/* ==========================================================================
   PROFILE DATA  —  THE ONLY FILE YOU NEED TO EDIT FOR CONTENT
   --------------------------------------------------------------------------
   Everything the site displays (name, bio, links, skills, projects, GitHub
   username) is read from this one object. Change a value here, save, refresh.

   Nothing else in the project contains personal information, except:
     • index.html   →  <title> and <meta> description (search / share previews)
     • assets/profile.jpg  →  your photo (see README)
   ========================================================================== */

window.PROFILE = {
  /* ---- Identity ---------------------------------------------------------- */
  name: "Suganth G",
  handle: "Suganth8270",                       // shown as @Suganth8270
  title: "B.Tech Biotechnology",
  focus: "Bioinformatics × Software Development",
  tagline:
    "Exploring the intersection of biotechnology, bioinformatics and software to build meaningful technology.",

  /* ---- Profile photo ------------------------------------------------------
     ▶ REPLACE THIS FILE:  assets/profile.jpg
       Best results: portrait crop, 4:5 ratio (e.g. 800 × 1000 px), under 300 KB.
       Keep the same filename, or change `src` below to match your new file. */
  photo: {
    src: "assets/profile.jpg",
    alt: "Portrait of G",
  },

  /* ---- Links ------------------------------------------------------------- */
  links: {
    github:    { label: "View GitHub",    url: "https://github.com/Suganth8270" },
    portfolio: { label: "View Portfolio", url: "https://suganth-portfolio-3kgs0490v-suganth-g1.vercel.app/" },
    linkedin:  { label: "LinkedIn",       url: "https://www.linkedin.com/in/suganthoff3125/" },
  },

  /* ---- About --------------------------------------------------------------
     `paragraphs`: keep it short. `interests`: shown as a list beside the text. */
  about: {
    paragraphs: [
      "Suganth G is a B.Tech Biotechnology student aiming to work where biology and software meet. Current focus areas are bioinformatics and software development, with an interest in tools that make biological data easier to explore.",
      "Projects so far include ProMatDb, a database for protein–biomaterial interactions built with Django, and BioPouch, a biodegradable food-packaging project based on cellulose from groundnut shells.",
    ],
    interests: [
      "Bioinformatics",
      "Computational biology",
      "Software development",
      "Protein and biomaterial research",
      "AI in biotechnology",
    ],
  },

  /* ---- Skills -------------------------------------------------------------
     icon:   code | server | dna | terminal
     accent: dapi (blue) | fitc (green) | ice (pale blue) | tritc (coral)
     span:   desktop grid width out of 12 (5 + 7 per row keeps the layout tidy) */
  skills: [
    { title: "Programming",   icon: "code",     accent: "dapi", span: 5,
      items: ["Python", "Java", "JavaScript", "SQL"] },
    { title: "Web / Backend", icon: "server",   accent: "ice",  span: 7,
      items: ["Django", "Django REST Framework", "REST APIs", "HTML", "CSS"] },
    { title: "Bioinformatics", icon: "dna",     accent: "fitc", span: 7,
      items: ["Protein Analysis", "Bioinformatics", "Computational Biology", "Molecular Biology"] },
    { title: "Tools",         icon: "terminal", accent: "tritc", span: 5,
      items: ["Git", "GitHub", "VS Code", "SQLite"] },
  ],

  /* ---- Projects -----------------------------------------------------------
     art:    network | cellulose | window   (the small illustration on each card)
     links:  each link is either
               { label, url, primary }          → opens the URL in a new tab
               { label, action: "details" }     → expands the card to show more info
     BioPouch has no repository yet. When you publish one, replace its
     `{ action: "details" }` link with `{ label: "View project", url: "https://…" }`. */
  projects: [
    {
      id: "promatdb",
      title: "ProMatDb",
      subtitle: "Protein–Biomaterial Interaction Database",
      description:
        "A database and web platform for exploring protein information, biomaterials and protein–biomaterial interactions, including structural and interaction information.",
      tech: ["Django", "Django REST Framework", "Python", "SQLite", "REST API", "UniProt API"],
      art: "network",
      featured: true,
      links: [
        { label: "View project", url: "https://github.com/Suganth8270/ProMatDb", primary: true },
      ],
    },
    {
      id: "biopouch",
      title: "BioPouch",
      subtitle: "Biodegradable Food Packaging",
      description:
        "A biotechnology project focused on biodegradable food packaging using cellulose derived from groundnut shell waste.",
      fullTitle:
        "Design and modelling of a fully biodegradable BioPouch using groundnut shell-derived cellulose for sustainable food packaging",
      tech: ["Cellulose", "Biotechnology", "Sustainable Materials", "Biodegradable Packaging"],
      art: "cellulose",
      links: [
        { label: "View project", action: "details", primary: true },
      ],
    },
    {
      id: "portfolio",
      title: "Personal Portfolio",
      subtitle: "Portfolio website",
      description: "My personal portfolio website, hosted on Vercel.",
      tech: [],
      art: "window",
      links: [
        { label: "Visit portfolio", url: "https://suganth-portfolio-3kgs0490v-suganth-g1.vercel.app/", primary: true },
        // NOTE: GitHub redirects your original "suganth-portfolio" URL to this
        // canonical name, so the repository now lives at "My-Portfolio".
        { label: "View source",     url: "https://github.com/Suganth8270/My-Portfolio" },
      ],
    },
  ],

  /* ---- GitHub section -----------------------------------------------------
     Live data comes from GitHub's public REST API (no key needed). If the
     request fails (offline, rate-limited) the section shows `fallbackRepos`. */
  github: {
    username: "Suganth8270",
    profileUrl: "https://github.com/Suganth8270",
    fallbackRepos: [
      {
        name: "ProMatDb",
        url: "https://github.com/Suganth8270/ProMatDb",
        description: "Protein–Biomaterial Interaction Database.",
      },
      {
        name: "My-Portfolio",
        url: "https://github.com/Suganth8270/My-Portfolio",
        description: "Personal portfolio website.",
      },
    ],
  },
};
