import { useEffect, useRef, useState } from "react";
import { fetchPresets, fetchTargets } from "../api";
import type { TargetInfo } from "../types";
import { SAMPLE_RESUME } from "../sample";

export type AnalyzeInput =
  | { kind: "file"; file: File }
  | { kind: "text"; text: string };

interface Props {
  onAnalyze: (input: AnalyzeInput, preset: string, target: string, jobDescription: string) => void;
  loading: boolean;
  error: string | null;
  preferredTarget?: string;
}

export default function UploadPanel({ onAnalyze, loading, error, preferredTarget }: Props) {
  const [mode, setMode] = useState<"file" | "text">("file");
  const [file, setFile] = useState<File | null>(null);
  const [text, setText] = useState("");
  const [dragging, setDragging] = useState(false);
  const [preset, setPreset] = useState("");
  const [presets, setPresets] = useState<string[]>([]);
  const [target, setTarget] = useState("");
  const [targets, setTargets] = useState<TargetInfo[]>([]);
  const [jobDescription, setJobDescription] = useState("");
  const [showJd, setShowJd] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchPresets()
      .then((p) => {
        setPresets(p);
        setPreset(p[0] ?? "");
      })
      .catch(() => setPresets([]));
    fetchTargets().then(setTargets).catch(() => setTargets([]));
  }, []);

  useEffect(() => {
    if (preferredTarget) setTarget(preferredTarget);
  }, [preferredTarget]);

  const byLabel = (a: TargetInfo, b: TargetInfo) => a.label.localeCompare(b.label);
  const companies = targets.filter((t) => t.type === "company").sort(byLabel);
  const schools = targets.filter((t) => t.type === "school").sort(byLabel);
  const ready = mode === "file" ? !!file : text.trim().length > 50;

  function submit() {
    if (!ready) return;
    const input: AnalyzeInput = mode === "file" ? { kind: "file", file: file! } : { kind: "text", text };
    onAnalyze(input, preset, target, jobDescription);
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold text-neutral-100">Analyze your resume or SOP</h2>
        <div className="flex rounded-lg border border-neutral-700 p-0.5 text-xs">
          {(["file", "text"] as const).map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={`rounded-md px-3 py-1 ${mode === m ? "bg-violet-600 text-white" : "text-neutral-400"}`}
            >
              {m === "file" ? "Upload file" : "Paste text"}
            </button>
          ))}
        </div>
      </div>

      {mode === "file" ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragging(false);
            const f = e.dataTransfer.files?.[0];
            if (f) setFile(f);
          }}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-xl border-2 border-dashed px-4 py-8 text-center transition ${
            dragging ? "border-violet-500 bg-violet-500/10" : "border-neutral-700 hover:border-neutral-500"
          }`}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
          <p className="text-sm text-neutral-200">{file ? file.name : "Drag & drop a file, or click to browse"}</p>
          <p className="text-xs text-neutral-500 mt-1">PDF, DOCX or TXT, up to 4 MB</p>
        </div>
      ) : (
        <>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={8}
          placeholder="Paste your resume or statement of purpose here (at least a few lines)…"
          className="input w-full"
        />
        </>
      )}
      <button
        type="button"
        className="mt-2 text-xs text-violet-400 hover:text-violet-300"
        onClick={() => {
          setMode("text");
          setText(SAMPLE_RESUME);
        }}
      >
        No resume handy? Try a sample
      </button>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Target role (ATS keywords)
          <select value={preset} onChange={(e) => setPreset(e.target.value)} className="input">
            {presets.map((p) => (
              <option key={p}>{p}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs text-neutral-400">
          Company or school (optional)
          <select value={target} onChange={(e) => setTarget(e.target.value)} className="input">
            <option value="">None</option>
            <optgroup label="Companies">
              {companies.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
            <optgroup label="Schools">
              {schools.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          </select>
        </label>
      </div>

      <button type="button" onClick={() => setShowJd((s) => !s)} className="mt-3 text-xs text-violet-400 hover:text-violet-300">
        {showJd ? "− Hide job posting" : "+ Paste a job posting to match against"}
      </button>
      {showJd && (
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          placeholder="Paste a job description. Skills mentioned in it are extracted automatically and matched against your resume."
          rows={5}
          className="input mt-2 w-full"
        />
      )}

      <div className="mt-4 flex items-center gap-3">
        <button className="btn" disabled={!ready || loading} onClick={submit}>
          {loading ? "Analyzing…" : "Analyze"}
        </button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
