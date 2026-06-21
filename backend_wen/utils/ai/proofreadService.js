const axios = require("axios");
const path = require("path");
const fs = require("fs");

const promptsPath = path.join(__dirname, "prompts.json");
const prompts = JSON.parse(fs.readFileSync(promptsPath, "utf8"));

function stripHtml(html = "") {
  return String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function truncateText(text, maxChars) {
  if (!text || text.length <= maxChars) return text;
  return text.slice(0, maxChars) + "\n[…truncated]";
}

function estimateMaxTokens(inputLength) {
  const cfg = prompts.proofread.maxOutputTokens || 4096;
  return Math.min(cfg, Math.max(512, Math.ceil(inputLength * 1.2)));
}

async function proofreadWithAI(rawContent) {
  const apiKey = process.env.AI_API_KEY;
  if (!apiKey) {
    throw new Error("AI_API_KEY is not configured in environment");
  }

  const model = process.env.AI_MODEL || "gpt-4o-mini";
  const baseURL = (process.env.AI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const cfg = prompts.proofread;
  const maxChars = cfg.maxInputChars || 12000;

  const plain = stripHtml(rawContent);
  const input = truncateText(plain, maxChars);
  const userMessage = cfg.userTemplate.replace("{{content}}", input);

  const response = await axios.post(
    `${baseURL}/chat/completions`,
    {
      model,
      messages: [
        { role: "system", content: cfg.system },
        { role: "user", content: userMessage },
      ],
      temperature: cfg.temperature ?? 0.2,
      max_tokens: estimateMaxTokens(input.length),
      response_format: { type: "json_object" },
    },
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      timeout: 120000,
    }
  );

  const raw = response.data?.choices?.[0]?.message?.content;
  if (!raw) {
    throw new Error("Empty response from AI provider");
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error("AI returned invalid JSON");
  }

  const correctedText = String(parsed.correctedText || "").trim();
  if (!correctedText) {
    throw new Error("AI response missing correctedText");
  }

  return {
    correctedText,
    summary: String(parsed.summary || "Proofread complete.").slice(0, 200),
    corrections: Array.isArray(parsed.corrections) ? parsed.corrections : [],
  };
}

module.exports = { proofreadWithAI, stripHtml, prompts };
