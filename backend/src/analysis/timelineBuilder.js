// Timeline auto-generation — still rule-based (no AI): scans Experience /
// Projects / Activities sections for date-range lines and pairs each with
// the nearest preceding title-like line.

import { DATE_RANGE_RE, YEAR_RE, LONE_YEAR_LINE_RE } from "./dateUtils.js";

const BULLET_RE = /^[\s]*[•\-\*●▪‣o]\s+/;

const SECTION_LABELS = {
  EXPERIENCE: "Experience",
  PROJECTS: "Projects",
  ACTIVITIES: "Leadership",
};

function extractStartYear(line) {
  const match = line.match(YEAR_RE);
  return match ? parseInt(match[0], 10) : null;
}

function buildSectionTimeline(content, sectionKey) {
  if (!content || !content.trim()) return [];
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const entries = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (BULLET_RE.test(line)) continue;
    const isDateLine = DATE_RANGE_RE.test(line) || LONE_YEAR_LINE_RE.test(line);
    if (!isDateLine) continue;

    // walk backwards to find the nearest non-bullet, non-date title line
    let title = null;
    for (let j = i - 1; j >= 0 && j >= i - 3; j--) {
      const candidate = lines[j];
      if (BULLET_RE.test(candidate)) continue;
      if (DATE_RANGE_RE.test(candidate) || LONE_YEAR_LINE_RE.test(candidate)) continue;
      title = candidate;
      break;
    }

    entries.push({
      section: SECTION_LABELS[sectionKey] ?? sectionKey,
      title: title ?? SECTION_LABELS[sectionKey] ?? sectionKey,
      dateText: line,
      startYear: extractStartYear(line),
    });
  }

  return entries;
}

/**
 * Builds a merged, chronologically-sorted timeline across Experience,
 * Projects, and Activities sections.
 */
export function buildTimeline(sections) {
  const all = [
    ...buildSectionTimeline(sections.EXPERIENCE.content, "EXPERIENCE"),
    ...buildSectionTimeline(sections.PROJECTS.content, "PROJECTS"),
    ...buildSectionTimeline(sections.ACTIVITIES.content, "ACTIVITIES"),
  ];

  // dedupe exact (title, dateText) pairs
  const seen = new Set();
  const deduped = all.filter((e) => {
    const key = `${e.title}::${e.dateText}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => (a.startYear ?? 0) - (b.startYear ?? 0));
  return deduped;
}
