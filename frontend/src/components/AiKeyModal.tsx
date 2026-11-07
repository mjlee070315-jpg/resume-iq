import { useEffect, useRef, useState } from "react";
import { getAiKey, isRemembered, setAiKey, type Provider } from "../aiKey";
import { verifyAiKey } from "../api";

const HELP: Record<Provider, { label: string; url: string; where: string; hint: string }> = {
  anthropic: { label: "Claude (Anthropic)", url: "https://console.anthropic.com/settings/keys", where: "console.anthropic.com > API keys", hint: "sk-ant-..." },
  openai: { label: "OpenAI", url: "https://platform.openai.com/api-keys", where: "platform.openai.com > API keys", hint: "sk-..." },
};

export default function AiKeyModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const existing = getAiKey();
  const [provider, setProvider] = useState<Provider>(existing?.provider ?? "anthropic");
  const [key, setKey] = useState(existing?.key ?? "");
  const [remember, setRemember] = useState(isRemembered());
  const [status, setStatus] = useState<{ kind: "idle" | "checking" | "ok" | "error"; msg?: string }>({ kind: "idle" });
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => ref.current?.focus(), 50);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const h = HELP[provider];

  async function save() {
    const trimmed = key.trim();
    if (trimmed.length < 20 || /\s/.test(trimmed)) {
      setStatus({ kind: "error", msg: "That does not look like a full API key." });
      return;
    }
    setAiKey({ provider, key: trimmed }, remember);
    setStatus({ kind: "checking" });
    const r = await verifyAiKey().catch(() => ({ ok: false, error: "Could not reach the server." }));
    setStatus(r.ok ? { kind: "ok", msg: "Key works. AI features are on." } : { kind: "error", msg: r.error });
  }

  function remove() {
    setAiKey(null, false);
    setKey("");
    setStatus({ kind: "idle" });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-labelledby="aikey-title" onClick={onClose}>
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto !bg-neutral-900" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <h2 id="aikey-title" className="text-lg font-semibold text-neutral-100">Use your own AI key</h2>
          <button className="btn-ghost" onClick={onClose} aria-label="Close">Close</button>
        </div>
        <p className="mt-2 text-sm text-neutral-300">
          AI features (rewrite, grammar check, chat, outlook and plan) run on your own API account, so you pay your provider
          directly for what you use. This site charges nothing and never pays for your usage. Everything else works without a key.
        </p>

        <div className="mt-4 flex gap-2">
          {(Object.keys(HELP) as Provider[]).map((p) => (
            <button
              key={p}
              onClick={() => setProvider(p)}
              className={`flex-1 rounded-lg border px-3 py-2 text-sm ${provider === p ? "border-violet-500 bg-violet-500/10 text-neutral-100" : "border-neutral-700 text-neutral-400"}`}
            >
              {HELP[p].label}
            </button>
          ))}
        </div>

        <label className="mt-4 block text-xs text-neutral-400" htmlFor="aikey-input">API key</label>
        <input
          id="aikey-input"
          ref={ref}
          type="password"
          autoComplete="off"
          spellCheck={false}
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={h.hint}
          className="input mt-1 w-full font-mono"
        />
        <p className="mt-1 text-xs text-neutral-500">
          Get one at <a className="underline hover:text-neutral-300" href={h.url} target="_blank" rel="noreferrer">{h.where}</a>. You need to add
          credit there first. Set a monthly spend limit in your provider's billing settings.
        </p>

        <label className="mt-3 flex items-center gap-2 text-sm text-neutral-300">
          <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
          Remember on this device (otherwise it is forgotten when you close the tab)
        </label>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <button className="btn" onClick={save} disabled={status.kind === "checking" || !key.trim()}>
            {status.kind === "checking" ? "Checking…" : "Save & test"}
          </button>
          {existing && <button className="btn-ghost" onClick={remove}>Remove key</button>}
          {status.kind === "ok" && <span className="text-sm text-emerald-400" role="status">{status.msg}</span>}
          {status.kind === "error" && <span className="text-sm text-red-400" role="alert">{status.msg}</span>}
        </div>

        <p className="mt-4 text-xs text-neutral-500">
          Privacy: your key is stored only in this browser and sent with AI requests over HTTPS. The server uses it for that one request and
          does not store or log it. Do not enter a key on a shared computer unless you leave "Remember" off.
        </p>
      </div>
    </div>
  );
}
