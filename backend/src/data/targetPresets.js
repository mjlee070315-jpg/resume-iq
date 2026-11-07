// Phase 3: hand-curated school/company presets. Deliberately small (per the
// roadmap) — each preset pairs keyword matching (reusing the same mechanism
// as the Phase 1 ATS matcher) with "emphasis" weights over the same verb
// categories already computed for the Action Verb Heatmap. No crawling or
// live job-posting scraping here; that's a possible future extension, not
// this phase.

import { EXTRA_PRESETS } from "./extraPresets.js";

const BASE_PRESETS = {
  "google-swe": {
    id: "google-swe",
    label: "Google — Software Engineer",
    type: "company",
    keywords: [
      "algorithms",
      "data structures",
      "distributed systems",
      "scalability",
      "system design",
      "kubernetes",
      "google cloud",
      "c++",
      "python",
      "go",
      "testing",
      "code review",
    ],
    emphasize: { Technical: 0.5, Leadership: 0.2, Management: 0.1, Communication: 0.2 },
    focusAreas: [
      "Strong signal on data structures/algorithms and large-scale system design",
      "Evidence of shipping to production at scale (users, QPS, latency)",
      "Collaboration/code review experience, not just solo projects",
    ],
  },
  "meta-swe": {
    id: "meta-swe",
    label: "Meta — Software Engineer",
    type: "company",
    keywords: [
      "react",
      "graphql",
      "distributed systems",
      "a/b testing",
      "scalability",
      "python",
      "javascript",
      "mobile",
      "infrastructure",
      "performance optimization",
    ],
    emphasize: { Technical: 0.45, Leadership: 0.15, Management: 0.1, Communication: 0.3 },
    focusAreas: [
      "Product-facing impact (user-facing features, experimentation/A-B testing)",
      "Fast iteration and measurable product metrics",
      "Cross-functional communication with product/design",
    ],
  },
  "amazon-swe": {
    id: "amazon-swe",
    label: "Amazon — Software Engineer",
    type: "company",
    keywords: [
      "aws",
      "microservices",
      "distributed systems",
      "java",
      "python",
      "ci/cd",
      "scalability",
      "cost optimization",
      "operational excellence",
      "on-call",
    ],
    emphasize: { Technical: 0.4, Leadership: 0.25, Management: 0.2, Communication: 0.15 },
    focusAreas: [
      "Ownership language (owned, drove, delivered end-to-end)",
      "Operational maturity — monitoring, on-call, incident response",
      "Cost/efficiency-oriented quantified impact",
    ],
  },
  "mit-eecs": {
    id: "mit-eecs",
    label: "MIT — EECS Graduate Program",
    type: "school",
    keywords: [
      "research",
      "publication",
      "thesis",
      "algorithms",
      "machine learning",
      "systems",
      "teaching assistant",
      "conference",
      "advisor",
      "lab",
    ],
    emphasize: { Technical: 0.35, Leadership: 0.25, Communication: 0.3, Management: 0.1 },
    focusAreas: [
      "Depth over breadth — sustained work with a single research group/advisor reads stronger than many unrelated projects",
      "Evidence of independent research contribution (publications, novel methods, thesis-scale projects)",
      "Teaching/mentorship experience (TA-ing, mentoring undergrads)",
    ],
  },
  "purdue-engineering": {
    id: "purdue-engineering",
    label: "Purdue — Engineering (Undergrad/Grad)",
    type: "school",
    keywords: [
      "design project",
      "capstone",
      "matlab",
      "cad",
      "engineering design",
      "teamwork",
      "internship",
      "research",
      "leadership",
    ],
    emphasize: { Technical: 0.4, Leadership: 0.3, Communication: 0.2, Management: 0.1 },
    focusAreas: [
      "Hands-on design/build projects (capstone, competition teams) over purely theoretical coursework",
      "Team-based engineering experience",
      "Clear progression of technical responsibility over time",
    ],
  },
  "stanford-cs": {
    id: "stanford-cs",
    label: "Stanford — Computer Science",
    type: "school",
    keywords: [
      "research",
      "startup",
      "machine learning",
      "systems",
      "publication",
      "open source",
      "hackathon",
      "founder",
      "product",
    ],
    emphasize: { Technical: 0.35, Leadership: 0.3, Communication: 0.25, Management: 0.1 },
    focusAreas: [
      "Initiative and self-directed projects (founding something, open source, hackathons) read well here",
      "Breadth across research and product/entrepreneurial experience is valued more than pure research depth",
      "Clear narrative connecting past projects to stated interests",
    ],
  },
};

export const TARGET_PRESETS = { ...BASE_PRESETS, ...EXTRA_PRESETS };

export const TARGET_LIST = Object.values(TARGET_PRESETS).map(
  ({ id, label, type }) => ({ id, label, type })
);
