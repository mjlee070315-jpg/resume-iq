import type { TimelineEntry } from "../types";

const SECTION_COLOR: Record<string, string> = {
  Experience: "bg-blue-400",
  Projects: "bg-emerald-400",
  Leadership: "bg-violet-400",
};

export default function Timeline({ entries }: { entries: TimelineEntry[] }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
        <h3 className="text-sm font-semibold text-neutral-300 mb-2">Timeline</h3>
        <p className="text-sm text-neutral-500">
          No dates detected. Use ranges like "2023 - 2024".
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-300 mb-4">Timeline</h3>
      <div className="relative pl-4 border-l border-neutral-800 flex flex-col gap-5">
        {entries.map((e, i) => (
          <div key={i} className="relative">
            <span
              className={`absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ${
                SECTION_COLOR[e.section] ?? "bg-neutral-400"
              }`}
            />
            <p className="text-xs text-neutral-500">{e.dateText}</p>
            <p className="text-sm text-neutral-200">{e.title}</p>
            <p className="text-xs text-neutral-600">{e.section}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
