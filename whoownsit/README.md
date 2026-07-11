# WhoOwnsIt

Photograph a product → Gemini names the company that really owns it → ownership chain, 1-yr stock chart, and a "$X/month invested" calculator.

## Setup

**Fastest:** `./run.sh` — checks Node, installs everything, creates `.env`, starts both apps.

Or manually:

1. `npm install` then `npm run setup`
2. `cp server/.env.example server/.env` — mock mode is on by default, **no API keys needed**
3. `npm run dev` → app at http://localhost:5173 (API at http://localhost:5001)

For live mode: put real `GEMINI_API_KEY` + `FMP_API_KEY` in `server/.env`, set `MOCK_MODE=false`.
