import { Router } from 'express';
import multer from 'multer';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { firstTradingDays, dcaResult } from '../utils/dca.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MOCK_PATH = path.join(__dirname, '../mocks/pep.json');

const UNIDENTIFIABLE_MESSAGE =
  "Couldn't identify a branded product — try again with the logo or packaging clearly in frame.";

function identityFields(gemini) {
  const {
    status,
    product_name,
    brand,
    ownership_chain,
    ultimate_parent,
    country,
    licensing_note,
    summary,
  } = gemini;
  return { status, product_name, brand, ownership_chain, ultimate_parent, country, licensing_note, summary };
}

router.get('/health', (req, res) => {
  res.json({ ok: true, mock: process.env.MOCK_MODE === 'true' });
});

router.post('/analyze', upload.single('image'), async (req, res) => {
  const monthly = Number(req.query.monthly) || 100;

  try {
    if (process.env.MOCK_MODE === 'true') {
      const mock = JSON.parse(await readFile(MOCK_PATH, 'utf8'));
      mock.dca = dcaResult(monthly, mock.monthly_buys, mock.share_price);
      return res.json(mock);
    }

    // #7 — services/gemini.js. Loaded dynamically so the mock path above
    // works standalone before the live services land.
    const { identifyOwner } = await import('../services/gemini.js');
    const gemini = await identifyOwner(req.file.buffer, req.file.mimetype);

    if (gemini.status === 'UNIDENTIFIABLE') {
      return res.json({ status: 'UNIDENTIFIABLE', message: UNIDENTIFIABLE_MESSAGE });
    }

    if (gemini.status === 'PRIVATE' || gemini.status === 'FOREIGN') {
      return res.json(identityFields(gemini));
    }

    // US_PUBLIC — #9 cache, else #8 FMP.
    const { getCached, setCache } = await import('../utils/cache.js');
    let payload = (await getCached?.(gemini.ticker)) ?? null;

    if (!payload) {
      const { getProfile, getDailyHistory } = await import('../services/fmp.js');
      const [profile, daily] = await Promise.all([
        getProfile(gemini.ticker),
        getDailyHistory(gemini.ticker),
      ]);

      if (!profile || !daily) {
        return res.json({
          status: 'TICKER_NOT_VERIFIED',
          gemini,
          message: "Identified the owner but couldn't verify the ticker against market data.",
        });
      }

      const latest = daily[daily.length - 1];
      payload = {
        company: profile,
        share_price: latest.price,
        as_of: latest.date,
        chart: daily.slice(-260),
        monthly_buys: firstTradingDays(daily),
      };
      await setCache?.(gemini.ticker, payload);
    }

    res.json({
      status: 'US_PUBLIC',
      product_name: gemini.product_name,
      brand: gemini.brand,
      ownership_chain: gemini.ownership_chain,
      ultimate_parent: gemini.ultimate_parent,
      ticker: gemini.ticker,
      licensing_note: gemini.licensing_note,
      summary: gemini.summary,
      company: payload.company,
      share_price: payload.share_price,
      as_of: payload.as_of,
      chart: payload.chart,
      monthly_buys: payload.monthly_buys,
      dca: dcaResult(monthly, payload.monthly_buys, payload.share_price),
    });
  } catch (err) {
    res.status(500).json({ status: 'ERROR', message: err.message });
  }
});

router.get('/calc', async (req, res) => {
  const { ticker, monthly } = req.query;

  try {
    // #9 — utils/cache.js. Optional chaining means a not-yet-implemented
    // cache (or an uncached ticker) both fall through to 404 below.
    const { getCached } = await import('../utils/cache.js');
    const cached = await getCached?.(ticker);

    if (!cached) {
      return res.status(404).json({ status: 'ERROR', message: `No cached data for ticker "${ticker}"` });
    }

    res.json({ dca: dcaResult(Number(monthly), cached.monthly_buys, cached.share_price) });
  } catch {
    res.status(404).json({ status: 'ERROR', message: `No cached data for ticker "${ticker}"` });
  }
});

export default router;
