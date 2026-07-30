import { SKILL_DICTIONARY } from "../data/skillDictionary.js";

const round1 = (n) => Math.round(n * 10) / 10;

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function countOccurrences(text, term) {
  const re = new RegExp(`\\b${escapeRegex(term)}\\b`, "gi");
  const matches = text.match(re);
  return matches ? matches.length : 0;
}

/**
 * Extracts which dictionary terms actually appear in an arbitrary pasted job
 * description, ranked by how often they appear in the JD. This is how we
 * support "any" job posting instead of only the fixed presets in
 * data/atsPresets.js / data/targetPresets.js — the required keyword set is
 * derived from the specific JD text rather than hard-coded per role.
 */
export function extractRequiredKeywords(jobDescriptionText) {
  const normalized = jobDescriptionText.toLowerCase();
  const found = [];

  for (const term of SKILL_DICTIONARY) {
    const count = countOccurrences(normalized, term);
    if (count > 0) found.push({ term, count });
  }

  found.sort((a, b) => b.count - a.count);
  return found;
}

/**
 * Matches a resume against an arbitrary pasted job description. The
 * "required keywords" are derived dynamically from the JD text (see
 * extractRequiredKeywords), then matched against the resume the same way
 * the fixed ATS presets are — same mechanism, dynamic input.
 */
export function matchCustomJob(resumeText, jobDescriptionText) {
  if (!jobDescriptionText || !jobDescriptionText.trim()) {
    throw new Error("Job description text is empty");
  }

  const requiredKeywords = extractRequiredKeywords(jobDescriptionText);
  if (requiredKeywords.length === 0) {
    return {
      requiredKeywords: [],
      matched: [],
      missing: [],
      matchRatio: 0,
      fitScore: 0,
      note:
        "이 공고에서 알려진 스킬/키워드를 감지하지 못했습니다. 공고 원문을 더 길게 붙여넣어 보세요.",
    };
  }

  const normalizedResume = resumeText.toLowerCase();
  const matched = [];
  const missing = [];

  for (const { term } of requiredKeywords) {
    if (countOccurrences(normalizedResume, term) > 0) matched.push(term);
    else missing.push(term);
  }

  const matchRatio = matched.length / requiredKeywords.length;

  return {
    requiredKeywords: requiredKeywords.map((k) => k.term),
    matched,
    missing,
    matchRatio: round1(matchRatio * 100) / 100,
    fitScore: round1(matchRatio * 100),
  };
}
