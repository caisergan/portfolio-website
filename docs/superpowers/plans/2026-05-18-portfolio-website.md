# Portfolio Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single-page, static portfolio at egeayyildiz.me that faithfully reproduces `references/portfolio.html`, with real GitHub data refreshed daily by a VPS cron script.

**Architecture:** Astro 5 + TypeScript + Tailwind CSS 4, output as static HTML/CSS/JS. All owner content lives in one typed file (`src/data/profile.ts`). A standalone Node script on the VPS hits the GitHub API every 24h and writes `/var/www/egeayyildiz.me/data/github.json`; the frontend fetches that file at runtime and swaps a server-rendered skeleton for real data. Caddy serves the result.

**Tech Stack:**
- Astro 5 (TypeScript, strict mode)
- Tailwind CSS 4 (via `@tailwindcss/vite`; CSS-based `@theme` config — no `tailwind.config.js`)
- `@fontsource-variable/jetbrains-mono` (self-hosted)
- Node ≥20 (uses built-in `fetch`)
- Zero npm dependencies in the cron script
- Caddy (deployment-time, not a build dep)

**Reference:** `references/portfolio.html` — port HTML/CSS faithfully; swap hardcoded content for `profile.*` references.

**Verification rhythm (after every task):**
- `npm run verify` (= `astro check && astro build`) — must succeed
- Visual check at `http://localhost:4321` (run `npm run dev` in a second terminal)
- Commit

---

## Task 1: Scaffold Astro + TypeScript + Tailwind 4 + JetBrains Mono

**Files:**
- Create: `package.json`
- Create: `astro.config.mjs`
- Create: `tsconfig.json`
- Modify: `.gitignore`

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "portfolio-website",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "verify": "astro check && astro build"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/check": "^0.9.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0",
    "@fontsource-variable/jetbrains-mono": "^5.1.0"
  }
}
```

- [ ] **Step 2: Create `astro.config.mjs`**

```js
// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://egeayyildiz.me",
  vite: {
    plugins: [tailwindcss()],
  },
});
```

- [ ] **Step 3: Create `tsconfig.json`**

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist"]
}
```

- [ ] **Step 4: Append Astro build artifacts to `.gitignore`**

Add these lines to the existing `.gitignore`:

```
# Astro
.astro/
dist/
.env
```

- [ ] **Step 5: Install dependencies**

Run: `npm install`
Expected: completes without errors, creates `node_modules/` and `package-lock.json`.

- [ ] **Step 6: Verify dev server starts**

Run (in a separate terminal): `npm run dev`
Expected: server listens on `http://localhost:4321`. (Page will 404 — no pages yet. That's fine. Stop the server with Ctrl-C.)

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json astro.config.mjs tsconfig.json .gitignore
git commit -m "Scaffold Astro 5 + TypeScript + Tailwind 4"
```

---

## Task 2: Global CSS — design tokens, font, base styles

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Create `src/styles/global.css`**

```css
@import "tailwindcss";
@import "@fontsource-variable/jetbrains-mono";

@theme {
  --color-bg: #0a0a0a;
  --color-bg-soft: #171717;
  --color-fg: #fafafa;
  --color-fg-2: #d4d4d4;
  --color-muted: #a3a3a3;
  --color-line: #262626;
  --color-line-strong: #404040;
  --color-accent: #60a5fa;
  --color-accent-soft: #1e3a5f;
  --color-ok: #4ade80;
  --color-warn: #fb923c;

  --font-mono: "JetBrains Mono Variable", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;

  --breakpoint-md: 880px;
}

@layer base {
  html, body {
    margin: 0;
    padding: 0;
    background: var(--color-bg);
    color: var(--color-fg);
    font-family: var(--font-mono);
    font-size: 14px;
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
    text-rendering: optimizeLegibility;
  }

  ::selection {
    background: var(--color-fg);
    color: var(--color-bg);
  }

  a {
    color: var(--color-accent);
    text-decoration: none;
  }
  a:hover {
    text-decoration: underline;
    text-underline-offset: 3px;
  }
}

@layer components {
  .wrap {
    max-width: 1120px;
    margin-left: auto;
    margin-right: auto;
    padding-left: 32px;
    padding-right: 32px;
  }

  .grid-bg {
    position: fixed;
    inset: 0;
    pointer-events: none;
    background-image: linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 80px 100%;
    background-position: center top;
    max-width: 1120px;
    margin: 0 auto;
    left: 0;
    right: 0;
    z-index: 0;
  }
}

@keyframes blink {
  50% { opacity: 0; }
}

.caret {
  display: inline-block;
  width: 0.55ch;
  background: var(--color-fg);
  margin-left: 4px;
  animation: blink 1.1s steps(2, end) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .caret { animation: none; }
}
```

- [ ] **Step 2: Verify the CSS loads in a build**

(No page yet to render it, but the build must accept the file.) Run: `npm run verify`
Expected: `astro check` passes (no TS to check yet, returns clean), `astro build` succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "Add global styles: design tokens, JetBrains Mono, layout primitives"
```

---

## Task 3: Typed content source — `src/data/profile.ts`

**Files:**
- Create: `src/data/profile.ts`

- [ ] **Step 1: Create `src/data/profile.ts` with full types and placeholder values**

The placeholder values are lifted from the reference so the site renders correctly out of the box. The owner replaces these with real content later.

```ts
// src/data/profile.ts

export type SocialLinks = {
  github: string;
  linkedin: string;
  x?: string;
  readcv?: string;
};

export type Project = {
  num: string;
  name: string;
  year: string;
  role: string;
  blurb: string;
  stack: string[];
  links: { label: string; href: string }[];
  meta: { k: string; v: string }[];
};

export type Job = {
  when: string;
  duration: string;
  title: string;
  company: string;
  where: string;
  bullets: string[];
  current?: boolean;
};

export type StackItem = { name: string; level: "daily" | "often" | "sometimes" };

export type Profile = {
  name: string;
  handle: string;
  role: string;
  location: string;
  timezone: string;
  yearsSince: number;
  email: string;
  available: boolean;
  resumeUrl: string;
  social: SocialLinks;

  hero: {
    kicker: string;
    headlineLead: string;
    headlineAccent: string;
    headlineTail: string;
    lede: string;
    terminal: { focus: string; openTo: string; uptime: string };
  };

  about: {
    paragraphs: string[];
    atAGlance: { k: string; v: string; pill?: boolean }[];
  };

  projects: Project[];

  experience: Job[];

  stack: {
    languages: StackItem[];
    frontend: StackItem[];
    backend: StackItem[];
    infra: StackItem[];
  };

  readingList: { title: string; href: string }[];
};

export const profile: Profile = {
  name: "Alex Morgan",
  handle: "alex.morgan",
  role: "fullstack",
  location: "San Francisco, CA",
  timezone: "UTC−7 · flexible",
  yearsSince: 2018,
  email: "hello@alexmorgan.dev",
  available: true,
  resumeUrl: "/resume.pdf",
  social: {
    github: "https://github.com/alexmorgan",
    linkedin: "https://linkedin.com/in/alexmorgan",
    x: "https://x.com/alexmorgan",
    readcv: "https://read.cv/alexmorgan",
  },

  hero: {
    kicker: "fullstack engineer · est. 2018",
    headlineLead: "I build software",
    headlineAccent: "ships",
    headlineTail: "& scales",
    lede:
      "Fullstack engineer with seven years of shipping production systems — from <em>type-safe APIs</em> to <em>distributed infra</em>. I care about fast feedback loops, durable abstractions, and code that future-me won't regret. Currently building developer tools at a Series B startup.",
    terminal: {
      focus: "dev tools · infra",
      openTo: "sr+ fullstack roles",
      uptime: "7y 142d",
    },
  },

  about: {
    paragraphs: [
      "I've spent the last seven years working at the seam between product and infrastructure — the kind of role where <strong>\"fullstack\" actually means everything from a React hover state to a Postgres index plan</strong> to an AWS bill review. I like ambiguous problems and small, opinionated teams.",
      "Most recently I led the platform team at a developer tools startup, where I rewrote our query layer to cut p95 latency by 4× and helped take the product from closed beta to 40k+ weekly active developers.",
      "When I'm not writing code I'm reading about distributed systems, running too many side projects, or making coffee that's objectively too strong.",
    ],
    atAGlance: [
      { k: "status", v: "available · jul", pill: true },
      { k: "based", v: "San Francisco, CA" },
      { k: "timezone", v: "UTC−7 · flexible" },
      { k: "years", v: "7 (since 2018)" },
      { k: "role", v: "Sr. Fullstack / Platform" },
      { k: "prefers", v: "small, opinionated teams" },
      { k: "remote", v: "yes · global ok" },
      { k: "contact", v: '<a href="mailto:hello@alexmorgan.dev">hello@alexmorgan.dev</a>' },
    ],
  },

  projects: [
    {
      num: "01",
      name: "Driftway",
      year: "2024 — present",
      role: "Tech lead · query & storage layer",
      blurb:
        "Real-time analytics for product teams. Rebuilt the streaming query engine on top of ClickHouse + a custom Kafka consumer, dropped p95 from 1.8s to 410ms, and shipped a query playground used by every customer on day one of their trial.",
      stack: ["TypeScript", "Next.js 14", "Node", "ClickHouse", "Kafka", "AWS"],
      links: [
        { label: "case study", href: "#" },
        { label: "live", href: "#" },
        { label: "github", href: "#" },
      ],
      meta: [
        { k: "scope", v: "infra · frontend" },
        { k: "team", v: "4 engineers" },
        { k: "p95 ↓", v: "−77%" },
        { k: "customers", v: "40k+ wkly" },
        { k: "uptime", v: "99.98%" },
      ],
    },
    {
      num: "02",
      name: "Ledgerline",
      year: "2022 — 2024",
      role: "Founding engineer · billing & identity",
      blurb:
        "B2B invoicing platform for marketplaces. Designed the multi-tenant data model, built the Stripe + ACH ingest pipeline, and shipped SAML/OIDC SSO in time for the first enterprise rollout. Took the product from zero to $4M ARR alongside two cofounders.",
      stack: ["TypeScript", "Node", "React", "Postgres", "Stripe", "Terraform"],
      links: [
        { label: "case study", href: "#" },
        { label: "writeup", href: "#" },
      ],
      meta: [
        { k: "scope", v: "end-to-end" },
        { k: "team", v: "3 founders" },
        { k: "arr", v: "$4M" },
        { k: "tenants", v: "320+" },
        { k: "tx vol", v: "$180M / yr" },
      ],
    },
    {
      num: "03",
      name: "warp-fetch",
      year: "2023",
      role: "Open source · maintainer",
      blurb:
        "A zero-dependency, type-safe fetch wrapper for Node and the edge. Schema-validated responses, automatic retries with jitter, and a tiny ~3kb footprint. 4.2k stars and used in production at a handful of companies I respect.",
      stack: ["TypeScript", "Zod", "Bun", "Vitest"],
      links: [
        { label: "github", href: "#" },
        { label: "npm", href: "#" },
        { label: "docs", href: "#" },
      ],
      meta: [
        { k: "stars", v: "4.2k" },
        { k: "downloads", v: "180k / wk" },
        { k: "size", v: "2.9 kb gz" },
        { k: "coverage", v: "98%" },
        { k: "contribs", v: "47" },
      ],
    },
    {
      num: "04",
      name: "Northbound",
      year: "2020 — 2022",
      role: "Senior engineer · platform",
      blurb:
        "Logistics planning tool for regional carriers. Built the routing optimizer (mixed-integer programming via OR-Tools, wrapped in a sensible API), the operations dashboard, and the mobile driver app. Saved partner carriers an average of 14% on fuel costs in pilot.",
      stack: ["TypeScript", "Python", "React Native", "Postgres + PostGIS", "GCP"],
      links: [
        { label: "writeup", href: "#" },
        { label: "video", href: "#" },
      ],
      meta: [
        { k: "scope", v: "web · mobile · solver" },
        { k: "team", v: "6 engineers" },
        { k: "fuel ↓", v: "−14%" },
        { k: "carriers", v: "22 pilots" },
        { k: "stops/day", v: "11k+" },
      ],
    },
  ],

  experience: [
    {
      when: "now — 2024",
      duration: "2y 4mo",
      title: "Tech Lead, Platform",
      company: "Driftway",
      where: "San Francisco · Series B · ~80 people",
      bullets: [
        "Lead a team of 4 engineers across query layer, ingest pipeline, and developer experience.",
        "Rewrote the streaming query engine, dropping p95 latency 77% and unlocking real-time use cases.",
        "Set the technical bar — code review standards, RFC process, incident response playbook.",
        "Interview & hire for the broader engineering org; closed 6 senior hires in '25.",
      ],
      current: true,
    },
    {
      when: "2024 — 2022",
      duration: "2y 0mo",
      title: "Founding Engineer",
      company: "Ledgerline",
      where: "Remote · Seed · 3 → 11 people",
      bullets: [
        "First engineering hire. Built the v1 product end-to-end with two cofounders.",
        "Designed the multi-tenant data model and Stripe + ACH ingest pipeline.",
        "Shipped SAML & OIDC SSO in time for the first enterprise contract.",
        "Took the product from zero to $4M ARR before handing off the platform team.",
      ],
    },
    {
      when: "2022 — 2020",
      duration: "2y 1mo",
      title: "Senior Engineer, Platform",
      company: "Northbound",
      where: "Portland · Series A · ~45 people",
      bullets: [
        "Built the routing optimizer (OR-Tools + a domain-specific solver wrapper).",
        "Owned the operations dashboard and the React Native driver app end-to-end.",
        "Saved pilot carriers ~14% on fuel costs — measured against an honest baseline.",
      ],
    },
    {
      when: "2020 — 2018",
      duration: "2y 2mo",
      title: "Software Engineer",
      company: "Wavelet (acquired '21)",
      where: "Portland · Series A · ~30 people",
      bullets: [
        "Built consumer-facing features for an audio social app — ~600k MAU at peak.",
        "Shipped my first production React app; migrated the legacy backend to Node + Postgres.",
        "Found my taste for small teams & ambiguous problems here.",
      ],
    },
  ],

  stack: {
    languages: [
      { name: "TypeScript", level: "daily" },
      { name: "Python", level: "often" },
      { name: "Go", level: "sometimes" },
      { name: "SQL", level: "daily" },
      { name: "Bash", level: "often" },
    ],
    frontend: [
      { name: "React 18+", level: "daily" },
      { name: "Next.js 14", level: "daily" },
      { name: "React Native", level: "often" },
      { name: "Tailwind", level: "daily" },
      { name: "Zustand / Jotai", level: "often" },
    ],
    backend: [
      { name: "Node.js", level: "daily" },
      { name: "tRPC / Hono", level: "daily" },
      { name: "Postgres", level: "daily" },
      { name: "ClickHouse", level: "often" },
      { name: "Redis", level: "often" },
    ],
    infra: [
      { name: "AWS (ECS · Lambda · RDS)", level: "daily" },
      { name: "Terraform", level: "often" },
      { name: "Docker", level: "daily" },
      { name: "Cloudflare Workers", level: "often" },
      { name: "Kafka", level: "sometimes" },
    ],
  },

  readingList: [
    { title: "Why I stopped reaching for microservices →", href: "#" },
    { title: "A tour of our Postgres setup →", href: "#" },
    { title: "Notes on shipping the rewrite →", href: "#" },
    { title: "All posts ↗", href: "#" },
  ],
};
```

- [ ] **Step 2: Verify types compile**

Run: `npm run check`
Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Commit**

```bash
git add src/data/profile.ts
git commit -m "Add typed profile.ts with placeholder content"
```

---

## Task 4: Base layout — `Base.astro`

**Files:**
- Create: `src/layouts/Base.astro`

- [ ] **Step 1: Create `src/layouts/Base.astro`**

```astro
---
import "../styles/global.css";

interface Props {
  title: string;
  description?: string;
}

const { title, description = "Personal portfolio." } = Astro.props;
---

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <title>{title}</title>
  </head>
  <body>
    <div class="grid-bg" aria-hidden="true"></div>
    <main id="top" class="relative z-10">
      <slot />
    </main>

    <script>
      // Smooth anchor scroll, respects reduced-motion.
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) => {
        a.addEventListener("click", (e) => {
          const id = a.getAttribute("href")!.slice(1);
          const target = id ? document.getElementById(id) : document.body;
          if (!target) return;
          e.preventDefault();
          const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
          const top = id ? target.getBoundingClientRect().top + window.scrollY - 56 : 0;
          window.scrollTo({ top, behavior: reduce ? "auto" : "smooth" });
          history.replaceState(null, "", id ? "#" + id : " ");
        });
      });
    </script>
  </body>
</html>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success. (Still nothing renders — no pages.)

- [ ] **Step 3: Commit**

```bash
git add src/layouts/Base.astro
git commit -m "Add Base layout with grid background and smooth scroll"
```

---

## Task 5: `Section.astro` wrapper component

**Files:**
- Create: `src/components/Section.astro`

- [ ] **Step 1: Create `src/components/Section.astro`**

```astro
---
interface Props {
  id?: string;
  tag: string;      // e.g. "01 / about"
  title: string;
  meta?: string;    // e.g. "~/about.md"
  class?: string;
}

const { id, tag, title, meta, class: className = "" } = Astro.props;
---

<section id={id} class={`py-[88px] border-b border-line ${className}`}>
  <div class="wrap">
    <div class="grid md:grid-cols-[180px_1fr] items-baseline gap-8 mb-10">
      <div class="text-muted text-xs uppercase tracking-wider">
        <span class="text-accent">//&nbsp;</span>{tag}
      </div>
      <h2 class="text-[28px] font-semibold tracking-tight m-0">
        {title}
        {meta && <span class="text-muted font-normal text-[13px] ml-3">{meta}</span>}
      </h2>
    </div>
    <slot />
  </div>
</section>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/Section.astro
git commit -m "Add Section wrapper component"
```

---

## Task 6: `Nav.astro`

**Files:**
- Create: `src/components/Nav.astro`

- [ ] **Step 1: Create `src/components/Nav.astro`**

```astro
---
import { profile } from "../data/profile";

const links = [
  { n: "01", label: "about", href: "#about" },
  { n: "02", label: "work", href: "#work" },
  { n: "03", label: "oss", href: "#oss" },
  { n: "04", label: "experience", href: "#experience" },
  { n: "05", label: "stack", href: "#stack" },
];
---

<nav class="sticky top-0 z-50 bg-bg border-b border-line">
  <div class="wrap flex items-center justify-between py-[14px] text-[13px]">
    <a href="#top" class="flex items-center gap-[10px] text-fg font-semibold no-underline hover:no-underline">
      <span class="inline-block w-2 h-2 bg-ok" style="box-shadow: 0 0 0 3px rgba(22,163,74,0.18);" aria-hidden="true"></span>
      <span>{profile.handle}</span>
      <span class="text-muted font-normal">/ {profile.role}</span>
    </a>

    <div class="hidden md:flex gap-1 flex-wrap">
      {links.map(({ n, label, href }) => (
        <a
          href={href}
          class="text-fg-2 px-[10px] py-[6px] border border-transparent hover:text-fg hover:bg-bg-soft hover:border-line no-underline hover:no-underline"
        >
          <span class="text-muted mr-1 font-medium">{n}.</span>{label}
        </a>
      ))}
    </div>

    <a
      href={profile.resumeUrl}
      class="inline-flex items-center gap-2 px-3 py-[7px] bg-fg text-bg border border-fg no-underline hover:bg-accent hover:border-accent hover:text-white hover:no-underline"
    >
      resume.pdf <span class="transition-transform">↓</span>
    </a>
  </div>
</nav>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/Nav.astro
git commit -m "Add Nav component"
```

---

## Task 7: `TerminalCard.astro`

**Files:**
- Create: `src/components/TerminalCard.astro`

- [ ] **Step 1: Create `src/components/TerminalCard.astro`**

```astro
---
import { profile } from "../data/profile";
const { handle, location, timezone, available, hero } = profile;
---

<div class="border border-line-strong bg-bg text-[12.5px] leading-[1.7]" role="img" aria-label="Terminal status">
  <div class="flex items-center gap-2 px-3 py-2 border-b border-line bg-bg-soft text-muted text-[11px] uppercase tracking-wider">
    <span class="inline-flex gap-[6px]">
      <i class="w-[9px] h-[9px] bg-line inline-block"></i>
      <i class="w-[9px] h-[9px] bg-line inline-block"></i>
      <i class="w-[9px] h-[9px] bg-line inline-block"></i>
    </span>
    <span>~/portfolio — zsh</span>
  </div>
  <div class="px-[18px] py-4">
    <div><span class="text-accent font-semibold">$</span> whoami</div>
    <div><span class="text-fg">{handle}</span> <span class="text-muted">// {profile.role} engineer · {location.toLowerCase()}</span></div>

    <div class="mt-2"><span class="text-accent font-semibold">$</span> cat status.json</div>
    <div><span class="text-muted">{"{"}</span></div>
    <div>&nbsp;&nbsp;<span class="text-muted">"available":</span> <span class="text-ok">{String(available)}</span>,</div>
    <div>&nbsp;&nbsp;<span class="text-muted">"location":</span> <span class="text-fg">"{location}"</span>,</div>
    <div>&nbsp;&nbsp;<span class="text-muted">"timezone":</span> <span class="text-fg">"{timezone}"</span>,</div>
    <div>&nbsp;&nbsp;<span class="text-muted">"focus":</span> <span class="text-fg">"{hero.terminal.focus}"</span>,</div>
    <div>&nbsp;&nbsp;<span class="text-muted">"open_to":</span> <span style="background:#3a3a00;color:#facc15;padding:0 3px;">"{hero.terminal.openTo}"</span></div>
    <div><span class="text-muted">{"}"}</span></div>

    <div class="mt-2"><span class="text-accent font-semibold">$</span> uptime</div>
    <div><span class="text-fg">{hero.terminal.uptime}</span> <span class="text-muted">shipping</span> · <span class="text-fg">0</span> <span class="text-muted">prod incidents this quarter</span></div>

    <div class="mt-2"><span class="text-accent font-semibold">$</span> <span class="caret"></span></div>
  </div>
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/TerminalCard.astro
git commit -m "Add TerminalCard component"
```

---

## Task 8: `Hero.astro`

**Files:**
- Create: `src/components/Hero.astro`

- [ ] **Step 1: Create `src/components/Hero.astro`**

```astro
---
import { profile } from "../data/profile";
import TerminalCard from "./TerminalCard.astro";

const { hero, email, resumeUrl } = profile;
---

<section class="py-24">
  <div class="wrap">
    <div class="grid md:grid-cols-[1.4fr_1fr] gap-12 items-start">
      <div>
        <div class="text-muted text-xs uppercase tracking-wider flex items-center gap-3 mb-7">
          <span>{hero.kicker}</span>
          <span class="flex-1 h-px bg-line"></span>
          <span>v1.0.0</span>
        </div>

        <h1 class="text-[56px] leading-[1.02] tracking-tight font-bold m-0 mb-6">
          {hero.headlineLead}<br />
          that <span class="text-accent">{hero.headlineAccent}</span> {hero.headlineTail}<span class="caret"></span>
        </h1>

        <p class="text-[17px] leading-[1.6] text-fg-2 max-w-[56ch] m-0 mb-8" set:html={hero.lede.replace(/<em>/g, '<em class="not-italic bg-accent-soft text-accent px-[7px] py-[2px]">')}></p>

        <div class="flex gap-[10px] flex-wrap">
          <a href="#work" class="inline-flex items-center gap-2 px-4 py-[11px] border border-line-strong bg-fg text-bg text-[13px] no-underline hover:bg-accent hover:border-accent hover:text-white hover:no-underline">
            View selected work <span>→</span>
          </a>
          <a href={resumeUrl} class="inline-flex items-center gap-2 px-4 py-[11px] border border-line-strong bg-bg text-fg text-[13px] no-underline hover:bg-fg hover:text-bg hover:no-underline">
            Download résumé
          </a>
          <a href={`mailto:${email}`} class="inline-flex items-center gap-2 px-4 py-[11px] border border-line-strong bg-bg text-fg text-[13px] no-underline hover:bg-fg hover:text-bg hover:no-underline">
            {email}
          </a>
        </div>
      </div>

      <TerminalCard />
    </div>
  </div>
</section>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/Hero.astro
git commit -m "Add Hero component"
```

---

## Task 9: `About.astro`

**Files:**
- Create: `src/components/About.astro`

- [ ] **Step 1: Create `src/components/About.astro`**

```astro
---
import { profile } from "../data/profile";
import Section from "./Section.astro";

const { about } = profile;
---

<Section id="about" tag="01 / about" title="Engineer · generalist · pragmatist" meta="~/about.md">
  <div class="grid md:grid-cols-[1.3fr_1fr] gap-14 items-start">
    <div>
      {about.paragraphs.map((p) => (
        <p
          class="text-[15px] leading-[1.7] text-fg-2 m-0 mb-4 max-w-[60ch] [&_strong]:text-fg [&_strong]:font-semibold"
          set:html={p}
        />
      ))}
    </div>

    <div class="border border-line bg-bg" aria-label="At a glance">
      {about.atAGlance.map((row, i) => (
        <div class={`grid grid-cols-[110px_1fr] gap-4 px-4 py-3 text-[13px] ${i < about.atAGlance.length - 1 ? "border-b border-line" : ""}`}>
          <span class="text-muted">{row.k}</span>
          <span class="text-fg">
            {row.pill ? (
              <span class="inline-flex items-center gap-[6px] px-[7px] py-[1px] bg-[rgba(22,163,74,0.08)] text-ok border border-[rgba(22,163,74,0.25)] text-[11px]">
                <span class="w-[6px] h-[6px] bg-ok rounded-full"></span>
                {row.v}
              </span>
            ) : (
              <span set:html={row.v} />
            )}
          </span>
        </div>
      ))}
    </div>
  </div>
</Section>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/About.astro
git commit -m "Add About component"
```

---

## Task 10: `Projects.astro`

**Files:**
- Create: `src/components/Projects.astro`

- [ ] **Step 1: Create `src/components/Projects.astro`**

```astro
---
import { profile } from "../data/profile";
import Section from "./Section.astro";

const { projects } = profile;
---

<Section id="work" tag="02 / selected work" title="Four projects worth talking about" meta="ls -l ~/work/featured">
  <div class="grid border-t border-line">
    {projects.map((p) => (
      <article class="grid md:grid-cols-[56px_1fr_280px] gap-7 py-7 border-b border-line items-start transition-colors hover:bg-bg-soft px-2 -mx-2 md:px-0 md:mx-0">
        <div class="text-[13px] text-muted font-semibold pt-1">[{p.num}]</div>

        <div>
          <h3 class="text-[22px] m-0 mb-[6px] tracking-tight flex items-baseline gap-3 flex-wrap">
            {p.name}
            <span class="text-[13px] text-muted font-normal">{p.year}</span>
          </h3>
          <div class="text-[12px] text-accent uppercase tracking-wider mb-3">{p.role}</div>
          <p class="m-0 mb-4 text-fg-2 text-[14px] leading-[1.65] max-w-[62ch]">{p.blurb}</p>

          <div class="flex flex-wrap gap-[6px]">
            {p.stack.map((tag) => (
              <span class="text-[11px] px-2 py-[2px] border border-line text-fg-2 bg-bg">{tag}</span>
            ))}
          </div>

          <div class="flex gap-[14px] mt-4 text-[12px]">
            {p.links.map((l) => (
              <a href={l.href} class="text-fg after:content-['_↗'] after:text-accent hover:no-underline">{l.label}</a>
            ))}
          </div>
        </div>

        <div class="md:border-l md:border-line md:pl-5 text-[12px] text-muted border-t md:border-t-0 border-line pt-4 md:pt-0">
          {p.meta.map((m, i) => (
            <div class={`flex justify-between py-1 ${i < p.meta.length - 1 ? "border-b border-dashed border-line" : ""}`}>
              <span>{m.k}</span><span class="text-fg">{m.v}</span>
            </div>
          ))}
        </div>
      </article>
    ))}
  </div>
</Section>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/Projects.astro
git commit -m "Add Projects component"
```

---

## Task 11: `Experience.astro`

**Files:**
- Create: `src/components/Experience.astro`

- [ ] **Step 1: Create `src/components/Experience.astro`**

```astro
---
import { profile } from "../data/profile";
import Section from "./Section.astro";

const { experience } = profile;
const yearsTotal = new Date().getFullYear() - profile.yearsSince;
const expTitle = `${yearsTotal} years, ${experience.length} companies`;
---

<Section id="experience" tag="04 / experience" title={expTitle} meta={`git log --author=${profile.handle}`}>
  <div class="grid">
    {experience.map((j, i) => (
      <div class={`grid md:grid-cols-[180px_1fr] gap-8 py-6 ${i === 0 ? "border-t border-line-strong" : "border-t border-line"} ${i === experience.length - 1 ? "border-b border-line" : ""}`}>
        <div class="text-[12px] text-muted pt-1">
          <div>{j.current && <span class="text-ok font-semibold">● now</span>}{j.current ? " — " + j.when.replace("now — ", "") : j.when}</div>
          <div class="mt-1">{j.duration}</div>
        </div>
        <div>
          <h4 class="m-0 mb-1 text-[16px] font-semibold">
            {j.title} <span class="text-muted font-normal">@ {j.company}</span>
          </h4>
          <div class="text-[12px] text-muted mb-3">{j.where}</div>
          <ul class="list-none p-0 m-0">
            {j.bullets.map((b) => (
              <li class="pl-[18px] relative text-fg-2 text-[13px] leading-[1.6] mb-1 before:content-['→'] before:absolute before:left-0 before:text-accent">{b}</li>
            ))}
          </ul>
        </div>
      </div>
    ))}
  </div>
</Section>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/Experience.astro
git commit -m "Add Experience component"
```

---

## Task 12: `Stack.astro`

**Files:**
- Create: `src/components/Stack.astro`

- [ ] **Step 1: Create `src/components/Stack.astro`**

```astro
---
import { profile } from "../data/profile";
import Section from "./Section.astro";

const cols = [
  { idx: "01", title: "Languages", items: profile.stack.languages },
  { idx: "02", title: "Frontend",  items: profile.stack.frontend },
  { idx: "03", title: "Backend",   items: profile.stack.backend },
  { idx: "04", title: "Infra",     items: profile.stack.infra },
];
---

<Section id="stack" tag="05 / stack" title="Tools I actually use" meta="~/.config/stack.toml">
  <div class="grid grid-cols-2 md:grid-cols-4 border-t border-l border-line">
    {cols.map((c) => (
      <div class="border-r border-b border-line px-[22px] py-5">
        <h5 class="m-0 mb-3 text-[11px] uppercase tracking-wider text-muted flex justify-between items-baseline">
          <span>{c.title}</span>
          <span class="text-accent">{c.idx}</span>
        </h5>
        <ul class="list-none p-0 m-0">
          {c.items.map((it, i) => (
            <li class={`text-[13px] py-[5px] text-fg flex justify-between ${i < c.items.length - 1 ? "border-b border-dashed border-line" : ""}`}>
              <span>{it.name}</span>
              <span class={`text-[11px] ${it.level === "daily" ? "text-accent" : "text-muted"}`}>{it.level}</span>
            </li>
          ))}
        </ul>
      </div>
    ))}
  </div>
</Section>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/Stack.astro
git commit -m "Add Stack component"
```

---

## Task 13: `Heatmap.astro` — skeleton renderer

**Files:**
- Create: `src/components/Heatmap.astro`

The component server-renders a complete empty grid (52 × 7 = 364 cells). Each cell has `data-week` and `data-day` attributes so the fetch script can set its level later. No JS runs to render the grid itself.

- [ ] **Step 1: Create `src/components/Heatmap.astro`**

```astro
---
const WEEKS = 52;
const DAYS = 7;
const weekIndices = Array.from({ length: WEEKS }, (_, i) => i);
const dayIndices = Array.from({ length: DAYS }, (_, i) => i);
---

<div id="heatmap" class="grid grid-cols-[repeat(52,1fr)] gap-[3px] mb-[14px]" aria-hidden="true">
  {weekIndices.map((w) => (
    <div class="grid grid-rows-7 gap-[3px]">
      {dayIndices.map((d) => (
        <div
          class="aspect-square bg-[#1a1a1a] border border-[rgba(255,255,255,0.03)] data-[level='1']:bg-accent-soft data-[level='2']:bg-[#2563eb] data-[level='3']:bg-[#3b82f6] data-[level='4']:bg-accent"
          data-week={w}
          data-day={d}
        ></div>
      ))}
    </div>
  ))}
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/Heatmap.astro
git commit -m "Add Heatmap skeleton component"
```

---

## Task 14: `RepoList.astro` — skeleton renderer

**Files:**
- Create: `src/components/RepoList.astro`

Renders 5 placeholder rows. The fetch script fills `.repo-name`, `.repo-desc`, `.repo-stars`, `.repo-lang` text and sets the `<a>`'s href and the lang dot's background color.

- [ ] **Step 1: Create `src/components/RepoList.astro`**

```astro
---
const slots = [0, 1, 2, 3, 4];
---

<div id="repos" class="border border-line">
  {slots.map((i) => (
    <a class={`repo-row block px-4 py-[14px] grid grid-cols-[1fr_auto] gap-3 items-start text-fg no-underline hover:no-underline ${i < slots.length - 1 ? "border-b border-line" : ""}`} href="#" data-slot={i}>
      <div>
        <div class="font-semibold text-[13px] text-fg">
          <span class="repo-name text-muted">—</span>
        </div>
        <div class="repo-desc text-muted text-[12px] mt-[2px] leading-[1.5]">—</div>
      </div>
      <div class="meta text-[11px] text-muted flex gap-[10px] items-center whitespace-nowrap">
        <span class="star inline-flex items-center gap-1">★ <span class="repo-stars">—</span></span>
        <span class="inline-flex items-center gap-1">
          <span class="repo-lang-dot w-2 h-2 inline-block rounded-full bg-line"></span>
          <span class="repo-lang">—</span>
        </span>
      </div>
    </a>
  ))}
</div>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/RepoList.astro
git commit -m "Add RepoList skeleton component"
```

---

## Task 15: `GithubSection.astro` — composes heatmap + repos + fetch script

**Files:**
- Create: `src/components/GithubSection.astro`

This component pulls `Heatmap` and `RepoList` together and ships a small inline `<script>` that hydrates them from `/data/github.json`.

- [ ] **Step 1: Create `src/components/GithubSection.astro`**

```astro
---
import { profile } from "../data/profile";
import Section from "./Section.astro";
import Heatmap from "./Heatmap.astro";
import RepoList from "./RepoList.astro";

const githubMeta = profile.social.github.replace("https://", "");
---

<Section id="oss" tag="03 / open source" title="Public commits & repos" meta={githubMeta}>
  <div class="grid md:grid-cols-[1fr_320px] gap-12 items-start">
    <div>
      <div class="border border-line p-[22px] bg-bg">
        <div id="gh-head" class="flex justify-between items-baseline mb-[18px] text-[12px] text-muted">
          <strong id="gh-headline" class="text-fg font-semibold text-[14px]">— contributions in the last year</strong>
          <span id="gh-streaks">longest streak · — · current · —</span>
        </div>

        <Heatmap />

        <div class="flex justify-between items-center text-[11px] text-muted">
          <span id="gh-date-from">—</span>
          <span class="flex gap-[3px]">
            <span class="text-[10px] mr-[6px]">less</span>
            <i class="w-[11px] h-[11px] inline-block bg-[#1a1a1a]"></i>
            <i class="w-[11px] h-[11px] inline-block bg-accent-soft"></i>
            <i class="w-[11px] h-[11px] inline-block bg-[#2563eb]"></i>
            <i class="w-[11px] h-[11px] inline-block bg-[#3b82f6]"></i>
            <i class="w-[11px] h-[11px] inline-block bg-accent"></i>
            <span class="text-[10px] ml-[6px]">more</span>
          </span>
          <span id="gh-date-to">—</span>
        </div>
      </div>

      <div class="grid grid-cols-3 gap-3 mt-5">
        <div class="border border-line p-[14px]">
          <div id="gh-stat-commits" class="text-[22px] font-bold tracking-tight">—</div>
          <div class="text-[11px] text-muted uppercase tracking-wider mt-1">commits / 12mo</div>
        </div>
        <div class="border border-line p-[14px]">
          <div id="gh-stat-prs" class="text-[22px] font-bold tracking-tight">—</div>
          <div class="text-[11px] text-muted uppercase tracking-wider mt-1">pull requests</div>
        </div>
        <div class="border border-line p-[14px]">
          <div id="gh-stat-stars" class="text-[22px] font-bold tracking-tight">—</div>
          <div class="text-[11px] text-muted uppercase tracking-wider mt-1">stars across repos</div>
        </div>
      </div>
    </div>

    <RepoList />
  </div>
</Section>

<script>
  type GithubData = {
    generatedAt: string;
    contributions: {
      total: number;
      longestStreak: number;
      currentStreak: number;
      weeks: { date: string; count: number; level: 0 | 1 | 2 | 3 | 4 }[][];
    };
    topRepos: {
      name: string;
      description: string | null;
      stars: number;
      language: string | null;
      languageColor: string | null;
      url: string;
    }[];
    stats: { commits12mo: number; mergedPrs12mo: number; totalStars: number };
  };

  function fmt(n: number): string {
    return n.toLocaleString("en-US");
  }

  function rangeLabel(weeks: GithubData["contributions"]["weeks"]): [string, string] {
    const first = weeks[0]?.[0]?.date ?? "";
    const last = weeks[weeks.length - 1]?.[6]?.date ?? "";
    const f = (s: string) => {
      if (!s) return "—";
      const d = new Date(s);
      return d.toLocaleString("en-US", { month: "short", year: "numeric" });
    };
    return [f(first), f(last)];
  }

  async function hydrate(): Promise<void> {
    try {
      const res = await fetch("/data/github.json", { cache: "no-store" });
      if (!res.ok) throw new Error("not ok");
      const data: GithubData = await res.json();

      // Headline
      const head = document.getElementById("gh-headline");
      if (head) head.textContent = `${fmt(data.contributions.total)} contributions in the last year`;

      const streaks = document.getElementById("gh-streaks");
      if (streaks) streaks.textContent = `longest streak · ${data.contributions.longestStreak} days · current · ${data.contributions.currentStreak} days`;

      // Date range
      const [from, to] = rangeLabel(data.contributions.weeks);
      const fromEl = document.getElementById("gh-date-from");
      const toEl = document.getElementById("gh-date-to");
      if (fromEl) fromEl.textContent = from;
      if (toEl) toEl.textContent = to;

      // Heatmap cells
      data.contributions.weeks.forEach((week, w) => {
        week.forEach((day, d) => {
          const cell = document.querySelector<HTMLElement>(`#heatmap [data-week="${w}"][data-day="${d}"]`);
          if (cell && day.level > 0) cell.dataset.level = String(day.level);
        });
      });

      // Stats
      const c = document.getElementById("gh-stat-commits");
      const p = document.getElementById("gh-stat-prs");
      const s = document.getElementById("gh-stat-stars");
      if (c) c.textContent = fmt(data.stats.commits12mo);
      if (p) p.textContent = fmt(data.stats.mergedPrs12mo);
      if (s) s.textContent = fmt(data.stats.totalStars);

      // Repos
      data.topRepos.forEach((repo, i) => {
        const row = document.querySelector<HTMLAnchorElement>(`#repos [data-slot="${i}"]`);
        if (!row) return;
        row.href = repo.url;
        row.querySelector(".repo-name")!.textContent = repo.name;
        row.querySelector(".repo-name")!.classList.remove("text-muted");
        (row.querySelector(".repo-name") as HTMLElement).classList.add("text-fg");
        row.querySelector(".repo-desc")!.textContent = repo.description ?? "";
        row.querySelector(".repo-stars")!.textContent = repo.stars >= 1000 ? (repo.stars / 1000).toFixed(1) + "k" : String(repo.stars);
        row.querySelector(".repo-lang")!.textContent = repo.language ?? "—";
        const dot = row.querySelector(".repo-lang-dot") as HTMLElement;
        if (dot && repo.languageColor) dot.style.background = repo.languageColor;
      });
    } catch {
      const head = document.getElementById("gh-headline");
      if (head) head.textContent = "GitHub stats unavailable";
      const streaks = document.getElementById("gh-streaks");
      if (streaks) streaks.textContent = "";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", hydrate);
  } else {
    hydrate();
  }
</script>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/GithubSection.astro
git commit -m "Add GithubSection with skeleton-and-hydrate fetch"
```

---

## Task 16: `Footer.astro`

**Files:**
- Create: `src/components/Footer.astro`

- [ ] **Step 1: Create `src/components/Footer.astro`**

```astro
---
import { profile } from "../data/profile";

const { email, social, readingList, resumeUrl } = profile;
const year = new Date().getFullYear();
---

<footer id="resume" class="pt-16 pb-12 border-t border-line-strong bg-bg">
  <div class="wrap">
    <div class="grid md:grid-cols-[1.4fr_1fr_1fr] gap-12 items-start">
      <div>
        <h5 class="m-0 mb-[14px] text-[11px] uppercase tracking-wider text-muted">Get in touch</h5>
        <div class="text-[28px] font-bold tracking-tight m-0 mb-2">
          <a href={`mailto:${email}`} class="text-fg hover:text-accent">{email}</a>
        </div>
        <p class="text-muted text-[13px] max-w-[36ch]">
          Open to senior fullstack and platform roles. Quickest reply is email — I read everything.
        </p>
        <div class="flex gap-[10px] mt-[18px] flex-wrap">
          <a href={resumeUrl} class="inline-flex items-center gap-2 px-4 py-[11px] border border-line-strong bg-fg text-bg text-[13px] no-underline hover:bg-accent hover:border-accent hover:text-white hover:no-underline">
            Download résumé.pdf <span>↓</span>
          </a>
          <a href={`mailto:${email}`} class="inline-flex items-center gap-2 px-4 py-[11px] border border-line-strong bg-bg text-fg text-[13px] no-underline hover:bg-fg hover:text-bg hover:no-underline">
            Email
          </a>
        </div>
      </div>

      <div>
        <h5 class="m-0 mb-[14px] text-[11px] uppercase tracking-wider text-muted">Elsewhere</h5>
        <ul class="list-none p-0 m-0 grid gap-2 text-[13px]">
          <li><a href={social.github} class="text-fg">{social.github.replace("https://", "")} ↗</a></li>
          <li><a href={social.linkedin} class="text-fg">{social.linkedin.replace("https://", "")} ↗</a></li>
          {social.readcv && <li><a href={social.readcv} class="text-fg">{social.readcv.replace("https://", "")} ↗</a></li>}
          {social.x && <li><a href={social.x} class="text-fg">{social.x.replace("https://", "")} ↗</a></li>}
        </ul>
      </div>

      <div>
        <h5 class="m-0 mb-[14px] text-[11px] uppercase tracking-wider text-muted">Reading list</h5>
        <ul class="list-none p-0 m-0 grid gap-2 text-[13px]">
          {readingList.map((r) => (
            <li><a href={r.href} class="text-fg">{r.title}</a></li>
          ))}
        </ul>
      </div>
    </div>

    <div class="mt-14 pt-5 border-t border-line flex justify-between text-[11px] text-muted flex-wrap gap-3">
      <span>© {year} {profile.name} · hand-built with html · no analytics, no cookies, no fuss.</span>
      <span>egeayyildiz.me</span>
    </div>
  </div>
</footer>
```

- [ ] **Step 2: Verify**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/Footer.astro
git commit -m "Add Footer component"
```

---

## Task 17: Compose `index.astro` and visually verify the full page

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Create `src/pages/index.astro`**

```astro
---
import Base from "../layouts/Base.astro";
import Nav from "../components/Nav.astro";
import Hero from "../components/Hero.astro";
import About from "../components/About.astro";
import Projects from "../components/Projects.astro";
import GithubSection from "../components/GithubSection.astro";
import Experience from "../components/Experience.astro";
import Stack from "../components/Stack.astro";
import Footer from "../components/Footer.astro";

import { profile } from "../data/profile";
---

<Base title={`${profile.name} — ${profile.role} engineer`} description={`Portfolio of ${profile.name}.`}>
  <Nav />
  <Hero />
  <About />
  <Projects />
  <GithubSection />
  <Experience />
  <Stack />
  <Footer />
</Base>
```

- [ ] **Step 2: Verify build**

Run: `npm run verify`
Expected: success.

- [ ] **Step 3: Visually verify in dev**

Run: `npm run dev`. Open `http://localhost:4321`. Walk through this checklist:

- [ ] Nav sticks to top, brand on left, links visible at desktop width, resume CTA on right.
- [ ] Hero headline shows blinking caret. Terminal card on the right renders with all sections (whoami, status.json, uptime).
- [ ] About section: 3 paragraphs on left, key-value card on right with green "available" pill.
- [ ] Projects: 4 articles, each with `[01]`-`[04]` number, stack tags, links, right-column metrics with dashed separators.
- [ ] OSS section: heatmap renders as an empty grid (all cells dim), header shows "— contributions in the last year", repo rows show "—" placeholders. **This is expected — no `/data/github.json` exists yet.**
- [ ] Experience: 4 jobs with `→` bullets, first has "● now" indicator.
- [ ] Stack: 4 columns (Languages, Frontend, Backend, Infra) with "daily" items in accent blue.
- [ ] Footer: email in big text, 3 columns (Get in touch, Elsewhere, Reading list).
- [ ] Resize browser to <880px. Two-column layouts collapse, nav links hide, brand + resume CTA remain.
- [ ] Open DevTools → Network. Observe a `GET /data/github.json` request that 404s. Confirm the "GitHub stats unavailable" text replaces the headline. (The skeleton remains, intentionally.)

Stop the dev server with Ctrl-C when done.

- [ ] **Step 4: Commit**

```bash
git add src/pages/index.astro
git commit -m "Compose index page and verify full visual render"
```

---

## Task 18: Cron script — `scripts/fetch-github.mjs`

**Files:**
- Create: `scripts/fetch-github.mjs`
- Create: `scripts/.env.example`

The script is standalone Node ≥20 (built-in `fetch`, no npm deps). It reads `GH_TOKEN`, `GITHUB_USERNAME`, and `GITHUB_JSON_PATH` from environment variables (loaded from a sibling `.env` file on the VPS — we'll write a minimal `.env` loader since we don't want a `dotenv` dependency).

- [ ] **Step 1: Create `scripts/.env.example`**

```sh
# Copy to .env on the VPS. Never commit the real .env.
GH_TOKEN=ghp_your_token_here
GITHUB_USERNAME=your-username
GITHUB_JSON_PATH=/var/www/egeayyildiz.me/data/github.json
```

- [ ] **Step 2: Create `scripts/fetch-github.mjs`**

```js
#!/usr/bin/env node
// Fetch GitHub data, write atomically to GITHUB_JSON_PATH.
// Usage:
//   node fetch-github.mjs          # write
//   node fetch-github.mjs --dry-run  # print to stdout, do not write

import { readFile, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

// --- Minimal .env loader (no dependency on dotenv) -------------------------
async function loadEnv() {
  const envPath = join(__dirname, ".env");
  if (!existsSync(envPath)) return;
  const text = await readFile(envPath, "utf8");
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const k = line.slice(0, eq).trim();
    let v = line.slice(eq + 1).trim();
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
      v = v.slice(1, -1);
    }
    if (!(k in process.env)) process.env[k] = v;
  }
}

// --- GitHub API calls -------------------------------------------------------
async function gqlContributions(token, user) {
  const query = `
    query($user: String!) {
      user(login: $user) {
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
                contributionLevel
              }
            }
          }
        }
      }
    }
  `;
  const res = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json",
      "User-Agent": "portfolio-cron",
    },
    body: JSON.stringify({ query, variables: { user } }),
  });
  if (!res.ok) throw new Error(`graphql contributions: HTTP ${res.status}`);
  const json = await res.json();
  if (json.errors) throw new Error(`graphql errors: ${JSON.stringify(json.errors)}`);
  return json.data.user.contributionsCollection.contributionCalendar;
}

async function restGet(token, url) {
  const res = await fetch(url, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Accept": "application/vnd.github+json",
      "User-Agent": "portfolio-cron",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

// --- Transform raw API responses to our JSON shape --------------------------
const LEVEL_MAP = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };

function transformContributions(calendar) {
  // GitHub returns weeks ordered chronologically; each week has up to 7 days.
  const weeks = calendar.weeks.map((wk) =>
    wk.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVEL_MAP[d.contributionLevel] ?? 0,
    }))
  );

  // Compute streaks across the flat list of days.
  const flat = weeks.flat();
  let longest = 0, current = 0, run = 0;
  for (const d of flat) {
    if (d.count > 0) { run++; longest = Math.max(longest, run); }
    else { run = 0; }
  }
  // Current streak = trailing run ending today.
  for (let i = flat.length - 1; i >= 0; i--) {
    if (flat[i].count > 0) current++;
    else break;
  }

  return {
    total: calendar.totalContributions,
    longestStreak: longest,
    currentStreak: current,
    weeks: weeks.slice(-52), // last 52 weeks only
  };
}

function transformRepos(rawRepos) {
  return rawRepos
    .filter((r) => !r.fork && !r.private && !r.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, 5)
    .map((r) => ({
      name: r.name,
      description: r.description,
      stars: r.stargazers_count,
      language: r.language,
      languageColor: null, // populated separately
      url: r.html_url,
    }));
}

// Tiny color map for common languages. Extend as needed.
const LANG_COLORS = {
  TypeScript: "#3178c6",
  JavaScript: "#f1e05a",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#dea584",
  Shell: "#89e051",
  HTML: "#e34c26",
  CSS: "#563d7c",
  Markdown: "#083fa1",
  Astro: "#ff5a03",
};

function applyLangColors(repos) {
  return repos.map((r) => ({ ...r, languageColor: r.language ? (LANG_COLORS[r.language] ?? "#888888") : null }));
}

async function mergedPrCount12mo(token, user) {
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - 1);
  const sinceStr = since.toISOString().slice(0, 10);
  const url = `https://api.github.com/search/issues?q=is:pr+author:${encodeURIComponent(user)}+is:merged+created:>=${sinceStr}&per_page=1`;
  const json = await restGet(token, url);
  return json.total_count ?? 0;
}

function totalStars(repos) {
  return repos.reduce((sum, r) => sum + (r.stargazers_count ?? 0), 0);
}

// --- Atomic write -----------------------------------------------------------
async function writeAtomic(path, contents) {
  const tmp = path + ".tmp";
  await writeFile(tmp, contents, "utf8");
  await rename(tmp, path);
}

// --- Main -------------------------------------------------------------------
async function main() {
  await loadEnv();

  const token = process.env.GH_TOKEN;
  const user = process.env.GITHUB_USERNAME;
  const outPath = process.env.GITHUB_JSON_PATH;
  if (!token) throw new Error("GH_TOKEN is required");
  if (!user) throw new Error("GITHUB_USERNAME is required");
  if (!DRY_RUN && !outPath) throw new Error("GITHUB_JSON_PATH is required (unless --dry-run)");

  const [calendar, allRepos, prCount] = await Promise.all([
    gqlContributions(token, user),
    restGet(token, `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=100&type=owner`),
    mergedPrCount12mo(token, user),
  ]);

  const contributions = transformContributions(calendar);
  const topReposRaw = transformRepos(allRepos);
  const topRepos = applyLangColors(topReposRaw);

  const result = {
    generatedAt: new Date().toISOString(),
    contributions,
    topRepos,
    stats: {
      commits12mo: contributions.total,
      mergedPrs12mo: prCount,
      totalStars: totalStars(allRepos),
    },
  };

  // Schema sanity check (would catch a transform regression).
  if (!Array.isArray(result.contributions.weeks) || result.contributions.weeks.length === 0) {
    throw new Error("schema: contributions.weeks is empty");
  }
  if (!Array.isArray(result.topRepos)) {
    throw new Error("schema: topRepos is not an array");
  }

  const json = JSON.stringify(result, null, 2);

  if (DRY_RUN) {
    process.stdout.write(json + "\n");
    return;
  }

  await writeAtomic(outPath, json);
  console.log(`wrote ${outPath} (${json.length} bytes)`);
}

main().catch((err) => {
  console.error("fetch-github failed:", err.message);
  process.exit(1);
});
```

- [ ] **Step 3: Local dry-run smoke test**

This test is OPTIONAL but recommended. Skip if the engineer doesn't have a GitHub PAT handy.

```bash
cd scripts
cp .env.example .env
# edit .env: paste a real PAT, set GITHUB_USERNAME to your handle
GH_TOKEN=$(grep ^GH_TOKEN= .env | cut -d= -f2-) \
GITHUB_USERNAME=$(grep ^GITHUB_USERNAME= .env | cut -d= -f2-) \
  node fetch-github.mjs --dry-run | head -30
# expect: JSON output starting with `{ "generatedAt": ...`
rm .env   # do NOT commit
cd ..
```

Expected: prints JSON to stdout. If a 401 → token bad. If a 403 → rate limited (wait an hour) or token missing scopes.

- [ ] **Step 4: Verify the rest of the project still builds**

Run: `npm run verify`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add scripts/fetch-github.mjs scripts/.env.example
git commit -m "Add GitHub cron script with --dry-run and atomic write"
```

---

## Task 19: VPS reference files — Caddyfile + DEPLOY.md

**Files:**
- Create: `deploy/Caddyfile`
- Create: `deploy/DEPLOY.md`

These files are reference material for the owner's VPS setup. They are NOT executed by the build — they document the steps.

- [ ] **Step 1: Create `deploy/Caddyfile`**

```caddyfile
egeayyildiz.me {
  root * /var/www/egeayyildiz.me
  file_server
  encode gzip zstd

  # JSON refreshed by cron — short browser cache so heatmap stays fresh-ish.
  header /data/* Cache-Control "public, max-age=300"

  # Astro hashes asset filenames; long-cache them.
  header /_astro/* Cache-Control "public, max-age=31536000, immutable"

  # Security headers
  header {
    X-Content-Type-Options nosniff
    X-Frame-Options DENY
    Referrer-Policy strict-origin-when-cross-origin
  }
}
```

- [ ] **Step 2: Create `deploy/DEPLOY.md`**

````markdown
# VPS Deployment

Reference for the first-time setup on a fresh VPS. Owner-managed.

## 1. DNS

Point `egeayyildiz.me` (A record) at the VPS IP.

## 2. Web server (Caddy)

Install Caddy (Debian/Ubuntu):
```sh
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

Drop in the Caddyfile and reload:
```sh
sudo cp deploy/Caddyfile /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

## 3. Webroot

```sh
sudo mkdir -p /var/www/egeayyildiz.me/data
sudo chown -R $USER:$USER /var/www/egeayyildiz.me
```

## 4. GitHub cron

Generate a fine-grained PAT (or classic with `read:user` + `public_repo` scopes — read-only).

```sh
sudo mkdir -p /opt/portfolio-cron
sudo chown $USER:$USER /opt/portfolio-cron
cp scripts/fetch-github.mjs /opt/portfolio-cron/
cp scripts/.env.example /opt/portfolio-cron/.env
# edit /opt/portfolio-cron/.env: fill in GH_TOKEN, GITHUB_USERNAME
# leave GITHUB_JSON_PATH=/var/www/egeayyildiz.me/data/github.json
chmod 600 /opt/portfolio-cron/.env
```

Smoke test the script:
```sh
cd /opt/portfolio-cron
node fetch-github.mjs --dry-run | head -20
```

Seed the JSON:
```sh
node fetch-github.mjs
ls -lh /var/www/egeayyildiz.me/data/github.json
```

Install the cron entry (`crontab -e`):
```cron
0 4 * * * cd /opt/portfolio-cron && /usr/bin/node fetch-github.mjs >> /var/log/portfolio-cron.log 2>&1
```

Create the log file with the right owner:
```sh
sudo touch /var/log/portfolio-cron.log
sudo chown $USER:$USER /var/log/portfolio-cron.log
```

## 5. First site deploy

From your laptop, after `npm run build`:
```sh
rsync -avz --delete --exclude 'data/' dist/ user@egeayyildiz.me:/var/www/egeayyildiz.me/
```
The `--exclude data/` is load-bearing: it preserves the cron-written JSON.

## 6. Verify in a browser

Visit https://egeayyildiz.me. Confirm:
- Site loads over HTTPS (Caddy provisions Let's Encrypt automatically).
- DevTools → Network: `/data/github.json` returns 200 with the cron-written payload.
- Heatmap and repo list render with real data within ~50ms of first paint.
````

- [ ] **Step 3: Verify build still passes (no project file changes that affect it)**

Run: `npm run verify`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add deploy/Caddyfile deploy/DEPLOY.md
git commit -m "Add Caddyfile and VPS deploy reference"
```

---

## Task 20: README, final verification, push

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create `README.md`**

```markdown
# Portfolio Website

Personal portfolio for egeayyildiz.me. Static Astro 5 site with a daily
GitHub data refresh handled by a small cron script on the VPS.

## Local development

```sh
npm install
npm run dev        # http://localhost:4321
npm run verify     # astro check && astro build
```

## Editing content

All content lives in `src/data/profile.ts`. Edit the `profile` object;
TypeScript will tell you if you miss a field.

## Deploy

See `deploy/DEPLOY.md` for first-time VPS setup. Subsequent deploys:

```sh
npm run build
rsync -avz --delete --exclude 'data/' dist/ user@egeayyildiz.me:/var/www/egeayyildiz.me/
```

## GitHub data refresh

`scripts/fetch-github.mjs` is a standalone Node ≥20 script with no npm
dependencies. It runs on the VPS via cron (see `deploy/DEPLOY.md`) and
writes `/var/www/egeayyildiz.me/data/github.json`. The site fetches
that file at runtime.

Run `node scripts/fetch-github.mjs --dry-run` to test API access without
writing.

## Reference

The original design (hand-coded HTML) lives at
`references/portfolio.html`. The Astro components in `src/components/`
port that design 1:1.
```

- [ ] **Step 2: Final verification**

Run: `npm run verify`
Expected: clean `astro check` + successful `astro build`.

Run: `npm run dev` and walk through the full visual checklist from Task 17 one more time.

- [ ] **Step 3: Final commit and push**

```bash
git add README.md
git commit -m "Add README"
git push
```

---

## Post-implementation (owner-handled, not part of this plan)

These steps need owner action and are intentionally left out of the implementation tasks:

- Replace placeholder content in `src/data/profile.ts` with real values.
- Drop a real `resume.pdf` into `public/`.
- Drop a `favicon.svg` into `public/`.
- Generate the GitHub PAT and follow `deploy/DEPLOY.md` on the VPS.
- Run the first deploy.
