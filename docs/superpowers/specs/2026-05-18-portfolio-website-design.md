# Portfolio Website — Design Spec

**Date:** 2026-05-18
**Owner:** Ege Ayyıldız
**Domain:** egeayyildiz.me
**Repo:** github.com/caisergan/portfolio-website

## Goal

Build a personal portfolio site that faithfully reproduces the design in
`references/portfolio.html` — a single-page, dark, monospace/terminal-aesthetic
site for a software engineer — with the author's real content and a real
GitHub activity heatmap, deployed to a self-managed VPS.

## Non-Goals (explicit)

- No blog or case-study posts in v1 (planned for a later iteration; design must
  not preclude it).
- No CMS, no admin UI, no auth.
- No analytics, no cookies, no tracking pixels.
- No server-rendered pages, no API routes, no long-running backend process.
- No unit, snapshot, or E2E test suite (see Testing section for what we do
  instead).

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | Astro 5 (TypeScript) | Component split for a content-heavy page; ships zero JS by default; static output; trivial to add MDX-based blog later. |
| Styling | Tailwind CSS + a small `global.css` | Semantic color tokens via CSS custom properties; plain CSS only where it earns it (grid background, caret keyframe). |
| Fonts | JetBrains Mono via `@fontsource-variable/jetbrains-mono` | Self-hosted, no Google Fonts request, matches reference. |
| Data refresh | Node cron script on VPS → JSON file in webroot | No build server, no token in browser, no SSR. |
| Frontend GitHub fetch | Vanilla `fetch()` on `DOMContentLoaded` | No framework hydration; updates pre-rendered skeleton DOM. |
| Web server | Caddy | Auto-HTTPS via Let's Encrypt; ~10 lines of config. |
| Deploy | Owner-handled (manual rsync or owner's own script) | No deploy script in repo. |

## Architecture

```
┌──────────────────────────────┐
│ scripts/fetch-github.mjs     │   runs on VPS via cron, every 24h
└─────────────┬────────────────┘
              │ GitHub API (auth: GH_TOKEN env)
              ↓
┌──────────────────────────────┐
│ /var/www/egeayyildiz.me/     │   atomic write: tmp file → rename
│   data/github.json           │
└─────────────┬────────────────┘
              │ HTTP GET /data/github.json
              ↓
┌──────────────────────────────┐    static HTML served by Caddy
│ Browser: GithubSection       │    from /var/www/egeayyildiz.me/
│   ├─ skeleton (SSR'd)        │
│   └─ swapped → real data     │
└──────────────────────────────┘
```

Two independent flows:

1. **Site code** — committed to git, built locally with `astro build`, output
   rsynced to `/var/www/egeayyildiz.me/`.
2. **GitHub data** — cron script writes `/var/www/egeayyildiz.me/data/github.json`
   on a 24h schedule. Last-good file is preserved on failure.

The two flows do not block each other. The deploy step explicitly excludes
`data/` so a site deploy never wipes the cron-written JSON.

## File Layout

```
portfolio-website/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── package.json
├── public/
│   ├── favicon.svg
│   └── resume.pdf
├── src/
│   ├── data/
│   │   └── profile.ts             # all owner content (typed)
│   ├── styles/
│   │   └── global.css             # CSS vars + Tailwind layers + small keyframes
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Hero.astro
│   │   ├── TerminalCard.astro
│   │   ├── About.astro
│   │   ├── Projects.astro
│   │   ├── GithubSection.astro    # composes Heatmap + RepoList; owns the fetch
│   │   ├── Heatmap.astro          # renders the 52×7 grid from JSON
│   │   ├── RepoList.astro
│   │   ├── Experience.astro
│   │   ├── Stack.astro
│   │   └── Footer.astro
│   ├── layouts/
│   │   └── Base.astro             # <head>, fonts, global styles, grid background
│   └── pages/
│       └── index.astro            # composes all sections in order
├── scripts/
│   └── fetch-github.mjs           # cron script (lives in repo, runs on VPS)
└── docs/superpowers/specs/
    └── 2026-05-18-portfolio-website-design.md
```

### Component sizing rule

One component per visual section of the reference. If any single component
file grows past ~250 lines, split it (e.g., `Projects` → `ProjectRow`).

## Content Data Model

All owner content lives in one typed file: `src/data/profile.ts`.
Components import the `profile` object and render. Editing the bio means
editing one file; no template hunting.

```ts
// src/data/profile.ts — shape, not values
export const profile = {
  name: string,
  handle: string,
  role: string,
  location: string,
  timezone: string,
  yearsSince: number,
  email: string,
  available: boolean,
  resumeUrl: string,
  social: { github: string, linkedin: string, x?: string, /* ... */ },

  hero: {
    kicker: string,
    headlineLead: string,
    headlineAccent: string,           // rendered in --accent color
    headlineTail: string,
    lede: string,                     // may include <em> spans
    terminal: { focus: string, openTo: string, uptime: string },
  },

  about: {
    paragraphs: string[],
    atAGlance: Array<{ k: string, v: string }>,
  },

  projects: Array<{
    num: string,                      // "01", "02", ...
    name: string,
    year: string,                     // "2024 — present"
    role: string,
    blurb: string,
    stack: string[],
    links: Array<{ label: string, href: string }>,
    meta: Array<{ k: string, v: string }>,   // right-column metrics
  }>,

  experience: Array<{
    when: string,                     // "now — 2024" or "2024 — 2022"
    duration: string,                 // "2y 4mo"
    title: string,
    company: string,
    where: string,
    bullets: string[],
    current?: boolean,
  }>,

  stack: {
    languages: Array<{ name: string, level: "daily" | "often" | "sometimes" }>,
    frontend:  Array<{ name: string, level: string }>,
    backend:   Array<{ name: string, level: string }>,
    infra:     Array<{ name: string, level: string }>,
  },

  readingList: Array<{ title: string, href: string }>,
};
```

GitHub data lives in a separate JSON file written by the cron script (see next
section); it is never edited by hand and is not in the repo.

## GitHub Data Flow

### Cron script: `scripts/fetch-github.mjs`

- Single Node script, zero npm dependencies (built-in `fetch` and `fs`).
- Reads `GH_TOKEN` from a `.env`-style file on the VPS (not committed; never
  in the browser).
- Calls three GitHub endpoints:
  1. GraphQL `user.contributionsCollection.contributionCalendar`
     → 52 weeks × 7 days heatmap, longest streak, current streak,
     12-month total commit count.
  2. REST `GET /users/{user}/repos?sort=updated&per_page=100`
     → filter out forks, sort by stars desc, take top 5.
  3. REST search `GET /search/issues?q=is:pr+author:{user}+is:merged+created:>={date-12mo-ago}`
     → merged-PR count for the last 12 months.
- Output shape:
  ```ts
  {
    generatedAt: string,                // ISO timestamp
    contributions: {
      total: number,
      longestStreak: number,
      currentStreak: number,
      weeks: Array<Array<{               // 52 weeks, each is 7 days
        date: string,                    // YYYY-MM-DD
        count: number,
        level: 0 | 1 | 2 | 3 | 4,
      }>>,
    },
    topRepos: Array<{
      name: string,
      description: string | null,
      stars: number,
      language: string | null,
      languageColor: string | null,      // hex; null if language is null
      url: string,
    }>,
    stats: { commits12mo: number, mergedPrs12mo: number, totalStars: number },
  }
  ```
- **Atomic write:** writes to `github.json.tmp`, then `rename()` to
  `github.json`. Readers never see a half-written file.
- **Failure mode:** on any API error or schema mismatch, the script exits
  non-zero without touching the existing `github.json`. Cron's default
  behavior (email on non-zero exit) handles notification.
- **Dry-run mode:** `node fetch-github.mjs --dry-run` performs the same
  fetches and schema validation but prints the result to stdout instead of
  writing. Used for the post-setup smoke test.

### Cron entry on VPS

```cron
0 4 * * * cd /opt/portfolio-cron && /usr/bin/node fetch-github.mjs >> /var/log/portfolio-cron.log 2>&1
```

Runs daily at 04:00 UTC. The script writes directly to
`/var/www/egeayyildiz.me/data/github.json` (path configured via the
`GITHUB_JSON_PATH` env var in `.env`; also reads `GITHUB_USERNAME`).

### Frontend fetch

`GithubSection.astro` server-renders a complete skeleton:
- 52 × 7 empty heatmap cells with the lowest-level background.
- 5 placeholder repo rows with dimmed text.
- The headline counts ("1,247 contributions...") rendered as `—` placeholders.

A small inline `<script>` (~30 lines, no framework) runs on `DOMContentLoaded`:

1. `fetch('/data/github.json')` (same-origin, no CORS).
2. On success: iterate the heatmap cells and set `dataset.level` /
   classList; replace repo placeholders; fill in numeric counts.
3. On failure (file 404, network error, JSON parse error): leave the
   skeleton in place and replace the header line with a muted
   "GitHub stats unavailable" message. The rest of the site is unaffected.

No client framework, no hydration cost.

## Styling & Design Tokens

### Color tokens (from reference)

```css
:root {
  --bg: #0a0a0a;
  --bg-soft: #171717;
  --fg: #fafafa;
  --fg-2: #d4d4d4;
  --muted: #a3a3a3;
  --line: #262626;
  --line-strong: #404040;
  --accent: #60a5fa;
  --accent-soft: #1e3a5f;
  --ok: #4ade80;
  --warn: #fb923c;
}
```

Exposed to Tailwind as semantic color names: `bg-bg`, `text-fg`, `text-muted`,
`border-line`, `text-accent`, `bg-accent-soft`, `text-ok`, etc.

### Typography

- JetBrains Mono (variable) via `@fontsource-variable/jetbrains-mono`,
  applied at `<body>` as the sole font family.
- Base size 14px, line-height 1.55.

### Layout primitives

- `.wrap`: `max-width: 1120px; padding: 0 32px; margin: 0 auto;` — defined
  once, used by every section.
- A small Astro `<Section>` wrapper provides the standard `padding: 88px 0`
  and `border-bottom: 1px solid var(--line)`.
- The vertical-line grid background is a fixed element in `Base.astro`,
  `aria-hidden="true"`.

### Animations

- Blink caret: CSS keyframe in `global.css`.
- Smooth anchor scroll: small inline script in `Base.astro` that respects
  `prefers-reduced-motion`.

### Responsive

Single breakpoint at `880px` (matches reference). Two-column layouts collapse
to one; nav links hide; brand + CTA remain.

### Accessibility

- Decorative grid and dot ornaments use `aria-hidden="true"`.
- Real semantic landmarks: `<nav>`, `<main>`, `<section>`, `<article>`,
  `<footer>`.
- Default focus rings preserved on all interactive elements.
- `prefers-reduced-motion` honored for scroll and the caret blink.

## Deployment

### VPS layout

```
/var/www/egeayyildiz.me/
├── index.html              (rsynced from dist/)
├── _astro/...              (rsynced from dist/)
├── resume.pdf
└── data/
    └── github.json         (cron-written; preserved across deploys)

/opt/portfolio-cron/
├── fetch-github.mjs        (copied from repo)
└── .env                    (GH_TOKEN; chmod 600, owner-only)
```

### Caddy config

```caddyfile
egeayyildiz.me {
  root * /var/www/egeayyildiz.me
  file_server
  encode gzip zstd
  header /data/*    Cache-Control "public, max-age=300"
  header /_astro/*  Cache-Control "public, max-age=31536000, immutable"
}
```

### Deploy flow

Owner-handled. Typical command:
```sh
npm run build
rsync -avz --delete --exclude 'data/' dist/ user@egeayyildiz.me:/var/www/egeayyildiz.me/
```
The `--exclude data/` is load-bearing: it prevents deploys from wiping the
cron-written `github.json`.

### First-deploy checklist

1. DNS A record `egeayyildiz.me` → VPS IP.
2. Install Caddy, drop in the Caddyfile, `systemctl reload caddy`.
3. Create `/var/www/egeayyildiz.me/data/` with correct ownership.
4. Generate a GitHub PAT (`read:user` + `public_repo` scopes, no write).
5. Place `.env` with `GH_TOKEN=...` at `/opt/portfolio-cron/.env`,
   `chmod 600`.
6. Copy `scripts/fetch-github.mjs` to `/opt/portfolio-cron/`.
7. Run once manually with `--dry-run` to confirm token + network.
8. Run once manually without `--dry-run` to seed `github.json`.
9. Install the crontab entry.
10. First site deploy via `rsync`.

## Testing & Verification

Three checks, no test framework:

1. **`npm run verify`** — runs `astro check` (types) and `astro build` (build
   must succeed). Run before every deploy.
2. **`node scripts/fetch-github.mjs --dry-run`** on the VPS during setup —
   validates GitHub API access, token scopes, and response schema without
   writing.
3. **Manual visual review** — `npm run dev`, check the page at ≥1120px and
   <880px (the only breakpoint). One Lighthouse run before first deploy with
   targets ≥95 for Performance / Accessibility / Best Practices.

Out of scope for v1: unit tests, snapshot tests, E2E tests. Revisit when
the blog ships.

## Open Items for the Owner (not blocking the spec)

These will be needed when implementing but do not affect the design:

- Real content values for every field in `profile.ts` (bio, projects, jobs,
  stack, social links, email).
- A `resume.pdf` file to drop into `public/`.
- A favicon (SVG preferred).
- GitHub username + PAT for the cron setup.
