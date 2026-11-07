import { test, before, after } from "node:test";
import assert from "node:assert/strict";

process.env.NODE_ENV = "test";
const { default: app } = await import("../index.js");

const RESUME = `Jane Doe
jane@example.com | (555) 123-4567 | github.com/janedoe
Education
Purdue University
B.S. Industrial Engineering, GPA: 3.8/4.0
Experience
Software Intern, Google 2023 - 2024
- Built a data pipeline processing 2M records per day using Python and SQL
- Led a team of 4 engineers to cut latency by 35%
Skills
Python, SQL, Docker, Git, React, AWS`;

let server, base;
before(() => new Promise((r) => { server = app.listen(0, () => { base = `http://127.0.0.1:${server.address().port}`; r(); }); }));
after(() => server.close());

const post = (path, body) => fetch(base + path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

test("lists at least 20 targets across companies and schools", async () => {
  const { targets } = await (await fetch(base + "/api/targets")).json();
  assert.ok(targets.length >= 20);
  assert.ok(targets.some((t) => t.type === "school") && targets.some((t) => t.type === "company"));
});

test("analyze-text returns score, target match, background and format checks", async () => {
  const res = await post("/api/analyze-text", { text: RESUME, preset: "Software Engineer", target: "purdue-ie" });
  assert.equal(res.status, 200);
  const data = await res.json();
  assert.ok(data.overallScore > 0 && data.overallScore <= 100);
  assert.equal(data.targetMatch.target.id, "purdue-ie");
  assert.equal(data.background.education.gpa.value, 3.8);
  assert.ok(data.background.employers.includes("Google"));
  assert.ok(Array.isArray(data.formatChecks) && data.formatChecks.length > 0);
});

test("rejects missing text and unknown targets", async () => {
  assert.equal((await post("/api/analyze-text", {})).status, 400);
  const bad = await (await post("/api/analyze-text", { text: RESUME, preset: "Software Engineer", target: "nope" })).json();
  assert.ok(bad.targetMatchError);
});

test("AI routes return 501 without a key", async () => {
  delete process.env.OPENAI_API_KEY;
  const res = await post("/api/ai/custom-target", { name: "X", type: "school", resumeText: RESUME });
  assert.equal(res.status, 501);
});
