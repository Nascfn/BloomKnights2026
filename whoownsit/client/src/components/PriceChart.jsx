import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

function PriceChart({ chart }) {
  if (!chart?.length) return null;

  const trendColor = chart[chart.length - 1].price >= chart[0].price ? "var(--gain)" : "var(--loss)";

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chart} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey="date"
          tickFormatter={formatTick}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
          minTickGap={40}
        />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          axisLine={{ stroke: "var(--border)" }}
          tickLine={{ stroke: "var(--border)" }}
          tickFormatter={formatPrice}
          width={64}
        />
        <Tooltip
          labelFormatter={formatTooltipLabel}
          formatter={(price) => [formatPrice(price), "Price"]}
          contentStyle={{
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            color: "var(--foreground)",
          }}
          labelStyle={{ color: "var(--muted-foreground)", fontWeight: 600 }}
          itemStyle={{ color: "var(--foreground)" }}
        />
        <Line type="monotone" dataKey="price" stroke={trendColor} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export default PriceChart;
