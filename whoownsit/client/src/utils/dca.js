const DCA_NOTE =
  "Split-adjusted prices; dividends not reinvested. Past performance is not predictive.";

function round2(n) {
  return Math.round(n * 100) / 100;
}

function round4(n) {
  return Math.round(n * 10000) / 10000;
}

// daily: ascending array of { date, price }. Returns the first trading day of
// each of the most recent 12 calendar months (including the current month).
export function firstTradingDays(daily) {
  const firstByMonth = new Map();
  for (const point of daily) {
    const monthKey = point.date.slice(0, 7);
    if (!firstByMonth.has(monthKey)) {
      firstByMonth.set(monthKey, point);
    }
  }
  return [...firstByMonth.values()].slice(-12);
}

// buys: array of { date, price } from firstTradingDays.
export function dcaResult(monthly, buys, latestPrice) {
  const shares = buys.reduce((sum, buy) => sum + monthly / buy.price, 0);
  const totalInvested = monthly * buys.length;
  const currentValue = shares * latestPrice;
  const profit = currentValue - totalInvested;
  const returnPct = (profit / totalInvested) * 100;

  return {
    monthly_amount: monthly,
    months: buys.length,
    total_invested: round2(totalInvested),
    shares_owned: round4(shares),
    current_value: round2(currentValue),
    profit: round2(profit),
    return_pct: round2(returnPct),
    note: DCA_NOTE,
  };
}
