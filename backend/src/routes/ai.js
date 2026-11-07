import express from "express";
import { isAiConfigured, activeProvider } from "../ai/llm.js";
import { rewriteBullet } from "../ai/rewrite.js";
import { chatAboutResume } from "../ai/chat.js";
import { checkGrammarAi } from "../ai/grammarAi.js";
import { generateTargetProfile, analyzeBackgroundFit } from "../ai/targetAnalysis.js";
import { generateOutlook, OUTLOOK_DISCLAIMER } from "../ai/outlook.js";
import { TARGET_PRESETS } from "../data/targetPresets.js";
import { matchTarget } from "../analysis/targetMatch.js";
import { analyzeBackground } from "../analysis/backgroundAnalysis.js";

const router = express.Router();
router.use(express.json({ limit: "2mb" }));

router.get("/status", (req, res) => {
  res.json({ configured: isAiConfigured(), provider: activeProvider() });
});

function requireAiConfigured(req, res, next) {
  if (!isAiConfigured()) {
    return res.status(501).json({
      error:
        "No AI key configured on the server. Set ANTHROPIC_API_KEY or OPENAI_API_KEY in backend/.env to enable AI features.",
    });
  }
  next();
}

router.post("/rewrite", requireAiConfigured, async (req, res) => {
  const { sentence, flaggedTerm, suggestions, sectionLabel } = req.body;
  if (!sentence) {
    return res.status(400).json({ error: "Missing 'sentence'" });
  }
  try {
    const result = await rewriteBullet({
      sentence,
      flaggedTerm: flaggedTerm || "weak verb",
      suggestions: suggestions?.length ? suggestions : ["Built", "Led", "Implemented"],
      sectionLabel: sectionLabel || "Experience",
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/grammar-check", requireAiConfigured, async (req, res) => {
  const { text, ruleBasedGrammar } = req.body;
  if (!text) {
    return res.status(400).json({ error: "Missing 'text'" });
  }
  try {
    const result = await checkGrammarAi({ text, ruleBasedGrammar });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/chat", requireAiConfigured, async (req, res) => {
  const { question, resumeText, analysis, history } = req.body;
  if (!question || !resumeText) {
    return res.status(400).json({ error: "Missing 'question' or 'resumeText'" });
  }
  try {
    const answer = await chatAboutResume({ question, resumeText, analysis, history });
    res.json({ answer });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/custom-target", requireAiConfigured, async (req, res) => {
  const { name, type, jobTitle, resumeText, verbHeatmap } = req.body;
  if (!name || !resumeText || !["company", "school"].includes(type)) {
    return res.status(400).json({ error: "Need 'name', 'type' (company|school) and 'resumeText'" });
  }
  try {
    const preset = await generateTargetProfile({ name: String(name).slice(0, 120), type, jobTitle });
    const targetMatch = matchTarget(resumeText, verbHeatmap || {}, preset);
    const background = analyzeBackground(resumeText, preset);
    const insight = await analyzeBackgroundFit({ resumeText, background, targetMatch });
    res.json({ targetMatch, background, insight });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/outlook", requireAiConfigured, async (req, res) => {
  const { resumeText, analysis, targetId, name, type, jobTitle } = req.body;
  if (!resumeText) return res.status(400).json({ error: "Missing 'resumeText'" });
  try {
    let preset;
    if (targetId) {
      preset = TARGET_PRESETS[targetId];
      if (!preset) return res.status(400).json({ error: `Unknown target: "${targetId}"` });
    } else if (name && ["company", "school"].includes(type)) {
      preset = await generateTargetProfile({ name: String(name).slice(0, 120), type, jobTitle });
    } else {
      return res.status(400).json({ error: "Provide 'targetId' or 'name' + 'type' (company|school)" });
    }
    const targetMatch = matchTarget(resumeText, analysis?.verbHeatmap || {}, preset);
    const background = analyzeBackground(resumeText, preset);
    const outlook = await generateOutlook({ resumeText, analysis, background, targetMatch });
    res.json({ targetMatch, background, outlook, disclaimer: OUTLOOK_DISCLAIMER });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
