const BULLET_RE = /^[\s]*[•\-\*●▪‣o]\s+/;

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
 * Lightweight, non-AI grammar/tense heuristic check.
 * This is intentionally simple for Phase 1 — Phase 2 adds AI-assisted
 * grammar correction on top of this baseline.
 */
export function checkGrammar(text) {
  const bullets = getBulletLines(text);
  const issues = [];

  let pastTenseCount = 0;
  let presentTenseCount = 0;

  for (const bullet of bullets) {
    if (bullet.length === 0) continue;

    // capitalization check
    if (!/^[A-Z0-9]/.test(bullet)) {
      issues.push({ type: "capitalization", sentence: bullet });
    }

    // double space / stray punctuation
    if (/ {2,}/.test(bullet) || /\s+[,.]/.test(bullet)) {
      issues.push({ type: "spacing", sentence: bullet });
    }

    const leadingWord = bullet.match(/^[A-Za-z]+/)?.[0]?.toLowerCase();
    if (leadingWord) {
      if (/(ed)$/.test(leadingWord) && leadingWord.length > 3) {
        pastTenseCount++;
      } else if (/(ing)$/.test(leadingWord) || /s$/.test(leadingWord)) {
        presentTenseCount++;
      }
    }
  }

  // tense consistency: flag if resume mixes past and present tense heavily
  const tenseMixed = pastTenseCount > 0 && presentTenseCount > 0;
  const minority = Math.min(pastTenseCount, presentTenseCount);
  if (tenseMixed && minority >= Math.max(2, bullets.length * 0.15)) {
    issues.push({
      type: "tense_inconsistency",
      detail: `${pastTenseCount} past-tense vs ${presentTenseCount} present-tense leading verbs`,
    });
  }

  const score = Math.max(0, 100 - issues.length * 6);

  return {
    totalBullets: bullets.length,
    issueCount: issues.length,
    issues,
    pastTenseCount,
    presentTenseCount,
    score,
  };
}
