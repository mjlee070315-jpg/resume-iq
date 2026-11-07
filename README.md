# ResumeIQ

AI-powered Resume & Statement Analyzer — Phase 1 + Phase 2 + Phase 3

ResumeIQ is not a "GPT wrapper." The core analysis pipeline — PDF/DOCX parsing, section
detection, rule-based scoring, weak-verb detection, passive-voice detection, quantified-
achievement detection, ATS keyword matching, and timeline extraction — is entirely
deterministic code with no AI calls. AI (Phase 2) is layered on top for sentence
rewriting and free-form chat, and every AI call is grounded in the Phase 1 rule-based
findings rather than re-deriving everything from scratch.

## Why this matters for the score

Every score returned by the API includes a `breakdown` array explaining exactly which
rule contributed how many points — nothing is a black box. See `backend/src/analysis/scoring.js`
for the full weighting logic and `Methodology` below for the reasoning behind it.


## What's new in v2

- **22 company and school presets** (Google, Apple, Microsoft, Netflix, NVIDIA, Tesla, Goldman, McKinsey, Stripe, MIT, Stanford, CMU, Berkeley, Georgia Tech, UIUC, Cornell, Michigan, Caltech, Purdue IE/Engineering, and more).
- **Background profile** (`analysis/backgroundAnalysis.js`): rule-based extraction of schools, degrees, GPA, recognizable employers, research/internship/leadership signals, contact links, plus target-aware advice (for example, a missing GPA matters for grad programs).
- **Format checks**: email/phone, length, overly long bullets, ATS-hostile layout.
- **Any company or school, on demand** (`ai/targetAnalysis.js`, `POST /api/ai/custom-target`): AI drafts the evaluation criteria for any name you type, the deterministic matcher scores your resume against them, and AI writes a grounded background-fit review (strengths, gaps, next steps).
- **New UI**: English interface, dark/light theme, drag-and-drop upload, paste-text mode, responsive layout, print/PDF and JSON export.
- **Quality and deploy**: API tests (`npm run test:api`), GitHub Actions CI, rate limiting, upload validation, and a single-service `Dockerfile` (backend serves the built frontend).

```bash
# one-service deploy
docker build -t resumeiq . && docker run -p 8080:8080 -e OPENAI_API_KEY=sk-... resumeiq
```

## Project structure

```
resumeiq/
  backend/            Node.js + Express API
    src/
      parsing/         PDF/DOCX -> text (pdf-parse, mammoth)
      analysis/         section detection, scoring, verb/grammar/quant analysis,
                         ATS matching, timeline extraction, target (school/company)
                         matching — all rule-based, no AI
      ai/               OpenAI integration (Phase 2 only) — rewriteBullet, chatAboutResume,
                         checkGrammarAi
      data/              hand-curated verb, ATS keyword, target preset, and skill dictionary
                         reference data
      routes/           /api/analyze, /api/analyze-text, /api/presets, /api/targets, /api/ai/*
      test/             runSample.js (2 hand-written resumes) + calibration.js
                         (5-tier weak-to-strong monotonicity check)
  frontend/            React + TypeScript + Tailwind + Recharts dashboard (Vite)
    src/components/    ScoreGauge, CategoryScores, ScoreRadar, Timeline, VerbHeatmap,
                        SectionBreakdown, AtsPanel, TargetPanel, CustomJobPanel,
                        WeakVerbSuggestions (AI rewrite), GrammarPanel (AI grammar check),
                        ChatPanel (Ask AI)
```

## Running it

```bash
# Terminal 1 — backend (port 4000)
cd backend
npm install
cp .env.example .env     # optional — only needed for Phase 2 AI features
npm start

# Terminal 2 — frontend (port 5173, proxies /api to :4000)
cd frontend
npm install
npm run dev
```

Open http://localhost:5173, upload a PDF/DOCX/TXT resume, pick a target job preset, and
click "분석하기" (Analyze).

### Enabling Phase 2 AI features

The rule-based dashboard (scores, warnings, heatmap, radar, timeline, ATS match) works
with zero configuration. To enable **AI Rewrite** (per-bullet rewriting) and **Ask AI**
(chat sidebar), add your OpenAI key:

```bash
cd backend
cp .env.example .env
# edit .env and set OPENAI_API_KEY=sk-...
npm start
```

Without a key, `/api/ai/*` routes respond with `501` and the UI shows an inline message
telling the user AI isn't configured — the rest of the app is unaffected.

### Quick backend-only tests (no UI needed)

```bash
cd backend
npm test               # runSample.js — 2 hand-written resumes, prints full breakdown
npm run test:calibration  # calibration.js — 5-tier weak→strong monotonicity check
npm run test:all       # both
```

`test:calibration` is the more important one for trusting the rubric: it runs 5 resumes
deliberately spanning very-weak to very-strong and asserts the overall score increases at
every step. Current output:

```
Tier         Overall  ATS  Leadership Technical Writing Grammar Projects
VERY WEAK      36.3    0          0       38      80     100        0
WEAK           45.7    7          0       44      67     100       57
MEDIUM         65.1   43          0       88      84     100       77
STRONG         84.7   57         77      100      91     100       84
VERY STRONG      88   64         80      100      94     100       90

✓ Overall scores are strictly increasing across all 5 tiers.
```

Note the STRONG → VERY STRONG gap is intentionally small (84.7 → 88): several components
(entry-count adequacy, skill-count adequacy) are deliberately capped so an already-strong
resume can't keep gaining unlimited points from stacking on more of the same signal. This is
a real trade-off worth knowing about, not a bug — see Methodology for where the caps are.

## Methodology (rule-based scoring)

Each of Experience / Projects / Leadership is scored out of 20 points:

| Component | Points | Signal |
|---|---|---|
| Section exists | 5 | Section was detected at all |
| Entry count adequacy | 4 | `min(entries, 3) / 3 * 4` — rewards 3+ distinct roles/entries |
| Bullet richness | 4 | `min(avg bullets per entry, 2) / 2 * 4` — rewards enough detail per entry |
| Quantified achievements | 4 | Share of bullets containing numbers/%/$ within that section |
| Strong verb usage | 3 | `(1 - weak/overused verb ratio) * 3` |

Skills is scored out of 20 as `5 (exists) + min(keywords, 12) / 12 * 15`.

Dashboard categories (0-100 each) are derived from these:
- **ATS** — % of the selected job preset's keywords found in the resume
- **Leadership / Projects** — the section score above, rescaled to 0-100
- **Technical** — the Skills section score, rescaled to 0-100
- **Writing** — `(1 - passive ratio) * 40 + (1 - weak verb ratio) * 40 + quantified ratio * 20`
- **Grammar** — a lightweight heuristic (capitalization, spacing, tense consistency); the
  "AI로 문법 검사" button in the dashboard layers an AI grammar check on top (see below)

**Known limitation:** the weights above are reasoned defaults verified against 7 hand-written
resumes (2 in `runSample.js`, 5 in `calibration.js`) spanning very-weak to very-strong — they
are NOT yet calibrated against real-world outcome data (e.g. resumes that did/didn't get
interviews). Before treating scores as authoritative for real decisions, feed in real sample
resumes with known outcomes via `/api/analyze-text` and check whether the rubric still
separates them the way it separates the hand-written test tiers.

## What Phase 2 added

- **Timeline** (`analysis/timelineBuilder.js`) — scans Experience/Projects/Activities for
  date-range lines (handles "2022 - 2024", "May 2023 - Aug 2023", "Jan 2023 - Present", etc.)
  and pairs each with its nearest title line, merged and sorted chronologically. Still 100%
  rule-based; date-range regex is shared with section entry counting via `analysis/dateUtils.js`.
- **Radar chart** (`ScoreRadar.tsx`) — visualizes the 6 category scores.
- **AI Rewrite** (`ai/rewrite.js`, wired into `WeakVerbSuggestions.tsx`) — for each bullet the
  rule-based weak-verb detector already flagged, the user can request an AI rewrite. The prompt
  is seeded with the flagged term and the rule-based suggested replacements, so GPT is polishing
  a rule-based finding, not analyzing from a blank slate. Uses OpenAI's structured output
  (`response_format: json_schema`) to guarantee a parseable `{rewritten, rationale, alternatives}` shape.
- **Ask AI chat** (`ai/chat.js`, `ChatPanel.tsx`) — free-form Q&A grounded in a compact summary
  of the Phase 1 analysis (scores, warnings, missing ATS keywords) injected into the system
  prompt, plus the resume text itself. If a Phase 3 target is selected, its fit score and
  missing keywords are included too, so "How would MIT evaluate this?" gets a grounded answer.

## What Phase 3 added

- **Target presets** (`data/targetPresets.js`) — 6 hand-curated presets: Google/Meta/Amazon SWE
  (companies) and MIT EECS/Purdue Engineering/Stanford CS (schools). Each preset has its own
  keyword list plus an "emphasize" weighting over the same 4 verb categories used by the Action
  Verb Heatmap (Leadership/Technical/Communication/Management). Deliberately narrow and static —
  no live job-posting or admissions-page crawling, per the roadmap's "start small" guidance.
- **Target matching** (`analysis/targetMatch.js`) — reuses the same keyword-matching mechanism
  as the Phase 1 ATS matcher, plus a rule-based "emphasis alignment" score: it compares the
  resume's actual verb-category distribution (from the heatmap) against the target's expected
  distribution using total-variation distance, and flags the single most under-represented
  category. `fitScore = keywordMatchRatio * 60 + emphasisAlignment * 40`. Still 100% rule-based.
- **TargetPanel** (`TargetPanel.tsx`) — shown when a target is selected in the upload panel;
  displays fit score, matched/missing keywords, an emphasis bar chart (actual vs. target
  weighting per category), and a recommendations list combining missing keywords, the weakest
  emphasis category, and the preset's hand-written focus areas.

Try it: pick "Google — Software Engineer" from the target dropdown before analyzing — a resume
heavy on Leadership bullets but light on distributed-systems keywords will score a low fit and
the weakest-category flag will point at Technical, while an MIT EECS target on the same resume
will weight Communication/Leadership more heavily and flag differently.

### Custom job description matching (beyond fixed presets)

The 6 target presets above are static and hand-curated. For anything else, the upload panel has
a "+ 채용공고 직접 붙여넣기" toggle — paste any job posting text and the backend
(`analysis/customJobMatch.js`) scans it against a ~90-term skill dictionary
(`data/skillDictionary.js`, spanning languages/frameworks/cloud/data/product/marketing/soft
skills) to figure out, per-posting, which terms are actually relevant, ranked by how often they
appear in that specific JD. Those extracted terms are then matched against the resume the same
way the fixed ATS presets are — same mechanism, dynamic input instead of a fixed list. Result
shows up as `customJobMatch` in the API response / a `CustomJobPanel` in the dashboard, and can
run alongside a fixed target preset in the same request.

### AI-assisted grammar check (beyond the rule-based heuristic)

The rule-based `Grammar` score only catches capitalization, spacing, and coarse tense-mixing —
things regex can reliably detect. The "AI로 문법 검사" button (`ai/grammarAi.js`, `GrammarPanel.tsx`)
asks GPT to find what the heuristic structurally can't: subject-verb agreement, article/preposition
misuse, parallelism across bullets in the same role, and awkward phrasing — using structured output
so results render as a clean list of `{original, corrected, issueType, explanation}`. The rule-based
result is passed in as context so the AI check complements rather than re-flags the same coarse
tense-mix signal.

## Roadmap

- **Phase 1 (done):** parsing, section detection, rule-based scoring, weak-verb/passive/quant
  detection, ATS keyword matching, minimal dashboard — all AI-free.
- **Phase 2 (done):** OpenAI-backed sentence rewriting, Radar chart, Timeline, an AI chat panel,
  and an AI-assisted grammar check layered on top of the rule-based heuristic.
- **Phase 3 (done):** School/company-specific presets (Google/Meta/Amazon SWE, MIT/Purdue/Stanford)
  with emphasis-alignment scoring, plus dynamic custom-job-description matching for anything
  outside the fixed preset list.
- **Calibration (done):** a 5-tier weak→strong test corpus (`test:calibration`) verifying the
  scoring rubric produces monotonically increasing scores; see Methodology for the one known
  caveat (score compression at the top end due to intentional per-component caps).
- **What's still open:** none of the above weight/keyword choices have been validated against
  real-world hiring outcomes — that would be the natural next step before treating any score as
  more than a directional signal.

## Tech stack

- Frontend: React, TypeScript, Tailwind CSS v4, Recharts
- Backend: Node.js, Express
- Parsing: pdf-parse, mammoth
- AI: OpenAI API (`openai` npm package), Structured Outputs for the rewrite endpoint
