import { useState } from "react";
import { checkGrammarAi, type GrammarCheckResult } from "../api";
import type { AnalysisResult } from "../types";

export default function GrammarPanel({
  resumeText,
  ruleBasedGrammar,
}: {
  resumeText: string;
  ruleBasedGrammar: AnalysisResult["grammar"];
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<GrammarCheckResult | null>(null);

  async function handleCheck() {
    setLoading(true);
    setError(null);
    try {
      const res = await checkGrammarAi({ text: resumeText, ruleBasedGrammar });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Grammar check failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-sm font-semibold text-neutral-300">
          Grammar — rule-based: {ruleBasedGrammar.score}/100
        </h3>
        {!result && (
          <button
            onClick={handleCheck}
            disabled={loading}
            className="rounded-md bg-violet-600/20 px-3 py-1 text-xs font-medium text-violet-300 hover:bg-violet-600/30 disabled:opacity-40"
          >
            {loading ? "AI가 검사 중..." : "AI로 문법 검사"}
          </button>
        )}
      </div>
      <p className="text-xs text-neutral-500 mb-3">
        규칙 기반 검사는 대문자/띄어쓰기/시제 혼용만 잡아냅니다. AI 검사는 주어-동사 일치,
        관사/전치사, 병렬 구조 등 정규식으로 잡기 어려운 문제를 추가로 찾아줍니다.
      </p>

      {error && (
        <p className="text-xs text-red-400">
          {error.includes("OPENAI_API_KEY")
            ? "AI 문법 검사를 사용하려면 backend/.env에 OPENAI_API_KEY를 설정하세요."
            : error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-neutral-300">{result.overallAssessment}</p>
          {result.issues.length === 0 ? (
            <p className="text-sm text-emerald-400">
              AI가 추가로 발견한 문법 이슈가 없습니다.
            </p>
          ) : (
            result.issues.map((issue, i) => (
              <div key={i} className="rounded-lg border border-neutral-800 p-3">
                <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wide">
                  {issue.issueType}
                </p>
                <p className="text-sm text-red-300 line-through decoration-red-500/50">
                  {issue.original}
                </p>
                <p className="text-sm text-emerald-300">{issue.corrected}</p>
                <p className="mt-1 text-xs text-neutral-500">{issue.explanation}</p>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
