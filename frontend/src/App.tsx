import { useEffect, useState } from "react";
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

function App() {
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 px-4 py-4 sm:px-8">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">
              Resume<span className="text-violet-400">IQ</span>
            </h1>
            <p className="text-xs text-neutral-500 sm:text-sm">
              Explainable resume &amp; SOP analysis. Rule-based core, AI-assisted polish.
            </p>
          </div>
          <div className="no-print flex gap-2">
            {result && (
              <>
                <button className="btn-ghost" onClick={() => window.print()}>
                  Print / PDF
                </button>
                <button className="btn-ghost" onClick={downloadJson}>
                  JSON
                </button>
              </>
            )}
            <button
              className="btn-ghost"
              aria-label="Toggle color theme"
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
            >
              {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
        <UploadPanel onAnalyze={handleAnalyze} loading={loading} error={error} />

        {result && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <ScoreGauge score={result.overallScore} />
              <div className="md:col-span-2">
                <CategoryScores scores={result.categoryScores} />
              </div>
            </div>

            <WarningsList warnings={result.warnings} />

            <OutlookPanel analysis={result} />

            {result.targetMatch && <TargetPanel match={result.targetMatch} />}
            {result.customJobMatch && <CustomJobPanel match={result.customJobMatch} />}

            {result.background && (
              <BackgroundPanel background={result.background} formatChecks={result.formatChecks} />
            )}

            <CustomTargetPanel analysis={result} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <ScoreRadar scores={result.categoryScores} />
              <Timeline entries={result.timeline} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            <AtsPanel
              preset={result.ats.preset}
              matched={result.ats.matched}
              missing={result.ats.missing}
            />

            <WeakVerbSuggestions flagged={result.weakVerbs.flagged} />

            <GrammarPanel
              resumeText={result.resumeText ?? ""}
              ruleBasedGrammar={result.grammar}
            />

            <ChatPanel resumeText={result.resumeText ?? ""} analysis={result} />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
