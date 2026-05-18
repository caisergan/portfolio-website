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

`scripts/fetch-github.mjs` is a standalone Node 20+ script with no npm
dependencies. It runs on the VPS via cron (see `deploy/DEPLOY.md`) and
writes `/var/www/egeayyildiz.me/data/github.json`. The site fetches
that file at runtime.

Run `node scripts/fetch-github.mjs --dry-run` to test API access without
writing.

## Reference

The original design (hand-coded HTML) lives at
`references/portfolio.html`. The Astro components in `src/components/`
port that design 1:1.
