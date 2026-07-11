import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../data');
const CACHE_FILE = path.join(DATA_DIR, 'cache.json');

// UTC calendar day. Deliberate: a prewarm run late the night before the demo
// (US time) shares its UTC day with demo morning, so the cache stays warm.
function today() {
  return new Date().toISOString().slice(0, 10);
}

function load() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

export function getCached(ticker) {
  const entry = load()[ticker];
  return entry && entry.date === today() ? entry.payload : null;
}

export function setCached(ticker, payload) {
  const cache = load();
  cache[ticker] = { date: today(), payload };
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

// routes/analyze.js imports the setter under this name.
export { setCached as setCache };
