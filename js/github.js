/* ==========================================================================
   GITHUB DATA
   Uses GitHub's public, unauthenticated REST API only — no keys, no tokens.
     GET /users/:user                 → repositories, followers, following, avatar
     GET /users/:user/repos           → repository list
     GET /users/:user/events/public   → recent public events (last ~90 days)

   Unauthenticated requests are limited to 60/hour per IP address, so:
     • results are cached in localStorage for 15 minutes,
     • if a request fails, the last cached copy is used (marked "saved data"),
     • if there is no cache either, the caller shows fallback content.
   GitHub does not offer a public API for the official contribution graph,
   so the heatmap is built from public events (which cover ~90 days).
   ========================================================================== */
(function () {
  'use strict';

  var CACHE_PREFIX = 'sg-github-v1:';
  var TTL_MS = 15 * 60 * 1000;
  var WEEKS = 13;

  /* ---- safe localStorage wrappers (storage can be blocked) --------------- */
  function readCache(key) {
    try {
      var raw = window.localStorage.getItem(CACHE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }
  function writeCache(key, value) {
    try { window.localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ t: Date.now(), v: value })); } catch (e) { /* ignore */ }
  }

  function getJSON(url, signal) {
    return fetch(url, { signal: signal }).then(function (res) {
      if (!res.ok) throw new Error('GitHub API responded with ' + res.status);
      return res.json();
    });
  }

  /* ---- activity grid ------------------------------------------------------ */
  function dayKey(d) {
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  function levelFor(n) { return n === 0 ? 0 : n === 1 ? 1 : n <= 3 ? 2 : n <= 6 ? 3 : 4; }

  // Columns = weeks (Sunday → Saturday), rows = weekdays. Ends with this week.
  function buildGrid(countsByDay) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var end = new Date(today); end.setDate(end.getDate() + (6 - today.getDay()));
    var start = new Date(end); start.setDate(start.getDate() - (WEEKS * 7 - 1));
    var cells = [], total = 0;
    for (var i = 0; i < WEEKS * 7; i++) {
      var d = new Date(start); d.setDate(start.getDate() + i);
      var future = d > today;
      var count = future ? 0 : (countsByDay[dayKey(d)] || 0);
      total += count;
      cells.push({ date: d, count: count, level: levelFor(count), future: future });
    }
    return { cells: cells, total: total };
  }
  function emptyGrid() { return buildGrid({}).cells; }

  function buildActivity(events) {
    var counts = {};
    events.forEach(function (ev) {
      var d = new Date(ev.created_at);
      if (isNaN(d)) return;
      var k = dayKey(d);
      counts[k] = (counts[k] || 0) + 1;
    });
    return buildGrid(counts);
  }

  /* ---- repositories -------------------------------------------------------- */
  function pickRepos(list) {
    var own = list.filter(function (r) { return !r.fork; });
    var chosen = (own.length ? own : list).slice(0, 4);
    return chosen.map(function (r) {
      return { name: r.name, url: r.html_url, description: r.description, language: r.language, stars: r.stargazers_count, updated: r.pushed_at || r.updated_at };
    });
  }

  /* ---- public: load(username) → Promise<{user, repos, activity, stale}> --- */
  function load(username) {
    var key = username.toLowerCase();
    var cached = readCache(key);
    if (cached && Date.now() - cached.t < TTL_MS) {
      return Promise.resolve(hydrate(cached.v, false));
    }

    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, 9000) : null;
    var base = 'https://api.github.com/users/' + encodeURIComponent(username);
    var signal = ctrl ? ctrl.signal : undefined;

    return Promise.all([
      getJSON(base, signal),
      getJSON(base + '/repos?per_page=100&sort=updated', signal).catch(function () { return null; }),
      getJSON(base + '/events/public?per_page=100', signal).catch(function () { return null; }),
    ]).then(function (r) {
      var user = r[0], repos = r[1], events = r[2];
      if (!user || typeof user !== 'object') throw new Error('Unexpected response');
      var plain = {
        user: { public_repos: user.public_repos, followers: user.followers, following: user.following, avatar_url: user.avatar_url },
        repos: repos ? pickRepos(repos) : null,
        events: events ? events.map(function (e) { return { created_at: e.created_at }; }) : null,
      };
      writeCache(key, plain);
      return hydrate(plain, false);
    }).catch(function (err) {
      if (cached) return hydrate(cached.v, true);   // stale cache beats nothing
      throw err;
    }).then(function (data) {
      if (timer) clearTimeout(timer);
      return data;
    }, function (err) {
      if (timer) clearTimeout(timer);
      throw err;
    });
  }

  function hydrate(plain, stale) {
    return {
      user: plain.user,
      repos: plain.repos,
      activity: plain.events ? buildActivity(plain.events) : null,
      stale: stale,
    };
  }

  window.SGGitHub = { load: load, emptyGrid: emptyGrid };
})();
