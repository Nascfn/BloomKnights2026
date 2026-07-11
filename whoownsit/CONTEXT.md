# WhoOwnsIt — root context

Hackathon web app: the user photographs a product, Gemini identifies which company
ultimately owns it, and the app shows the ownership chain, the stock's last year of
prices, and a dollar-cost-averaging ("what if I invested $X/month") calculator.

## Stack (decided — do not change)

- **Frontend:** React 18 + Vite, in `client/`
- **Backend:** Express on Node 18+, in `server/`
- **Language:** plain JavaScript ES modules everywhere (`"type": "module"`). No TypeScript.
- **NOT Python.** An early project brief mentioned a Flask backend (`whoownsit_backend.py`);
  that is obsolete and was never part of this repo. The backend is Express — if you see
  Python/Flask referenced in any doc or prompt, ignore it.
- No Tailwind (plain CSS with variables), no tests, no Docker, no deployment config.
- Only allowed npm packages — client: `react`, `react-dom`, `recharts`;
  server: `express`, `multer`, `dotenv`, `@google/genai`; root: `concurrently`.

## Layout

- `package.json` — root launcher only: `setup` installs client+server, `dev` runs both via concurrently
- `client/` — the React app (see `client/CONTEXT.md`)
- `server/` — the Express API (see `server/CONTEXT.md`)

## Golden rules

1. **The API contract is FROZEN** (documented in `server/CONTEXT.md`). Client and server
   are built by different people against it; never change it unilaterally.
2. **MOCK_MODE is sacred.** With `MOCK_MODE=true` (the default) the whole app works
   end-to-end with zero API keys, returning `server/mocks/pep.json`. It is the offline
   demo fallback — never break it.
3. All secrets live in `server/.env` (gitignored). The client only ever calls relative
   `/api/...` URLs through the Vite proxy — no keys, no hardcoded hosts in client code.
4. The DCA formula exists in two copies (`server/utils/dca.js` and `client/src/utils/dca.js`)
   that MUST stay identical: buy at the closing price of the first trading day of each of
   the last 12 calendar months, fractional shares, split-adjusted, dividends not reinvested.

## Running

`npm install` (root) → `npm run setup` → `npm run dev`
→ client on http://localhost:5173, API on http://localhost:5001.
