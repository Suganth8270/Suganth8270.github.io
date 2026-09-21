/* ==========================================================================
   BACKGROUND  —  one fixed <canvas> behind the page
   Layers (back → front):  DNA helices · molecular structures · particles
   • Particles drift, sit at different depths, and are nudged by the cursor.
   • Molecules are small 3D node-and-bond models that rotate slowly.
   • The helices scroll with the page at a slower rate (parallax).
   • Everything is drawn from pre-rendered glow sprites (no shadowBlur) so it
     stays cheap. Pauses when the tab is hidden. Draws ONE static frame when
     the user prefers reduced motion.
   ========================================================================== */
(function () {
  'use strict';

  var TAU = Math.PI * 2;
  var RGB = { dapi: '127,178,255', fitc: '126,240,193', tritc: '255,157,177', ice: '207,227,255' };

  /* ---- helpers ------------------------------------------------------------ */
  function rng(seed) {                       // deterministic PRNG → stable layout
    var a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }
  function mod(n, m) { return ((n % m) + m) % m; }

  function makeSprite(rgb) {
    var size = 64, c = document.createElement('canvas');
    c.width = c.height = size;
    var g = c.getContext('2d'), r = size / 2;
    var grad = g.createRadialGradient(r, r, 0, r, r, r);
    grad.addColorStop(0, 'rgba(' + rgb + ',1)');
    grad.addColorStop(0.22, 'rgba(' + rgb + ',.6)');
    grad.addColorStop(1, 'rgba(' + rgb + ',0)');
    g.fillStyle = grad; g.fillRect(0, 0, size, size);
    return c;
  }

  /* ---- molecule models ---------------------------------------------------- */
  function ringModel(rand) {                 // aromatic-style ring + substituents
    var nodes = [], bonds = [], R = 46, i;
    for (i = 0; i < 6; i++) {
      var a = (i / 6) * TAU;
      nodes.push({ x: Math.cos(a) * R, y: Math.sin(a) * R, z: 0, c: 'dapi' });
      bonds.push([i, (i + 1) % 6]);
    }
    [0, 2, 4].forEach(function (ri, k) {
      var a = (ri / 6) * TAU, n = nodes.length;
      nodes.push({ x: Math.cos(a) * R * 1.9, y: Math.sin(a) * R * 1.9, z: (rand() - 0.5) * 70, c: k === 0 ? 'tritc' : 'fitc' });
      bonds.push([ri, n]);
      if (k === 1) {
        nodes.push({ x: Math.cos(a) * R * 2.7, y: Math.sin(a) * R * 2.7 + 22, z: (rand() - 0.5) * 90, c: 'dapi' });
        bonds.push([n, n + 1]);
      }
    });
    return { nodes: nodes, bonds: bonds };
  }
  function clusterModel(rand) {              // protein-like interaction network
    var nodes = [], set = {}, i, x, y, z;
    for (i = 0; i < 13; i++) {
      do { x = rand() * 2 - 1; y = rand() * 2 - 1; z = rand() * 2 - 1; } while (x * x + y * y + z * z > 1);
      var r = rand();
      nodes.push({ x: x * 95, y: y * 95, z: z * 95, c: r < 0.2 ? 'tritc' : r < 0.6 ? 'fitc' : 'dapi' });
    }
    nodes.forEach(function (a, i2) {
      nodes.map(function (b, j) {
        return { j: j, d: i2 === j ? 1e9 : Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2) + Math.pow(a.z - b.z, 2) };
      }).sort(function (p, q) { return p.d - q.d; }).slice(0, 2).forEach(function (o) {
        set[Math.min(i2, o.j) + '-' + Math.max(i2, o.j)] = 1;
      });
    });
    return { nodes: nodes, bonds: Object.keys(set).map(function (s) { return s.split('-').map(Number); }) };
  }
  function chainModel(rand) {                // zig-zag backbone with side branches
    var nodes = [], bonds = [], i;
    for (i = 0; i < 9; i++) {
      nodes.push({ x: (i - 4) * 34, y: (i % 2 ? 1 : -1) * 16 + (rand() - 0.5) * 10, z: Math.sin(i * 0.9) * 42, c: i % 4 === 0 ? 'fitc' : 'dapi' });
      if (i) bonds.push([i - 1, i]);
    }
    [2, 6].forEach(function (bi) {
      var n = nodes.length;
      nodes.push({ x: nodes[bi].x + (rand() - 0.5) * 20, y: nodes[bi].y + (bi === 2 ? -44 : 44), z: (rand() - 0.5) * 60, c: 'tritc' });
      bonds.push([bi, n]);
    });
    return { nodes: nodes, bonds: bonds };
  }

  /* ---- main --------------------------------------------------------------- */
  function init(opts) {
    var canvas = opts.canvas, gridEl = opts.gridEl || null;
    var ctx = canvas.getContext('2d');
    if (!ctx) return { setReducedMotion: function () {}, destroy: function () {} };

    var sprites = {};
    Object.keys(RGB).forEach(function (k) { sprites[k] = makeSprite(RGB[k]); });

    var reduced = !!opts.reducedMotion;
    var w = 0, h = 0, dpr = 1, small = false;
    var particles = [], molecules = [];
    var ptr = { tx: 0, ty: 0, x: 0, y: 0, px: -9999, py: -9999, on: false };   // normalised + pixel pointer
    var scrollY = window.scrollY || 0;
    var raf = 0, last = 0, t0 = performance.now(), running = false;

    /* -- (re)build for current viewport size -- */
    function resize() {
      small = window.innerWidth < 760;
      dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // Particles
      var count = clamp(Math.round((w * h) / 24000), 26, small ? 38 : 84);
      var rand = rng(1337), colors = ['dapi', 'dapi', 'ice', 'fitc', 'tritc'];
      particles = [];
      for (var i = 0; i < count; i++) {
        var z = 0.25 + rand() * 0.75;
        particles.push({
          x: rand() * w, y: rand() * h, z: z,
          vx: (rand() - 0.5) * 6 * z, vy: -(2 + rand() * 7) * z,   // px / second, slow upward drift
          r: 5 + rand() * 9 * z, c: colors[Math.floor(rand() * colors.length)],
          ph: rand() * TAU, dx: 0, dy: 0,
        });
      }

      // Molecules (anchors are viewport fractions; `f` is scroll parallax factor)
      var mr = rng(42), scale = clamp(Math.min(w, h) / 820, 0.62, 1.25);
      var defs = [
        { model: ringModel(mr),    ax: 0.86, ay: 0.16, f: 0.10, depth: 0.7 },
        { model: clusterModel(mr), ax: 0.09, ay: 0.64, f: 0.14, depth: 1.0 },
        { model: chainModel(mr),   ax: 0.78, ay: 0.88, f: 0.08, depth: 0.5 },
      ];
      if (small) defs.pop();
      molecules = defs.map(function (d, i) {
        return { model: d.model, ax: d.ax, ay: d.ay, f: d.f, depth: d.depth, scale: scale,
                 a0: mr() * TAU, b0: 0.5 + mr() * 0.5, spin: (i % 2 ? -1 : 1) * (0.10 + mr() * 0.08), ph: mr() * TAU };
      });
    }

    /* -- drawing -- */
    function glow(name, x, y, size, alpha) {
      ctx.globalAlpha = alpha;
      ctx.drawImage(sprites[name], x - size / 2, y - size / 2, size, size);
    }

    function drawHelix(cx, t, strength, amp) {
      var step = small ? 16 : 14, shift = (scrollY * 0.16) / step, whole = Math.floor(shift), frac = shift - whole;
      var n = Math.ceil(h / step) + 3, i, p, edgeFade;
      var pts1 = [], pts2 = [];
      for (i = -1; i < n; i++) {
        var y = (i - frac) * step, phase = (i + whole) * 0.34 + t * 0.55, s = Math.sin(phase), c = Math.cos(phase);
        pts1.push({ x: cx + amp * s, y: y, z: c, s: s, i: i + whole });
        pts2.push({ x: cx - amp * s, y: y, z: -c, s: s, i: i + whole });
      }
      // backbone (vertical gradient stroke fades at top / bottom)
      var grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(127,178,255,0)');
      grad.addColorStop(0.18, 'rgba(127,178,255,' + (0.28 * strength) + ')');
      grad.addColorStop(0.82, 'rgba(127,178,255,' + (0.28 * strength) + ')');
      grad.addColorStop(1, 'rgba(127,178,255,0)');
      ctx.globalAlpha = 1; ctx.lineWidth = 1; ctx.strokeStyle = grad;
      [pts1, pts2].forEach(function (pts) {
        ctx.beginPath();
        pts.forEach(function (q, k) { if (k) ctx.lineTo(q.x, q.y); else ctx.moveTo(q.x, q.y); });
        ctx.stroke();
      });
      // rungs + nodes
      for (i = 0; i < pts1.length; i++) {
        p = pts1[i];
        edgeFade = clamp(Math.min(p.y, h - p.y) / (h * 0.16), 0, 1);
        if (edgeFade <= 0) continue;
        if (p.i % 2 === 0) {
          ctx.globalAlpha = 0.16 * strength * edgeFade * Math.abs(p.s);
          ctx.strokeStyle = 'rgb(' + RGB.ice + ')';
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(pts2[i].x, pts2[i].y); ctx.stroke();
        }
        var d1 = (p.z + 1) / 2, d2 = (pts2[i].z + 1) / 2;
        glow('dapi', p.x, p.y, 5 + 7 * d1, (0.18 + 0.5 * d1) * strength * edgeFade);
        glow('fitc', pts2[i].x, pts2[i].y, 5 + 7 * d2, (0.18 + 0.5 * d2) * strength * edgeFade);
      }
      ctx.globalAlpha = 1;
    }

    function drawMolecule(m, t) {
      var F = 520, mdl = m.model;
      var cy = mod(m.ay * h - scrollY * m.f + 220, h + 440) - 220;
      var cx = m.ax * w - ptr.x * 16 * m.depth;
      cy -= ptr.y * 10 * m.depth;
      var by = m.a0 + t * m.spin, bx = m.b0 + Math.sin(t * 0.3 + m.ph) * 0.25;
      var cY = Math.cos(by), sY = Math.sin(by), cX = Math.cos(bx), sX = Math.sin(bx);

      var P = mdl.nodes.map(function (n) {
        var x = n.x * cY + n.z * sY, z = -n.x * sY + n.z * cY;
        var y = n.y * cX - z * sX; z = n.y * sX + z * cX;
        var s = F / (F + z);
        return { x: cx + x * s * m.scale, y: cy + y * s * m.scale, z: z, s: s, c: n.c };
      });

      ctx.lineWidth = 1;
      mdl.bonds.forEach(function (b) {
        var A = P[b[0]], B = P[b[1]], dz = clamp(1 - ((A.z + B.z) / 2 + 120) / 240, 0, 1);
        ctx.globalAlpha = 0.07 + 0.16 * dz;
        ctx.strokeStyle = 'rgb(' + RGB.ice + ')';
        ctx.beginPath(); ctx.moveTo(A.x, A.y); ctx.lineTo(B.x, B.y); ctx.stroke();
      });
      P.slice().sort(function (a, b) { return b.z - a.z; }).forEach(function (n) {
        var dz = clamp(1 - (n.z + 120) / 240, 0, 1);
        glow(n.c, n.x, n.y, (14 + 16 * dz) * n.s * m.scale, 0.22 + 0.42 * dz);
      });
      ctx.globalAlpha = 1;
    }

    function drawParticles(t, dt) {
      var reach = 150, i, p, x, y, dx, dy, d, f;
      for (i = 0; i < particles.length; i++) {
        p = particles[i];
        if (dt) {
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.y < -20) { p.y = h + 20; p.x = Math.random() * w; }
          if (p.x < -20) p.x = w + 20; else if (p.x > w + 20) p.x = -20;
          // gentle cursor repulsion
          if (ptr.on) {
            dx = p.x + p.dx - ptr.px; dy = p.y + p.dy - ptr.py; d = Math.sqrt(dx * dx + dy * dy);
            if (d < reach && d > 0.1) { f = (1 - d / reach) * 26 * p.z * dt; p.dx += (dx / d) * f * 6; p.dy += (dy / d) * f * 6; }
          }
          p.dx *= 0.94; p.dy *= 0.94;
        }
        x = p.x + p.dx - ptr.x * 22 * p.z;
        y = mod(p.y + p.dy - ptr.y * 14 * p.z - scrollY * 0.05 * p.z, h + 40) - 20;
        var tw = 0.75 + 0.25 * Math.sin(t * 1.3 + p.ph);
        glow(p.c, x, y, p.r * 2.2, (0.16 + 0.42 * p.z) * tw);
      }
      ctx.globalAlpha = 1;
    }

    function draw(t, dt) {
      ctx.clearRect(0, 0, w, h);
      var strength = small ? 0.75 : 1;
      drawHelix(small ? 14 : Math.max(38, w * 0.045) - ptr.x * 6, t, strength, small ? 9 : 20);
      if (w >= 980) drawHelix(w - Math.max(38, w * 0.045) - ptr.x * 6, t + 2.1, 0.8, 18);
      molecules.forEach(function (m) { drawMolecule(m, t); });
      drawParticles(t, dt);
      if (gridEl) gridEl.style.transform = 'translate3d(' + (-ptr.x * 10).toFixed(1) + 'px,' + (-(ptr.y * 8) - (scrollY * 0.03) % 56).toFixed(1) + 'px,0)';
    }

    /* -- loop -- */
    function frame(ts) {
      raf = requestAnimationFrame(frame);
      var dt = Math.min(0.05, (ts - (last || ts)) / 1000); last = ts;
      var k = 1 - Math.exp(-dt * 4);
      ptr.x += (ptr.tx - ptr.x) * k; ptr.y += (ptr.ty - ptr.y) * k;
      draw((ts - t0) / 1000, dt);
    }
    function start() { if (running || reduced || document.hidden) return; running = true; last = 0; raf = requestAnimationFrame(frame); }
    function stop() { running = false; cancelAnimationFrame(raf); }
    function still() { ptr.x = ptr.y = 0; ptr.on = false; draw(2.2, 0); }

    /* -- events -- */
    function onMove(e) {
      if (reduced || e.pointerType === 'touch') return;
      ptr.tx = clamp((e.clientX / w) * 2 - 1, -1, 1); ptr.ty = clamp((e.clientY / h) * 2 - 1, -1, 1);
      ptr.px = e.clientX; ptr.py = e.clientY; ptr.on = true;
    }
    function onLeave() { ptr.tx = ptr.ty = 0; ptr.on = false; }
    function onScroll() { scrollY = window.scrollY || 0; if (reduced) still(); }
    var resizeTimer = 0;
    function onResize() { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { resize(); if (reduced) still(); }, 120); }
    function onVis() { if (document.hidden) stop(); else if (!reduced) start(); }

    window.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    document.addEventListener('visibilitychange', onVis);

    resize();
    if (reduced) still(); else start();

    return {
      setReducedMotion: function (flag) {
        reduced = !!flag;
        if (reduced) { stop(); still(); if (gridEl) gridEl.style.transform = ''; } else start();
      },
      destroy: function () {
        stop();
        window.removeEventListener('pointermove', onMove);
        document.documentElement.removeEventListener('pointerleave', onLeave);
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onResize);
        document.removeEventListener('visibilitychange', onVis);
      },
    };
  }

  window.SGBackground = { init: init };
})();
