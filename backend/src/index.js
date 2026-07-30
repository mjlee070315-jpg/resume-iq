import "dotenv/config";
import express from "express";
import cors from "cors";
import analyzeRouter from "./routes/analyze.js";
import aiRouter from "./routes/ai.js";

const app = express();
app.use(cors());
app.use("/api", analyzeRouter);
app.use("/api/ai", aiRouter);

app.get("/api/health", (req, res) => res.json({ ok: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`ResumeIQ backend running on http://localhost:${PORT}`);
});
