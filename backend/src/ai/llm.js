// Provider-agnostic LLM layer. Every AI feature goes through these two
// functions, so the rest of the app never knows which vendor is behind them.
//   ANTHROPIC_API_KEY -> Claude (default model: claude-haiku-4-5)
//   OPENAI_API_KEY    -> OpenAI (default model: gpt-4o-mini)
// If both are set, Anthropic wins unless AI_PROVIDER=openai.

import { getOpenAiClient, CHAT_MODEL as OPENAI_MODEL } from "./openaiClient.js";

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

export function activeProvider() {
  const forced = process.env.AI_PROVIDER?.toLowerCase();
  if (forced === "openai" && process.env.OPENAI_API_KEY) return "openai";
  if (forced === "anthropic" && process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.ANTHROPIC_API_KEY) return "anthropic";
  if (process.env.OPENAI_API_KEY) return "openai";
  return null;
}

export function isAiConfigured() {
  return activeProvider() !== null;
}

async function anthropicMessage({ system, messages, temperature }) {
  const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com"}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 2000,
      temperature,
      system,
      messages,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error?.message || `Anthropic API error (${res.status})`);
  return (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
}

/** Free-form text completion. `messages` = [{role: "user"|"assistant", content}] */
export async function completeText({ system, messages, temperature = 0.5 }) {
  if (activeProvider() === "anthropic") {
    return anthropicMessage({ system, messages, temperature });
  }
  const client = getOpenAiClient();
  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [{ role: "system", content: system }, ...messages],
    temperature,
  });
  return response.choices[0]?.message?.content ?? "";
}

function parseJsonLoose(raw) {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Model did not return JSON");
  return JSON.parse(raw.slice(start, end + 1));
}

/** Structured completion validated against a JSON schema ({name, schema}). */
export async function completeJson({ system, user, schema, temperature = 0.3 }) {
  if (activeProvider() === "anthropic") {
    const raw = await anthropicMessage({
      system: `${system}\n\nRespond with ONLY a JSON object that matches this JSON Schema. No prose, no code fences:\n${JSON.stringify(schema.schema)}`,
      messages: [{ role: "user", content: user }],
      temperature,
    });
    return parseJsonLoose(raw);
  }
  const client = getOpenAiClient();
  const response = await client.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    response_format: { type: "json_schema", json_schema: { ...schema, strict: true } },
    temperature,
  });
  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from model");
  return JSON.parse(raw);
}
