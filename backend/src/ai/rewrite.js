import { getOpenAiClient, CHAT_MODEL } from "./openaiClient.js";

const REWRITE_SCHEMA = {
  name: "resume_bullet_rewrite",
  schema: {
    type: "object",
    properties: {
      rewritten: {
        type: "string",
        description: "The rewritten bullet point, one sentence, no bullet character.",
      },
      rationale: {
        type: "string",
        description: "One short sentence explaining what changed and why.",
      },
      alternatives: {
        type: "array",
        items: { type: "string" },
        description: "1-2 additional rewrite options.",
      },
    },
    required: ["rewritten", "rationale", "alternatives"],
    additionalProperties: false,
  },
  strict: true,
};

/**
 * Rewrites a single flagged bullet point using GPT, but the prompt is
 * grounded in Phase 1's rule-based findings (flagged weak verb + suggested
 * replacements) rather than asking the model to analyze from scratch.
 */
export async function rewriteBullet({ sentence, flaggedTerm, suggestions, sectionLabel }) {
  const client = getOpenAiClient();

  const systemPrompt = `You are a resume writing assistant embedded in ResumeIQ, a resume analysis tool.
A rule-based analyzer (not you) already flagged the weak/generic term "${flaggedTerm}" in the sentence below and suggested these stronger verbs: ${suggestions.join(", ")}.
Rewrite the bullet to:
- start with a strong action verb (prefer one of the suggestions, or an equally strong synonym)
- keep it truthful to the original content (do not invent facts, companies, or numbers not implied by the original)
- add a plausible quantified outcome ONLY if the original clearly implies one is missing (mark it as [X]% / [X] if you are only illustrating the pattern, don't fabricate a specific number)
- stay under 25 words
Return concise, resume-appropriate language for the "${sectionLabel}" section.`;

  const response = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Original bullet: "${sentence}"` },
    ],
    response_format: { type: "json_schema", json_schema: REWRITE_SCHEMA },
    temperature: 0.4,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from model");
  return JSON.parse(raw);
}
