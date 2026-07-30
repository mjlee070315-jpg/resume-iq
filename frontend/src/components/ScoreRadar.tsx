import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { CategoryScores } from "../types";

export default function ScoreRadar({ scores }: { scores: CategoryScores }) {
  const data = Object.entries(scores).map(([category, value]) => ({
    category,
    value,
  }));

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-300 mb-4">Radar Overview</h3>
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="#27272a" />
            <PolarAngleAxis
              dataKey="category"
              tick={{ fill: "#a3a3a3", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: "#525252", fontSize: 10 }}
            />
            <Radar
              dataKey="value"
              stroke="#c084fc"
              fill="#c084fc"
              fillOpacity={0.35}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
