import type { CustomJobMatch } from "../types";

function fitColor(score: number) {
  if (score >= 70) return "text-emerald-400";
  if (score >= 45) return "text-yellow-400";
  return "text-red-400";
}

export default function CustomJobPanel({ match }: { match: CustomJobMatch }) {
  if (match.note) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h3 className="text-sm font-semibold text-neutral-300 mb-2">붙여넣은 공고 매칭</h3>
        <p className="text-sm text-neutral-500">{match.note}</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="flex items-baseline justify-between mb-1">
        <h3 className="text-sm font-semibold text-neutral-200">붙여넣은 공고 매칭</h3>
        <span className={`text-lg font-bold ${fitColor(match.fitScore)}`}>
          {match.fitScore}/100
        </span>
      </div>
      <p className="text-xs text-neutral-500 mb-4">
        공고 원문에서 {match.requiredKeywords.length}개의 스킬/키워드를 자동으로 감지해 이력서와
        매칭했습니다 (고정 프리셋이 아닌 동적 추출).
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-neutral-500 mb-2">
            매칭됨 ({match.matched.length}/{match.requiredKeywords.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {match.matched.map((k) => (
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
          <p className="text-xs text-neutral-500 mb-2">누락</p>
          <div className="flex flex-wrap gap-1.5">
            {match.missing.map((k) => (
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
    </div>
  );
}
