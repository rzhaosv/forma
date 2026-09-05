/* Forma site comments — anonymous notes for the next person. Vanilla, no deps.
   Mounts into every <div data-comments></div>; the attribute value overrides the heading.
   Talks to /api/comments (see api/comments.js). All user text goes through textContent. */
(function () {
  'use strict';
  var API = '/api/comments';
  var LS_NAME = 'fz_cmt_name';
  var LS_LIKED = 'fz_cmt_liked';
  var PAGE = normalizePage(location.pathname);

  function normalizePage(p) {
    p = (p || '/').replace(/\/index\.html?$/i, '/').replace(/\/+/g, '/');
    if (p.charAt(p.length - 1) !== '/') p += '/';
    return p;
  }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function timeAgo(iso) {
    var t = new Date(iso).getTime();
    if (!t) return '';
    var s = Math.max(0, (Date.now() - t) / 1000);
    if (s < 60) return 'just now';
    if (s < 3600) return Math.floor(s / 60) + 'm ago';
    if (s < 86400) return Math.floor(s / 3600) + 'h ago';
    if (s < 86400 * 14) return Math.floor(s / 86400) + 'd ago';
    var d = new Date(t);
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: d.getFullYear() === new Date().getFullYear() ? undefined : 'numeric' });
  }
  function errorText(code, status) {
    switch (code) {
      case 'rate_limited': return 'You have posted a lot in the last few minutes. Take a breath and try again soon.';
      case 'links_not_allowed': return 'Links are not allowed here. Say it in your own words.';
      case 'missing_text': return 'Write something first.';
      case 'parent_not_found': return 'That comment is gone. Reload and try again.';
      case 'rejected': return 'That did not go through.';
      default: return status === 0 ? 'Could not reach the server. Check your connection and try again.' : 'Something went wrong. Please try again in a moment.';
    }
  }
  function request(method, url, body) {
    var opts = { method: method, headers: {} };
    if (body) { opts.headers['Content-Type'] = 'application/json'; opts.body = JSON.stringify(body); }
    return fetch(url, opts).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) { var e = new Error(data.error || 'http_' + r.status); e.code = data.error; e.status = r.status; throw e; }
        return data;
      });
    }, function () { var e = new Error('network'); e.status = 0; throw e; });
  }

  function mount(host) {
    var heading = (host.getAttribute('data-comments') || '').trim() || 'Leave something for the next person';
    var liked = lsGet(LS_LIKED, []);
    var byId = {};
    var root = el('section', 'cmt');
    root.id = 'comments';
    root.appendChild(el('h2', 'cmt-h', heading));
    var form = buildForm(null, root);
    root.appendChild(form);
    root.appendChild(el('p', 'cmt-note', 'No account needed. Be kind; this is a quiet place.'));
    var status = el('p', 'cmt-status', 'Loading notes…');
    root.appendChild(status);
    var list = el('div', 'cmt-list');
    root.appendChild(list);
    var more = el('button', 'cmt-btn cmt-ghost cmt-more', 'Load older');
    more.type = 'button';
    more.hidden = true;
    root.appendChild(more);
    host.textContent = '';
    host.appendChild(root);

    var nextCursor = null;
    function load(cursor) {
      more.disabled = true;
      var url = API + '?page=' + encodeURIComponent(PAGE) + '&limit=50' + (cursor ? '&cursor=' + cursor : '');
      request('GET', url).then(function (data) {
        status.hidden = true;
        var cs = data.comments || [];
        cs.filter(function (c) { return !c.parentId; }).forEach(function (c) { insert(c, true); });
        cs.filter(function (c) { return c.parentId; }).forEach(function (c) { insert(c, true); });
        nextCursor = data.next || null;
        more.hidden = !nextCursor;
        more.disabled = false;
        if (!cursor && !list.children.length) { status.hidden = false; status.textContent = 'Nothing here yet. You could be the first.'; }
      }, function (e) {
        status.hidden = false;
        status.textContent = 'Notes could not load right now. You can still leave one.';
        more.disabled = false;
      });
    }
    more.addEventListener('click', function () { if (nextCursor) load(nextCursor); });

    // Top-level newest first; replies oldest first under their parent. A reply
    // whose parent has not loaded yet waits in `orphans` until it does.
    var orphans = {};
    function insert(c, append) {
      if (byId[c.id]) return byId[c.id];
      var node = render(c);
      byId[c.id] = node;
      if (c.parentId) {
        var parent = byId[c.parentId];
        if (!parent) { (orphans[c.parentId] = orphans[c.parentId] || []).push(c); return node; }
        var replies = parent.querySelector('.cmt-replies');
        var ts = new Date(c.createdAt).getTime() || 0;
        var before = null;
        for (var i = 0; i < replies.children.length; i++) {
          if ((Number(replies.children[i].getAttribute('data-ts')) || 0) > ts) { before = replies.children[i]; break; }
        }
        replies.insertBefore(node, before);
      } else if (append) {
        list.appendChild(node);
      } else {
        list.insertBefore(node, list.firstChild);
      }
      if (orphans[c.id]) { var kids = orphans[c.id]; delete orphans[c.id]; kids.forEach(function (k) { delete byId[k.id]; insert(k, true); }); }
      return node;
    }

    function render(c) {
      var item = el('article', 'cmt-item' + (c.parentId ? ' cmt-reply' : ''));
      item.setAttribute('data-id', c.id);
      item.setAttribute('data-ts', String(new Date(c.createdAt).getTime() || 0));
      var head = el('div', 'cmt-meta');
      head.appendChild(el('b', 'cmt-name', c.name || 'anonymous'));
      var time = el('time', 'cmt-time', timeAgo(c.createdAt));
      time.setAttribute('datetime', c.createdAt || '');
      head.appendChild(time);
      item.appendChild(head);
      item.appendChild(el('p', 'cmt-text', c.text));
      var actions = el('div', 'cmt-actions');
      var like = el('button', 'cmt-like' + (liked.indexOf(c.id) >= 0 ? ' is-liked' : ''));
      like.type = 'button';
      like.setAttribute('aria-label', 'Like this note');
      like.appendChild(el('span', 'cmt-heart', '♡'));
      like.appendChild(el('span', 'cmt-count', String(c.likes || 0)));
      like.addEventListener('click', function () { doLike(c, like); });
      actions.appendChild(like);
      if (!c.parentId) {
        var reply = el('button', 'cmt-replybtn', 'Reply');
        reply.type = 'button';
        reply.addEventListener('click', function () { toggleReply(item, c); });
        actions.appendChild(reply);
      }
      item.appendChild(actions);
      if (!c.parentId) item.appendChild(el('div', 'cmt-replies'));
      return item;
    }

    function toggleReply(item, c) {
      var existing = item.querySelector(':scope > .cmt-form');
      if (existing) { existing.remove(); return; }
      var f = buildForm(c.id, item);
      item.insertBefore(f, item.querySelector('.cmt-replies'));
      f.querySelector('textarea').focus();
    }

    function doLike(c, btn) {
      if (btn.classList.contains('is-liked') || btn.disabled || /^tmp-/.test(c.id)) return;
      btn.disabled = true;
      var count = btn.querySelector('.cmt-count');
      request('POST', API, { action: 'like', id: c.id }).then(function (d) {
        count.textContent = String(d.likes);
        btn.classList.add('is-liked');
        liked = lsGet(LS_LIKED, []);
        if (liked.indexOf(c.id) < 0) { liked.push(c.id); lsSet(LS_LIKED, liked.slice(-500)); }
        btn.disabled = false;
      }, function () { btn.disabled = false; });
    }

    function buildForm(parentId, container) {
      var f = el('form', 'cmt-form' + (parentId ? ' cmt-form-reply' : ''));
      f.setAttribute('novalidate', '');
      var name = el('input', 'cmt-input');
      name.type = 'text'; name.name = 'name'; name.maxLength = 32; name.placeholder = 'anonymous'; name.autocomplete = 'nickname';
      name.value = lsGet(LS_NAME, '') || '';
      name.setAttribute('aria-label', 'Your name (optional)');
      var text = el('textarea', 'cmt-input cmt-textarea');
      text.name = 'text'; text.maxLength = 800; text.rows = parentId ? 2 : 3;
      text.placeholder = parentId ? 'Write a reply…' : 'What would you tell the next person who lands here?';
      text.setAttribute('aria-label', parentId ? 'Your reply' : 'Your note');
      var hp = el('input', 'cmt-hp');
      hp.type = 'text'; hp.name = 'website'; hp.tabIndex = -1; hp.autocomplete = 'off'; hp.setAttribute('aria-hidden', 'true');
      var row = el('div', 'cmt-row');
      var btn = el('button', 'cmt-btn', parentId ? 'Reply' : 'Post');
      btn.type = 'submit';
      var msg = el('span', 'cmt-msg');
      msg.setAttribute('role', 'status');
      var counter = el('span', 'cmt-counter', '');
      row.appendChild(btn); row.appendChild(msg); row.appendChild(counter);
      f.appendChild(name); f.appendChild(text); f.appendChild(hp); f.appendChild(row);
      text.addEventListener('input', function () { counter.textContent = text.value.length > 600 ? (800 - text.value.length) + ' left' : ''; });
      f.addEventListener('submit', function (ev) {
        ev.preventDefault();
        var body = text.value.trim();
        msg.textContent = '';
        if (!body) { msg.textContent = 'Write something first.'; text.focus(); return; }
        if (/https?:|www\.|\bhttp\b/i.test(body)) { msg.textContent = errorText('links_not_allowed'); return; }
        var nm = name.value.trim().slice(0, 32);
        lsSet(LS_NAME, nm);
        btn.disabled = true; text.disabled = true;
        var temp = { id: 'tmp-' + Date.now(), page: PAGE, name: nm || 'anonymous', text: body, parentId: parentId, likes: 0, createdAt: new Date().toISOString() };
        var node = insert(temp, false);
        node.classList.add('is-pending');
        status.hidden = true;
        request('POST', API, { page: PAGE, name: nm, text: body, parentId: parentId, honeypot: hp.value }).then(function (d) {
          var c = d.comment || temp;
          delete byId[temp.id];
          node.remove();
          var real = insert(c, false);
          if (c.hidden) {
            real.classList.add('is-held');
            real.querySelector('.cmt-meta').appendChild(el('span', 'cmt-held', 'held for review — only you can see this'));
          }
          text.value = ''; counter.textContent = '';
          btn.disabled = false; text.disabled = false;
          if (parentId) f.remove();
        }, function (e) {
          node.remove();
          delete byId[temp.id];
          if (!list.children.length) status.hidden = false;
          msg.textContent = errorText(e.code, e.status);
          btn.disabled = false; text.disabled = false;
        });
      });
      return f;
    }

    load(null);
  }

  function init() {
    var hosts = document.querySelectorAll('[data-comments]');
    for (var i = 0; i < hosts.length; i++) if (!hosts[i].querySelector('.cmt')) mount(hosts[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();
