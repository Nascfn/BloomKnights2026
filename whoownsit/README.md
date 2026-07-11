# WhoOwnsIt

Photograph a product → Gemini names the company that really owns it → ownership chain, 1-yr stock chart, and a "$X/month invested" calculator.

## Start here (mock mode — no API keys, works offline)

```bash
git clone https://github.com/Nascfn/BloomKnights2026.git
cd BloomKnights2026/whoownsit
./run.sh
```

Open **http://localhost:5173**, upload any image, and you'll get the canned PepsiCo result. That's the whole app working end-to-end. (`run.sh` checks your Node version — needs 20.19+ — installs everything, and creates `server/.env` for you.)

## Go live (real Gemini + FMP)

1. Paste the team keys into `server/.env` (ask Paulo — **never commit this file**)
2. `./run.sh live` — validates the keys, prewarms the ticker cache, starts in live mode
3. **Scan with your phone:** open the `Network:` URL Vite prints on a phone on the same WiFi — real camera, real products
4. The corner badge tells you the truth: `🎭 Mock data` vs `● Live`. Flip back anytime with `./run.sh mock`

## If `./run.sh` doesn't work on your machine

```bash
npm install && npm run setup      # root + client + server deps
cp server/.env.example server/.env
npm run dev                       # client :5173 + API :5001
```

## Rules of the road

- Secrets live **only** in `server/.env` (gitignored). The client never sees keys.
- FMP budget is shared: each ticker costs API calls once per day (the cache handles the rest). Gemini calls happen per scan.
- Demo fallback: `git checkout demo-fallback-mock-v1 && ./run.sh` — known-good build, zero keys needed.
