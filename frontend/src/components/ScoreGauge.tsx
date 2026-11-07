interface Props {
  score: number;
}

function colorFor(score: number) {
  if (score >= 85) return "#4ade80";
  if (score >= 70) return "#facc15";
  return "#f87171";
}

export default function ScoreGauge({ score }: Props) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke="var(--color-neutral-800)"
          strokeWidth="14"
          fill="none"
        />
        <circle
          cx="90"
          cy="90"
          r={radius}
          stroke={colorFor(score)}
          strokeWidth="14"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 90 90)"
          style={{ transition: "stroke-dashoffset 0.6s ease" }}
        />
        <text
          x="90"
          y="98"
          textAnchor="middle"
          fontSize="36"
          fontWeight="600"
          fill="var(--color-neutral-100)"
        >
          {Math.round(score)}
        </text>
      </svg>
      <p className="mt-1 text-sm text-neutral-400">Overall Score</p>
    </div>
  );
}
