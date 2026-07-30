export default function AtsPanel({
  preset,
  matched,
  missing,
}: {
  preset: string;
  matched: string[];
  missing: string[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-300 mb-1">
        ATS Keyword Match — {preset}
      </h3>
      <p className="text-xs text-neutral-500 mb-4">
        {matched.length}/{matched.length + missing.length} keywords found
      </p>
      <div className="flex flex-wrap gap-2 mb-3">
        {matched.map((k) => (
          <span
            key={k}
            className="rounded-full bg-emerald-500/15 px-3 py-1 text-xs text-emerald-300"
          >
            {k}
          </span>
        ))}
      </div>
      {missing.length > 0 && (
        <>
          <p className="text-xs text-neutral-500 mb-2">Missing</p>
          <div className="flex flex-wrap gap-2">
            {missing.map((k) => (
              <span
                key={k}
                className="rounded-full bg-red-500/15 px-3 py-1 text-xs text-red-300"
              >
                {k}
              </span>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
