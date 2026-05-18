#!/usr/bin/env node

import { readFile, writeFile, rename } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DRY_RUN = process.argv.includes("--dry-run");

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
      Authorization: `Bearer ${token}`,
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
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "portfolio-cron",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  return res.json();
}

const LEVEL_MAP = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
};

function transformContributions(calendar) {
  const weeks = calendar.weeks.map((wk) =>
    wk.contributionDays.map((d) => ({
      date: d.date,
      count: d.contributionCount,
      level: LEVEL_MAP[d.contributionLevel] ?? 0,
    }))
  );

  const flat = weeks.flat();
  let longest = 0;
  let current = 0;
  let run = 0;
  for (const d of flat) {
    if (d.count > 0) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 0;
    }
  }
  for (let i = flat.length - 1; i >= 0; i--) {
    if (flat[i].count > 0) current++;
    else break;
  }

  return {
    total: calendar.totalContributions,
    longestStreak: longest,
    currentStreak: current,
    weeks: weeks.slice(-52),
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
      languageColor: null,
      url: r.html_url,
    }));
}

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
  return repos.map((r) => ({
    ...r,
    languageColor: r.language ? (LANG_COLORS[r.language] ?? "#888888") : null,
  }));
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

async function writeAtomic(path, contents) {
  const tmp = path + ".tmp";
  await writeFile(tmp, contents, "utf8");
  await rename(tmp, path);
}

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
    restGet(
      token,
      `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=updated&per_page=100&type=owner`
    ),
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
