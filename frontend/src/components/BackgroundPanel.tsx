import type { BackgroundProfile, FormatCheck } from "../types";

function Chip({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <span
      className={`rounded-full px-2.5 py-0.5 text-xs ${
        ok ? "bg-emerald-500/15 text-emerald-300" : "bg-neutral-800 text-neutral-500"
      }`}
    >
      {ok ? "✓" : "–"} {children}
    </span>
  );
}

export default function BackgroundPanel({
  background,
  formatChecks,
}: {
  background: BackgroundProfile;
  formatChecks?: FormatCheck[];
}) {
  const { education, employers, contact, signals } = background;
  return (
    <div className="card">
      <h3 className="card-title">Background profile</h3>
      <p className="card-sub">Extracted from your resume with rule-based parsing (no AI).</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <p className="label">Education</p>
          <p className="text-sm text-neutral-200">
            {education.schools.length ? education.schools.join(" · ") : "No school detected"}
          </p>
          <p className="text-xs text-neutral-500 mt-1">
            {education.degrees.join(", ") || "No degree detected"}
            {education.gpa && ` · GPA ${education.gpa.value}/${education.gpa.scale}`}
          </p>
        </div>
        <div>
          <p className="label">Recognizable employers</p>
          <p className="text-sm text-neutral-200">{employers.length ? employers.join(" · ") : "None detected"}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <Chip ok={signals.research}>Research</Chip>
        <Chip ok={signals.internship}>Internship</Chip>
        <Chip ok={signals.leadership}>Leadership</Chip>
        <Chip ok={contact.email}>Email</Chip>
        <Chip ok={contact.phone}>Phone</Chip>
        <Chip ok={contact.linkedin}>LinkedIn</Chip>
        <Chip ok={contact.github}>GitHub</Chip>
      </div>

      {background.insights.length > 0 && (
        <ul className="mt-4 space-y-1.5 text-sm text-neutral-300">
          {background.insights.map((i) => (
            <li key={i}>• {i}</li>
          ))}
        </ul>
      )}

      {formatChecks && (
        <div className="mt-5 border-t border-neutral-800 pt-4">
          <p className="label">Format checks</p>
          <ul className="space-y-1 text-sm">
            {formatChecks.map((c) => (
              <li key={c.label} className="flex gap-2">
                <span className={c.ok ? "text-emerald-400" : "text-amber-400"}>{c.ok ? "✓" : "!"}</span>
                <span className="text-neutral-300">
                  {c.label} <span className="text-neutral-500">— {c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
