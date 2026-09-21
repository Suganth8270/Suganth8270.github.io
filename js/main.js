/* ==========================================================================
   MAIN  —  renders the page from window.PROFILE and starts the effects.
   You should not need to edit this file.
   ========================================================================== */
(function () {
  'use strict';

  var P = window.PROFILE, C = window.SGComponents, FX = window.SGEffects;
  var root = document.documentElement;
  root.classList.add('js');                     // CSS uses this to enable reveal animations

  var reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  function mount(id, nodes) {
    var el = document.getElementById(id);
    if (!el) return null;
    el.textContent = '';
    (Array.isArray(nodes) ? nodes : [nodes]).forEach(function (n) { if (n) el.appendChild(n); });
    return el;
  }

  /* ---- 1. Render content from profile-data.js ----------------------------- */
  document.title = P.name + ' — ' + P.title + ' · Bioinformatics & Software';

  mount('hero-content', C.HeroContent(P));
  mount('about-mount', C.AboutContent(P));
  mount('skills-mount', P.skills.map(C.SkillCard));
  mount('projects-mount', P.projects.map(C.ProjectCard));
  mount('footer-mount', C.Footer(P));

  document.querySelectorAll('[data-bind="name"]').forEach(function (el) { el.textContent = P.name; });

  /* GitHub section: show fallback immediately, then upgrade with live data. */
  var gh = C.GitHubPanel(P);
  mount('github-mount', gh.root);
  gh.showLoading();
  window.SGGitHub.load(P.github.username).then(gh.showData, function () {
    gh.showFallback('Live GitHub data is unavailable right now (offline or rate-limited). Open the profile for the latest.');
  });

  /* ---- 2. Effects ---------------------------------------------------------- */
  var reduced = reducedQuery.matches;

  var bg = window.SGBackground.init({
    canvas: document.getElementById('bg-canvas'),
    gridEl: document.getElementById('bg-grid'),
    reducedMotion: reduced,
  });
  var tilt = FX.initCardTilt(document.getElementById('profile-card'), document.getElementById('hero-stage'), reduced);
  var glow = FX.initCursorGlow(document.getElementById('cursor-glow'), reduced);
  FX.initSpotlights();
  FX.initReveal();
  FX.initNav();

  // React live if the user toggles "reduce motion" in their OS while the page is open.
  function onReducedChange(e) {
    reduced = e.matches;
    root.classList.toggle('reduced-motion', reduced);
    bg.setReducedMotion(reduced);
    tilt.setReducedMotion(reduced);
    glow.setReducedMotion(reduced);
  }
  root.classList.toggle('reduced-motion', reduced);
  if (reducedQuery.addEventListener) reducedQuery.addEventListener('change', onReducedChange);
  else if (reducedQuery.addListener) reducedQuery.addListener(onReducedChange);
})();
