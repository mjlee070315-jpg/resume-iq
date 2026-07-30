import { useEffect, useState } from "react";
import { fetchPresets, fetchTargets } from "../api";
import type { TargetInfo } from "../types";

interface Props {
  onAnalyze: (file: File, preset: string, target: string, jobDescription: string) => void;
  loading: boolean;
  error: string | null;
}

export default function UploadPanel({ onAnalyze, loading, error }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [preset, setPreset] = useState<string>("");
  const [presets, setPresets] = useState<string[]>([]);
  const [target, setTarget] = useState<string>("");
  const [targets, setTargets] = useState<TargetInfo[]>([]);
  const [jobDescription, setJobDescription] = useState<string>("");
  const [showJobDescription, setShowJobDescription] = useState(false);

  useEffect(() => {
    fetchPresets()
      .then((p) => {
        setPresets(p);
        setPreset(p[0] ?? "");
      })
      .catch(() => setPresets([]));

    fetchTargets()
      .then((t) => setTargets(t))
      .catch(() => setTargets([]));
  }, []);

  const companies = targets.filter((t) => t.type === "company");
  const schools = targets.filter((t) => t.type === "school");

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h2 className="text-lg font-semibold text-neutral-100 mb-1">
        Resume / SOP 업로드
      </h2>
      <p className="text-sm text-neutral-400 mb-4">
        PDF, DOCX, TXT 파일을 지원합니다. 분석은 서버에서 규칙 기반 로직으로 처리됩니다.
      </p>

      <div className="flex flex-col gap-3">
        <input
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="text-sm text-neutral-300 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-600 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-violet-500"
        />

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-neutral-400">목표 직군 (ATS)</label>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100"
          >
            {presets.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="text-sm text-neutral-400">학교/기업 맞춤 분석</label>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-1.5 text-sm text-neutral-100"
          >
            <option value="">선택 안 함</option>
            {companies.length > 0 && (
              <optgroup label="Companies">
                {companies.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            )}
            {schools.length > 0 && (
              <optgroup label="Schools">
                {schools.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowJobDescription((s) => !s)}
            className="text-xs text-violet-400 hover:text-violet-300"
          >
            {showJobDescription ? "− 채용공고 직접 붙여넣기 닫기" : "+ 채용공고 직접 붙여넣기 (프리셋 대신)"}
          </button>
          {showJobDescription && (
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="채용 공고 원문을 붙여넣으면 해당 공고에서 언급된 키워드를 자동으로 추출해서 매칭합니다."
              rows={5}
              className="mt-2 w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-100 placeholder:text-neutral-500"
            />
          )}
        </div>

        <button
          disabled={!file || loading}
          onClick={() => file && onAnalyze(file, preset, target, jobDescription)}
          className="mt-1 w-fit rounded-lg bg-violet-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-40 hover:bg-violet-500 transition"
        >
          {loading ? "분석 중..." : "분석하기"}
        </button>

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
