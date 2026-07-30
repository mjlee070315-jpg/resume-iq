import { getOpenAiClient, CHAT_MODEL } from "./openaiClient.js";

const GRAMMAR_SCHEMA = {
  name: "resume_grammar_check",
  schema: {
    type: "object",
    properties: {
      issues: {
        type: "array",
        items: {
          type: "object",
          properties: {
            original: { type: "string", description: "The exact original sentence/bullet." },
            corrected: { type: "string", description: "The corrected version." },
            issueType: {
              type: "string",
              enum: [
                "tense",
                "subject-verb agreement",
                "article/preposition",
                "punctuation",
                "wordiness",
                "parallelism",
                "other",
              ],
            },
            explanation: { type: "string", description: "One short sentence, plain language." },
          },
          required: ["original", "corrected", "issueType", "explanation"],
          additionalProperties: false,
        },
      },
      overallAssessment: {
        type: "string",
        description: "1-2 sentence summary of grammar quality across the whole document.",
      },
    },
    required: ["issues", "overallAssessment"],
    additionalProperties: false,
  },
  strict: true,
};

/**
 * AI-assisted grammar/tense/parallelism check that goes beyond the rule-based
 * heuristic in analysis/grammarCheck.js (which only catches capitalization,
 * spacing, and a coarse tense-mix signal). The rule-based result is passed
 * in as context so the model focuses on what the heuristic can't catch
 * (subject-verb agreement, article usage, parallelism across bullets, etc.)
 * instead of re-flagging the same coarse tense-mix issue.
 */
export async function checkGrammarAi({ text, ruleBasedGrammar }) {
  const client = getOpenAiClient();

  const systemPrompt = `You are a resume proofreading assistant inside ResumeIQ.
A rule-based checker already ran and found: ${ruleBasedGrammar?.issueCount ?? 0} basic issues
(capitalization/spacing), ${ruleBasedGrammar?.pastTenseCount ?? 0} past-tense and
${ruleBasedGrammar?.presentTenseCount ?? 0} present-tense leading verbs across bullets.

Your job is to find issues that rule-based regex CANNOT catch: subject-verb agreement,
incorrect article/preposition use, lack of parallel structure across bullets in the same
role (e.g. mixing "Led team" with "Was responsible for..." in the same job), and awkward
or wordy phrasing. Only flag real issues — do not invent problems in already-correct
sentences. Return at most 8 issues, prioritizing the most impactful ones. Keep the document
professional resume language, don't rewrite content/facts, only grammar and structure.`;

  const response = await client.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: text.slice(0, 6000) },
    ],
    response_format: { type: "json_schema", json_schema: GRAMMAR_SCHEMA },
    temperature: 0.2,
  });

  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from model");
  return JSON.parse(raw);
}
