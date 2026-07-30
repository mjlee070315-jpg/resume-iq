import { useState } from "react";
import type { SectionScore } from "../types";

function Row({ section }: { section: SectionScore }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-neutral-800 last:border-none py-2">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm text-neutral-200">{section.label}</span>
        <span className="text-sm text-neutral-400">
          {section.score}/{section.max} {open ? "▲" : "▼"}
        </span>
      </button>
      {open && (
        <ul className="mt-2 flex flex-col gap-1 pl-3">
          {section.breakdown.map((b, i) => (
            <li key={i} className="flex justify-between text-xs text-neutral-500">
              <span>{b.reason}</span>
              <span>+{b.points}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function SectionBreakdown({
  sections,
}: {
  sections: SectionScore[];
}) {
  return (
    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-6">
      <h3 className="text-sm font-semibold text-neutral-300 mb-2">
        Section Scores{" "}
        <span className="font-normal text-neutral-500">(클릭해서 근거 보기)</span>
      </h3>
      {sections.map((s) => (
        <Row key={s.label} section={s} />
      ))}
    </div>
  );
}
