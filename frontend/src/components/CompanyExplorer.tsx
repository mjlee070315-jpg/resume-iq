import { useEffect, useMemo, useState } from "react";
import { fetchCompanies, type CompanyProfile } from "../api";

export default function CompanyExplorer({ onUse }: { onUse: (targetId: string, name: string) => void }) {
  const [companies, setCompanies] = useState<CompanyProfile[]>([]);
  const [industries, setIndustries] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [q, setQ] = useState("");
  const [industry, setIndustry] = useState("");
  const [open, setOpen] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCompanies()
      .then((d) => {
        setCompanies(d.companies);
        setIndustries(d.industries);
        setNote(d.note);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"));
  }, []);

  const shown = useMemo(() => {
    const s = q.toLowerCase().trim();
    return companies
      .filter((c) => (!industry || c.industry === industry) && (!s || c.name.toLowerCase().includes(s) || c.keywords.some((k) => k.includes(s))))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [companies, q, industry]);

  return (
    <div className="flex flex-col gap-4">
      <div className="card">
        <h2 className="text-lg font-semibold text-neutral-100">Company explorer</h2>
        <p className="card-sub">
          {companies.length || "70+"} companies with what they tend to look for. Pick one to analyze your resume against it.
        </p>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by company or skill, e.g. Cummins, cuda, supply chain"
          className="input w-full"
          aria-label="Search companies"
        />
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["", ...industries].map((i) => (
            <button
              key={i || "all"}
              onClick={() => setIndustry(i)}
              className={`rounded-full px-3 py-1 text-xs ${industry === i ? "bg-violet-600 text-white" : "border border-neutral-700 text-neutral-400 hover:border-neutral-500"}`}
            >
              {i || "All"}
            </button>
          ))}
        </div>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {shown.map((c) => {
          const isOpen = open === c.id;
          return (
            <div key={c.id} className="card !p-4">
              <button className="w-full text-left" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen}>
                <p className="font-semibold text-neutral-100">{c.name}</p>
                <p className="text-xs text-neutral-500">
                  {c.industry} · {c.size}
                  {c.hq && ` · ${c.hq}`}
                </p>
              </button>
              <div className="mt-2 flex flex-wrap gap-1">
                {c.keywords.slice(0, isOpen ? 20 : 4).map((k) => (
                  <span key={k} className="rounded-full bg-violet-600/20 px-2 py-0.5 text-[11px] text-violet-300">{k}</span>
                ))}
              </div>
              {isOpen && (
                <div className="mt-3 text-sm">
                  <p className="label">What stands out</p>
                  <ul className="space-y-1 text-neutral-300">
                    {c.tips.map((t) => (
                      <li key={t}>• {t}</li>
                    ))}
                  </ul>
                  <button className="btn mt-3" onClick={() => onUse(c.targetId, c.name)}>
                    Analyze my resume for {c.name}
                  </button>
                </div>
              )}
            </div>
          );
        })}
        {shown.length === 0 && <p className="text-sm text-neutral-500">No companies match. Try the AI custom target for any name.</p>}
      </div>
      <p className="text-xs text-neutral-500">{note}</p>
    </div>
  );
}
