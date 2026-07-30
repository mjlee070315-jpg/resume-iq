import { analyzeResume } from "../analysis/scoring.js";

const SAMPLE_RESUME = `
Jane Doe
jane.doe@email.com | (555) 123-4567 | linkedin.com/in/janedoe

EDUCATION
Purdue University, B.S. in Computer Science
2021 - 2025

EXPERIENCE
Software Engineering Intern, Acme Corp
Jun 2024 - Aug 2024
- Built a React dashboard used by 2,000+ internal users
- Optimized database queries, reducing latency by 42%
- Worked on the payments team

Research Assistant, Purdue HCI Lab
Jan 2024 - May 2024
- Helped with data collection for a user study
- Was responsible for writing weekly reports

PROJECTS
Campus Marketplace App
2023
- Designed and developed a full-stack marketplace app serving 500+ students
- Implemented authentication using OAuth2

SKILLS
Python, JavaScript, TypeScript, React, Node.js, SQL, Git, Docker, Linux, AWS

ACTIVITIES
`;

const GOOD_RESUME = `
John Smith
john.smith@email.com

EDUCATION
MIT, B.S. Electrical Engineering & Computer Science
2020 - 2024

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
`;

function printReport(label, text) {
  console.log(`\n${"=".repeat(60)}\n${label}\n${"=".repeat(60)}`);
  const result = analyzeResume(text, "Software Engineer");

  console.log(`Overall Score: ${result.overallScore}`);
  console.log("Category Scores:", result.categoryScores);
  console.log("Section Counts:", result.sectionCounts);
  console.log(
    "Section Scores:",
    Object.fromEntries(
      Object.entries(result.sectionScores).map(([k, v]) => [k, `${v.score}/${v.max}`])
    )
  );
  console.log("Verb Heatmap:", result.verbHeatmap);
  console.log(`Weak verbs flagged: ${result.weakVerbs.weakCount + result.weakVerbs.overusedCount}/${result.weakVerbs.totalBullets}`);
  console.log(`Passive sentences: ${result.passiveVoice.passiveCount}/${result.passiveVoice.totalBullets}`);
  console.log(`Quantified achievements: ${result.quantification.quantifiedCount}/${result.quantification.totalBullets}`);
  console.log(`ATS matched (${result.ats.preset}):`, result.ats.matched);
  console.log(`ATS missing:`, result.ats.missing);
  console.log("Warnings:");
  result.warnings.forEach((w) => console.log(`  - ${w}`));
}

printReport("WEAKER SAMPLE RESUME", SAMPLE_RESUME);
printReport("STRONGER SAMPLE RESUME", GOOD_RESUME);
