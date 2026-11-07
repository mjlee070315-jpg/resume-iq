import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

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

test("AI features work end-to-end through the Anthropic provider (mock server)", async () => {
  const replies = [
    { label: "Acme — Engineer", keywords: ["python", "sql", "testing"], emphasize: { Technical: 2, Leadership: 1, Management: 0.5, Communication: 0.5 }, focusAreas: ["a", "b", "c"] },
    { summary: "Solid fit.", strengths: ["Python"], gaps: ["Research"], nextSteps: ["Add a project"] },
  ];
  let calls = 0;
  const mock = http.createServer((req, res) => {
    req.resume();
    req.on("end", () => {
      const body = calls < replies.length ? JSON.stringify(replies[calls++]) : "```json\n{\"rewritten\":\"Built X\",\"rationale\":\"r\",\"alternatives\":[]}\n```";
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ content: [{ type: "text", text: body }] }));
    });
  });
  await new Promise((r) => mock.listen(0, r));
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${mock.address().port}`;
  process.env.ANTHROPIC_API_KEY = "test-key";
  try {
    const status = await (await fetch(base + "/api/ai/status")).json();
    assert.deepEqual(status, { configured: true, provider: "anthropic" });

    const res = await post("/api/ai/custom-target", { name: "Acme", type: "company", resumeText: RESUME, verbHeatmap: { Technical: 3, Leadership: 1 } });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.targetMatch.keywords.matched.length, 2);
    assert.ok(Math.abs(Object.values(data.targetMatch.emphasis.target).reduce((a, b) => a + b, 0) - 1) < 1e-6);
    assert.equal(data.insight.summary, "Solid fit.");

    const rw = await (await post("/api/ai/rewrite", { sentence: "Worked on the pipeline" })).json();
    assert.equal(rw.rewritten, "Built X");
  } finally {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_BASE_URL;
    mock.close();
  }
});

test("outlook returns a wide, capped range plus the fixed disclaimer", async () => {
  const reply = {
    band: "Strong", chanceLow: 97, chanceHigh: 99, confidence: "low", summary: "s",
    strengths: ["a"], risks: ["b"], unknowns: ["GPA"],
    plan: [{ timeframe: "Next 2 weeks", goal: "g", actions: ["x"] }],
    prepChecklist: ["SOP"], interviewPrep: ["Tell me about X"],
  };
  const mock = http.createServer((req, res) => {
    req.resume();
    req.on("end", () => {
      res.setHeader("content-type", "application/json");
      res.end(JSON.stringify({ content: [{ type: "text", text: JSON.stringify(reply) }] }));
    });
  });
  await new Promise((r) => mock.listen(0, r));
  process.env.ANTHROPIC_BASE_URL = `http://127.0.0.1:${mock.address().port}`;
  process.env.ANTHROPIC_API_KEY = "test-key";
  try {
    const res = await post("/api/ai/outlook", { resumeText: RESUME, targetId: "purdue-ie", analysis: { verbHeatmap: { Technical: 2 } } });
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.outlook.chanceHigh <= 90, "never above 90%");
    assert.ok(data.outlook.chanceHigh - data.outlook.chanceLow >= 15, "never a point estimate");
    assert.match(data.disclaimer, /not a prediction/i);
    assert.equal((await post("/api/ai/outlook", { resumeText: RESUME })).status, 400);
  } finally {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_BASE_URL;
    mock.close();
  }
});

test("company explorer lists 70+ companies and each one is usable as a target", async () => {
  const data = await (await fetch(base + "/api/companies")).json();
  assert.ok(data.companies.length >= 70);
  assert.ok(data.industries.length >= 8);
  assert.match(data.note, /not linkedin/i);
  const hit = await (await fetch(base + "/api/companies?q=cummins")).json();
  assert.equal(hit.companies[0].name, "Cummins");
  const { targets } = await (await fetch(base + "/api/targets")).json();
  const ids = new Set(targets.map((t) => t.id));
  for (const c of data.companies) assert.ok(ids.has(c.targetId), `${c.name} has no target preset`);
});
