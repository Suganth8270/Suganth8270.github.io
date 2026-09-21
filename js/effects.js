/* ==========================================================================
   EFFECTS
   • initCardTilt     3D tilt + mouse-follow + cursor-tracked reflection
   • initCursorGlow   soft light that trails the cursor (desktop only)
   • initSpotlights   per-card highlight that follows the cursor
   • initReveal       scroll-triggered entrance
   • initNav          highlights the current section in the top navigation

   Heavy pointer effects only run for a real mouse/pen ("hover: hover" +
   "pointer: fine") and never when the user prefers reduced motion.
   On touch screens the card keeps a light-touch highlight and a slow idle
   sheen (pure CSS), with no tilt.
   ========================================================================== */
(function () {
  'use strict';

  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

  /* ------------------------------------------------------------------------
     CARD TILT
     Tune the feel here:
       MAX_TILT_Y / MAX_TILT_X  – degrees of rotation at the extremes
       FOLLOW_X / FOLLOW_Y      – how many px the card drifts toward the cursor
       SMOOTHING                – higher = snappier, lower = floatier
     ------------------------------------------------------------------------ */
  var MAX_TILT_Y = 5.5, MAX_TILT_X = 4, FOLLOW_X = 9, FOLLOW_Y = 6, SMOOTHING = 6.5;

  function initCardTilt(card, stage, initialReduced) {
    var layers = Array.prototype.slice.call(card.querySelectorAll('[data-depth]'));
    var reduced = !!initialReduced;
    var keys = ['rx', 'ry', 'tx', 'ty', 'px', 'py', 'sx', 'glow'];
    var rest = { rx: 0, ry: 0, tx: 0, ty: 0, px: 32, py: 18, sx: 50, glow: 0 };
    var cur = Object.assign({}, rest), tgt = Object.assign({}, rest);
    var raf = 0, last = 0;

    function apply() {
      card.style.transform = 'translate3d(' + cur.tx.toFixed(2) + 'px,' + cur.ty.toFixed(2) + 'px,0) rotateX(' + cur.rx.toFixed(3) + 'deg) rotateY(' + cur.ry.toFixed(3) + 'deg)';
      card.style.setProperty('--px', cur.px.toFixed(1) + '%');
      card.style.setProperty('--py', cur.py.toFixed(1) + '%');
      card.style.setProperty('--sx', cur.sx.toFixed(1));
      card.style.setProperty('--glow', cur.glow.toFixed(3));
      var lx = cur.tx / FOLLOW_X, ly = cur.ty / FOLLOW_Y;
      layers.forEach(function (el) {
        var d = parseFloat(el.getAttribute('data-depth')) || 0;
        el.style.transform = 'translate3d(' + (-lx * d * 0.5).toFixed(2) + 'px,' + (-ly * d * 0.4).toFixed(2) + 'px,0)';
      });
    }
    function settled() {
      return keys.every(function (k) { return Math.abs(cur[k] - tgt[k]) < 0.01; });
    }
    function tick(ts) {
      var dt = Math.min(0.05, (ts - (last || ts)) / 1000) || 0.016; last = ts;
      var k = 1 - Math.exp(-dt * SMOOTHING);
      keys.forEach(function (key) { cur[key] += (tgt[key] - cur[key]) * k; });
      apply();
      if (settled()) { raf = 0; last = 0; } else raf = requestAnimationFrame(tick);
    }
    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    function aimAt(e) {
      var r = stage.getBoundingClientRect();           // un-tilted layout box
      if (r.bottom < 0 || r.top > window.innerHeight) return release();
      var cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      var local = { x: (e.clientX - cx) / (r.width / 2), y: (e.clientY - cy) / (r.height / 2) };
      var view = { x: (e.clientX / window.innerWidth) * 2 - 1, y: (e.clientY / window.innerHeight) * 2 - 1 };
      var nx = clamp(local.x, -1, 1) * 0.6 + view.x * 0.4;   // blend: card-relative + viewport-relative
      var ny = clamp(local.y, -1, 1) * 0.6 + view.y * 0.4;
      var inside = Math.abs(local.x) <= 1 && Math.abs(local.y) <= 1;

      tgt.ry = nx * MAX_TILT_Y;
      tgt.rx = -ny * MAX_TILT_X;
      tgt.tx = nx * FOLLOW_X;
      tgt.ty = ny * FOLLOW_Y;
      tgt.px = clamp(((e.clientX - r.left) / r.width) * 100, -15, 115);
      tgt.py = clamp(((e.clientY - r.top) / r.height) * 100, -15, 115);
      tgt.sx = clamp(100 - tgt.px, 0, 100);
      tgt.glow = inside ? 1 : 0.4;
      kick();
    }
    function release() {
      Object.keys(rest).forEach(function (k) { tgt[k] = rest[k]; });
      kick();
    }

    function onMove(e) {
      if (reduced) return;
      if (e.pointerType === 'touch') return;
      aimAt(e);
    }
    function onTouchMove(e) {                          // light-touch highlight only, no tilt
      if (reduced || e.pointerType !== 'touch') return;
      var r = card.getBoundingClientRect();
      tgt.px = clamp(((e.clientX - r.left) / r.width) * 100, 0, 100);
      tgt.py = clamp(((e.clientY - r.top) / r.height) * 100, 0, 100);
      tgt.sx = 100 - tgt.px; tgt.glow = 1; kick();
    }
    function onTouchEnd() { tgt.glow = 0; kick(); }

    if (finePointer) {
      window.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.addEventListener('pointerleave', release);
      window.addEventListener('blur', release);
    } else {
      card.addEventListener('pointerdown', onTouchMove, { passive: true });
      card.addEventListener('pointermove', onTouchMove, { passive: true });
      card.addEventListener('pointerup', onTouchEnd);
      card.addEventListener('pointercancel', onTouchEnd);
    }

    apply();
    return {
      setReducedMotion: function (flag) {
        reduced = !!flag;
        if (reduced) { release(); }
      },
    };
  }

  /* ------------------------------------------------------------------------
     CURSOR GLOW  (a soft light following the pointer, beneath the content)
     ------------------------------------------------------------------------ */
  function initCursorGlow(el, initialReduced) {
    if (!finePointer) { el.hidden = true; return { setReducedMotion: function () {} }; }
    var reduced = !!initialReduced;
    var x = window.innerWidth / 2, y = window.innerHeight / 3, tx = x, ty = y, raf = 0, last = 0;

    function tick(ts) {
      var dt = Math.min(0.05, (ts - (last || ts)) / 1000) || 0.016; last = ts;
      var k = 1 - Math.exp(-dt * 5);
      x += (tx - x) * k; y += (ty - y) * k;
      el.style.transform = 'translate3d(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px,0)';
      if (Math.abs(tx - x) + Math.abs(ty - y) < 0.4) { raf = 0; last = 0; } else raf = requestAnimationFrame(tick);
    }
    window.addEventListener('pointermove', function (e) {
      if (reduced || e.pointerType === 'touch') return;
      tx = e.clientX; ty = e.clientY; el.classList.add('is-on');
      if (!raf) raf = requestAnimationFrame(tick);
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', function () { el.classList.remove('is-on'); });
    return {
      setReducedMotion: function (flag) { reduced = !!flag; if (reduced) el.classList.remove('is-on'); },
    };
  }

  /* ------------------------------------------------------------------------
     SPOTLIGHT  (any element with class "spot" gets --px / --py)
     ------------------------------------------------------------------------ */
  function initSpotlights() {
    if (!finePointer) return;
    document.addEventListener('pointermove', function (e) {
      var el = e.target && e.target.closest ? e.target.closest('.spot') : null;
      if (!el) return;
      var r = el.getBoundingClientRect();
      el.style.setProperty('--px', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
      el.style.setProperty('--py', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
    }, { passive: true });
  }

  /* ------------------------------------------------------------------------
     SCROLL REVEAL  (content stays visible if IntersectionObserver is missing)
     ------------------------------------------------------------------------ */
  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) {
      items.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* ------------------------------------------------------------------------
     NAV: mark the section currently in view
     ------------------------------------------------------------------------ */
  function initNav() {
    var links = Array.prototype.slice.call(document.querySelectorAll('.nav__link'));
    var map = {};
    links.forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    if (!('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute('aria-current'); });
        var a = map[en.target.id];
        if (a) a.setAttribute('aria-current', 'true');
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) {
      var s = document.getElementById(id);
      if (s) io.observe(s);
    });
  }

  window.SGEffects = {
    initCardTilt: initCardTilt, initCursorGlow: initCursorGlow,
    initSpotlights: initSpotlights, initReveal: initReveal, initNav: initNav,
  };
})();
