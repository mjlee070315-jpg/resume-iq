import { useEffect, useState, useSyncExternalStore } from "react";
import { getAiKey, subscribeAiKey } from "./aiKey";
import AiKeyModal from "./components/AiKeyModal";
import { analyzeResumeFile, analyzePastedText } from "./api";
import type { AnalysisResult } from "./types";
import UploadPanel, { type AnalyzeInput } from "./components/UploadPanel";
import BackgroundPanel from "./components/BackgroundPanel";
import CustomTargetPanel from "./components/CustomTargetPanel";
import OutlookPanel from "./components/OutlookPanel";
import ScoreGauge from "./components/ScoreGauge";
import CategoryScores from "./components/CategoryScores";
import WarningsList from "./components/WarningsList";
import SectionBreakdown from "./components/SectionBreakdown";
import VerbHeatmap from "./components/VerbHeatmap";
import AtsPanel from "./components/AtsPanel";
import WeakVerbSuggestions from "./components/WeakVerbSuggestions";
import ScoreRadar from "./components/ScoreRadar";
import Timeline from "./components/Timeline";
import ChatPanel from "./components/ChatPanel";
import TargetPanel from "./components/TargetPanel";
import GrammarPanel from "./components/GrammarPanel";
import CustomJobPanel from "./components/CustomJobPanel";
import CompanyExplorer from "./components/CompanyExplorer";

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<"analyze" | "companies">("analyze");
  const [tab, setTab] = useState<"overview" | "fit" | "details" | "ai">("overview");
  const [preferredTarget, setPreferredTarget] = useState("");
  const [toast, setToast] = useState<string | null>(null);
  const [keyOpen, setKeyOpen] = useState(false);
  const hasKey = useSyncExternalStore(subscribeAiKey, () => getAiKey() !== null);

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    try {
      const saved = localStorage.getItem("resumeiq-theme");
      if (saved === "light" || saved === "dark") return saved;
    } catch {
      /* storage unavailable */
    }
    return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("resumeiq-theme", theme);
    } catch {
      /* ignore */
    }
  }, [theme]);

  function downloadJson() {
    if (!result) return;
    const { resumeText: _omit, ...rest } = result;
    void _omit;
    const blob = new Blob([JSON.stringify(rest, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "resumeiq-report.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function handleAnalyze(
    input: AnalyzeInput,
    preset: string,
    target: string,
    jobDescription: string
  ) {
    setLoading(true);
    setError(null);
    try {
      const res =
        input.kind === "file"
          ? await analyzeResumeFile(input.file, preset, target, jobDescription)
          : await analyzePastedText(input.text, preset, target, jobDescription);
      setResult(res);
      setTab("overview");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const tabs = [
    ["overview", "Overview"],
    ["fit", "Fit & outlook"],
    ["details", "Details"],
    ["ai", "Ask AI"],
  ] as const;

  return (
    <div className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-violet-600 focus:px-3 focus:py-1 focus:text-white">
        Skip to content
      </a>
      <header className="sticky top-0 z-40 border-b border-neutral-800 bg-neutral-950/90 px-4 py-3 backdrop-blur sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-semibold tracking-tight">
              Resume<span className="text-violet-400">IQ</span>
            </h1>
            <nav className="no-print flex gap-1 text-sm" aria-label="Main">
              {(["analyze", "companies"] as const).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  aria-current={page === p ? "page" : undefined}
                  className={`rounded-lg px-3 py-1.5 ${page === p ? "bg-neutral-800 text-neutral-100" : "text-neutral-400 hover:text-neutral-200"}`}
                >
                  {p === "analyze" ? "Analyze" : "Companies"}
                </button>
              ))}
            </nav>
          </div>
          <div className="no-print flex gap-2">
            {result && page === "analyze" && (
              <>
                <button className="btn-ghost" onClick={() => window.print()}>
                  Print / PDF
                </button>
                <button className="btn-ghost" onClick={downloadJson}>
                  JSON
                </button>
              </>
            )}
            <button className="btn-ghost" onClick={() => setKeyOpen(true)} aria-label="Set your AI API key">
              {hasKey ? "AI key ✓" : "AI key"}
            </button>
            <button className="btn-ghost" aria-label="Toggle color theme" onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}>
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      <main id="main" className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        {toast && (
          <div role="status" className="rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            {toast}
          </div>
        )}

        {page === "companies" ? (
          <CompanyExplorer
            onUse={(id, name) => {
              setPreferredTarget(id);
              setPage("analyze");
              setToast(`Target set to ${name}. Upload or paste your resume, then analyze.`);
              setTimeout(() => setToast(null), 6000);
            }}
          />
        ) : (
          <>
            {!result && !loading && (
              <section className="py-4 text-center">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
                  Know where your resume stands, <span className="text-violet-400">and what to do next.</span>
                </h2>
                <p className="mx-auto mt-3 max-w-2xl text-neutral-400">
                  Explainable scoring, ATS keyword matching, fit for 85+ companies and schools, and an AI plan for getting
                  from here to your target. Nothing is a black box, and nothing is guaranteed.
                </p>
                <ol className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-x-6 gap-y-1 text-sm text-neutral-500">
                  <li>1. Upload or paste</li>
                  <li>2. Pick a target</li>
                  <li>3. Get scores, fit, and a plan</li>
                </ol>
              </section>
            )}

            <UploadPanel onAnalyze={handleAnalyze} loading={loading} error={error} preferredTarget={preferredTarget} />

            {loading && (
              <div className="card animate-pulse" aria-busy="true" aria-live="polite">
                <div className="h-4 w-1/3 rounded bg-neutral-800" />
                <div className="mt-4 h-24 rounded bg-neutral-800" />
              </div>
            )}

            {result && (
              <>
                <div role="tablist" aria-label="Result sections" className="no-print sticky top-[57px] z-30 -mx-1 flex gap-1 overflow-x-auto rounded-xl border border-neutral-800 bg-neutral-950/90 p-1 backdrop-blur">
                  {tabs.map(([id, label]) => (
                    <button
                      key={id}
                      role="tab"
                      aria-selected={tab === id}
                      onClick={() => setTab(id)}
                      className={`whitespace-nowrap rounded-lg px-4 py-1.5 text-sm ${tab === id ? "bg-violet-600 text-white" : "text-neutral-400 hover:text-neutral-200"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col gap-6 print-all">
                  <div className={tab === "overview" ? "contents" : "hidden print:contents"}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      <ScoreGauge score={result.overallScore} />
                      <div className="md:col-span-2">
                        <CategoryScores scores={result.categoryScores} />
                      </div>
                    </div>
                    <WarningsList warnings={result.warnings} />
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <ScoreRadar scores={result.categoryScores} />
                      <Timeline entries={result.timeline} />
                    </div>
                  </div>

                  <div className={tab === "fit" ? "contents" : "hidden print:contents"}>
                    <OutlookPanel analysis={result} />
                    {result.targetMatch && <TargetPanel match={result.targetMatch} />}
                    {result.customJobMatch && <CustomJobPanel match={result.customJobMatch} />}
                    {result.background && <BackgroundPanel background={result.background} formatChecks={result.formatChecks} />}
                    <CustomTargetPanel analysis={result} />
                  </div>

                  <div className={tab === "details" ? "contents" : "hidden print:contents"}>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                      <SectionBreakdown
                        sections={[
                          result.sectionScores.experience,
                          result.sectionScores.projects,
                          result.sectionScores.leadership,
                          result.sectionScores.skills,
                        ]}
                      />
                      <VerbHeatmap data={result.verbHeatmap} />
                    </div>
                    <AtsPanel preset={result.ats.preset} matched={result.ats.matched} missing={result.ats.missing} />
                    <WeakVerbSuggestions flagged={result.weakVerbs.flagged} />
                    <GrammarPanel resumeText={result.resumeText ?? ""} ruleBasedGrammar={result.grammar} />
                  </div>

                  <div className={tab === "ai" ? "contents" : "hidden print:hidden"}>
                    <ChatPanel resumeText={result.resumeText ?? ""} analysis={result} />
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </main>

      <AiKeyModal open={keyOpen} onClose={() => setKeyOpen(false)} />

      <footer className="no-print border-t border-neutral-800 px-4 py-6 text-center text-xs text-neutral-500 sm:px-8">
        <p>
          Your file is processed on the server only to produce this report and is deleted right after. Pasted text is not
          stored. Scores and AI outlooks are estimates, not guarantees.
        </p>
        <p className="mt-1">
          <a className="underline hover:text-neutral-300" href="https://github.com/mjlee070315-jpg/resume-iq" target="_blank" rel="noreferrer">
            Open source on GitHub
          </a>
        </p>
      </footer>
    </div>
  );
}

export default App;
