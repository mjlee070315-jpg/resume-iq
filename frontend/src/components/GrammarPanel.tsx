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
            {loading ? "AI is checking…" : "Check grammar with AI"}
          </button>
        )}
      </div>
      <p className="text-xs text-neutral-500 mb-3">
        The rule-based check only catches capitalization, spacing, and tense mixing. The AI check
        adds subject-verb agreement, articles/prepositions, parallelism, and awkward phrasing.
      </p>

      {error && (
        <p className="text-xs text-red-400">
          {error.includes("API key")
            ? "AI grammar check needs your own API key. Click \"AI key\" at the top of the page to add one."
            : error}
        </p>
      )}

      {result && (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-neutral-300">{result.overallAssessment}</p>
          {result.issues.length === 0 ? (
            <p className="text-sm text-emerald-400">
              The AI found no additional grammar issues.
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
