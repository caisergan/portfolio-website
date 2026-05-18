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
- DevTools Network: `/data/github.json` returns 200 with cron-written payload.
- Heatmap and repo list render with real data.
