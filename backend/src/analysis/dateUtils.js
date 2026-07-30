// Shared date-range detection used by sectionDetector.js (entry counting) and
// timelineBuilder.js (Phase 2 timeline). Kept in one place so both stay in sync.
//
// Handles formats like:
//   "2022 - 2024"
//   "May 2023 - Aug 2023"
//   "Jan 2023 – Present"
//   "Sep 2022 - Dec 2022"

const MONTH = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec";
const YEAR = "(?:19|20)\\d{2}";
const DATE_TOKEN = `(?:(?:${MONTH})[a-z]*\\.?\\s+)?${YEAR}`;

export const DATE_RANGE_RE = new RegExp(
  `\\b${DATE_TOKEN}\\s*(?:[-–—]|to)\\s*(?:${DATE_TOKEN}|present|current)\\b`,
  "i"
);

export const YEAR_RE = new RegExp(`\\b${YEAR}\\b`);
export const LONE_YEAR_LINE_RE = new RegExp(`^\\D*(${YEAR})\\D*$`);
