// Pre-caches the demo tickers so scans are instant and immune to venue WiFi.
// Run the night before demos: node scripts/prewarm.js (from server/) — works
// from any cwd because .env is resolved relative to this script.
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const { getProfile, getDailyHistory } = await import('../services/fmp.js');
const { getCached, setCached } = await import('../utils/cache.js');
const { firstTradingDays } = await import('../utils/dca.js');

// K (Kellanova) removed: delisted 2025-12-10 after the Mars buyout closed —
// Pringles now resolves via the route's staleness guard, not stock data.
const TICKERS = [
  'PEP', 'KO', 'AAPL', 'MSFT', 'NKE', 'MCD', 'PG', 'HSY',
  'GIS', 'MDLZ', 'SBUX', 'COST', 'WMT', 'CROX', 'YETI',
];

const MAX_QUOTE_AGE_DAYS = 14; // keep in sync with routes/analyze.js

let ok = 0;
let failed = 0;

for (const ticker of TICKERS) {
  if (getCached(ticker)) {
    console.log(`${ticker}: already cached today`);
    ok++;
    continue;
  }

  const [profile, daily] = await Promise.all([
    getProfile(ticker),
    getDailyHistory(ticker),
  ]);

  if (!profile || !daily) {
    console.warn(`${ticker}: FAILED (profile=${!!profile}, history=${!!daily})`);
    failed++;
    continue;
  }

  const latest = daily[daily.length - 1];

  if (Date.now() - Date.parse(`${latest.date}T00:00:00Z`) > MAX_QUOTE_AGE_DAYS * 86400000) {
    console.warn(`${ticker}: SKIPPED — latest close is ${latest.date}, looks delisted`);
    failed++;
    continue;
  }

  // Same payload shape routes/analyze.js caches and /api/calc reads.
  setCached(ticker, {
    company: profile,
    share_price: latest.price,
    as_of: latest.date,
    chart: daily.slice(-260),
    monthly_buys: firstTradingDays(daily),
  });
  console.log(`${ticker}: cached ${daily.length} days @ ${latest.price}`);
  ok++;
}

console.log(`\nDone: ${ok}/${TICKERS.length} cached${failed ? `, ${failed} FAILED` : ''}`);
if (failed) process.exitCode = 1;
