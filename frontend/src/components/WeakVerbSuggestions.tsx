import { useState } from "react";
import type { AnalysisResult } from "../types";
import { rewriteBulletAi, type RewriteResult } from "../api";

type Flagged = AnalysisResult["weakVerbs"]["flagged"][number];

function RewriteCard({ item }: { item: Flagged }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RewriteResult | null>(null);

  async function handleRewrite() {
    setLoading(true);
    setError(null);
    try {
      const res = await rewriteBulletAi({
        sentence: item.sentence,
        flaggedTerm: item.flaggedTerm,
        suggestions: item.suggestions,
      });
      setResult(res);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Rewrite failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border border-neutral-800 p-3">
      <p className="text-sm text-neutral-300">"{item.sentence}"</p>
      <p className="mt-1 text-xs text-neutral-500">
        <span className="text-amber-400">{item.flaggedTerm}</span> →{" "}
        {item.suggestions.join(", ")}
      </p>

      {!result && (
        <button
          onClick={handleRewrite}
          disabled={loading}
          className="mt-2 rounded-md bg-violet-600/20 px-3 py-1 text-xs font-medium text-violet-300 hover:bg-violet-600/30 disabled:opacity-40"
        >
          {loading ? "Rewriting…" : "Rewrite with AI"}
        </button>
      )}

      {error && (
        <p className="mt-2 text-xs text-red-400">
          {error.includes("OPENAI_API_KEY")
            ? "AI rewrite is unavailable. Set OPENAI_API_KEY in backend/.env to enable it."
            : error}
        </p>
      )}

      {result && (
        <div className="mt-2 rounded-md bg-emerald-500/10 p-2">
          <p className="text-sm text-emerald-300">{result.rewritten}</p>
          <p className="mt-1 text-xs text-neutral-500">{result.rationale}</p>
          {result.alternatives.length > 0 && (
            <ul className="mt-1 list-inside list-disc text-xs text-neutral-500">
              {result.alternatives.map((a, i) => (
                <li key={i}>{a}</li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

export default function WeakVerbSuggestions({ flagged }: { flagged: Flagged[] }) {
  if (flagged.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h3 className="text-sm font-semibold text-neutral-300 mb-2">
          Sentence-level Suggestions
        </h3>
        <p className="text-sm text-emerald-400">No weak verbs detected.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-300 mb-3">
        Sentence-level Suggestions
      </h3>
      <div className="flex flex-col gap-3">
        {flagged.map((f, i) => (
          <RewriteCard key={i} item={f} />
        ))}
      </div>
    </div>
  );
}
