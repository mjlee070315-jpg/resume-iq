import type { CategoryScores as CategoryScoresType } from "../types";

function barColor(score: number) {
  if (score >= 85) return "bg-emerald-500";
  if (score >= 70) return "bg-yellow-500";
  return "bg-red-500";
}

export default function CategoryScores({ scores }: { scores: CategoryScoresType }) {
  const entries = Object.entries(scores) as [string, number][];

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-300 mb-4">Category Scores</h3>
      <div className="flex flex-col gap-3">
        {entries.map(([label, value]) => (
          <div key={label}>
            <div className="flex justify-between text-xs text-neutral-400 mb-1">
              <span>{label}</span>
              <span>{Math.round(value)}</span>
            </div>
            <div className="h-2 w-full rounded-full bg-neutral-800">
              <div
                className={`h-2 rounded-full ${barColor(value)}`}
                style={{ width: `${Math.min(value, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
