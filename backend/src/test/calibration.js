import { analyzeResume } from "../analysis/scoring.js";

/**
 * Calibration harness: five hand-written resumes spanning very-weak to
 * very-strong, each deliberately varying the exact signals scoring.js
 * measures (section presence, entry counts, bullet richness, quantified
 * achievements, weak-verb ratio, ATS keyword coverage, skill count).
 *
 * This does NOT prove the weights are "correct" in any absolute sense —
 * that requires real resumes with known outcomes (see README). What it
 * does verify is the more basic, necessary property: the rubric actually
 * separates resumes that most people would agree are better vs. worse,
 * and does so monotonically. If this test fails, the weights are broken
 * in an obvious way (e.g. a worse resume outscoring a better one).
 */

const TIERS = [
  {
    name: "VERY WEAK",
    text: `
EXPERIENCE
Store Associate, Local Shop
2023
- Did tasks assigned by manager
- Helped customers

SKILLS
Communication, Teamwork
`,
  },
  {
    name: "WEAK",
    text: `
EXPERIENCE
Intern, Small Startup
Jun 2024 - Aug 2024
- Worked on the website
- Helped with testing

PROJECTS
School Project
2023
- Made a small app

SKILLS
Python, HTML, CSS
`,
  },
  {
    name: "MEDIUM",
    text: `
EXPERIENCE
Software Engineering Intern, Acme Corp
Jun 2024 - Aug 2024
- Built a React dashboard used by 2,000+ internal users
- Optimized database queries, reducing latency by 42%
- Worked on the payments team

PROJECTS
Campus Marketplace App
2023
- Designed and developed a full-stack marketplace app serving 500+ students
- Implemented authentication using OAuth2

SKILLS
Python, JavaScript, TypeScript, React, Node.js, SQL, Git, Docker, Linux, AWS

ACTIVITIES
`,
  },
  {
    name: "STRONG",
    text: `
EXPERIENCE
Software Engineer Intern, Google
May 2023 - Aug 2023
- Architected a microservice handling 1M+ daily requests
- Reduced API latency by 35% through query optimization
- Led a team of 3 interns to deliver a new internal tool

Teaching Assistant, MIT 6.006
Sep 2022 - Dec 2022
- Directed weekly recitations for 40+ students
- Automated grading pipeline, cutting grading time by 60%

PROJECTS
Distributed Cache System
2023
- Engineered a distributed LRU cache in Go, achieving 99.9% uptime
- Deployed on Kubernetes with automated CI/CD via GitHub Actions

Personal Finance Tracker
2022
- Built a full-stack app used by 300+ beta users
- Implemented REST API with Node.js and PostgreSQL

SKILLS
Python, Go, JavaScript, TypeScript, React, Docker, Kubernetes, Linux, SQL, Git, REST API, AWS

ACTIVITIES
President, MIT Robotics Club
2022 - 2024
- Managed a 20-person club budget and coordinated 5 competitions
- Mentored 10+ underclassmen in robotics fundamentals
`,
  },
  {
    name: "VERY STRONG",
    text: `
EXPERIENCE
Senior Software Engineer Intern, Google
May 2023 - Aug 2023
- Architected a distributed microservice handling 1M+ daily requests with 99.99% uptime
- Reduced API latency by 35% through query optimization and caching
- Led a team of 3 interns to deliver a new internal tool, presented to VP-level stakeholders
- Implemented CI/CD pipeline, cutting deployment time by 50%

Teaching Assistant, MIT 6.006
Sep 2022 - Dec 2022
- Directed weekly recitations for 40+ students, achieving 95% satisfaction rating
- Automated grading pipeline using Python scripts, cutting grading time by 60%
- Mentored 5 students individually on algorithm design

Research Assistant, MIT CSAIL
Jan 2022 - May 2022
- Co-authored a paper accepted at a top-tier systems conference
- Built a distributed testing framework used by 3 research groups

PROJECTS
Distributed Cache System
2023
- Engineered a distributed LRU cache in Go, achieving 99.9% uptime and 40% cost reduction
- Deployed on Kubernetes with automated CI/CD via GitHub Actions
- Open-sourced with 200+ GitHub stars

Personal Finance Tracker
2022
- Built a full-stack app used by 300+ beta users, generating $5k in early revenue
- Implemented REST API with Node.js and PostgreSQL, achieving sub-100ms response times

SKILLS
Python, Go, JavaScript, TypeScript, React, Docker, Kubernetes, Linux, SQL, Git, REST API, AWS, CI/CD, System Design, Algorithms

ACTIVITIES
President, MIT Robotics Club
2022 - 2024
- Managed a 20-person club budget and coordinated 5 competitions, winning 2 regional titles
- Mentored 10+ underclassmen in robotics fundamentals
- Organized a hackathon with 150+ participants
`,
  },
];

function run() {
  const rows = TIERS.map(({ name, text }) => {
    const result = analyzeResume(text, "Software Engineer");
    return { name, overall: result.overallScore, categories: result.categoryScores };
  });

  console.log("Tier         Overall  ATS  Leadership Technical Writing Grammar Projects");
  rows.forEach((r) => {
    console.log(
      `${r.name.padEnd(12)} ${String(r.overall).padStart(6)}  ${String(
        Math.round(r.categories.ATS)
      ).padStart(3)}  ${String(Math.round(r.categories.Leadership)).padStart(9)} ${String(
        Math.round(r.categories.Technical)
      ).padStart(8)}  ${String(Math.round(r.categories.Writing)).padStart(6)}  ${String(
        Math.round(r.categories.Grammar)
      ).padStart(6)}  ${String(Math.round(r.categories.Projects)).padStart(7)}`
    );
  });

  let monotonic = true;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].overall <= rows[i - 1].overall) {
      monotonic = false;
      console.log(
        `\n⚠ NOT MONOTONIC: "${rows[i - 1].name}" (${rows[i - 1].overall}) >= "${rows[i].name}" (${rows[i].overall})`
      );
    }
  }

  if (monotonic) {
    console.log("\n✓ Overall scores are strictly increasing across all 5 tiers.");
  } else {
    console.log("\n✗ Calibration check FAILED — see warnings above.");
    process.exitCode = 1;
  }
}

run();
