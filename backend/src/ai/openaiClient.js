import OpenAI from "openai";

// Phase 2 boundary: this is the ONLY file that talks to OpenAI. Everything
// in src/analysis/ is rule-based and has zero dependency on this module.
// If OPENAI_API_KEY isn't set, AI routes respond with a clear 501 instead of
// crashing — the rest of the app (Phase 1) works with no key at all.

let client = null;

export function isAiConfigured() {
  return Boolean(process.env.OPENAI_API_KEY);
}

export function getOpenAiClient() {
  if (!isAiConfigured()) {
    throw new Error(
      "OPENAI_API_KEY is not set. Add it to backend/.env to enable Phase 2 AI features."
    );
  }
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export const CHAT_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
