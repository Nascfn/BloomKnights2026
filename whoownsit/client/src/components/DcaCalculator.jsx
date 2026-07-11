import { useState } from "react";
import { dcaResult } from "../utils/dca.js";

function clampToSlider(value) {
  if (!Number.isFinite(value)) return 100;
  return Math.min(200, Math.max(1, value));
}

function money(n) {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function DcaCalculator({ monthlyBuys, sharePrice, initialMonthly = 100 }) {
  const [monthly, setMonthly] = useState(() => clampToSlider(initialMonthly));

  // Recomputed on every slider tick, entirely client-side — never calls the network.
  const dca = dcaResult(monthly, monthlyBuys, sharePrice);
  const gained = dca.profit >= 0;

  return (
    <div className="dca">
      <h2>What if you'd invested instead?</h2>

      <div className="dca-slider-row">
        <input
          type="range"
          min="1"
          max="200"
          step="1"
          value={monthly}
          onChange={(event) => setMonthly(Number(event.target.value))}
          aria-label="Monthly investment in dollars"
        />
        <p className="dca-amount">
          ${monthly}
          <span>/mo</span>
        </p>
      </div>

      <dl className="dca-grid">
        <div>
          <dt>Invested ({dca.months} mo)</dt>
          <dd>${money(dca.total_invested)}</dd>
        </div>
        <div>
          <dt>Shares owned</dt>
          <dd>{dca.shares_owned}</dd>
        </div>
        <div>
          <dt>Value today</dt>
          <dd>${money(dca.current_value)}</dd>
        </div>
        <div>
          <dt>Profit</dt>
          <dd className={gained ? "gain" : "loss"}>
            {gained ? "+" : "−"}${money(Math.abs(dca.profit))} ({gained ? "+" : ""}
            {dca.return_pct}%)
          </dd>
        </div>
      </dl>

      <p className="disclaimer">{dca.note}</p>
    </div>
  );
}

export default DcaCalculator;
