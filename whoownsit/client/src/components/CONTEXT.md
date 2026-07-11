# client/src/components/ — screens & widgets

One React component per file, plain JS + the CSS variables/classes from `../index.css`.

## Pre-result flow

- `ScanScreen.jsx` — the demo starts here. File/camera input
  (`accept="image/*" capture`), a `$/month` number field defaulting to 100, and a big
  primary **Scan** button (disabled until a file is chosen) that calls `onScan(file, monthly)`.
- `LoadingScreen.jsx` — spinner + fun copy ("Tracing the corporate family tree…").

## US_PUBLIC result (the money shot)

- `ResultScreen.jsx` — composition only. Order: product name → OwnershipChain →
  `licensing_note` info chip (when present) → summary → CompanyCard → PriceChart →
  DcaCalculator → "Scan another product" reset button.
- `OwnershipChain.jsx` — `ownership_chain[]` as pill badges with arrows:
  Doritos → Frito-Lay → PepsiCo. Highlight the last pill (ultimate parent).
- `CompanyCard.jsx` — `company.logo_url` (graceful fallback on 404), name, sector,
  exchange, and the share price as a BIG number with the `as_of` date small underneath.
- `PriceChart.jsx` — Recharts `LineChart` fed by `chart[]` (~250 `{date, price}` points):
  no dots, tooltip on, auto y-axis domain, sparse x ticks, light-themed axes/tooltip,
  line colored green if last ≥ first else red.
- `DcaCalculator.jsx` — slider $25–$1000 step $25, initial $100. On change, recompute via
  `../utils/dca.js` from `monthly_buys` + `share_price` props — NEVER call the network.
  Profit green when ≥ 0, red otherwise. Always render the disclaimer note in small text.

## Non-stock outcomes (locked product decisions)

- `PrivateScreen.jsx` — 🔒 "Privately held by {ultimate_parent}" + chain + summary. No stock data.
- `ForeignScreen.jsx` — 🌍 "{ultimate_parent} is not US-listed ({country})" + chain +
  summary. No stock data, even if a US ADR exists (deliberate).
- `RetryScreen.jsx` — friendly retry message + "Scan again" button. Also reused for
  `ERROR` and `TICKER_NOT_VERIFIED` (shows the response's `message`).
