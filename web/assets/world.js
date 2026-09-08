/* Forma: The World. Globe, the four rooms' small tools, and the homepage teaser.
   Loaded with defer after d3 + topojson-client (also defer, so order holds).
   Page data lives in window.WORLD (set inline before this script). No build step. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var D = window.WORLD || {};
  var LAND_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/land-110m.json';
  var landCache = null;
  function land() {
    if (landCache) return landCache;
    landCache = d3.json(LAND_URL).then(function (w) { return topojson.feature(w, w.objects.land); });
    return landCache;
  }
  function fmt(lat, lon) { return Math.abs(lat).toFixed(2) + '° ' + (lat < 0 ? 'S' : 'N') + ', ' + Math.abs(lon).toFixed(2) + '° ' + (lon < 0 ? 'W' : 'E'); }

  /* ---------------- globe ---------------- */
  function globe(host, o) {
    if (!host || !window.d3 || !window.topojson) return null;
    var W = 600, you = o.you, pins = o.pins || [], mini = !!o.mini;
    var svg = d3.select(host).append('svg').attr('viewBox', [0, 0, W, W]).attr('role', 'img').attr('aria-label', o.label || 'World globe');
    var proj = d3.geoOrthographic().scale(W / 2 - 14).translate([W / 2, W / 2]).clipAngle(90).rotate([-you.lon, -you.lat + 6]);
    var path = d3.geoPath(proj);
    svg.append('circle').attr('class', 'ocean').attr('cx', W / 2).attr('cy', W / 2).attr('r', W / 2 - 14);
    var grat = svg.append('path').attr('class', 'grat').datum(d3.geoGraticule10());
    var landP = svg.append('path').attr('class', 'land');
    var youRing = svg.append('circle').attr('class', 'you-ring').attr('r', 2);
    var youDot = svg.append('circle').attr('class', 'you').attr('r', mini ? 3 : 2.2);
    var youLabel = svg.append('text').attr('class', 'you-label').text('you');
    var pinSel = svg.append('g').selectAll('circle').data(mini ? [] : pins).join('circle').attr('class', 'pin').attr('r', 4.5).attr('fill', function (d) { return o.colors[d.cat]; });
    pinSel.append('title').text(function (d) { return d.t; });
    var locked = null, filter = 'all', paused = false, dragging = false, flying = false;

    function visible(lon, lat) { var r = proj.rotate(); return d3.geoDistance([-r[0], -r[1]], [lon, lat]) < Math.PI / 2 - 0.02; }
    function render() {
      grat.attr('d', path); landP.attr('d', path);
      pinSel.each(function (d) {
        var el = d3.select(this);
        if (!visible(d.lon, d.lat)) { el.style('display', 'none'); return; }
        var xy = proj([d.lon, d.lat]); el.style('display', null).attr('cx', xy[0]).attr('cy', xy[1]);
      });
      var yv = visible(you.lon, you.lat), yxy = proj([you.lon, you.lat]);
      youDot.style('display', yv ? null : 'none'); youRing.style('display', yv ? null : 'none'); youLabel.style('display', yv ? null : 'none');
      if (yv) { youDot.attr('cx', yxy[0]).attr('cy', yxy[1]); youRing.attr('cx', yxy[0]).attr('cy', yxy[1]); youLabel.attr('x', yxy[0] + 9).attr('y', yxy[1] + 4); }
    }
    land().then(function (f) { landP.datum(f); render(); }).catch(function () { render(); });
    render();

    function show(p) { if (o.onSelect) o.onSelect(p); }
    function lock(p) { locked = p; pinSel.classed('is-on', function (x) { return x === locked; }); show(locked); }
    var flyT = null;
    function flyTo(lon, lat, done) {
      var from = proj.rotate(), to = [-lon, -lat + 6, 0];
      // shortest way round: bring the start longitude within 180° of the target
      from = [from[0] - Math.round((from[0] - to[0]) / 360) * 360, from[1], from[2] || 0];
      if (flyT) { flyT.stop(); flyT = null; }
      if (reduce) { proj.rotate(to); render(); if (done) done(); return; }
      var ip = d3.interpolateArray(from, to), t0 = null; flying = true;
      flyT = d3.timer(function (el) {
        if (t0 === null) t0 = el;
        var k = Math.min(1, (el - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        proj.rotate(ip(e)); render();
        if (k >= 1) { flyT.stop(); flyT = null; flying = false; if (done) done(); }
      });
    }
    function applyFilter() { pinSel.classed('dim', function (d) { return filter !== 'all' && d.cat !== filter; }); }
    function setFilter(cat) {
      filter = cat; applyFilter();
      if (cat === 'all') { lock(null); flyTo(you.lon, you.lat); return; }
      var first = pins.filter(function (p) { return p.cat === cat; })[0];
      if (first) { lock(first); flyTo(first.lon, first.lat); }
    }

    if (!mini) {
      pinSel.on('mouseenter', function (e, d) { paused = true; if (!locked) show(d); })
        .on('mouseleave', function () { paused = false; if (!locked) show(null); })
        .on('click', function (e, d) { e.stopPropagation(); lock(locked === d ? null : d); });
      svg.on('click', function () { lock(null); });
      svg.call(d3.drag()
        .on('start', function () { dragging = true; })
        .on('drag', function (e) { var r = proj.rotate(), k = 90 / proj.scale(); proj.rotate([r[0] + e.dx * k, Math.max(-70, Math.min(70, r[1] - e.dy * k))]); render(); })
        .on('end', function () { dragging = false; }));
      if (o.legend) {
        o.legend.addEventListener('click', function (e) {
          var btn = e.target.closest('[data-cat]'); if (!btn) return;
          o.legend.querySelectorAll('[data-cat]').forEach(function (c) { c.classList.toggle('is-on', c === btn); });
          setFilter(btn.getAttribute('data-cat'));
        });
      }
    }
    if (!reduce) {
      var last = 0, speed = mini ? 0.006 : 0.0045;
      d3.timer(function (t) {
        if (paused || dragging || flying) { last = t; return; }
        var dt = Math.min(64, t - last); last = t;
        var r = proj.rotate(); proj.rotate([r[0] + speed * dt, r[1]]); render();
      });
    }
    var api = { setFilter: setFilter, flyTo: flyTo, lock: lock }; if (!mini) window.__fzWorld = api; return api;
  }

  function mountGlobe() {
    var host = document.getElementById('globe'); if (!host) return;
    var pp = { no: document.getElementById('pp-no'), t: document.getElementById('pp-title'), b: document.getElementById('pp-body'), w: document.getElementById('pp-where'), go: document.getElementById('pp-go') };
    var DEF = D.panelDefault || {};
    function onSelect(p) {
      if (!pp.t) return;
      if (!p) { pp.no.textContent = DEF.no; pp.t.textContent = DEF.t; pp.b.textContent = DEF.b; pp.w.textContent = DEF.w; pp.go.hidden = true; return; }
      pp.no.textContent = D.labels[p.cat] + ' · ' + p.no; pp.t.textContent = p.t; pp.b.textContent = p.b; pp.w.textContent = fmt(p.lat, p.lon); pp.go.href = p.go; pp.go.hidden = false;
    }
    globe(host, { you: D.you, pins: D.pins, colors: D.colors, labels: D.labels, legend: document.getElementById('legend'), onSelect: onSelect });
  }

  /* homepage teaser: a small globe that only loads when it scrolls near */
  function mountMini() {
    var host = document.querySelector('[data-mini-globe]'); if (!host) return;
    var you = { lat: parseFloat(host.getAttribute('data-lat') || '37.3688'), lon: parseFloat(host.getAttribute('data-lon') || '-122.0363') };
    globe(host, { you: you, pins: [], colors: {}, mini: true, label: 'A small turning globe' });
  }

  /* ---------------- make a call ---------------- */
  function calls() {
    var list = document.getElementById('calls'), tally = document.getElementById('tally'); if (!list || !D.calls) return;
    var KEY = D.callsKey || 'fz-calls-v1', CALLS = D.calls, st;
    try { st = JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { st = {}; }
    function save() { try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (e) {} }
    function draw() {
      var r = 0, w = 0, o = 0; list.innerHTML = '';
      CALLS.forEach(function (c) {
        var s = st[c.id] || {};
        if (s.c) { if (s.o === 'right') r++; else if (s.o === 'wrong') w++; else o++; }
        var li = document.createElement('li');
        var q = document.createElement('span'); q.className = 'q'; q.textContent = c.q;
        var kl = c.k || (window.WORLD_CALL_LINKS || {})[c.id]; if (kl) { c = Object.assign({}, c, { k: kl }); var sm = document.createElement('small'); sm.innerHTML = 'Kalshi has this one: <a href="' + c.k + '" rel="noopener" target="_blank">see the live price</a>'; q.appendChild(sm); }
        li.appendChild(q);
        var opts = document.createElement('div'); opts.className = 'opts';
        ['yes', 'no'].forEach(function (v) { var b = document.createElement('button'); b.type = 'button'; b.className = 'tog' + (s.c === v ? ' is-on' : ''); b.textContent = v === 'yes' ? 'Yes' : 'No'; b.onclick = function () { st[c.id] = { c: v, o: null }; save(); draw(); }; opts.appendChild(b); });
        li.appendChild(opts);
        var mark = document.createElement('div'); mark.className = 'mark';
        if (s.c) {
          var lab = document.createElement('span'); lab.textContent = 'You called ' + (s.c === 'yes' ? 'yes' : 'no') + '. Sunday:'; mark.appendChild(lab);
          [['right', 'I was right'], ['wrong', 'I was wrong'], ['clear', 'clear']].forEach(function (p) { var b = document.createElement('button'); b.type = 'button'; b.className = 'tog sm ' + p[0] + (s.o === p[0] ? ' is-on' : ''); b.textContent = p[1]; b.onclick = function () { if (p[0] === 'clear') { delete st[c.id]; } else { st[c.id].o = p[0]; } save(); draw(); }; mark.appendChild(b); });
        }
        li.appendChild(mark); list.appendChild(li);
      });
      if (tally) tally.innerHTML = '<span><b>' + r + '</b>right</span><span><b>' + w + '</b>wrong</span><span><b>' + o + '</b>still open</span><span><b>' + (CALLS.length - r - w - o) + '</b>not called</span>';
    }
    draw();
  }

  /* ---------------- the Kalshi board ---------------- */
  function kalshi() {
    var list = document.getElementById('markets'); var MK = D.markets || window.WORLD_MARKETS; if (!list || !MK || !MK.length) return; D.markets = MK; D.marketsApi = D.marketsApi || window.WORLD_MARKETS_API;
    function row(m) {
      var li = document.createElement('li');
      var q = document.createElement('span'); q.className = 'mq'; q.textContent = m.title;
      var sm = document.createElement('small'); sm.textContent = m.sub || ''; q.appendChild(sm);
      li.appendChild(q);
      if (m.yes != null) {
        var yes = Math.round(m.yes), odds = document.createElement('span'); odds.className = 'odds';
        odds.innerHTML = yes + '¢<small>yes</small>'; li.appendChild(odds);
      }
      var a = document.createElement('a'); a.className = 'btn sm ghost trade'; a.href = m.url; a.rel = 'noopener'; a.target = '_blank'; a.textContent = 'Open on Kalshi';
      li.appendChild(a);
      if (m.yes != null) { var bar = document.createElement('span'); bar.className = 'bar'; bar.innerHTML = '<i style="--p:' + Math.round(m.yes) + '%"></i>'; li.appendChild(bar); }
      return li;
    }
    function draw(ms) { list.innerHTML = ''; ms.forEach(function (m) { list.appendChild(row(m)); }); }
    draw(D.markets);
    // Live prices if the browser is allowed to ask. If not, the snapshot stands and the "as of" line says so.
    if (D.marketsApi) {
      var asof = document.getElementById('asof');
      Promise.all(D.markets.map(function (m) {
        return fetch(D.marketsApi + encodeURIComponent(m.ticker), { mode: 'cors' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (j) {
          var mk = j && (j.market || j); if (!mk) return m;
          var p = mk.last_price != null ? mk.last_price : (mk.yes_ask != null ? mk.yes_ask : null);
          if (p != null && p > 1) return Object.assign({}, m, { yes: p });
          return m;
        }).catch(function () { return m; });
      })).then(function (ms) { draw(ms); if (asof && ms.some(function (m, i) { return m.yes !== D.markets[i].yes; })) asof.textContent = 'Live prices, just now.'; });
    }
  }

  /* ---------------- the cut and the build ---------------- */
  function cut() {
    var pick = document.getElementById('pick'); if (!pick || !D.plan) return;
    var P = D.plan, st = {};
    pick.querySelectorAll('[data-group]').forEach(function (g) { st[g.getAttribute('data-group')] = null; });
    var groups = Object.keys(st);
    pick.addEventListener('click', function (e) {
      var b = e.target.closest('.tog'); if (!b) return;
      var g = b.parentNode.getAttribute('data-group'); st[g] = b.getAttribute('data-val');
      b.parentNode.querySelectorAll('.tog').forEach(function (x) { x.classList.toggle('is-on', x === b); });
      var n = groups.filter(function (k) { return st[k]; }).length;
      document.getElementById('pick-note').textContent = n === groups.length ? 'All three. Press it.' : (groups.length - n) + ' more to pick.';
    });
    document.getElementById('write-plan').addEventListener('click', function () {
      if (groups.some(function (k) { return !st[k]; })) { document.getElementById('pick-note').textContent = 'One from each row first.'; return; }
      P.sections.forEach(function (s) { var el = document.getElementById('plan-' + s.id); if (el) el.textContent = typeof s.text === 'string' ? s.text : s.text[st[s.from]]; });
      var plan = document.getElementById('plan'); plan.hidden = false; plan.querySelector('.card').classList.add('is-in');
      plan.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' });
    });
    var cp = document.getElementById('copy-brief');
    if (cp) cp.addEventListener('click', function () {
      var t = document.getElementById('plan-brief').textContent, n = document.getElementById('copy-note');
      if (navigator.clipboard) { navigator.clipboard.writeText(t).then(function () { n.textContent = 'Copied. Hand it over.'; }, function () { n.textContent = 'Select it and copy by hand.'; }); } else { n.textContent = 'Select it and copy by hand.'; }
    });
  }

  function init() { mountGlobe(); mountMini(); calls(); kalshi(); cut(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); }); else setTimeout(init, 0);
})();
