# Suganth S — Liquid-Glass Profile Website

A static, dependency-free personal site: a physical-feeling glass profile card over a dark
biotechnology lab atmosphere (drifting particles, rotating molecules, a scrolling DNA helix).
Plain HTML + CSS + JavaScript — **no build step, no npm install**.

## Project structure

```
suganth-profile/
├── index.html              Page shell + SEO meta tags
├── README.md               This file
├── vercel.json             Optional Vercel settings (clean URLs, security headers)
├── .nojekyll               Tells GitHub Pages to serve files as-is
├── .gitignore
├── assets/
│   ├── profile.jpg         ← YOUR PHOTO GOES HERE (currently a placeholder)
│   └── favicon.svg
├── css/
│   ├── base.css            Colour/type tokens, reset, layout          ← edit colours here
│   ├── glass.css           Glass surfaces, buttons, nav, hero card
│   ├── sections.css        About, skills, projects, GitHub, footer
│   └── effects.css         Background, cursor glow, reveal, reduced-motion
└── js/
    ├── profile-data.js     ← ALL your content lives here
    ├── components.js       Reusable UI builders (buttons, cards, GitHub panel…)
    ├── github.js           Public GitHub API loader (cache + fallback)
    ├── background.js       Canvas: particles, molecules, DNA helix
    ├── effects.js          Card tilt, cursor glow, spotlights, reveal, nav
    └── main.js             Renders the page and starts the effects
```

## 1. Run locally

Any one of these (from inside the `suganth-profile` folder):

```bash
# Option A — Python (already installed on most machines)
python3 -m http.server 8000
# then open http://localhost:8000

# Option B — Node
npx serve .
# then open the URL it prints (usually http://localhost:3000)
```

You can also just double-click `index.html` — scripts are classic (non-module) files, so it works from disk too.

## 2. Add your profile photo

Put your photo at exactly:

```
suganth-profile/assets/profile.jpg
```

Replace the placeholder file, keeping the name `profile.jpg`.

- Best size: portrait crop, **4:5 ratio** (e.g. 800 × 1000 px), under ~300 KB.
- Face roughly centred; the card crops with `object-fit: cover`.
- Using a PNG/WebP or another name? Open `js/profile-data.js` and change `photo.src`
  (for example `"assets/me.webp"`).
- After replacing it, hard-refresh the browser (Ctrl/Cmd + Shift + R) to bypass the cache.

If the file is missing, the site automatically shows a monogram placeholder instead of a broken image.

## 3. Edit your information

Open **`js/profile-data.js`**. Every name, bio line, link, skill, project and the GitHub username is there,
with comments. Save and refresh — nothing else needs to change.

Two things live outside that file:
- `index.html` → the `<title>` and `<meta name="description">` (search results and link previews)
- `css/base.css` → colour and font tokens at the top (`--dapi`, `--fitc`, `--abyss`, …)

**BioPouch:** it has no repository URL, so its "View project" button expands the card to show the full
project title. When you publish a repo, in `profile-data.js` replace
`{ label: "View project", action: "details", primary: true }` with
`{ label: "View project", url: "https://github.com/…", primary: true }`.

## 4. Deploy to GitHub Pages

All paths are relative, so this works both as a user site and as a project site.

1. Create a **public** repository on GitHub: <https://github.com/new>
   - Name it `Suganth8270.github.io` to get the address `https://suganth8270.github.io/`
   - (Any other name also works; the address becomes `https://suganth8270.github.io/<repo-name>/`.)
   - Do not tick "Add a README" (keep it empty).
2. In a terminal, from inside the `suganth-profile` folder:

   ```bash
   git init
   git add .
   git commit -m "Add profile website"
   git branch -M main
   git remote add origin https://github.com/Suganth8270/Suganth8270.github.io.git
   git push -u origin main
   ```
   (If you chose another repo name, use that in the `remote add` URL.)
3. On GitHub open the repo → **Settings** → **Pages**.
4. Under **Build and deployment → Source** choose **Deploy from a branch**.
5. Under **Branch** choose **main** and folder **/ (root)**, then click **Save**.
6. Wait ~1 minute and refresh the Pages screen; it shows your live URL.

To update later: change files, then `git add . && git commit -m "Update" && git push`.

## 5. Deploy to Vercel

**Option A — dashboard (recommended)**
1. Push the project to a GitHub repo (steps 1–2 above; any repo name works).
2. Go to <https://vercel.com/new> and sign in with GitHub.
3. Click **Import** next to your repository.
4. Set **Framework Preset** to **Other**. Leave **Build Command**, **Output Directory** and
   **Install Command** empty (no build step).
5. Click **Deploy**. Every future `git push` redeploys automatically.

**Option B — CLI**
```bash
npm install -g vercel
cd suganth-profile
vercel          # first run: log in, accept defaults, answer "No" to "modify settings"
vercel --prod   # publish to production
```

## How the effects behave

| Feature | Desktop (mouse) | Touch devices | `prefers-reduced-motion` |
|---|---|---|---|
| Card 3D tilt + follow | Yes (max ≈ 5.5°) | No | Off |
| Cursor-tracking reflection / rim light | Yes | Light-touch highlight + slow idle sheen | Static |
| Cursor glow, particle response, parallax | Yes | No | Off |
| Particles, molecules, DNA helix | Animated | Animated, fewer | One still frame |
| Scroll reveal | Yes | Yes | Content simply visible |

Tune the tilt in `js/effects.js` (`MAX_TILT_Y`, `MAX_TILT_X`, `FOLLOW_X`, `FOLLOW_Y`, `SMOOTHING`).

## GitHub section notes

- Uses only GitHub's public, unauthenticated API (no keys anywhere).
- Unauthenticated requests are limited to 60/hour per visitor IP; results are cached in the visitor's
  browser for 15 minutes, and saved data is reused if a request fails.
- If the API is unreachable the section shows your repositories from `github.fallbackRepos` in
  `profile-data.js` and a short notice — never a broken layout.
- GitHub has no public API for the official contribution graph, so the heatmap shows **public events**
  (pushes, PRs, issues, …) from roughly the last 90 days.
