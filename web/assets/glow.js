/* Forma: quiet motion. Reveal-on-enter for cards and sections, nav hairline after scroll.
   Loaded with defer; the page marks itself `fz-js` inline in <head> so CSS can hide reveal
   targets before this runs. Everything here degrades to "just show it". No deps. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function navShadow() {
    var nav = doc.querySelector('.fz-nav');
    if (!nav) return;
    var on = false;
    function check() {
      var s = (window.scrollY || root.scrollTop) > 8;
      if (s !== on) { on = s; nav.classList.toggle('is-scrolled', on); }
    }
    window.addEventListener('scroll', check, { passive: true });
    check();
  }

  function reveal() {
    var sel = '.card,.features li,.steps li,.beliefs li,.faq details,.social a,.notes li,.banner,.section>.wrap>h2,.principles>div';
    var items = doc.querySelectorAll(sel);
    if (!items.length) return;
    if (reduce || !('IntersectionObserver' in window)) { root.classList.remove('fz-js'); return; }
    var early = performance.now() < 1500;
    // Stagger by position among siblings so a grid of cards ripples in; cap the delay so long lists stay snappy.
    for (var i = 0; i < items.length; i++) {
      var el = items[i], p = el.parentNode, k = 0, n = p.firstElementChild;
      while (n && n !== el) { if (n.classList.contains('fz-reveal')) k++; n = n.nextElementSibling; }
      var d = Math.min(k, 8) * 70;
      // The first belief line on the umbrella arrives a beat after the hero settles.
      if (early && el.closest('#believe')) d += 420;
      el.style.setProperty('--d', d + 'ms');
      el.classList.add('fz-reveal');
    }
    var io = new IntersectionObserver(function (entries) {
      for (var j = 0; j < entries.length; j++) {
        if (entries[j].isIntersecting) { entries[j].target.classList.add('is-in'); io.unobserve(entries[j].target); }
      }
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    for (var m = 0; m < items.length; m++) io.observe(items[m]);
    // Safety net: anything still hidden after a while (odd layouts, print) is shown.
    setTimeout(function () { for (var q = 0; q < items.length; q++) items[q].classList.add('is-in'); }, 6000);
  }

  function init() { navShadow(); reveal(); }
  if (doc.readyState === 'loading') doc.addEventListener('DOMContentLoaded', init); else init();
})();
