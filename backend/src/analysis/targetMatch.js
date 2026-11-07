import { TARGET_PRESETS } from "../data/targetPresets.js";

const round1 = (n) => Math.round(n * 10) / 10;

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ");
}

function escapeRegex(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function matchKeywords(text, keywords) {
  const normalized = normalize(text);
  const matched = [];
  const missing = [];
  for (const keyword of keywords) {
    const re = new RegExp(`\\b${escapeRegex(keyword)}\\b`, "i");
    if (re.test(normalized)) matched.push(keyword);
    else missing.push(keyword);
  }
  return { matched, missing, matchRatio: keywords.length ? matched.length / keywords.length : 0 };
}

/**
 * Compares the resume's actual verb-category distribution (from the Phase 1/2
 * Action Verb Heatmap) against a target preset's expected emphasis weights.
 * Both are treated as probability distributions over the same 4 categories;
 * alignment is 1 minus half the total-variation distance between them,
 * scaled to 0-100. This stays rule-based — no AI involved.
 */
function scoreEmphasisAlignment(verbHeatmap, emphasize) {
  const categories = Object.keys(emphasize);
  const total = categories.reduce((sum, c) => sum + (verbHeatmap[c] ?? 0), 0);

  const actual = {};
  categories.forEach((c) => {
    actual[c] = total > 0 ? (verbHeatmap[c] ?? 0) / total : 0;
  });

  let totalVariation = 0;
  categories.forEach((c) => {
    totalVariation += Math.abs(actual[c] - emphasize[c]);
  });
  const alignmentScore = round1((1 - totalVariation / 2) * 100);

  // category with the largest (target - actual) gap is the most under-emphasized
  let weakestCategory = null;
  let largestGap = -Infinity;
  categories.forEach((c) => {
    const gap = emphasize[c] - actual[c];
    if (gap > largestGap) {
      largestGap = gap;
      weakestCategory = c;
    }
  });

  return { actual, target: emphasize, alignmentScore, weakestCategory };
}

function buildRecommendations({ preset, keywordMatch, emphasis }) {
  const recs = [];

  if (keywordMatch.missing.length > 0) {
    recs.push(
      `Keywords commonly expected for ${preset.label} are missing: ${keywordMatch.missing.slice(0, 6).join(", ")}`
    );
  }

  if (emphasis.weakestCategory && emphasis.alignmentScore < 85) {
    recs.push(
      `${emphasis.weakestCategory} experience looks under-represented; consider emphasizing it more`
    );
  }

  recs.push(...preset.focusAreas);
  return recs;
}

export function matchTarget(text, verbHeatmap, targetIdOrPreset) {
  const preset =
    typeof targetIdOrPreset === "object" && targetIdOrPreset
      ? targetIdOrPreset
      : TARGET_PRESETS[targetIdOrPreset];
  if (!preset) {
    throw new Error(`Unknown target preset: "${targetIdOrPreset}"`);
  }

  const keywordMatch = matchKeywords(text, preset.keywords);
  const emphasis = scoreEmphasisAlignment(verbHeatmap, preset.emphasize);
  const recommendations = buildRecommendations({ preset, keywordMatch, emphasis });

  const fitScore = round1(keywordMatch.matchRatio * 60 + (emphasis.alignmentScore / 100) * 40);

  return {
    target: { id: preset.id, label: preset.label, type: preset.type },
    fitScore,
    keywords: keywordMatch,
    emphasis,
    focusAreas: preset.focusAreas,
    recommendations,
  };
}
