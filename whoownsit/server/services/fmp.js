const STABLE_BASE = 'https://financialmodelingprep.com/stable';
const V3_BASE = 'https://financialmodelingprep.com/api/v3';

function withQuery(url, params) {
  const query = new URLSearchParams(params).toString();
  if (!query) return url;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

async function fetchOk(url) {
  try {
    const res = await fetch(url);
    if (res.status !== 200) return null;
    const text = await res.text();
    if (!text) return null;
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function fmpGet(stablePath, v3Path, params = {}) {
  const query = { ...params, apikey: process.env.FMP_API_KEY };
  const stableData = await fetchOk(withQuery(`${STABLE_BASE}/${stablePath}`, query));
  if (stableData !== null) return stableData;
  return fetchOk(withQuery(`${V3_BASE}/${v3Path}`, query));
}

export async function getProfile(ticker) {
  const symbol = encodeURIComponent(ticker);
  const data = await fmpGet(`profile?symbol=${symbol}`, `profile/${symbol}`);
  const row = Array.isArray(data) ? data[0] : null;
  if (!row) return null;

  return {
    company_name: row.companyName,
    price: row.price,
    exchange: row.exchange || row.exchangeShortName,
    sector: row.sector,
    logo_url: row.image,
    description: (row.description || '').slice(0, 400),
  };
}

function isoDaysAgo(days) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function getDailyHistory(ticker) {
  const symbol = encodeURIComponent(ticker);
  const from = isoDaysAgo(420);
  const to = isoDaysAgo(0);
  const data = await fmpGet(
    `historical-price-eod/full?symbol=${symbol}&from=${from}&to=${to}`,
    `historical-price-full/${symbol}?from=${from}&to=${to}`
  );

  const rows = Array.isArray(data) ? data : Array.isArray(data?.historical) ? data.historical : null;
  if (!rows || rows.length === 0) return null;

  return rows
    .map((row) => ({ date: row.date, price: row.adjClose ?? row.close }))
    .sort((a, b) => (a.date < b.date ? -1 : a.date > b.date ? 1 : 0));
}
