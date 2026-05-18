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
    lede: 'Fullstack engineer with seven years of shipping production systems — from <em>type-safe APIs</em> to <em>distributed infra</em>. I care about fast feedback loops, durable abstractions, and code that future-me won’t regret. Currently building developer tools at a Series B startup.',
    terminal: {
      focus: "dev tools · infra",
      openTo: "sr+ fullstack roles",
      uptime: "7y 142d",
    },
  },

  about: {
    paragraphs: [
      'I’ve spent the last seven years working at the seam between product and infrastructure — the kind of role where <strong>"fullstack" actually means everything from a React hover state to a Postgres index plan</strong> to an AWS bill review. I like ambiguous problems and small, opinionated teams.',
      "Most recently I led the platform team at a developer tools startup, where I rewrote our query layer to cut p95 latency by 4× and helped take the product from closed beta to 40k+ weekly active developers.",
      "When I’m not writing code I’m reading about distributed systems, running too many side projects, or making coffee that’s objectively too strong.",
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
        "Interview & hire for the broader engineering org; closed 6 senior hires in ’25.",
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
      company: "Wavelet (acquired ’21)",
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
