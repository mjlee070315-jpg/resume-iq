export default function WarningsList({ warnings }: { warnings: string[] }) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-300 mb-3">Warnings</h3>
      {warnings.length === 0 ? (
        <p className="text-sm text-emerald-400">No major issues detected.</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-300">
              <span>⚠</span>
              <span className="text-neutral-200">{w}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
