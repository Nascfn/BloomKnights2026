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

## Deploying (DigitalOcean App Platform)

The app spec lives at [`.do/app.yaml`](../.do/app.yaml) — DO picks it up when you create the app from this GitHub repo, and every push to `main` auto-deploys.

1. DO dashboard → Apps → Create App → this repo (it reads `.do/app.yaml`: static client + `/api` service)
2. Add `GEMINI_API_KEY` + `FMP_API_KEY` as **encrypted** env vars on the `api` component — scans fail until they're set
3. Notes: the ticker cache is wiped on each deploy (refills from FMP on demand), and every scan on the public URL costs a Gemini call — don't post the link publicly

## Rules of the road

- Secrets live **only** in `server/.env` locally / encrypted env vars on DO. The client never sees keys.
- FMP budget: each ticker costs API calls once per day (the cache handles the rest). Gemini calls happen per scan.
- Offline fallback for demos: `git checkout demo-fallback-mock-v1 && ./run.sh` — an old tagged build that still has mock mode, zero keys needed.
