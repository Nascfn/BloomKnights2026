# WhoOwnsIt

Photograph a product → Gemini names the company that really owns it → ownership chain, 1-yr stock chart, and a "$X/month invested" calculator.

## Run it locally

```bash
git clone https://github.com/Nascfn/BloomKnights2026.git
cd BloomKnights2026/whoownsit
cp server/.env.example server/.env
# paste the team keys into server/.env (ask Paulo — NEVER commit this file)
./run.sh
```

`run.sh` checks your Node version (needs 20.19+), installs everything, refuses to start without keys, prewarms the ticker cache, and starts both apps. Open **http://localhost:5173**.

**Scan with your phone:** open the `Network:` URL Vite prints on a phone on the same WiFi — real camera, real products.

## If `./run.sh` doesn't work on your machine

```bash
npm install && npm run setup      # root + client + server deps
npm run dev                       # client :5173 + API :5001
```

## Deploying (Render)

The blueprint lives at [`render.yaml`](../render.yaml) — two services: `whoownsit` (static client, free, proxies `/api/*`) and `whoownsit-api` (Express). Every push to `main` auto-deploys.

1. Render dashboard → New → **Blueprint** → connect this repo → apply
2. It prompts for `GEMINI_API_KEY` + `FMP_API_KEY` during setup (declared `sync: false` — never in git). Scans fail until they're set
3. After first deploy, confirm the API service's URL matches the rewrite `destination` in `render.yaml`; fix the destination if Render suffixed the name
4. ⚠️ The API is on the **free plan, which sleeps after idle** (~1 min cold start) — upgrade it to Starter before demo day
5. Notes: the ticker cache is wiped on each deploy/restart, and every scan on the public URL costs a Gemini call — don't post the link publicly

## Rules of the road

- Secrets live **only** in `server/.env` locally / encrypted env vars on DO. The client never sees keys.
- FMP budget: each ticker costs API calls once per day (the cache handles the rest). Gemini calls happen per scan.
- Offline fallback for demos: `git checkout demo-fallback-mock-v1 && ./run.sh` — an old tagged build that still has mock mode, zero keys needed.
