import type { AnalysisResult, TargetInfo, TargetMatch, BackgroundProfile, BackgroundInsight } from "./types";

export async function fetchPresets(): Promise<string[]> {
  const res = await fetch("/api/presets");
  if (!res.ok) throw new Error("Failed to load ATS presets");
  const data = await res.json();
  return data.presets;
}

export async function fetchTargets(): Promise<TargetInfo[]> {
  const res = await fetch("/api/targets");
  if (!res.ok) throw new Error("Failed to load target presets");
  const data = await res.json();
  return data.targets;
}

export async function analyzeResumeFile(
  file: File,
  preset: string,
  target?: string,
  jobDescription?: string
): Promise<AnalysisResult> {
  const formData = new FormData();
  formData.append("resume", file);
  formData.append("preset", preset);
  if (target) formData.append("target", target);
  if (jobDescription) formData.append("jobDescription", jobDescription);

  const res = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(err.error || "Analysis failed");
  }
  return res.json();
}

export async function fetchAiStatus(): Promise<{ configured: boolean }> {
  const res = await fetch("/api/ai/status");
  if (!res.ok) return { configured: false };
  return res.json();
}

export interface RewriteResult {
  rewritten: string;
  rationale: string;
  alternatives: string[];
}

export async function rewriteBulletAi(params: {
  sentence: string;
  flaggedTerm: string;
  suggestions: string[];
  sectionLabel?: string;
}): Promise<RewriteResult> {
  const res = await fetch("/api/ai/rewrite", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Rewrite failed");
  return data;
}

export interface GrammarIssue {
  original: string;
  corrected: string;
  issueType: string;
  explanation: string;
}

export interface GrammarCheckResult {
  issues: GrammarIssue[];
  overallAssessment: string;
}

export async function checkGrammarAi(params: {
  text: string;
  ruleBasedGrammar: AnalysisResult["grammar"];
}): Promise<GrammarCheckResult> {
  const res = await fetch("/api/ai/grammar-check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Grammar check failed");
  return data;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export async function chatAboutResumeAi(params: {
  question: string;
  resumeText: string;
  analysis: AnalysisResult;
  history: ChatMessage[];
}): Promise<string> {
  const res = await fetch("/api/ai/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Chat failed");
  return data.answer;
}

export async function analyzePastedText(
  text: string,
  preset: string,
  target?: string,
  jobDescription?: string
): Promise<AnalysisResult> {
  const res = await fetch("/api/analyze-text", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, preset, target: target || undefined, jobDescription: jobDescription || undefined }),
  });
  const data = await res.json().catch(() => ({ error: "Unknown error" }));
  if (!res.ok) throw new Error(data.error || "Analysis failed");
  return data;
}

export interface CustomTargetResult {
  targetMatch: TargetMatch;
  background: BackgroundProfile;
  insight: BackgroundInsight;
}

export async function analyzeCustomTarget(params: {
  name: string;
  type: "company" | "school";
  jobTitle?: string;
  resumeText: string;
  verbHeatmap: Record<string, number>;
}): Promise<CustomTargetResult> {
  const res = await fetch("/api/ai/custom-target", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Custom target analysis failed");
  return data;
}
