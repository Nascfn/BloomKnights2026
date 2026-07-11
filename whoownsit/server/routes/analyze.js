import { Router } from 'express';
import multer from 'multer';
import { firstTradingDays, dcaResult } from '../utils/dca.js';
import { identifyOwner } from '../services/gemini.js';
import { getProfile, getDailyHistory } from '../services/fmp.js';
import { getCached, setCache } from '../utils/cache.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

const UNIDENTIFIABLE_MESSAGE =
  "Couldn't identify a branded product — try again with the logo or packaging clearly in frame.";

// A real listing trades most weekdays; a latest close older than this means
// the ticker is likely delisted (or the data source is broken).
const MAX_QUOTE_AGE_DAYS = 14;

function isStaleQuote(asOf) {
  const age = Date.now() - Date.parse(`${asOf}T00:00:00Z`);
  return !asOf || Number.isNaN(age) || age > MAX_QUOTE_AGE_DAYS * 24 * 60 * 60 * 1000;
}

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
  res.json({ ok: true });
});

router.post('/analyze', upload.single('image'), async (req, res) => {
  const monthly = Number(req.query.monthly) || 100;

  try {
    const gemini = await identifyOwner(req.file.buffer, req.file.mimetype);

    if (gemini.status === 'UNIDENTIFIABLE') {
      return res.json({ status: 'UNIDENTIFIABLE', message: UNIDENTIFIABLE_MESSAGE });
    }

    if (gemini.status === 'PRIVATE' || gemini.status === 'FOREIGN') {
      return res.json(identityFields(gemini));
    }

    // US_PUBLIC — same-day cache, else FMP.
    let payload = getCached(gemini.ticker);

    if (!payload) {
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
      if (!isStaleQuote(payload.as_of)) {
        setCache(gemini.ticker, payload);
      }
    }

    // Staleness guard: FMP keeps serving old history for delisted tickers
    // (e.g. Kellanova after the Mars buyout closed Dec 2025), and Gemini's
    // training data can lag a going-private deal. Never show stale prices.
    if (isStaleQuote(payload.as_of)) {
      return res.json({
        status: 'TICKER_NOT_VERIFIED',
        gemini,
        message: `Identified the owner but market data for "${gemini.ticker}" appears inactive or delisted — not showing stock numbers.`,
      });
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
    const cached = getCached(ticker);

    if (!cached) {
      return res.status(404).json({ status: 'ERROR', message: `No cached data for ticker "${ticker}"` });
    }

    res.json({ dca: dcaResult(Number(monthly), cached.monthly_buys, cached.share_price) });
  } catch {
    res.status(404).json({ status: 'ERROR', message: `No cached data for ticker "${ticker}"` });
  }
});

export default router;
