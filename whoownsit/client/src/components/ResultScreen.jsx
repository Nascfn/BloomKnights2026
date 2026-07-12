import { useMemo, useState } from "react";
import PriceChart from "./PriceChart";
import { dcaResult } from "../utils/dca.js";

const TABS = ["OVERVIEW", "NEWS", "CHAIN", "INVEST"];

// ── Placeholder data (no backend source — illustrative, matches the design) ──
const SAMPLE_STATS = [
  { label: "MKT CAP", value: "$235.8B" },
  { label: "P/E", value: "23.4×" },
  { label: "DIV YIELD", value: "3.1%" },
  { label: "52W HIGH", value: "$182.10" },
  { label: "52W LOW", value: "$154.30" },
  { label: "AVG VOL", value: "5.2M" },
];

const SAMPLE_NEWS = [
  {
    id: 1,
    sentiment: "positive",
    source: "Bloomberg",
    time: "2h ago",
    headline: "PepsiCo Raises Annual Guidance After Strong Q2 Beat",
    summary:
      "Q2 EPS of $2.28 topped analyst expectations of $2.15, driven by pricing power in North America and resilient snack demand in international markets.",
  },
  {
    id: 2,
    sentiment: "positive",
    source: "Reuters",
    time: "8h ago",
    headline: "PepsiCo Expands Zero-Sugar Portfolio Across 40 New Markets",
    summary:
      "CEO Ramon Laguarta confirmed aggressive global rollout of Pepsi Zero Sugar and Lipton Zero as health-conscious consumer demand accelerates in developing markets.",
  },
  {
    id: 3,
    sentiment: "neutral",
    source: "WSJ",
    time: "1d ago",
    headline: "Elliott Management Builds $1.5B Stake in PepsiCo",
    summary:
      "Activist investor Elliott Management has accumulated a significant position and is reportedly pushing for operational efficiency improvements and portfolio streamlining.",
  },
  {
    id: 4,
    sentiment: "negative",
    source: "FT",
    time: "2d ago",
    headline: "Tropicana Revenue Falls 4% Amid Orange Price Surge",
    summary:
      "Florida crop damage has pushed orange concentrate prices to multi-decade highs, squeezing Tropicana Brands Group margins for the third consecutive quarter.",
  },
];

const SAMPLE_HOLDERS = [
  { name: "Vanguard Group", pct: "8.4%" },
  { name: "BlackRock Inc.", pct: "7.1%" },
  { name: "State Street", pct: "4.2%" },
  { name: "Other Inst.", pct: "51.7%" },
];

// ── Icons ──
const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
};
const PackageIcon = () => (
  <svg {...iconProps}>
    <path d="M12 3 3 7.5v9L12 21l9-4.5v-9L12 3Z" />
    <path d="M3 7.5 12 12l9-4.5M12 12v9" />
  </svg>
);
const LayersIcon = () => (
  <svg {...iconProps}>
    <path d="m12 3 9 5-9 5-9-5 9-5Z" />
    <path d="m3 13 9 5 9-5" />
  </svg>
);
const BuildingIcon = () => (
  <svg {...iconProps}>
    <rect x="5" y="3" width="14" height="18" rx="1" />
    <path d="M9 7h.01M13 7h.01M9 11h.01M13 11h.01M9 15h2" />
  </svg>
);
const UsersIcon = () => (
  <svg {...iconProps}>
    <circle cx="9" cy="8" r="3" />
    <path d="M15 8a3 3 0 0 1 0 6M3 20c0-2.8 2.7-5 6-5s6 2.2 6 5M17 20c0-1.6-.5-3-1.5-4" />
  </svg>
);

function ProductThumb({ photoUrl, company }) {
  const [failed, setFailed] = useState(false);
  const src = !failed ? photoUrl || company.logo_url : null;
  if (src) {
    return (
      <div className="scan-thumb">
        <img src={src} alt="" onError={() => setFailed(true)} />
      </div>
    );
  }
  return (
    <div className="scan-thumb scan-thumb-fallback" aria-hidden="true">
      {company.company_name.charAt(0)}
    </div>
  );
}

function OverviewTab({ result }) {
  const summary = result.summary || result.company.description;
  return (
    <div className="tab-stack">
      <div className="panel">
        <div className="panel-label">Company summary</div>
        <p className="panel-body">{summary}</p>
        <div className="panel-divider" />
        <div className="stat-grid stat-grid-3">
          {SAMPLE_STATS.map(({ label, value }) => (
            <div key={label} className="stat">
              <div className="stat-label">{label}</div>
              <div className="stat-value">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <span className="panel-label">1-year price history</span>
          <span className="panel-ticker">{result.ticker}</span>
        </div>
        <PriceChart chart={result.chart} height={220} />
      </div>
    </div>
  );
}

function NewsTab() {
  return (
    <div className="tab-stack">
      <div className="tab-heading">
        <span className="panel-label">Recent major news</span>
        <span className="sample-tag">Illustrative sample</span>
      </div>
      {SAMPLE_NEWS.map((item) => (
        <article key={item.id} className="news-card">
          <div className="news-top">
            <span className={`sentiment sentiment-${item.sentiment}`}>
              {item.sentiment.toUpperCase()}
            </span>
            <span className="news-source">
              <strong>{item.source}</strong> {item.time}
            </span>
          </div>
          <h3 className="news-headline">{item.headline}</h3>
          <p className="news-summary">{item.summary}</p>
        </article>
      ))}
    </div>
  );
}

function ChainTab({ result }) {
  const chain = result.ownership_chain;
  const nodes = chain.map((name, i) => {
    const isFirst = i === 0;
    const isLast = i === chain.length - 1;
    return {
      key: `${name}-${i}`,
      tag: isFirst ? "Product" : isLast ? "Parent Company" : "Subsidiary",
      name,
      detail: isFirst
        ? result.product_name
        : isLast
          ? `${result.company.exchange}: ${result.ticker}`
          : "Subsidiary in the ownership chain",
      meta: isLast ? result.company.sector : null,
      Icon: isFirst ? PackageIcon : isLast ? BuildingIcon : LayersIcon,
      tone: isFirst ? "tone-a" : isLast ? "tone-c" : "tone-b",
    };
  });

  return (
    <div className="tab-stack">
      <span className="panel-label">Ownership chain</span>
      <div className="chain">
        {nodes.map((node) => (
          <div key={node.key} className="chain-row">
            <div className={`chain-icon ${node.tone}`}>
              <node.Icon />
            </div>
            <div className="chain-card">
              <div className="chain-tag">{node.tag.toUpperCase()}</div>
              <div className="chain-name">{node.name}</div>
              <div className="chain-detail">{node.detail}</div>
              {node.meta && <div className="chain-meta">{node.meta}</div>}
            </div>
          </div>
        ))}

        <div className="chain-row">
          <div className="chain-icon tone-d">
            <UsersIcon />
          </div>
          <div className="chain-card">
            <div className="chain-tag">PUBLIC SHAREHOLDERS</div>
            <div className="chain-name">Institutional + Retail Holders</div>
            <div className="chain-detail">Illustrative sample · not live data</div>
            <div className="chain-holders">
              {SAMPLE_HOLDERS.map((h) => (
                <div key={h.name} className="chain-holder">
                  <span>{h.name}</span>
                  <span className="chain-holder-pct">{h.pct}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvestTab({ result }) {
  const [monthly, setMonthly] = useState(() =>
    Math.min(200, Math.max(1, result.dca?.monthly_amount ?? 100)),
  );
  const dca = useMemo(
    () => dcaResult(monthly, result.monthly_buys, result.share_price),
    [monthly, result.monthly_buys, result.share_price],
  );
  const gained = dca.profit >= 0;
  const money = (n) =>
    n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="tab-stack">
      <span className="panel-label">$/month calculator · {result.ticker}</span>

      <div className="panel">
        <label className="stat-label" htmlFor="invest-amount">
          Monthly investment
        </label>
        <div className="invest-amount-row">
          <span className="invest-dollar">$</span>
          <input
            id="invest-amount"
            type="number"
            min="1"
            max="200"
            value={monthly}
            onChange={(e) => setMonthly(Math.min(200, Math.max(1, Number(e.target.value) || 1)))}
            className="invest-input"
          />
          <span className="invest-per">/mo</span>
        </div>
        <div className="invest-quick">
          {[25, 50, 100, 200].map((v) => (
            <button
              key={v}
              type="button"
              className={`invest-chip${monthly === v ? " is-active" : ""}`}
              onClick={() => setMonthly(v)}
            >
              ${v}
            </button>
          ))}
        </div>
        <input
          type="range"
          min="1"
          max="200"
          step="1"
          value={monthly}
          onChange={(e) => setMonthly(Number(e.target.value))}
          aria-label="Monthly investment in dollars"
          className="invest-slider"
        />
        <p className="invest-hint">
          ${monthly}/mo on the first trading day of each of the last {dca.months} months.
        </p>
      </div>

      <div className="panel panel-result">
        <div className="panel-label panel-label-accent">Your result today</div>
        <div className="stat-grid stat-grid-2">
          <div className="stat">
            <div className="stat-label">Invested ({dca.months} mo)</div>
            <div className="stat-value stat-value-lg">${money(dca.total_invested)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Shares purchased</div>
            <div className="stat-value stat-value-lg">{dca.shares_owned}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Current value</div>
            <div className="stat-value stat-value-lg accent">${money(dca.current_value)}</div>
          </div>
          <div className="stat">
            <div className="stat-label">Gain / loss</div>
            <div className={`stat-value stat-value-lg ${gained ? "gain" : "loss"}`}>
              {gained ? "+" : "−"}${money(Math.abs(dca.profit))} ({gained ? "+" : ""}
              {dca.return_pct}%)
            </div>
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-label">1-year price history</div>
        <PriceChart chart={result.chart} height={150} showAxes={false} />
      </div>

      <p className="disclaimer">{dca.note}</p>
    </div>
  );
}

function ResultScreen({ result, onReset, photoUrl }) {
  const [tab, setTab] = useState("OVERVIEW");
  const { company } = result;

  const prev = result.chart?.[result.chart.length - 2]?.price ?? result.share_price;
  const change = result.share_price - prev;
  const pct = prev ? (change / prev) * 100 : 0;
  const up = change >= 0;

  return (
    <div className="scanner">
      <div className="scan-summary">
        <div className="scan-product">
          <ProductThumb photoUrl={photoUrl} company={company} />
          <div className="scan-product-info">
            <div className="scan-badge">✓ Scanned</div>
            <div className="scan-product-name">{result.product_name}</div>
            <div className="scan-product-detail">{result.brand}</div>
            {result.licensing_note && (
              <div className="scan-product-note">{result.licensing_note}</div>
            )}
          </div>
          <button type="button" className="scan-rescan" onClick={onReset}>
            Rescan
          </button>
        </div>

        <div className="company-banner">
          <div className="company-banner-top">
            <div>
              <div className="banner-eyebrow">Parent company</div>
              <div className="banner-company">{company.company_name}</div>
              <div className="banner-meta">
                {company.exchange}: {result.ticker} · {company.sector}
              </div>
            </div>
            <div className="banner-price">
              <div className="banner-price-big">${result.share_price.toFixed(2)}</div>
              <div className={`banner-change ${up ? "gain" : "loss"}`}>
                {up ? "↗" : "↘"} {up ? "+" : ""}
                {change.toFixed(2)} ({pct.toFixed(2)}%)
              </div>
            </div>
          </div>
          <div className="banner-divider" />
          <div className="stat-grid stat-grid-3">
            {SAMPLE_STATS.slice(0, 3).map(({ label, value }) => (
              <div key={label} className="stat">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="scan-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            className={`scan-tab${tab === t ? " is-active" : ""}`}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      <div className="scan-tab-content">
        {tab === "OVERVIEW" && <OverviewTab result={result} />}
        {tab === "NEWS" && <NewsTab />}
        {tab === "CHAIN" && <ChainTab result={result} />}
        {tab === "INVEST" && <InvestTab result={result} />}
      </div>
    </div>
  );
}

export default ResultScreen;
