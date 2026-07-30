import express from "express";
import multer from "multer";
import fs from "fs/promises";
import { extractText } from "../parsing/extractText.js";
import { analyzeResume } from "../analysis/scoring.js";
import { PRESET_NAMES } from "../analysis/atsMatch.js";
import { matchTarget } from "../analysis/targetMatch.js";
import { TARGET_LIST } from "../data/targetPresets.js";
import { matchCustomJob } from "../analysis/customJobMatch.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

router.get("/presets", (req, res) => {
  res.json({ presets: PRESET_NAMES });
});

router.get("/targets", (req, res) => {
  res.json({ targets: TARGET_LIST });
});

function withTargetMatch(result, text, targetId) {
  if (!targetId) return result;
  try {
    const targetMatch = matchTarget(text, result.verbHeatmap, targetId);
    return { ...result, targetMatch };
  } catch (err) {
    return { ...result, targetMatchError: err.message };
  }
}

function withCustomJobMatch(result, text, jobDescription) {
  if (!jobDescription || !jobDescription.trim()) return result;
  try {
    const customJobMatch = matchCustomJob(text, jobDescription);
    return { ...result, customJobMatch };
  } catch (err) {
    return { ...result, customJobMatchError: err.message };
  }
}

router.post("/analyze", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded (expected field 'resume')" });
  }

  const preset = req.body.preset || PRESET_NAMES[0];
  const targetId = req.body.target || null;
  const jobDescription = req.body.jobDescription || null;

  try {
    const text = await extractText(req.file.path, req.file.originalname);
    let result = analyzeResume(text, preset);
    result = withTargetMatch(result, text, targetId);
    result = withCustomJobMatch(result, text, jobDescription);
    // Full text is returned so the frontend can pass it as context to the
    // Phase 2 AI chat/rewrite endpoints without re-uploading the file.
    res.json({
      ...result,
      extractedTextPreview: text.slice(0, 400),
      resumeText: text,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await fs.unlink(req.file.path).catch(() => {});
  }
});

// Accepts raw text directly (useful for testing / pasted resumes)
router.post("/analyze-text", express.json({ limit: "1mb" }), (req, res) => {
  const { text, preset, target, jobDescription } = req.body;
  if (!text || typeof text !== "string") {
    return res.status(400).json({ error: "Missing 'text' field" });
  }
  try {
    let result = analyzeResume(text, preset || PRESET_NAMES[0]);
    result = withTargetMatch(result, text, target);
    result = withCustomJobMatch(result, text, jobDescription);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
