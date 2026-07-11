# WhoOwnsIt

Photograph a product → Gemini names the company that really owns it → ownership chain, 1-yr stock chart, and a "$X/month invested" calculator.

## Setup

**Fastest:** `./run.sh` — checks Node, installs everything, creates `.env`, starts both apps.

Or manually:

1. `npm install` then `npm run setup`
2. `cp server/.env.example server/.env` — mock mode is on by default, **no API keys needed**
3. `npm run dev` → app at http://localhost:5173 (API at http://localhost:5001)

## Testing live (real Gemini + FMP)

1. Paste the team keys into `server/.env` (ask Paulo)
2. `./run.sh live` — forces live mode and prewarms the ticker cache (same-day reruns are free)
3. **Phone camera:** open the `Network:` URL Vite prints on a phone on the same WiFi and scan real products
4. The corner badge shows the mode: `🎭 Mock data` vs `● Live`. `./run.sh mock` forces mock mode back on.
