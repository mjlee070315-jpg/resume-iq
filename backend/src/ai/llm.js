// Provider-agnostic LLM layer. Every AI feature goes through these two
// functions, so the rest of the app never knows which vendor is behind them.
//   ANTHROPIC_API_KEY -> Claude (default model: claude-haiku-4-5)
//   OPENAI_API_KEY    -> OpenAI (default model: gpt-4o-mini)
// If both are set, Anthropic wins unless AI_PROVIDER=openai.

import { AsyncLocalStorage } from "node:async_hooks";
import OpenAI from "openai";
import { CHAT_MODEL as OPENAI_MODEL } from "./openaiClient.js";

// Bring-your-own-key: a user's key arrives per request (headers) and lives only in
// this request's async context. It is never stored, logged, or sent anywhere except
// the chosen provider. Server env keys remain an optional fallback for self-hosting.
const store = new AsyncLocalStorage();

export function runWithCredentials({ provider, key }, fn) {
  const k = typeof key === "string" ? key.trim() : "";
  const valid = k.length >= 20 && k.length <= 400 && !/\s/.test(k);
  const p = provider === "openai" || provider === "anthropic" ? provider : k.startsWith("sk-ant-") ? "anthropic" : "openai";
  return store.run(valid ? { provider: p, key: k } : null, fn);
}

const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5";

function userCreds() {
  return store.getStore() || null;
}

export function credentialSource() {
  if (userCreds()) return "user";
  return process.env.ANTHROPIC_API_KEY || process.env.OPENAI_API_KEY ? "server" : null;
}

export function activeProvider() {
  const u = userCreds();
  if (u) return u.provider;
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

function apiKey(provider) {
  const u = userCreds();
  if (u) return u.key;
  return provider === "anthropic" ? process.env.ANTHROPIC_API_KEY : process.env.OPENAI_API_KEY;
}

function openaiClient() {
  return new OpenAI({ apiKey: apiKey("openai") });
}

function friendlyProviderError(provider, status, message) {
  if (status === 401 || status === 403) return `The ${provider === "anthropic" ? "Anthropic" : "OpenAI"} key was rejected. Check that it is correct and active.`;
  if (status === 402 || /credit|billing|quota/i.test(message || "")) return "Your API account has no credit left. Add credit in your provider's billing page and try again.";
  if (status === 429) return "Your API account hit a rate limit. Wait a moment and try again.";
  return message || `${provider} API error (${status})`;
}

async function anthropicMessage({ system, messages, temperature }) {
  const res = await fetch(`${process.env.ANTHROPIC_BASE_URL || "https://api.anthropic.com"}/v1/messages`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey("anthropic"),
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
  if (!res.ok) throw new Error(friendlyProviderError("anthropic", res.status, data?.error?.message));
  return (data.content ?? []).filter((b) => b.type === "text").map((b) => b.text).join("");
}

/** Free-form text completion. `messages` = [{role: "user"|"assistant", content}] */
export async function completeText({ system, messages, temperature = 0.5 }) {
  if (activeProvider() === "anthropic") {
    return anthropicMessage({ system, messages, temperature });
  }
  try {
    const response = await openaiClient().chat.completions.create({
      model: OPENAI_MODEL,
      messages: [{ role: "system", content: system }, ...messages],
      temperature,
    });
    return response.choices[0]?.message?.content ?? "";
  } catch (e) {
    throw new Error(friendlyProviderError("openai", e.status, e.message));
  }
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
  let response;
  try {
    response = await openaiClient().chat.completions.create({
      model: OPENAI_MODEL,
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_schema", json_schema: { ...schema, strict: true } },
      temperature,
    });
  } catch (e) {
    throw new Error(friendlyProviderError("openai", e.status, e.message));
  }
  const raw = response.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from model");
  return JSON.parse(raw);
}
