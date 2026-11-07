import { useState } from "react";
import { analyzeCustomTarget, type CustomTargetResult } from "../api";
import type { AnalysisResult } from "../types";
import TargetPanel from "./TargetPanel";

export default function CustomTargetPanel({ analysis }: { analysis: AnalysisResult }) {
  const [name, setName] = useState("");
  const [type, setType] = useState<"company" | "school">("company");
  const [jobTitle, setJobTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CustomTargetResult | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setResult(
        await analyzeCustomTarget({
          name: name.trim(),
          type,
          jobTitle: jobTitle.trim() || undefined,
          resumeText: analysis.resumeText ?? "",
          verbHeatmap: analysis.verbHeatmap,
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h3 className="card-title">Analyze against any company or school</h3>
      <p className="card-sub">
        Type any name. AI drafts what that organization looks for, then the rule-based matcher scores your resume
        against it and AI reviews your background fit.
      </p>
      <div className="flex flex-wrap gap-2">
        <select value={type} onChange={(e) => setType(e.target.value as "company" | "school")} className="input">
          <option value="company">Company</option>
          <option value="school">School</option>
        </select>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={type === "company" ? "e.g. Palantir" : "e.g. Georgia Tech"}
          className="input min-w-48 flex-1"
        />
        <input
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder={type === "company" ? "Role (optional)" : "Program (optional)"}
          className="input min-w-40 flex-1"
        />
        <button className="btn" disabled={!name.trim() || loading} onClick={run}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

      {result && (
        <div className="mt-5 flex flex-col gap-4">
          <TargetPanel match={result.targetMatch} />
          <div className="rounded-xl border border-neutral-800 p-4">
            <p className="label">AI background review</p>
            <p className="text-sm text-neutral-200 mb-3">{result.insight.summary}</p>
            <div className="grid gap-4 md:grid-cols-3 text-sm">
              {(
                [
                  ["Strengths", result.insight.strengths, "text-emerald-400"],
                  ["Gaps", result.insight.gaps, "text-amber-400"],
                  ["Next steps", result.insight.nextSteps, "text-violet-400"],
                ] as const
              ).map(([title, items, color]) => (
                <div key={title}>
                  <p className={`text-xs font-semibold mb-1 ${color}`}>{title}</p>
                  <ul className="space-y-1 text-neutral-300">
                    {items.map((i) => (
                      <li key={i}>• {i}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
