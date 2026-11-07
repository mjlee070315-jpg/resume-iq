import { useEffect, useState } from "react";
import { fetchOutlook, fetchTargets, type OutlookResult } from "../api";
import type { AnalysisResult, TargetInfo } from "../types";

const BAND_COLOR: Record<string, string> = {
  "Long shot": "text-red-400",
  Reach: "text-amber-400",
  Competitive: "text-yellow-400",
  Target: "text-emerald-400",
  Strong: "text-emerald-400",
};

function List({ title, items, color }: { title: string; items: string[]; color: string }) {
  if (!items.length) return null;
  return (
    <div>
      <p className={`mb-1 text-xs font-semibold ${color}`}>{title}</p>
      <ul className="space-y-1 text-sm text-neutral-300">
        {items.map((i) => (
          <li key={i}>• {i}</li>
        ))}
      </ul>
    </div>
  );
}

export default function OutlookPanel({ analysis }: { analysis: AnalysisResult }) {
  const [targets, setTargets] = useState<TargetInfo[]>([]);
  const [targetId, setTargetId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customType, setCustomType] = useState<"company" | "school">("company");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<OutlookResult | null>(null);

  useEffect(() => {
    fetchTargets().then(setTargets).catch(() => setTargets([]));
  }, []);

  const custom = customName.trim().length > 0;
  const canRun = custom || targetId !== "";

  async function run() {
    setLoading(true);
    setError(null);
    try {
      setResult(
        await fetchOutlook({
          resumeText: analysis.resumeText ?? "",
          analysis,
          ...(custom ? { name: customName.trim(), type: customType } : { targetId }),
        })
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : "Outlook failed");
    } finally {
      setLoading(false);
    }
  }

  const o = result?.outlook;

  return (
    <div className="card border-violet-800/50">
      <h3 className="card-title">Admission / hiring outlook &amp; preparation plan (AI)</h3>
      <p className="card-sub">
        Pick a target from the list, or type any company or school. AI estimates how competitive you are and
        builds a plan, grounded in the rule-based scores above.
      </p>

      <div className="flex flex-wrap gap-2">
        <select
          value={targetId}
          onChange={(e) => {
            setTargetId(e.target.value);
            setCustomName("");
          }}
          className="input min-w-56 flex-1"
          disabled={custom}
        >
          <option value="">Choose a target…</option>
          <optgroup label="Companies">
            {targets.filter((t) => t.type === "company").map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </optgroup>
          <optgroup label="Schools">
            {targets.filter((t) => t.type === "school").map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </optgroup>
        </select>
        <span className="self-center text-xs text-neutral-500">or</span>
        <select value={customType} onChange={(e) => setCustomType(e.target.value as "company" | "school")} className="input">
          <option value="company">Company</option>
          <option value="school">School</option>
        </select>
        <input
          value={customName}
          onChange={(e) => setCustomName(e.target.value)}
          placeholder="Any name, e.g. Palantir"
          className="input min-w-40 flex-1"
        />
        <button className="btn" disabled={!canRun || loading} onClick={run}>
          {loading ? "Analyzing…" : "Estimate & plan"}
        </button>
      </div>
      {error && (
        <p className="mt-3 text-sm text-red-400">
          {error}
        </p>
      )}

      {result && o && (
        <div className="mt-5 flex flex-col gap-5">
          <div role="note" className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-sm text-amber-300">
            <strong>Not a guarantee.</strong> {result.disclaimer}
          </div>

          <div>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="text-sm text-neutral-300">
                {result.targetMatch.target.label} · rule-based fit {result.targetMatch.fitScore}/100
              </p>
              <p className={`text-lg font-bold ${BAND_COLOR[o.band] ?? ""}`}>
                {o.band} · roughly {o.chanceLow}–{o.chanceHigh}%
              </p>
            </div>
            <div className="relative mt-2 h-3 rounded-full bg-neutral-800" aria-label={`Estimated range ${o.chanceLow} to ${o.chanceHigh} percent`}>
              <div
                className="absolute top-0 h-3 rounded-full bg-violet-500/80"
                style={{ left: `${o.chanceLow}%`, width: `${o.chanceHigh - o.chanceLow}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-neutral-500">
              A wide range on purpose. Confidence: {o.confidence}. The tool cannot see test scores, recommendations,
              essays, the applicant pool, or interviews.
            </p>
            <p className="mt-3 text-sm text-neutral-200">{o.summary}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <List title="Strengths" items={o.strengths} color="text-emerald-400" />
            <List title="Risks" items={o.risks} color="text-amber-400" />
            <List title="What this report can't see" items={o.unknowns} color="text-neutral-400" />
          </div>

          <div>
            <p className="label">Preparation plan</p>
            <ol className="space-y-3">
              {o.plan.map((p) => (
                <li key={p.timeframe} className="rounded-xl border border-neutral-800 p-4">
                  <p className="text-xs font-semibold text-violet-400">{p.timeframe}</p>
                  <p className="text-sm text-neutral-100">{p.goal}</p>
                  <ul className="mt-2 space-y-1 text-sm text-neutral-300">
                    {p.actions.map((a) => (
                      <li key={a}>☐ {a}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <List title="Materials to prepare" items={o.prepChecklist} color="text-violet-400" />
            <List title="Likely interview questions" items={o.interviewPrep} color="text-violet-400" />
          </div>
        </div>
      )}
    </div>
  );
}
