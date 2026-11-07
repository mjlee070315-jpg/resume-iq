// Bring-your-own-key storage. The key stays in this browser only (session by default,
// device-wide if the user opts in) and is sent solely with AI requests.

export type Provider = "anthropic" | "openai";
export interface AiKey {
  provider: Provider;
  key: string;
}

const K = "resumeiq-ai-key";
let memory: AiKey | null = null;
const listeners = new Set<() => void>();

function read(storage: Storage | undefined): AiKey | null {
  try {
    const raw = storage?.getItem(K);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return v && (v.provider === "anthropic" || v.provider === "openai") && typeof v.key === "string" ? v : null;
  } catch {
    return null;
  }
}

export function getAiKey(): AiKey | null {
  if (memory) return memory;
  try {
    memory = read(window.sessionStorage) ?? read(window.localStorage);
  } catch {
    memory = null;
  }
  return memory;
}

export function setAiKey(value: AiKey | null, remember: boolean) {
  memory = value;
  try {
    window.sessionStorage.removeItem(K);
    window.localStorage.removeItem(K);
    if (value) (remember ? window.localStorage : window.sessionStorage).setItem(K, JSON.stringify(value));
  } catch {
    /* storage unavailable: the key still works for this page load */
  }
  listeners.forEach((l) => l());
}

export function isRemembered(): boolean {
  try {
    return !!read(window.localStorage);
  } catch {
    return false;
  }
}

export function subscribeAiKey(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function aiHeaders(): Record<string, string> {
  const h: Record<string, string> = { "Content-Type": "application/json" };
  const k = getAiKey();
  if (k) {
    h["x-ai-provider"] = k.provider;
    h["x-ai-key"] = k.key;
  }
  return h;
}
