/* ==========================================================================
   COMPONENTS
   Small, reusable DOM builders. They only read from window.PROFILE, so you
   normally never edit this file to change content — edit js/profile-data.js.

   Security note: all text is inserted with textContent (via createTextNode),
   never innerHTML, so data from the GitHub API cannot inject markup.
   Only the hard-coded SVG strings below use innerHTML.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- tiny DOM helper ------------------------------------------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    if (props) {
      Object.keys(props).forEach(function (k) {
        var v = props[k];
        if (v === null || v === undefined || v === false) return;
        if (k === 'class') el.className = v;
        else if (k === 'style' && typeof v === 'object') {
          Object.keys(v).forEach(function (p) { el.style.setProperty(p, v[p]); });
        } else el.setAttribute(k, v === true ? '' : v);
      });
    }
    for (var i = 2; i < arguments.length; i++) append(el, arguments[i]);
    return el;
  }
  function append(el, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { append(el, c); }); return; }
    el.appendChild(child.nodeType ? child : document.createTextNode(String(child)));
  }
  function fromSVG(markup) {
    var t = document.createElement('template');
    t.innerHTML = markup.trim();
    return t.content.firstChild;
  }

  /* ---------- icons (24×24) --------------------------------------------- */
  var STROKE = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var ICONS = {
    // Brand marks (filled)
    github: '<path fill="currentColor" d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.921.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>',
    linkedin: '<path fill="currentColor" d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>',
    // Stroke icons
    globe: '<g ' + STROKE + '><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.5 5.7 12 3z"/></g>',
    external: '<g ' + STROKE + '><path d="M14 4h6v6"/><path d="M20 4 10 14"/><path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/></g>',
    code: '<g ' + STROKE + '><path d="m8 8-4 4 4 4"/><path d="m16 8 4 4-4 4"/><path d="m13.5 5-3 14"/></g>',
    server: '<g ' + STROKE + '><rect x="3" y="4" width="18" height="6" rx="2"/><rect x="3" y="14" width="18" height="6" rx="2"/><path d="M7 7h.01M7 17h.01"/></g>',
    dna: '<g ' + STROKE + '><path d="M7 3c0 5 10 5 10 9s-10 4-10 9"/><path d="M17 3c0 5-10 5-10 9s10 4 10 9"/><path d="M8.6 6.4h6.8M8.6 17.6h6.8"/></g>',
    terminal: '<g ' + STROKE + '><path d="m4 17 6-6-6-6"/><path d="M12 19h8"/></g>',
    star: '<g ' + STROKE + '><path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/></g>',
    repo: '<g ' + STROKE + '><path d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3V4z"/><path d="M5 17a3 3 0 0 1 3-3h11"/></g>',
    users: '<g ' + STROKE + '><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7"/><path d="M18 14a6.5 6.5 0 0 1 3.5 6"/></g>',
    chevron: '<g ' + STROKE + '><path d="m6 9 6 6 6-6"/></g>',
  };
  function icon(name, cls) {
    var svg = fromSVG('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true" focusable="false">' + (ICONS[name] || '') + '</svg>');
    svg.setAttribute('class', 'icon' + (cls ? ' ' + cls : ''));
    return svg;
  }

  /* ---------- Button ----------------------------------------------------- */
  // Renders <a> when `href` is given, otherwise <button>.
  function Button(o) {
    var isLink = !!o.href;
    var external = isLink && /^https?:/i.test(o.href);
    var el = h(isLink ? 'a' : 'button', {
      class: 'btn btn--' + (o.variant || 'ghost'),
      href: isLink ? o.href : null,
      type: isLink ? null : 'button',
      target: external ? '_blank' : null,
      rel: external ? 'noopener noreferrer' : null,
      'aria-expanded': o.expanded !== undefined ? String(o.expanded) : null,
      'aria-controls': o.controls || null,
    },
      o.icon ? icon(o.icon) : null,
      h('span', { class: 'btn__label' }, o.label),
      external ? h('span', { class: 'sr-only' }, ' (opens in a new tab)') : null
    );
    if (o.onClick) el.addEventListener('click', o.onClick);
    return el;
  }

  function ChipList(items) {
    if (!items || !items.length) return null;
    return h('ul', { class: 'chips', role: 'list' },
      items.map(function (t) { return h('li', { class: 'chip' }, t); }));
  }

  /* ---------- Profile photo placeholder (used only if the image fails) --- */
  function placeholderDataURI(initial) {
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000">' +
      '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#12274d"/><stop offset="1" stop-color="#050b18"/></linearGradient>' +
      '<radialGradient id="r" cx=".3" cy=".25" r=".7"><stop offset="0" stop-color="#7fb2ff" stop-opacity=".35"/><stop offset="1" stop-color="#7fb2ff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="800" height="1000" fill="url(#g)"/><rect width="800" height="1000" fill="url(#r)"/>' +
      '<text x="400" y="560" text-anchor="middle" font-family="Georgia,serif" font-size="360" fill="#e8f0fd" fill-opacity=".9">' + initial + '</text><text x="400" y="885" text-anchor="middle" font-family="Arial,sans-serif" font-size="26" letter-spacing="6" fill="#cfe3ff" fill-opacity=".72">BIOTECH / BIOINFORMATICS</text></svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  /* ---------- Hero (inside the glass profile card) ----------------------- */
  function HeroContent(p) {
    var img = h('img', {
      src: p.photo.src, alt: p.photo.alt, width: 800, height: 1000,
      decoding: 'async', fetchpriority: 'high',
    });
    // If assets/profile.jpg is missing, fall back to an elegant monogram.
    img.addEventListener('error', function () {
      if (img.dataset.fallback) return;
      img.dataset.fallback = '1';
      img.src = placeholderDataURI(p.name.charAt(0).toUpperCase());
    });

    var portrait = h('figure', { class: 'portrait', 'data-depth': '16' },
      img,
      h('span', { class: 'portrait__shine', 'aria-hidden': 'true' }),
      h('span', { class: 'portrait__scan', 'aria-hidden': 'true' })
    );

    var identity = h('div', { class: 'identity', 'data-depth': '9' },
      h('h1', { class: 'identity__name' }, p.name),
      h('p', { class: 'identity__role' }, p.title),
      h('p', { class: 'identity__focus' }, p.focus),
      h('p', { class: 'identity__bio' }, p.tagline),
      h('div', { class: 'actions' },
        Button({ label: p.links.github.label,    href: p.links.github.url,    variant: 'primary', icon: 'github' }),
        Button({ label: p.links.portfolio.label, href: p.links.portfolio.url, variant: 'ghost',   icon: 'globe' }),
        Button({ label: p.links.linkedin.label,  href: p.links.linkedin.url,  variant: 'ghost',   icon: 'linkedin' })
      )
    );

    return [portrait, identity];
  }

  /* ---------- About ------------------------------------------------------- */
  function AboutContent(p) {
    var copy = h('div', { class: 'about__copy' },
      h('div', { class: 'about__content about__text' },
        p.about.paragraphs.map(function (t, i) { return h('p', { class: 'reveal', style: { '--i': String(i + 1) } }, t); }))
    );
    return [
      copy,
      h('div', { class: 'about__interests glass reveal', style: { '--i': '1' } },
        h('h3', { class: 'about__interests-title' }, 'Areas of interest'),
        h('ul', { class: 'interests', role: 'list' },
          p.about.interests.map(function (t) {
            return h('li', { class: 'interests__item' }, h('span', { class: 'interests__dot', 'aria-hidden': 'true' }), t);
          }))
      ),
    ];
  }

  /* ---------- Skills ------------------------------------------------------ */
  function SkillCard(cat, i) {
    return h('article', {
      class: 'skill glass lift spot reveal',
      'data-span': String(cat.span || 6),
      style: { '--accent': 'var(--' + cat.accent + ')', '--i': String(i) },
    },
      h('header', { class: 'skill__head' },
        h('span', { class: 'skill__icon' }, icon(cat.icon)),
        h('h3', { class: 'skill__title' }, cat.title)),
      ChipList(cat.items)
    );
  }

  /* ---------- Project art (decorative, hard-coded SVG) -------------------- */
  function hexPoints(cx, cy, r) {
    var pts = [];
    for (var k = 0; k < 6; k++) {
      var a = (-90 + 60 * k) * Math.PI / 180;
      pts.push((cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1));
    }
    return pts.join(' ');
  }
  function ProjectArt(kind) {
    var body = '';
    if (kind === 'network') {
      var P = { A: [70, 95], B: [118, 62], C: [152, 118], D: [96, 150], E: [62, 205], F: [138, 206], G: [196, 166], H: [206, 100] };
      var bonds = ['AB', 'BC', 'AD', 'CD', 'DE', 'DF', 'CG', 'FG', 'BH', 'CH'];
      bonds.forEach(function (b) {
        body += '<line class="art__line" x1="' + P[b[0]][0] + '" y1="' + P[b[0]][1] + '" x2="' + P[b[1]][0] + '" y2="' + P[b[1]][1] + '"/>';
      });
      Object.keys(P).forEach(function (k, i) {
        body += '<circle class="art__node ' + (i === 2 || i === 6 ? 'art__node--warm' : '') + '" cx="' + P[k][0] + '" cy="' + P[k][1] + '" r="' + (i % 3 === 0 ? 7 : 5.5) + '"/>';
      });
      var lattice = [[290, 95], [335, 95], [267.5, 134], [312.5, 134], [357.5, 134], [290, 173], [335, 173]];
      lattice.forEach(function (c) { body += '<polygon class="art__hex" points="' + hexPoints(c[0], c[1], 26) + '"/>'; });
      body += '<line class="art__link" x1="152" y1="118" x2="267.5" y2="134"/><line class="art__link" x1="196" y1="166" x2="290" y2="173"/>' +
              '<circle class="art__pulse" cx="267.5" cy="134" r="4"/><circle class="art__pulse" cx="290" cy="173" r="4"/>';
    } else if (kind === 'cellulose') {
      var rings = [[95, 170], [190, 120], [285, 170]];
      body += '<path class="art__fibre" d="M20 60 C110 20 170 90 260 50 S380 40 410 70"/><path class="art__fibre" d="M10 250 C90 220 150 270 240 240 S370 250 415 225"/>';
      rings.forEach(function (c) { body += '<polygon class="art__hex art__hex--fill" points="' + hexPoints(c[0], c[1], 34) + '"/>'; });
      body += '<line class="art__line" x1="122" y1="152" x2="163" y2="134"/><line class="art__line" x1="217" y1="134" x2="258" y2="152"/>' +
              '<circle class="art__node art__node--warm" cx="142" cy="143" r="6"/><circle class="art__node art__node--warm" cx="238" cy="143" r="6"/>';
      rings.forEach(function (c, i) {
        var dir = i % 2 === 0 ? 1 : -1;
        body += '<line class="art__line" x1="' + c[0] + '" y1="' + (c[1] + dir * 34) + '" x2="' + c[0] + '" y2="' + (c[1] + dir * 58) + '"/>' +
                '<circle class="art__node art__node--green" cx="' + c[0] + '" cy="' + (c[1] + dir * 62) + '" r="5"/>';
      });
      body += '<line class="art__line" x1="313" y1="150" x2="355" y2="130"/><circle class="art__node" cx="360" cy="127" r="5"/>';
    } else {
      body += '<rect class="art__frame" x="60" y="52" width="300" height="196" rx="18"/>' +
              '<line class="art__line" x1="60" y1="88" x2="360" y2="88"/>' +
              '<circle class="art__node" cx="84" cy="70" r="4.5"/><circle class="art__node art__node--green" cx="102" cy="70" r="4.5"/><circle class="art__node art__node--warm" cx="120" cy="70" r="4.5"/>' +
              '<rect class="art__block" x="84" y="110" width="120" height="14" rx="7"/><rect class="art__block art__block--dim" x="84" y="136" width="190" height="10" rx="5"/><rect class="art__block art__block--dim" x="84" y="156" width="160" height="10" rx="5"/>' +
              '<rect class="art__frame" x="84" y="186" width="80" height="40" rx="10"/><rect class="art__frame" x="176" y="186" width="80" height="40" rx="10"/><rect class="art__frame" x="268" y="186" width="68" height="40" rx="10"/>';
    }
    return fromSVG('<svg class="art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 300" aria-hidden="true" focusable="false">' + body + '</svg>');
  }

  /* ---------- Projects ---------------------------------------------------- */
  function ProjectCard(p, i) {
    var detailsId = 'details-' + p.id;
    var details = null;

    var actions = h('div', { class: 'project__actions' });
    p.links.forEach(function (l) {
      if (l.action === 'details') {
        var btn = Button({
          label: l.label, variant: l.primary ? 'primary' : 'ghost',
          expanded: false, controls: detailsId, icon: 'chevron',
        });
        btn.classList.add('btn--toggle');
        btn.addEventListener('click', function () {
          var open = btn.getAttribute('aria-expanded') !== 'true';
          btn.setAttribute('aria-expanded', String(open));
          btn.querySelector('.btn__label').textContent = open ? 'Hide project' : l.label;
          details.classList.toggle('is-open', open);
          if (open) {
            var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
            setTimeout(function () {
              details.scrollIntoView({ block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
            }, 120);
          }
        });
        actions.appendChild(btn);
      } else {
        actions.appendChild(Button({
          label: l.label, href: l.url, variant: l.primary ? 'primary' : 'ghost',
          icon: l.primary ? 'external' : null,
        }));
      }
    });

    if (p.fullTitle || p.description) {
      var hasDetails = p.links.some(function (l) { return l.action === 'details'; });
      if (hasDetails) {
        details = h('div', { class: 'details', id: detailsId, role: 'region', 'aria-label': p.title + ' details' },
          h('div', { class: 'details__clip' },
            h('div', { class: 'details__inner' },
              p.fullTitle ? h('p', { class: 'details__label' }, 'Project title') : null,
              p.fullTitle ? h('h4', { class: 'details__title' }, p.fullTitle) : h('p', null, p.description))));
      }
    }

    var projectImage = h('img', {
      class: 'project__image',
      src: 'assets/' + p.id + '.png',
      alt: p.title + ' project preview',
      loading: 'lazy',
      decoding: 'async',
    });

    return h('article', {
      class: 'project glass lift spot reveal' + (p.featured ? ' project--featured' : ''),
      'data-project': p.id, style: { '--i': String(i) },
    },
      h('div', { class: 'project__art' }, projectImage),
      h('div', { class: 'project__body' },
        h('h3', { class: 'project__title' }, p.title),
        h('p', { class: 'project__subtitle' }, p.subtitle),
        h('p', { class: 'project__desc' }, p.description),
        ChipList(p.tech),
        actions,
        details
      )
    );
  }

  /* ---------- GitHub panel ------------------------------------------------ */
  var MONTHS_FMT = (function () { try { return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric' }); } catch (e) { return null; } })();
  var DAY_FMT = (function () { try { return new Intl.DateTimeFormat('en', { weekday: 'short', month: 'short', day: 'numeric' }); } catch (e) { return null; } })();

  function RepoCard(r) {
    var meta = h('div', { class: 'repo__meta' });
    if (r.language) meta.appendChild(h('span', { class: 'repo__lang' }, h('span', { class: 'repo__lang-dot', 'aria-hidden': 'true' }), r.language));
    if (typeof r.stars === 'number') meta.appendChild(h('span', { class: 'repo__stat' }, icon('star'), h('span', { class: 'sr-only' }, 'Stars: '), String(r.stars)));
    if (r.updated && MONTHS_FMT) meta.appendChild(h('span', { class: 'repo__stat' }, 'Updated ' + MONTHS_FMT.format(new Date(r.updated))));
    return h('li', { class: 'repo-wrap' },
      h('a', { class: 'repo glass lift spot', href: r.url, target: '_blank', rel: 'noopener noreferrer' },
        h('span', { class: 'repo__name' }, icon('repo'), h('span', null, r.name), h('span', { class: 'sr-only' }, ' (opens in a new tab)')),
        r.description ? h('span', { class: 'repo__desc' }, r.description) : null,
        meta.children.length ? meta : null));
  }

  function GitHubPanel(p) {
    var gh = p.github;
    var initials = p.name.split(/\s+/).map(function (w) { return w.charAt(0); }).join('').toUpperCase();
    var refs = {};

    function stat(key, label) {
      refs[key] = h('span', { class: 'stat__value' }, '—');
      return h('div', { class: 'stat' }, h('dt', { class: 'stat__label' }, label), h('dd', { class: 'stat__dd' }, refs[key]));
    }

    refs.avatar = h('div', { class: 'gh-avatar' }, h('span', { 'aria-hidden': 'true' }, initials));
    refs.note = h('p', { class: 'gh-note', role: 'status' }, 'Loading public GitHub data…');

    var profileCard = h('div', { class: 'gh-profile glass reveal' },
      h('div', { class: 'gh-profile__head' },
        refs.avatar,
        h('div', null,
          h('h3', { class: 'gh-profile__name' }, p.name),
          h('p', { class: 'gh-profile__handle' }, '@' + gh.username))),
      h('dl', { class: 'stats' }, stat('repos', 'Repositories'), stat('followers', 'Followers'), stat('following', 'Following')),
      refs.note,
      Button({ label: 'View GitHub profile', href: gh.profileUrl, variant: 'primary', icon: 'github' })
    );

    // Activity heatmap: 13 weeks × 7 days
    refs.heatmap = h('div', { class: 'heatmap', role: 'img', 'aria-label': 'Public GitHub activity heatmap' });
    refs.activityCaption = h('p', { class: 'activity__caption' }, 'Public events over the last 13 weeks.');
    var legend = h('div', { class: 'legend', 'aria-hidden': 'true' },
      h('span', null, 'Less'),
      [0, 1, 2, 3, 4].map(function (l) { return h('span', { class: 'cell l' + l }); }),
      h('span', null, 'More'));

    var activity = h('div', { class: 'gh-activity glass reveal', style: { '--i': '1' } },
      h('h3', { class: 'gh-block-title' }, 'Public activity'),
      refs.activityCaption, refs.heatmap, legend);

    refs.repos = h('ul', { class: 'repos', role: 'list' });
    var reposBlock = h('div', { class: 'gh-repos reveal', style: { '--i': '2' } },
      h('h3', { class: 'gh-block-title' }, 'Repositories'), refs.repos);

    var root = h('div', { class: 'gh' }, profileCard, activity, reposBlock);
    refs.root = root;

    // ---- render helpers
    function renderHeatmap(cells, total, live) {
      activity.classList.toggle('is-unavailable', live === false);
      refs.heatmap.textContent = '';
      cells.forEach(function (c) {
        var cell = h('span', { class: 'cell l' + (c.future ? 'x' : c.level) });
        if (!c.future && DAY_FMT) cell.title = c.count + (c.count === 1 ? ' public event' : ' public events') + ' — ' + DAY_FMT.format(c.date);
        refs.heatmap.appendChild(cell);
      });
      refs.heatmap.setAttribute('aria-label', live
        ? 'Public GitHub activity: ' + total + ' public events in the last 13 weeks'
        : 'Public GitHub activity is not available yet');
    }
    function renderRepos(list) {
      refs.repos.textContent = '';
      list.forEach(function (r) { refs.repos.appendChild(RepoCard(r)); });
    }

    return {
      root: root,
      // Initial state: never empty. Placeholder grid + your own repositories from profile-data.js.
      showLoading: function () {
        refs.note.classList.remove('is-warn');
        refs.note.textContent = 'Loading public GitHub data…';
        refs.activityCaption.textContent = 'Loading public activity…';
        renderHeatmap(window.SGGitHub.emptyGrid(), 0, null);
        renderRepos(gh.fallbackRepos.map(function (r) { return { name: r.name, url: r.url, description: r.description }; }));
      },
      // Shown when the API request fails and there is no saved copy.
      showFallback: function (message) {
        refs.note.textContent = message || 'Live GitHub data is unavailable right now. Open the profile for the latest.';
        refs.note.classList.add('is-warn');
        renderHeatmap(window.SGGitHub.emptyGrid(), 0, false);
        refs.activityCaption.textContent = 'Live activity could not be loaded.';
        renderRepos(gh.fallbackRepos.map(function (r) { return { name: r.name, url: r.url, description: r.description }; }));
      },
      showData: function (d) {
        if (d.user) {
          var values = [d.user.public_repos, d.user.followers, d.user.following];
          root.querySelectorAll('.stat__value').forEach(function (el, idx) {
            el.textContent = typeof values[idx] === 'number' ? String(values[idx]) : '—';
          });
          // Only accept GitHub-hosted avatar URLs.
          if (typeof d.user.avatar_url === 'string' && /^https:\/\/avatars\.githubusercontent\.com\//.test(d.user.avatar_url)) {
            var av = h('img', { src: d.user.avatar_url + (d.user.avatar_url.indexOf('?') > -1 ? '&' : '?') + 's=160', alt: '', width: 80, height: 80, loading: 'lazy', decoding: 'async' });
            av.addEventListener('error', function () { av.remove(); });
            refs.avatar.appendChild(av);
          }
        }
        var list = d.repos && d.repos.length ? d.repos : gh.fallbackRepos.map(function (r) {
          return { name: r.name, url: r.url, description: r.description };
        });
        renderRepos(list);
        if (d.activity) {
          renderHeatmap(d.activity.cells, d.activity.total, true);
          refs.activityCaption.textContent = d.activity.total === 0
            ? 'No public events in the last 13 weeks.'
            : d.activity.total + ' public ' + (d.activity.total === 1 ? 'event' : 'events') + ' over the last 13 weeks.';
        } else {
          renderHeatmap(window.SGGitHub.emptyGrid(), 0, false);
          refs.activityCaption.textContent = 'Activity data is unavailable right now.';
        }
        refs.note.classList.remove('is-warn');
        refs.note.textContent = d.stale
          ? 'Showing saved data from an earlier visit.'
          : 'Live data from the public GitHub API.';
      },
    };
  }

  /* ---------- Footer ------------------------------------------------------ */
  function Footer(p) {
    var links = h('ul', { class: 'footer__links', role: 'list' },
      [['GitHub', p.links.github.url, 'github'], ['LinkedIn', p.links.linkedin.url, 'linkedin'], ['Portfolio', p.links.portfolio.url, 'globe']]
        .map(function (l) {
          return h('li', null, h('a', { href: l[1], target: '_blank', rel: 'noopener noreferrer' }, icon(l[2]), h('span', null, l[0]), h('span', { class: 'sr-only' }, ' (opens in a new tab)')));
        }));
    return [
      h('p', { class: 'footer__copy' }, '© ' + new Date().getFullYear() + ' ' + p.name),
      links,
    ];
  }

  window.SGComponents = {
    h: h, icon: icon, Button: Button, HeroContent: HeroContent, AboutContent: AboutContent,
    SkillCard: SkillCard, ProjectCard: ProjectCard, GitHubPanel: GitHubPanel, Footer: Footer,
  };
})();
