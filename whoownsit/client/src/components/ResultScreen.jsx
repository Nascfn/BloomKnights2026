import { useMemo, useState } from "react";
import PriceChart from "./PriceChart";
import { dcaResult } from "../utils/dca.js";

// ── Formatting helpers for real FMP data ──
function bigMoney(n) {
  if (n == null) return null;
  if (n >= 1e12) return `$${(n / 1e12).toFixed(1)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(1)}M`;
  return `$${Math.round(n).toLocaleString()}`;
}

function bigCount(n) {
  if (n == null) return null;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return `${n}`;
}

function timeAgo(published) {
  const t = Date.parse((published || "").replace(" ", "T"));
  if (Number.isNaN(t)) return "";
  const mins = Math.max(1, Math.round((Date.now() - t) / 60000));
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.round(mins / 60)}h ago`;
  return `${Math.round(mins / (60 * 24))}d ago`;
}

// Real stat tiles from the company profile; tiles with no data are dropped.
function companyStats(company) {
  return [
    { label: "MKT CAP", value: bigMoney(company.market_cap) },
    { label: "52W RANGE", value: company.range_52w ? `$${company.range_52w}` : null },
    { label: "AVG VOL", value: bigCount(company.average_volume) },
    { label: "BETA", value: company.beta != null ? company.beta.toFixed(2) : null },
    { label: "DIV / SHR", value: company.last_dividend != null ? `$${company.last_dividend.toFixed(2)}` : null },
    { label: "SECTOR", value: company.sector },
  ].filter((s) => s.value);
}

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
          {companyStats(result.company).map(({ label, value }) => (
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

function NewsTab({ news, companyName }) {
  if (!news?.length) {
    return (
      <div className="tab-stack">
        <span className="panel-label">Recent news</span>
        <div className="panel">
          <p className="panel-body">No recent headlines available for {companyName}.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tab-stack">
      <div className="tab-heading">
        <span className="panel-label">Recent news</span>
        <span className="sample-tag">Live · Financial Modeling Prep</span>
      </div>
      {news.map((item) => (
        <article key={item.url || item.headline} className="news-card">
          <div className="news-top">
            <span className="news-source">
              <strong>{item.source}</strong> {timeAgo(item.published)}
            </span>
          </div>
          <h3 className="news-headline">
            {item.url ? (
              <a href={item.url} target="_blank" rel="noopener noreferrer">
                {item.headline}
              </a>
            ) : (
              item.headline
            )}
          </h3>
          <p className="news-summary">{item.summary}…</p>
        </article>
      ))}
    </div>
  );
}

function SegmentsTab({ revenueSegments, companyName }) {
  const { fiscal_year, total_revenue, segments } = revenueSegments;
  return (
    <div className="tab-stack">
      <div className="tab-heading">
        <span className="panel-label">
          Revenue by segment · FY{fiscal_year}
        </span>
        <span className="sample-tag">Live · Financial Modeling Prep</span>
      </div>
      <div className="panel">
        <p className="panel-body">
          {companyName} reported {bigMoney(total_revenue)} in FY{fiscal_year} revenue. Here's
          which parts of the business it came from:
        </p>
        <div className="panel-divider" />
        <div className="segments">
          {segments.map((seg, i) => (
            <div key={seg.name} className="segment">
              <div className="segment-top">
                <span className="segment-name">{seg.name}</span>
                <span className="segment-figures">
                  {bigMoney(seg.revenue)} <strong>({seg.pct}%)</strong>
                </span>
              </div>
              <div className="segment-track">
                <div
                  className={`segment-bar${i === 0 ? " segment-bar-top" : ""}`}
                  style={{ width: `${Math.max(seg.pct, 2)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
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

function CompanyLogo({ company }) {
  const [failed, setFailed] = useState(false);
  if (company.logo_url && !failed) {
    return (
      <img
        src={company.logo_url}
        alt={`${company.company_name} logo`}
        className="banner-logo"
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className="banner-logo banner-logo-fallback" aria-hidden="true">
      {company.company_name.charAt(0)}
    </div>
  );
}

function ResultScreen({ result, onReset, photoUrl }) {
  const [tab, setTab] = useState("OVERVIEW");
  const { company } = result;

  const tabs = ["OVERVIEW", "NEWS", "CHAIN", ...(result.revenue_segments ? ["SEGMENTS"] : []), "INVEST"];

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
            <div className="banner-identity">
              <CompanyLogo company={company} />
              <div>
                <div className="banner-eyebrow">Parent company</div>
                <div className="banner-company">{company.company_name}</div>
                <div className="banner-meta">
                  {company.exchange}: {result.ticker} · {company.sector}
                </div>
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
            {companyStats(company).slice(0, 3).map(({ label, value }) => (
              <div key={label} className="stat">
                <div className="stat-label">{label}</div>
                <div className="stat-value">{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="scan-tabs" role="tablist">
        {tabs.map((t) => (
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
        {tab === "NEWS" && <NewsTab news={result.news} companyName={company.company_name} />}
        {tab === "CHAIN" && <ChainTab result={result} />}
        {tab === "SEGMENTS" && result.revenue_segments && (
          <SegmentsTab revenueSegments={result.revenue_segments} companyName={company.company_name} />
        )}
        {tab === "INVEST" && <InvestTab result={result} />}
      </div>
    </div>
  );
}

export default ResultScreen;
