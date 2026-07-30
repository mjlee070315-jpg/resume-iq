// Broad reference dictionary used ONLY for Phase 3's "custom job description"
// feature: since a pasted job posting can be about anything, we can't rely on
// fixed per-role presets (data/atsPresets.js, data/targetPresets.js). Instead
// we scan the pasted JD text against this dictionary to figure out, per
// posting, which terms are actually relevant — then match those against the
// resume. Still 100% rule-based (keyword presence), no AI involved.

export const SKILL_DICTIONARY = [
  // languages
  "python", "javascript", "typescript", "java", "c++", "c#", "go", "rust", "swift",
  "kotlin", "ruby", "php", "scala", "r", "matlab", "sql", "html", "css",
  // frameworks / libraries
  "react", "vue", "angular", "node.js", "express", "django", "flask", "spring",
  "next.js", "graphql", "rest api", "tensorflow", "pytorch", "pandas", "numpy",
  // cloud / devops / infra
  "aws", "azure", "gcp", "google cloud", "docker", "kubernetes", "terraform",
  "ci/cd", "jenkins", "github actions", "linux", "microservices",
  "distributed systems", "system design", "scalability",
  // data
  "data analysis", "data visualization", "machine learning", "deep learning",
  "nlp", "computer vision", "etl", "tableau", "power bi", "excel", "statistics",
  "a/b testing", "big data", "spark", "hadoop",
  // product / business
  "product management", "roadmap", "stakeholder management", "kpi", "agile",
  "scrum", "go-to-market", "market research", "user research", "analytics",
  "project management", "cross-functional collaboration",
  // marketing / design
  "seo", "sem", "google analytics", "content strategy", "social media",
  "brand management", "email marketing", "crm", "figma", "adobe creative suite",
  "ui/ux", "copywriting",
  // general professional / soft skills
  "leadership", "communication", "public speaking", "mentoring", "negotiation",
  "problem solving", "teamwork", "time management", "presentation skills",
  // testing / quality
  "unit testing", "test automation", "quality assurance", "debugging", "code review",
];
