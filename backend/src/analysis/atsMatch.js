import { ATS_PRESETS, PRESET_NAMES } from "../data/atsPresets.js";

function normalize(text) {
  return text.toLowerCase().replace(/\s+/g, " ");
}

/**
 * Matches resume text against a job-role keyword preset.
 * Returns matched/missing keywords — pure keyword search, no AI.
 */
export function matchAts(text, presetName) {
  const preset = ATS_PRESETS[presetName];
  if (!preset) {
    throw new Error(
      `Unknown ATS preset: "${presetName}". Available: ${PRESET_NAMES.join(", ")}`
    );
  }

  const normalized = normalize(text);
  const matched = [];
  const missing = [];

  for (const keyword of preset) {
    const re = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(normalized)) {
      matched.push(keyword);
    } else {
      missing.push(keyword);
    }
  }

  return {
    preset: presetName,
    matched,
    missing,
    matchRatio: preset.length > 0 ? matched.length / preset.length : 0,
  };
}

export { PRESET_NAMES };
