import { detectSections } from "./sectionDetector.js";
import { analyzeWeakVerbs, analyzePassiveVoice, buildVerbHeatmap } from "./verbAnalysis.js";
import { analyzeQuantification } from "./quantAnalysis.js";
import { matchAts } from "./atsMatch.js";
import { checkGrammar } from "./grammarCheck.js";
import { buildTimeline } from "./timelineBuilder.js";

const round1 = (n) => Math.round(n * 10) / 10;
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

/**
 * Scores an "experience-like" section (Experience, Projects, Leadership/Activities)
 * on a 0-20 scale using explainable, weighted rule-based signals.
 *
 * Weighting (out of 20):
 *   5  - section exists
 *   4  - entry count adequacy (target: 3 entries)
 *   4  - bullet richness (target: 2 bullets/entry)
 *   4  - quantified-achievement ratio within section
 *   3  - strong-verb ratio within section (inverse of weak/overused ratio)
 */
function scoreExperienceLike(section, label) {
  if (!section.found || section.content.trim() === "") {
    return {
      label,
      score: 0,
      max: 20,
      found: false,
      breakdown: [{ reason: `${label} 섹션을 찾을 수 없음`, points: 0 }],
    };
  }

  const breakdown = [];
  let score = 0;

  score += 5;
  breakdown.push({ reason: "섹션 존재", points: 5 });

  const entryPts = clamp(section.entryCount, 0, 3) / 3 * 4;
  score += entryPts;
  breakdown.push({ reason: `경험 항목 ${section.entryCount}개 감지`, points: round1(entryPts) });

  const avgBullets =
    section.entryCount > 0 ? section.bulletCount / section.entryCount : section.bulletCount;
  const bulletPts = clamp(avgBullets, 0, 2) / 2 * 4;
  score += bulletPts;
  breakdown.push({
    reason: `항목당 평균 bullet ${avgBullets.toFixed(1)}개`,
    points: round1(bulletPts),
  });

  const quant = analyzeQuantification(section.content);
  const quantPts = quant.ratio * 4;
  score += quantPts;
  breakdown.push({
    reason: `정량화된 성과 비율 ${Math.round(quant.ratio * 100)}%`,
    points: round1(quantPts),
  });

  const verbs = analyzeWeakVerbs(section.content);
  const weakRatio =
    verbs.totalBullets > 0 ? (verbs.weakCount + verbs.overusedCount) / verbs.totalBullets : 0;
  const verbPts = (1 - weakRatio) * 3;
  score += verbPts;
  breakdown.push({
    reason: `약한/과사용 동사 비율 ${Math.round(weakRatio * 100)}%`,
    points: round1(verbPts),
  });

  return { label, score: round1(clamp(score, 0, 20)), max: 20, found: true, breakdown };
}

/**
 * Scores the Skills section on a 0-20 scale.
 *   5  - section exists
 *   15 - keyword count adequacy (target: 12 distinct skills)
 */
function scoreSkills(section) {
  if (!section.found || section.content.trim() === "") {
    return {
      label: "Skills",
      score: 0,
      max: 20,
      found: false,
      breakdown: [{ reason: "Skills 섹션을 찾을 수 없음", points: 0 }],
    };
  }

  const breakdown = [];
  let score = 0;

  score += 5;
  breakdown.push({ reason: "섹션 존재", points: 5 });

  const countPts = clamp(section.entryCount, 0, 12) / 12 * 15;
  score += countPts;
  breakdown.push({ reason: `스킬 키워드 ${section.entryCount}개 감지`, points: round1(countPts) });

  return { label: "Skills", score: round1(clamp(score, 0, 20)), max: 20, found: true, breakdown };
}

/**
 * Full resume analysis pipeline. Everything here is rule-based (no AI calls).
 */
export function analyzeResume(text, atsPresetName) {
  const { sections } = detectSections(text);

  const experienceScore = scoreExperienceLike(sections.EXPERIENCE, "Experience");
  const projectsScore = scoreExperienceLike(sections.PROJECTS, "Projects");
  const leadershipScore = scoreExperienceLike(sections.ACTIVITIES, "Leadership");
  const skillsScore = scoreSkills(sections.SKILLS);

  const weakVerbs = analyzeWeakVerbs(text);
  const passive = analyzePassiveVoice(text);
  const quant = analyzeQuantification(text);
  const heatmap = buildVerbHeatmap(text);
  const grammar = checkGrammar(text);
  const ats = matchAts(text, atsPresetName);

  const weakRatioOverall =
    weakVerbs.totalBullets > 0
      ? (weakVerbs.weakCount + weakVerbs.overusedCount) / weakVerbs.totalBullets
      : 0;
  const passiveRatioOverall =
    passive.totalBullets > 0 ? passive.passiveCount / passive.totalBullets : 0;

  // Writing score (0-100): active voice (40) + strong verbs (40) + quantification (20)
  const writingScore = round1(
    clamp(
      (1 - passiveRatioOverall) * 40 + (1 - weakRatioOverall) * 40 + quant.ratio * 20,
      0,
      100
    )
  );

  const atsScore = round1(ats.matchRatio * 100);
  const technicalScore = skillsScore.score / skillsScore.max * 100; // 0-100 scale for dashboard

  const categoryScores = {
    ATS: atsScore,
    Leadership: round1((leadershipScore.score / leadershipScore.max) * 100),
    Technical: round1(technicalScore),
    Writing: writingScore,
    Grammar: round1(grammar.score),
    Projects: round1((projectsScore.score / projectsScore.max) * 100),
  };

  const overallScore = round1(
    Object.values(categoryScores).reduce((a, b) => a + b, 0) / Object.keys(categoryScores).length
  );

  const warnings = buildWarnings({
    weakVerbs,
    passive,
    quant,
    ats,
    sections,
    grammar,
  });

  const timeline = buildTimeline(sections);

  return {
    overallScore,
    categoryScores,
    timeline,
    sectionScores: {
      experience: experienceScore,
      projects: projectsScore,
      leadership: leadershipScore,
      skills: skillsScore,
    },
    sectionCounts: {
      experience: sections.EXPERIENCE.entryCount,
      projects: sections.PROJECTS.entryCount,
      leadership: sections.ACTIVITIES.entryCount,
      skills: sections.SKILLS.entryCount,
    },
    verbHeatmap: heatmap,
    weakVerbs,
    passiveVoice: passive,
    quantification: quant,
    grammar,
    ats,
    warnings,
  };
}

function buildWarnings({ weakVerbs, passive, quant, ats, sections, grammar }) {
  const warnings = [];

  const weakRatio =
    weakVerbs.totalBullets > 0
      ? (weakVerbs.weakCount + weakVerbs.overusedCount) / weakVerbs.totalBullets
      : 0;
  if (weakRatio > 0.25) {
    warnings.push(
      `Weak action verbs detected in ${weakVerbs.weakCount + weakVerbs.overusedCount}/${weakVerbs.totalBullets} bullets`
    );
  }

  const passiveRatio = passive.totalBullets > 0 ? passive.passiveCount / passive.totalBullets : 0;
  if (passiveRatio > 0.2) {
    warnings.push(`Too many passive-voice sentences (${passive.passiveCount})`);
  }

  if (!sections.ACTIVITIES.found || sections.ACTIVITIES.entryCount === 0) {
    warnings.push("Missing leadership examples");
  }

  if (quant.quantifiedCount < 3) {
    warnings.push(`Only ${quant.quantifiedCount} quantified achievements found`);
  }

  if (ats.missing.length > 0) {
    warnings.push(`Missing ATS keywords: ${ats.missing.slice(0, 6).join(", ")}`);
  }

  if (grammar.issueCount > 3) {
    warnings.push(`${grammar.issueCount} grammar/formatting issues detected`);
  }

  return warnings;
}
