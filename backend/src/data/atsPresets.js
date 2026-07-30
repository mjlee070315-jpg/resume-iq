// Hand-curated ATS keyword presets per job category (Phase 1: small preset list).
// Phase 3 will extend this with school/company-specific presets.

export const ATS_PRESETS = {
  "Software Engineer": [
    "git",
    "docker",
    "linux",
    "rest api",
    "sql",
    "ci/cd",
    "unit testing",
    "agile",
    "cloud",
    "python",
    "javascript",
    "java",
    "system design",
    "microservices",
  ],
  "Data Analyst": [
    "sql",
    "excel",
    "python",
    "tableau",
    "power bi",
    "data visualization",
    "statistics",
    "a/b testing",
    "etl",
    "dashboard",
  ],
  "Product Manager": [
    "roadmap",
    "stakeholder",
    "user research",
    "a/b testing",
    "kpi",
    "agile",
    "cross-functional",
    "prioritization",
    "go-to-market",
    "analytics",
  ],
  "Marketing": [
    "seo",
    "campaign",
    "google analytics",
    "content strategy",
    "social media",
    "brand",
    "conversion rate",
    "email marketing",
    "crm",
    "roi",
  ],
};

export const PRESET_NAMES = Object.keys(ATS_PRESETS);
