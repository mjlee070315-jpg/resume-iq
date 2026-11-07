import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import analyzeRouter from "./routes/analyze.js";
import aiRouter from "./routes/ai.js";

const app = express();
app.disable("x-powered-by");

const origins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(",") : true;
app.use(cors({ origin: origins }));

// Minimal in-memory rate limiter (per IP) so the AI endpoints can't be hammered.
const hits = new Map();
function rateLimit({ windowMs, max }) {
  return (req, res, next) => {
    const now = Date.now();
    const key = `${req.ip}:${req.baseUrl}`;
    const entry = hits.get(key)?.filter((t) => now - t < windowMs) ?? [];
    if (entry.length >= max) {
      return res.status(429).json({ error: "Too many requests. Please slow down." });
    }
    entry.push(now);
    hits.set(key, entry);
    next();
  };
}
setInterval(() => hits.clear(), 10 * 60 * 1000).unref();

app.use("/api/ai", rateLimit({ windowMs: 60_000, max: 30 }));
app.use("/api", rateLimit({ windowMs: 60_000, max: 120 }));
app.use("/api", analyzeRouter);
app.use("/api/ai", aiRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

// Serve the built frontend when present (single-service deploys).
const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/dist");
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(dist, "index.html")));
}

const PORT = process.env.PORT || 4000;
if (process.env.NODE_ENV !== "test" && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`ResumeIQ running on http://localhost:${PORT}`);
  });
}

export default app;
