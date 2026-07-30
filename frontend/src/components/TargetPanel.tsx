import type { TargetMatch } from "../types";

function fitColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-yellow-400";
  return "text-red-400";
}

export default function TargetPanel({ match }: { match: TargetMatch }) {
  return (
    <div className="rounded-2xl border border-violet-800/50 bg-violet-950/20 p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-sm font-semibold text-neutral-200">
          맞춤 분석 — {match.target.label}
        </h3>
        <span className={`text-lg font-bold ${fitColor(match.fitScore)}`}>
          {match.fitScore}/100
        </span>
      </div>
      <p className="text-xs text-neutral-500 mb-4">
        키워드 매칭(60%) + 경험 강조 정렬도(40%)로 계산된 rule-based fit score
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-neutral-500 mb-2">
            매칭된 키워드 ({match.keywords.matched.length}/
            {match.keywords.matched.length + match.keywords.missing.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {match.keywords.matched.map((k) => (
              <span
                key={k}
                className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs text-emerald-300"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs text-neutral-500 mb-2">누락된 키워드</p>
          <div className="flex flex-wrap gap-1.5">
            {match.keywords.missing.map((k) => (
              <span
                key={k}
                className="rounded-full bg-red-500/15 px-2.5 py-0.5 text-xs text-red-300"
              >
                {k}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-xs text-neutral-500 mb-2">
          경험 강조 정렬도 — {match.emphasis.alignmentScore}/100
          {match.emphasis.weakestCategory && (
            <span className="text-amber-400">
              {" "}
              (가장 부족: {match.emphasis.weakestCategory})
            </span>
          )}
        </p>
        <div className="flex flex-col gap-1.5">
          {Object.keys(match.emphasis.target).map((category) => {
            const actual = Math.round((match.emphasis.actual[category] ?? 0) * 100);
            const target = Math.round((match.emphasis.target[category] ?? 0) * 100);
            return (
              <div key={category} className="flex items-center gap-2 text-xs">
                <span className="w-28 text-neutral-400">{category}</span>
                <div className="relative h-2 flex-1 rounded-full bg-neutral-800">
                  <div
                    className="absolute h-2 rounded-full bg-violet-500"
                    style={{ width: `${actual}%` }}
                  />
                  <div
                    className="absolute h-2 w-0.5 bg-neutral-300"
                    style={{ left: `${target}%` }}
                    title={`목표 비중 ${target}%`}
                  />
                </div>
                <span className="w-10 text-right text-neutral-500">{actual}%</span>
              </div>
            );
          })}
        </div>
        <p className="mt-1 text-[11px] text-neutral-600">
          보라색 막대 = 현재 이력서 비중, 흰색 선 = {match.target.label} 권장 비중
        </p>
      </div>

      <div>
        <p className="text-xs text-neutral-500 mb-2">추천 사항</p>
        <ul className="flex flex-col gap-1.5">
          {match.recommendations.map((r, i) => (
            <li key={i} className="text-sm text-neutral-300">
              • {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
