import { completeText } from "./llm.js";

/**
 * Free-form Q&A about the resume/SOP. Grounded in the Phase 1 rule-based
 * analysis (scores, warnings, missing keywords) rather than asking GPT to
 * re-derive everything from raw text alone — this keeps AI answers
 * consistent with what the dashboard already shows the user.
 */
export async function chatAboutResume({ question, resumeText, analysis, history = [] }) {
  const contextSummary = summarizeAnalysis(analysis);

  const systemPrompt = `You are the "Ask AI" assistant inside ResumeIQ, a resume/SOP analysis tool.
A rule-based engine (not you) already computed the following analysis of this document. Use it as ground truth and refer to it directly when relevant instead of re-deriving your own scores from scratch:

${contextSummary}

Answer the user's question directly and specifically, referencing concrete lines from the resume/SOP text below where useful. Keep answers focused and under 200 words unless asked for more detail. If asked to evaluate fit for a specific school or company, be honest about the limits of the rule-based ATS matcher (Phase 1) and reason qualitatively as well.

--- DOCUMENT TEXT ---
${resumeText.slice(0, 6000)}
--- END DOCUMENT TEXT ---`;

  return completeText({
    system: systemPrompt,
    messages: [...history, { role: "user", content: question }],
    temperature: 0.5,
  });
}

function summarizeAnalysis(analysis) {
  if (!analysis) return "(no analysis available)";
  const { overallScore, categoryScores, warnings, ats, sectionCounts, targetMatch } = analysis;
  const lines = [
    `Overall score: ${overallScore}/100`,
    `Category scores: ${JSON.stringify(categoryScores)}`,
    `Section entry counts: ${JSON.stringify(sectionCounts)}`,
    `ATS preset "${ats?.preset}" — missing keywords: ${(ats?.missing ?? []).join(", ") || "none"}`,
    `Warnings from rule-based analysis: ${warnings?.join(" | ") || "none"}`,
  ];

  if (targetMatch) {
    lines.push(
      `Target: ${targetMatch.target?.label} (fit score ${targetMatch.fitScore}/100)`,
      `Target missing keywords: ${(targetMatch.keywords?.missing ?? []).join(", ") || "none"}`,
      `Target focus areas: ${(targetMatch.focusAreas ?? []).join(" | ")}`
    );
  }

  return lines.join("\n");
}
