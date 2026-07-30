import { useState } from "react";
import { analyzeResumeFile } from "./api";
import type { AnalysisResult } from "./types";
import UploadPanel from "./components/UploadPanel";
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

  async function handleAnalyze(
    file: File,
    preset: string,
    target: string,
    jobDescription: string
  ) {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeResumeFile(file, preset, target, jobDescription);
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
      <header className="border-b border-neutral-800 px-8 py-5">
        <h1 className="text-xl font-semibold">ResumeIQ</h1>
        <p className="text-sm text-neutral-500">
          AI-powered Resume &amp; Statement Analyzer — rule-based core, AI-assisted polish
        </p>
      </header>

      <main className="mx-auto max-w-5xl px-8 py-8 flex flex-col gap-6">
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

            {result.targetMatch && <TargetPanel match={result.targetMatch} />}
            {result.customJobMatch && <CustomJobPanel match={result.customJobMatch} />}

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
