import { useState } from "react";
import type { AnalysisResult } from "../types";
import { chatAboutResumeAi, type ChatMessage } from "../api";

const SUGGESTED_PROMPTS = [
  "How can I improve this resume for a Google SWE role?",
  "What's the single weakest part of this resume?",
  "Rewrite my Experience section to sound more senior.",
];

export default function ChatPanel({
  resumeText,
  analysis,
}: {
  resumeText: string;
  analysis: AnalysisResult;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send(question: string) {
    if (!question.trim()) return;
    setError(null);
    const nextMessages: ChatMessage[] = [...messages, { role: "user", content: question }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    try {
      const answer = await chatAboutResumeAi({
        question,
        resumeText,
        analysis,
        history: messages,
      });
      setMessages([...nextMessages, { role: "assistant", content: answer }]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Chat failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6 flex flex-col gap-3">
      <h3 className="text-sm font-semibold text-neutral-300">Ask AI</h3>

      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTED_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => send(p)}
              className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-400 hover:border-violet-500 hover:text-violet-300"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      <div className="flex flex-col gap-3 max-h-80 overflow-y-auto">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`text-sm rounded-lg px-3 py-2 ${
              m.role === "user"
                ? "self-end bg-violet-600/20 text-violet-100"
                : "self-start bg-neutral-800 text-neutral-200"
            }`}
          >
            {m.content}
          </div>
        ))}
        {loading && <p className="text-xs text-neutral-500">AI is writing a reply…</p>}
      </div>

      {error && (
        <p className="text-xs text-red-400">
          {error.includes("OPENAI_API_KEY")
            ? "AI chat is unavailable. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in backend/.env to enable it."
            : error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about this resume..."
          className="flex-1 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-violet-500"
        >
          Send
        </button>
      </form>
    </div>
  );
}
