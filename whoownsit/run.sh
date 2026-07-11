#!/bin/bash
# One-command local setup + run for WhoOwnsIt.
# Usage:
#   ./run.sh         # whatever server/.env says (mock by default)
#   ./run.sh live    # force LIVE mode: real Gemini + FMP, prewarms the cache
#   ./run.sh mock    # force MOCK mode regardless of .env
set -e
cd "$(dirname "$0")"

MODE="${1:-}"

if ! command -v node >/dev/null 2>&1; then
  echo "❌ Node.js not found — install Node 20.19+ from https://nodejs.org"
  exit 1
fi

NODE_MAJOR=$(node -v | sed 's/^v\([0-9]*\).*/\1/')
if [ "$NODE_MAJOR" -lt 20 ]; then
  echo "❌ Node $(node -v) is too old — Vite 7 needs Node 20.19+"
  exit 1
fi

if [ ! -f server/.env ]; then
  cp server/.env.example server/.env
  echo "✅ Created server/.env from the example (MOCK_MODE=true — works with zero API keys)"
fi

[ -d node_modules ]        || { echo "Installing root deps…";   npm install; }
[ -d client/node_modules ] || { echo "Installing client deps…"; npm install --prefix client; }
[ -d server/node_modules ] || { echo "Installing server deps…"; npm install --prefix server; }

if [ "$MODE" = "live" ]; then
  for key in GEMINI_API_KEY FMP_API_KEY; do
    if ! grep -qE "^${key}=.+" server/.env; then
      echo "❌ ${key} is empty in server/.env — paste the team key first, then rerun ./run.sh live"
      exit 1
    fi
  done
  # Exported env beats .env (dotenv never overwrites existing vars).
  export MOCK_MODE=false
  echo "🔴 LIVE mode — real Gemini + FMP calls"
  echo "📦 Prewarming demo tickers (same-day cache hits are free)…"
  (cd server && node scripts/prewarm.js) || echo "⚠️  prewarm reported failures — continuing anyway"
elif [ "$MODE" = "mock" ]; then
  export MOCK_MODE=true
  echo "🎭 MOCK mode forced — no API keys used"
fi

echo ""
echo "🚀 WhoOwnsIt starting — app: http://localhost:5173   api: http://localhost:5001"
echo "   Phone testing: open the 'Network:' URL Vite prints below on a phone on the same WiFi."
echo "   The badge in the app's corner shows which mode you're in."
echo ""
npm run dev
