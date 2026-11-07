// Rule-based background profile: pulls education, GPA, employers, links and
// format basics out of the resume text. No AI. Used to ground target-specific
// advice (e.g. "no GPA listed" matters for a grad program, not a startup).

import { detectSections } from "./sectionDetector.js";

const SCHOOL_RE =
  /\b((?:[A-Z][A-Za-z.&'-]+\s+){0,4}(?:University|College|Institute of Technology|Institute|Polytechnic|School)(?:\s+of\s+[A-Z][A-Za-z&'-]+(?:\s+[A-Z][A-Za-z&'-]+){0,2})?)/g;
const DEGREE_RE =
  /\b(B\.?S\.?|B\.?A\.?|M\.?S\.?|M\.?A\.?|Ph\.?D\.?|MBA|Bachelor(?:'s)?(?:\s+of\s+\w+)?|Master(?:'s)?(?:\s+of\s+\w+)?|Doctor(?:ate)?)\b/g;
const GPA_RE = /\bGPA[:\s]*([0-4](?:\.\d{1,2})?)\s*(?:\/\s*([0-4](?:\.\d{1,2})?))?/i;

const KNOWN_EMPLOYERS = [
  "google", "meta", "facebook", "amazon", "apple", "microsoft", "netflix", "nvidia", "tesla",
  "stripe", "openai", "anthropic", "ibm", "intel", "oracle", "salesforce", "adobe", "uber",
  "airbnb", "goldman sachs", "morgan stanley", "jpmorgan", "mckinsey", "bcg", "bain", "deloitte",
  "samsung", "lg", "naver", "kakao", "coupang", "hyundai", "boeing", "lockheed martin",
  "caterpillar", "eli lilly", "cummins", "ge", "3m", "ford", "toyota",
];

function findEmployers(text) {
  const lower = text.toLowerCase();
  return KNOWN_EMPLOYERS.filter((e) => new RegExp(`\\b${e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(lower)).map(
    (e) => e.replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function analyzeBackground(text, target) {
  const { sections } = detectSections(text);
  const eduText = sections.EDUCATION?.found ? sections.EDUCATION.content : text.slice(0, 1500);

  const schools = [...new Set([...eduText.matchAll(SCHOOL_RE)].map((m) => m[1].trim()))].slice(0, 4);
  const degrees = [...new Set([...eduText.matchAll(DEGREE_RE)].map((m) => m[1]))].slice(0, 4);
  const gpaMatch = eduText.match(GPA_RE) || text.match(GPA_RE);
  const gpa = gpaMatch
    ? { value: parseFloat(gpaMatch[1]), scale: gpaMatch[2] ? parseFloat(gpaMatch[2]) : 4.0 }
    : null;
  const employers = findEmployers(text);

  const email = /[\w.+-]+@[\w-]+\.[\w.-]+/.test(text);
  const phone = /(\+?\d[\d\s().-]{8,}\d)/.test(text);
  const linkedin = /linkedin\.com\/in\//i.test(text);
  const github = /github\.com\/[\w-]+/i.test(text);
  const words = text.split(/\s+/).filter(Boolean).length;

  const hasResearch = /\b(research|laboratory|lab|publication|thesis|advisor|professor)\b/i.test(text);
  const hasInternship = /\b(intern|internship|co-?op)\b/i.test(text);
  const hasLeadership = /\b(president|captain|founder|co-?founder|lead|chair|officer|director)\b/i.test(text);

  const insights = [];
  const isSchool = target?.type === "school";
  const isCompany = target?.type === "company";

  if (!gpa && (isSchool || !target)) {
    insights.push("No GPA found. Admissions committees usually expect it unless it is weak; add it if 3.3+ (or the equivalent).");
  } else if (gpa && gpa.value / gpa.scale < 0.8 && isSchool) {
    insights.push("GPA is below the typical range for selective programs; offset it with research, projects, or an upward trend.");
  }
  if (isSchool && !hasResearch) {
    insights.push("No research or lab experience detected; most graduate programs weigh this heavily.");
  }
  if (isCompany && !hasInternship && employers.length === 0) {
    insights.push("No internships or recognizable employers detected; projects and open-source work can fill that gap.");
  }
  if (!hasLeadership) {
    insights.push("No leadership roles detected (president, lead, founder, captain, etc.).");
  }
  if (!github && !linkedin) {
    insights.push("No GitHub or LinkedIn link found; recruiters expect at least one.");
  }
  if (isCompany && employers.length > 0) {
    insights.push(`Recognizable employers detected (${employers.slice(0, 3).join(", ")}); put these prominently near the top.`);
  }

  return {
    education: { schools, degrees, gpa },
    employers,
    contact: { email, phone, linkedin, github },
    signals: { research: hasResearch, internship: hasInternship, leadership: hasLeadership },
    wordCount: words,
    insights,
  };
}

export function formatChecks(text) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const lines = text.split("\n");
  const longBullets = lines.filter((l) => /^[\s]*[•\-*●▪‣]\s+/.test(l) && l.split(/\s+/).length > 35).length;
  const checks = [];
  const add = (ok, label, detail) => checks.push({ ok, label, detail });

  add(/[\w.+-]+@[\w-]+\.[\w.-]+/.test(text), "Email address", "Recruiters need a way to reach you.");
  add(/(\+?\d[\d\s().-]{8,}\d)/.test(text), "Phone number", "Include a reachable phone number.");
  add(words >= 150 && words <= 900, "Length", `${words} words. Aim for roughly 300-700 for a one-page resume.`);
  add(longBullets === 0, "Bullet length", longBullets ? `${longBullets} bullets run longer than 35 words.` : "All bullets are concise.");
  add(!/\t{2,}/.test(text) && !/\|\s*\|/.test(text), "Layout parsing", "No table-like layout artifacts that confuse ATS parsers.");
  return checks;
}
