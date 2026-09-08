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

  /* ---------------- make a call: the house beside the money ----------------
     Every question is voted here and the tally is shared, so you are never
     playing against yourself. Where Kalshi has the same question we show their
     price next to the house's opinion and hold the door open. Prices and votes
     both come from /api/world; either can be missing and the board still reads. */
  function board() {
    var list = document.getElementById('markets'); if (!list) return;
    var ROWS = (D.board || []).slice(0, 24); if (!ROWS.length) return;
    var elById = {}, state = {};

    function pct(v) { return Math.round(v) + '%'; }
    function houseYes(t) { var n = (t.yes || 0) + (t.no || 0); return n ? (t.yes / n) * 100 : null; }

    function paint(row) {
      var el = elById[row.id]; if (!el) return;
      var st = state[row.id] || {}, t = st.votes || { yes: 0, no: 0 }, n = t.yes + t.no;
      var h = houseYes(t), m = st.money == null ? null : st.money;

      el.house.innerHTML = (h == null ? '&mdash;' : pct(h)) + '<small>the house</small>';
      el.houseN.textContent = n === 0 ? 'no calls yet' : n === 1 ? '1 call' : n + ' calls';
      if (el.money) el.money.innerHTML = (m == null ? '&mdash;' : m + '¢') + '<small>the money</small>';
      el.split.style.setProperty('--h', (h == null ? 50 : h) + '%');
      el.split.style.setProperty('--m', (m == null ? -1 : m) + '%');
      el.split.classList.toggle('has-money', m != null);

      for (var k in el.btn) el.btn[k].classList.toggle('is-on', st.you === k);

      var say = '';
      if (st.you) {
        say = 'You said ' + st.you + '. ';
        if (h != null && n > 1) {
          var agree = st.you === 'yes' ? h : 100 - h;
          say += pct(agree) + ' of the house is with you';
          say += m == null ? '.' : ', and the money says ' + m + '.';
        } else if (m != null) {
          say += 'You are the first here. The money says ' + m + '.';
        } else {
          say += 'You are the first here.';
        }
      } else if (h != null && m != null && n >= 3) {
        var gap = Math.round(h - m);
        if (Math.abs(gap) >= 12) say = 'The house is ' + Math.abs(gap) + ' points more ' + (gap > 0 ? 'hopeful' : 'doubtful') + ' than the money. One of you is wrong.';
        else say = 'The house and the money agree, near enough.';
      }
      el.say.textContent = say;
      el.say.hidden = !say;
    }

    function cast(row, side) {
      var st = state[row.id] || (state[row.id] = {});
      var prev = st.you, t = st.votes || (st.votes = { yes: 0, no: 0 });
      if (prev === side) return;
      if (prev) t[prev] = Math.max(0, t[prev] - 1);
      t[side]++; st.you = side; paint(row);
      fetch('/api/world', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ market: row.id, side: side }) })
        .then(function (r) { return r.ok ? r.json() : null; })
        .then(function (j) { if (j && j.market === row.id) { st.votes = { yes: j.yes, no: j.no }; st.you = j.you; paint(row); } })
        .catch(function () {});
      try { localStorage.setItem('fz-call-' + row.id, side); } catch (e) {}
    }

    ROWS.forEach(function (row) {
      var li = document.createElement('li');
      var q = document.createElement('div'); q.className = 'mq';
      q.appendChild(document.createTextNode(row.q));
      if (row.sub) { var sm = document.createElement('small'); sm.textContent = row.sub; q.appendChild(sm); }
      li.appendChild(q);

      var reads = document.createElement('div'); reads.className = 'reads';
      var house = document.createElement('span'); house.className = 'read house'; reads.appendChild(house);
      var money = null;
      if (row.ticker) { money = document.createElement('span'); money.className = 'read money'; reads.appendChild(money); }
      li.appendChild(reads);

      var vote = document.createElement('div'); vote.className = 'vote';
      var btn = {};
      ['yes', 'no'].forEach(function (side) {
        var b = document.createElement('button'); b.type = 'button'; b.className = 'tog ' + side;
        b.textContent = side === 'yes' ? 'Yes' : 'No';
        b.setAttribute('aria-label', (side === 'yes' ? 'Yes' : 'No') + ': ' + row.q);
        b.onclick = function () { cast(row, side); };
        vote.appendChild(b); btn[side] = b;
      });
      if (row.url) {
        var a = document.createElement('a'); a.className = 'trade'; a.href = row.url; a.rel = 'noopener'; a.target = '_blank';
        a.textContent = 'Trade it'; a.setAttribute('aria-label', 'Trade this on Kalshi: ' + row.q);
        vote.appendChild(a);
      }
      li.appendChild(vote);

      var split = document.createElement('div'); split.className = 'split'; split.innerHTML = '<i></i><b></b>';
      li.appendChild(split);
      var houseN = document.createElement('span'); houseN.className = 'houseN'; li.appendChild(houseN);
      var say = document.createElement('p'); say.className = 'say'; say.hidden = true; li.appendChild(say);

      elById[row.id] = { house: house, money: money, split: split, say: say, houseN: houseN, btn: btn };
      state[row.id] = { votes: { yes: 0, no: 0 }, money: null, you: null };
      try { var seen = localStorage.getItem('fz-call-' + row.id); if (seen === 'yes' || seen === 'no') state[row.id].you = seen; } catch (e) {}
      list.appendChild(li);
      paint(row);
    });

    var q = ROWS.map(function (r) { return r.id + ':' + (r.ticker || ''); }).join(',');
    fetch('/api/world?q=' + encodeURIComponent(q))
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (j) {
        if (!j) return;
        var total = 0, priced = 0;
        ROWS.forEach(function (row) {
          var st = state[row.id];
          var t = j.votes && j.votes[row.id]; if (t) { st.votes = { yes: t.yes || 0, no: t.no || 0 }; }
          if (j.you && j.you[row.id]) st.you = j.you[row.id];
          var p = row.ticker && j.prices && j.prices[row.ticker];
          if (p && p.yes != null) { st.money = p.yes; priced++; }
          total += st.votes.yes + st.votes.no;
          paint(row);
        });
        var asof = document.getElementById('asof');
        if (asof) {
          var bits = [];
          bits.push(total === 0 ? 'No calls made here yet. Be the first.' : total.toLocaleString() + (total === 1 ? ' call made here.' : ' calls made here.'));
          if (priced) bits.push('Prices from Kalshi, updated every minute.');
          asof.textContent = bits.join(' ');
        }
      })
      .catch(function () {});
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

  function init() { mountGlobe(); mountMini(); board(); cut(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(init, 0); }); else setTimeout(init, 0);
})();
