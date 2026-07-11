#!/bin/bash
# One-command local setup + run for WhoOwnsIt (live mode — keys required).
# Usage: ./run.sh   (from anywhere — it cd's to the repo)
set -e
cd "$(dirname "$0")"

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
fi

for key in GEMINI_API_KEY FMP_API_KEY; do
  if ! grep -qE "^${key}=.+" server/.env; then
    echo "❌ ${key} is empty in server/.env — paste the team key first, then rerun ./run.sh"
    exit 1
  fi
done

[ -d node_modules ]        || { echo "Installing root deps…";   npm install; }
[ -d client/node_modules ] || { echo "Installing client deps…"; npm install --prefix client; }
[ -d server/node_modules ] || { echo "Installing server deps…"; npm install --prefix server; }

echo "📦 Prewarming demo tickers (same-day reruns are free)…"
(cd server && node scripts/prewarm.js) || echo "⚠️  prewarm reported failures — continuing anyway"

echo ""
echo "🚀 WhoOwnsIt starting — app: http://localhost:5173   api: http://localhost:5001"
echo "   Phone testing: open the 'Network:' URL Vite prints below on a phone on the same WiFi."
echo ""
npm run dev
