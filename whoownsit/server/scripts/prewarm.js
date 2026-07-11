// Pre-caches the demo tickers so scans are instant and immune to venue WiFi.
// Run the night before demos: node scripts/prewarm.js (from server/) — works
// from any cwd because .env is resolved relative to this script.
import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';

dotenv.config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

const { getProfile, getDailyHistory } = await import('../services/fmp.js');
const { getCached, setCached } = await import('../utils/cache.js');
const { firstTradingDays } = await import('../utils/dca.js');

const TICKERS = [
  'PEP', 'KO', 'AAPL', 'MSFT', 'NKE', 'MCD', 'PG', 'HSY',
  'GIS', 'K', 'MDLZ', 'SBUX', 'COST', 'WMT', 'CROX', 'YETI',
];

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
