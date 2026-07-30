import {
  WEAK_VERBS,
  OVERUSED_VERBS,
  STRONG_VERB_CATEGORIES,
  IRREGULAR_PARTICIPLES,
} from "../data/verbData.js";

const BULLET_RE = /^[\s]*[•\-\*●▪‣o]\s+/;

/**
 * Splits resume text into "bullet-like" lines for sentence-level analysis.
 * Falls back to sentence splitting if no bullets are found.
 */
function getBulletLines(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const bullets = lines.filter((l) => BULLET_RE.test(l));
  if (bullets.length > 0) {
    return bullets.map((l) => l.replace(BULLET_RE, "").trim());
  }
  // fallback: treat lines longer than 25 chars as pseudo-bullets
  return lines.filter((l) => l.length > 25);
}

function findLeadingVerb(sentence) {
  const match = sentence.trim().match(/^([A-Za-z]+(?:\s[a-z]+){0,2})\b/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Detects weak/overused verbs at the start of bullets and returns
 * flagged sentences + suggested strong verb replacements.
 */
export function analyzeWeakVerbs(text) {
  const bullets = getBulletLines(text);
  const flagged = [];

  for (const bullet of bullets) {
    const lower = bullet.toLowerCase();

    // check multi-word weak phrases first (e.g. "responsible for")
    const phraseHit = Object.keys(WEAK_VERBS).find(
      (phrase) => phrase.includes(" ") && lower.startsWith(phrase)
    );
    if (phraseHit) {
      flagged.push({
        sentence: bullet,
        flaggedTerm: phraseHit,
        type: "weak",
        suggestions: WEAK_VERBS[phraseHit],
      });
      continue;
    }

    const leading = findLeadingVerb(bullet);
    if (leading && WEAK_VERBS[leading]) {
      flagged.push({
        sentence: bullet,
        flaggedTerm: leading,
        type: "weak",
        suggestions: WEAK_VERBS[leading],
      });
    } else if (leading && OVERUSED_VERBS[leading]) {
      flagged.push({
        sentence: bullet,
        flaggedTerm: leading,
        type: "overused",
        suggestions: OVERUSED_VERBS[leading],
      });
    }
  }

  return {
    totalBullets: bullets.length,
    weakCount: flagged.filter((f) => f.type === "weak").length,
    overusedCount: flagged.filter((f) => f.type === "overused").length,
    flagged,
  };
}

/**
 * Detects passive-voice constructions using a simple pattern:
 * (was|were|is|are|been|being|be) + past participle (regular -ed or known irregular).
 */
export function analyzePassiveVoice(text) {
  const bullets = getBulletLines(text);
  const passiveRe = new RegExp(
    `\\b(was|were|is|are|been|being|be)\\s+(\\w+ed|${IRREGULAR_PARTICIPLES.join("|")})\\b`,
    "i"
  );

  const flagged = bullets.filter((b) => passiveRe.test(b));
  return {
    totalBullets: bullets.length,
    passiveCount: flagged.length,
    flaggedSentences: flagged,
  };
}

/**
 * Builds action-verb category counts for the heatmap (Leadership / Technical /
 * Communication / Management), based purely on keyword matching.
 */
export function buildVerbHeatmap(text) {
  const lower = text.toLowerCase();
  const counts = {};

  for (const [category, verbs] of Object.entries(STRONG_VERB_CATEGORIES)) {
    let total = 0;
    for (const verb of verbs) {
      const re = new RegExp(`\\b${verb}\\w*\\b`, "gi");
      const matches = lower.match(re);
      total += matches ? matches.length : 0;
    }
    counts[category] = total;
  }
  return counts;
}
