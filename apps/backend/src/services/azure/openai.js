const axios = require("axios");

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const DEFAULT_SYSTEM_PROMPT =
  "You are Swasthya, a warm and empathetic voice assistant for mental wellbeing support. " +
  "Respond like a caring friend — acknowledge feelings, ask thoughtful follow-up questions, and offer gentle suggestions. " +
  "Keep responses to 2-3 conversational sentences. Be genuine and human-like, not robotic. " +
  "Do NOT include bullet points, numbered lists, asterisks, or formatting. " +
  "Avoid clinical diagnosis. If the caller mentions self-harm or danger, " +
  "gently encourage them to contact emergency services or a trusted person. " +
  "Output ONLY your spoken reply, nothing else.";

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class GeminiService {
  buildContents(userText, history = [], systemPrompt = DEFAULT_SYSTEM_PROMPT) {
    const normalizedHistory = Array.isArray(history)
      ? history.filter(
          (msg) =>
            msg &&
            (msg.role === "user" || msg.role === "assistant") &&
            typeof msg.content === "string" &&
            msg.content.trim().length > 0,
        )
      : [];

    // Gemini uses "user" and "model" roles (not "assistant")
    // Gemma models don't support systemInstruction, so prepend as first user turn
    const contents = [
      { role: "user", parts: [{ text: `[System Instructions]: ${systemPrompt}` }] },
      { role: "model", parts: [{ text: "Understood. I will follow these instructions." }] },
    ];

    for (const msg of normalizedHistory) {
      contents.push({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.content }],
      });
    }

    contents.push({
      role: "user",
      parts: [{ text: userText }],
    });

    return contents;
  }

  getApiKey() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("Missing GEMINI_API_KEY environment variable.");
    }
    return apiKey;
  }

  async requestCompletion(contents, options = {}) {
    const apiKey = this.getApiKey();

    const payload = {
      contents,
      generationConfig: {
        temperature: options.temperature ?? 0.5,
        maxOutputTokens: options.maxTokens ?? 250,
        thinkingConfig: { thinkingBudget: 0 },
      },
    };

    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Gemini retry attempt ${attempt}/${MAX_RETRIES}`);
          await sleep(RETRY_DELAY_MS * attempt);
        }

        const response = await axios.post(
          `${GEMINI_API_URL}?key=${apiKey}`,
          payload,
          {
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
          },
        );

        // Extract the actual text part (skip any thought parts)
        const parts = response?.data?.candidates?.[0]?.content?.parts || [];
        const textPart = parts.filter((p) => p.text && !p.thought).pop();
        const rawText = textPart?.text;
        if (!rawText) {
          throw new Error("Gemini returned an empty response.");
        }

        console.log("[GEMINI] Raw response:", rawText.trim());
        return this.cleanResponse(rawText.trim());
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const errData = err.response?.data;
        console.error(
          `Gemini request failed (attempt ${attempt + 1}): status=${status}, message=${err.message}`,
          errData ? JSON.stringify(errData).slice(0, 500) : '',
        );

        // Retry on 429 (rate limit), 5xx (server), or network errors
        // Do NOT retry on other 4xx client errors (auth, bad request, etc.)
        if (status && status !== 429 && (status < 500 || status === 501)) {
          throw err;
        }
      }
    }

    throw lastError;
  }

  /**
   * Strip any chain-of-thought reasoning the model may output.
   * Extracts the last quoted line, or the last non-empty line.
   */
  cleanResponse(text) {
    // If the response contains quoted text, extract the last quote
    const quoteMatches = text.match(/"([^"]{10,})"/g);
    if (quoteMatches && quoteMatches.length > 0) {
      const lastQuote = quoteMatches[quoteMatches.length - 1];
      return lastQuote.replace(/^"|"$/g, "").trim();
    }

    // If response has bullet points or options, take the last non-empty line
    if (text.includes("*") || text.includes("Option")) {
      const lines = text
        .split("\n")
        .map((l) => l.replace(/^[\s*\-]+/, "").trim())
        .filter((l) => l.length > 10);
      if (lines.length > 0) {
        return lines[lines.length - 1];
      }
    }

    return text;
  }

  async generateReply(userText, history = []) {
    const contents = this.buildContents(userText, history);
    return this.requestCompletion(contents, {
      temperature: 0.5,
      maxTokens: 250,
    });
  }

  async analyzeSentiment(text) {
    const contents = this.buildContents(
      text,
      [],
      'Classify the sentiment as positive, neutral, or negative. Return JSON only: {"sentiment": "...", "score": 0-1}.',
    );

    const content = await this.requestCompletion(contents, {
      temperature: 0,
      maxTokens: 60,
    });

    return JSON.parse(content);
  }
}

module.exports = new GeminiService();
