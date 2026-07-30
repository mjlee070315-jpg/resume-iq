/**
 * Section detection — pure heuristic/regex logic, no AI.
 *
 * Strategy:
 * 1. Split resume text into lines.
 * 2. A line is a "heading candidate" if it's short, has no trailing
 *    punctuation typical of sentences, and matches (or closely matches)
 *    one of our known section aliases.
 * 3. Everything between two headings belongs to the first heading's section.
 * 4. Within each section, count "entries" using date-range / bullet heuristics.
 */

import { DATE_RANGE_RE, YEAR_RE } from "./dateUtils.js";

const SECTION_ALIASES = {
  EDUCATION: ["education", "academic background", "academics"],
  EXPERIENCE: [
    "experience",
    "work experience",
    "professional experience",
    "employment history",
    "relevant experience",
  ],
  PROJECTS: ["projects", "personal projects", "academic projects", "project experience"],
  SKILLS: [
    "skills",
    "technical skills",
    "core competencies",
    "skills & tools",
    "technologies",
  ],
  AWARDS: ["awards", "honors", "awards & honors", "achievements", "honors & awards"],
  ACTIVITIES: [
    "activities",
    "leadership",
    "extracurricular",
    "leadership & activities",
    "volunteer experience",
    "volunteering",
  ],
};

const BULLET_RE = /^[\s]*[•\-\*•●▪▪‣o]\s+/;

function normalizeHeadingText(line) {
  return line
    .trim()
    .toLowerCase()
    .replace(/[:：]+$/, "")
    .replace(/[^a-z& ]/g, "")
    .trim();
}

function matchSection(line) {
  const trimmed = line.trim();
  if (trimmed.length === 0 || trimmed.length > 40) return null;
  // Sentence-like lines (end in period, contain multiple commas) are not headings
  if (/[.]$/.test(trimmed)) return null;

  const normalized = normalizeHeadingText(trimmed);
  if (!normalized) return null;

  for (const [canonical, aliases] of Object.entries(SECTION_ALIASES)) {
    for (const alias of aliases) {
      if (normalized === alias) return canonical;
      // headings are sometimes "EXPERIENCE" alone or "Experience & Leadership"
      if (
        normalized.split(/\s*&\s*|\s+and\s+/).some((part) => part.trim() === alias) &&
        normalized.length < alias.length + 20
      ) {
        return canonical;
      }
    }
  }
  return null;
}

export function detectSections(text) {
  const lines = text.split("\n");
  const headingIndices = []; // { index, canonical }

  lines.forEach((line, idx) => {
    const canonical = matchSection(line);
    if (canonical) {
      headingIndices.push({ index: idx, canonical });
    }
  });

  const sections = {};
  const order = Object.keys(SECTION_ALIASES);
  order.forEach((name) => {
    sections[name] = {
      name,
      found: false,
      content: "",
      lineCount: 0,
      bulletCount: 0,
      entryCount: 0,
    };
  });

  if (headingIndices.length === 0) {
    return { sections, unassignedText: text, headingsFound: 0 };
  }

  for (let i = 0; i < headingIndices.length; i++) {
    const { index, canonical } = headingIndices[i];
    const nextIndex =
      i + 1 < headingIndices.length ? headingIndices[i + 1].index : lines.length;
    const bodyLines = lines.slice(index + 1, nextIndex);
    const body = bodyLines.join("\n").trim();

    // Merge if section alias appears more than once (rare, but be safe)
    const existing = sections[canonical];
    existing.found = true;
    existing.content = existing.content ? `${existing.content}\n${body}` : body;
    existing.lineCount += bodyLines.filter((l) => l.trim().length > 0).length;
    existing.bulletCount += bodyLines.filter((l) => BULLET_RE.test(l)).length;
    existing.entryCount += countEntries(bodyLines, canonical);
  }

  return { sections, headingsFound: headingIndices.length };
}

function countEntries(bodyLines, canonical) {
  if (canonical === "SKILLS") {
    // count comma / bullet separated skill tokens roughly
    const joined = bodyLines.join(" ");
    const tokens = joined
      .split(/[,••\|]/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0 && t.length < 30);
    return tokens.length;
  }

  // For EXPERIENCE / PROJECTS / ACTIVITIES / AWARDS / EDUCATION:
  // an "entry" is a non-bullet line that looks like a title line —
  // i.e. it contains a date range, OR a year, and is not itself a bullet.
  let count = 0;
  for (const line of bodyLines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (BULLET_RE.test(line)) continue;
    if (DATE_RANGE_RE.test(trimmed) || YEAR_RE.test(trimmed)) {
      count += 1;
    }
  }
  return count;
}
