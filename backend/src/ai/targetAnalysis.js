import { completeJson } from "./llm.js";

const PROFILE_SCHEMA = {
  name: "target_profile",
  schema: {
    type: "object",
    properties: {
      label: { type: "string" },
      keywords: { type: "array", items: { type: "string" } },
      emphasize: {
        type: "object",
        properties: {
          Technical: { type: "number" },
          Leadership: { type: "number" },
          Management: { type: "number" },
          Communication: { type: "number" },
        },
        required: ["Technical", "Leadership", "Management", "Communication"],
        additionalProperties: false,
      },
      focusAreas: { type: "array", items: { type: "string" } },
    },
    required: ["label", "keywords", "emphasize", "focusAreas"],
    additionalProperties: false,
  },
  strict: true,
};

const INSIGHT_SCHEMA = {
  name: "background_insight",
  schema: {
    type: "object",
    properties: {
      summary: { type: "string" },
      strengths: { type: "array", items: { type: "string" } },
      gaps: { type: "array", items: { type: "string" } },
      nextSteps: { type: "array", items: { type: "string" } },
    },
    required: ["summary", "strengths", "gaps", "nextSteps"],
    additionalProperties: false,
  },
  strict: true,
};

/**
 * Builds a preset on the fly for ANY company or school name, in the same
 * shape the rule-based matcher already consumes. The AI only proposes the
 * criteria; scoring against the resume stays deterministic.
 */
export async function generateTargetProfile({ name, type, jobTitle }) {
  const p = await completeJson({
    system: `You build evaluation profiles for ResumeIQ. Given a ${type} name${jobTitle ? " and role" : ""}, return what that ${type} typically looks for in an application.
- label: "Name — Role/Program"
- keywords: 8-14 lowercase skills, tools, or themes commonly expected (specific, no filler)
- emphasize: weights over Technical, Leadership, Management, Communication that sum to 1.0
- focusAreas: 3 concise statements about what stands out to reviewers
Be accurate and general; if you are unsure about the specific organization, say less rather than inventing specifics.`,
    user: `${type}: ${name}${jobTitle ? `\nRole: ${jobTitle}` : ""}`,
    schema: PROFILE_SCHEMA,
    temperature: 0.3,
  });

  const sum = Object.values(p.emphasize).reduce((a, b) => a + b, 0) || 1;
  for (const k of Object.keys(p.emphasize)) p.emphasize[k] = Math.max(0, p.emphasize[k] / sum);
  p.keywords = [...new Set(p.keywords.map((k) => k.toLowerCase().trim()).filter(Boolean))].slice(0, 16);
  return { id: `custom-${Date.now()}`, type, ...p };
}

/** Qualitative read of the candidate's background vs. the target, grounded in rule-based findings. */
export async function analyzeBackgroundFit({ resumeText, background, targetMatch }) {
  return completeJson({
    system: `You assess how a candidate's background fits a target school or company for ResumeIQ.
Ground every statement in the facts below; do not invent credentials.

Rule-based background facts: ${JSON.stringify(background)}
Target: ${targetMatch.target.label} (fit ${targetMatch.fitScore}/100)
Missing keywords: ${targetMatch.keywords.missing.join(", ") || "none"}
Focus areas: ${targetMatch.focusAreas.join(" | ")}

Return a short summary, up to 3 strengths, up to 3 gaps, and up to 4 concrete next steps.`,
    user: resumeText.slice(0, 6000),
    schema: INSIGHT_SCHEMA,
    temperature: 0.4,
  });
}
