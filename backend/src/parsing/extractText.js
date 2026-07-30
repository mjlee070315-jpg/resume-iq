import fs from "fs/promises";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import mammoth from "mammoth";

/**
 * Extracts raw text from an uploaded resume file (PDF or DOCX).
 * This is pure parsing — no AI involved.
 */
export async function extractText(filePath, originalName) {
  const ext = originalName.split(".").pop().toLowerCase();
  const buffer = await fs.readFile(filePath);

  if (ext === "pdf") {
    const data = await pdfParse(buffer);
    return normalize(data.text);
  }

  if (ext === "docx") {
    const { value } = await mammoth.extractRawText({ buffer });
    return normalize(value);
  }

  if (ext === "txt") {
    return normalize(buffer.toString("utf-8"));
  }

  throw new Error(`Unsupported file type: .${ext}`);
}

function normalize(rawText) {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/ /g, " ") // non-breaking spaces (common in PDF extraction)
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
