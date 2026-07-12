import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const OLIVE = "#95b355";
const GRID = "rgba(149, 179, 85, 0.15)";
const AXIS = "#5a7040";

function formatTick(date) {
  return new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTooltipLabel(date) {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ChartTip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="chart-tip">
      <div className="chart-tip-label">{formatTooltipLabel(label)}</div>
      <div className="chart-tip-value">${payload[0].value.toFixed(2)}</div>
    </div>
  );
}

function PriceChart({ chart, height = 200, showAxes = true, entryDate }) {
  if (!chart?.length) return null;

  const prices = chart.map((p) => p.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={chart} margin={{ top: 6, right: 6, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="priceFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OLIVE} stopOpacity={0.25} />
            <stop offset="100%" stopColor={OLIVE} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="2 6" stroke={GRID} />
        <XAxis
          dataKey="date"
          hide={!showAxes}
          tickFormatter={formatTick}
          tick={{ fill: AXIS, fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          minTickGap={48}
        />
        <YAxis
          hide={!showAxes}
          domain={[min - 4, max + 4]}
          tick={{ fill: AXIS, fontSize: 10, fontFamily: "JetBrains Mono" }}
          axisLine={false}
          tickLine={false}
          width={46}
          tickFormatter={(v) => `$${v.toFixed(0)}`}
        />
        <Tooltip content={<ChartTip />} />
        {entryDate && (
          <ReferenceLine x={entryDate} stroke="#d5b7c6" strokeDasharray="3 4" strokeWidth={1.5} />
        )}
        <Area
          type="monotone"
          dataKey="price"
          stroke={OLIVE}
          strokeWidth={2}
          fill="url(#priceFill)"
          dot={false}
          activeDot={{ r: 3, fill: OLIVE, strokeWidth: 0 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export default PriceChart;
