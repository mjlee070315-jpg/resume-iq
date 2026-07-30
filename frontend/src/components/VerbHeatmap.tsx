import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const COLORS: Record<string, string> = {
  Leadership: "#c084fc",
  Technical: "#60a5fa",
  Communication: "#34d399",
  Management: "#fbbf24",
};

export default function VerbHeatmap({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([category, count]) => ({
    category,
    count,
  }));

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-300 mb-4">
        Action Verb Heatmap
      </h3>
      <div style={{ width: "100%", height: 220 }}>
        <ResponsiveContainer>
          <BarChart data={chartData} layout="vertical" margin={{ left: 10 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="category"
              type="category"
              width={100}
              tick={{ fill: "#a3a3a3", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#18181b",
                border: "1px solid #27272a",
                fontSize: 12,
              }}
            />
            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
              {chartData.map((d) => (
                <Cell key={d.category} fill={COLORS[d.category] ?? "#a3a3a3"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
