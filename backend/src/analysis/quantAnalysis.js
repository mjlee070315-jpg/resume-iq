const BULLET_RE = /^[\s]*[•\-\*●▪‣o]\s+/;

// Matches: 35%, $2,000, 2,000+, 500+ students, 14 people, 42ms, 3x, 10-person team, etc.
// Split into independent alternatives so a bare "2,000+" or "42%" counts on its
// own, even when an adjective sits between the number and the unit noun
// (e.g. "2,000+ internal users").
const QUANT_RE = new RegExp(
  [
    `\\$\\s?\\d[\\d,]*(\\.\\d+)?\\s?(k|m|b)?\\b`, // $2,000 / $2k
    `\\d[\\d,]*(\\.\\d+)?\\s?%`, // 42%
    `\\b\\d[\\d,]*(\\.\\d+)?\\+`, // 2,000+ / 500+
    `\\b\\d+x\\b`, // 3x
    `\\b\\d[\\d,]*\\s?(users?|people|clients?|customers?|members?|engineers?|hours?|days?|weeks?|months?|projects?|teams?|requests?|records?|students?|companies|accounts?|transactions?|downloads?|sales|revenue|employees?|ms)\\b`,
  ].join("|"),
  "i"
);

function getBulletLines(text) {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  const bullets = lines.filter((l) => BULLET_RE.test(l));
  if (bullets.length > 0) return bullets.map((l) => l.replace(BULLET_RE, "").trim());
  return lines.filter((l) => l.length > 25);
}

/**
 * Detects bullets containing quantified achievements (numbers, %, $, units).
 * This is the "Only 2 quantified achievements found" check from the roadmap.
 */
export function analyzeQuantification(text) {
  const bullets = getBulletLines(text);
  const quantified = bullets.filter((b) => QUANT_RE.test(b));

  return {
    totalBullets: bullets.length,
    quantifiedCount: quantified.length,
    quantifiedSentences: quantified,
    ratio: bullets.length > 0 ? quantified.length / bullets.length : 0,
  };
}
