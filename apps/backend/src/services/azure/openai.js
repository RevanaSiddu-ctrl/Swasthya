const axios = require('axios');
const { env } = require('../../../config/env');

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

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
  getApiKey() {
    const apiKey = env.gemini?.key || process.env.GEMINI_API_KEY;
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
      }
    };

    if (options.systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: options.systemInstruction }]
      };
    }

    if (options.responseMimeType) {
      payload.generationConfig.responseMimeType = options.responseMimeType;
    }

    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Gemini retry attempt ${attempt}/${MAX_RETRIES}`);
          await sleep(RETRY_DELAY_MS * attempt);
        }

        const response = await axios.post(`${GEMINI_API_URL}?key=${apiKey}`, payload, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 30000,
        });

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          throw new Error("Gemini returned an empty response.");
        }

        return rawText.trim();
      } catch (err) {
        lastError = err;
        const status = err.response?.status;
        const errData = err.response?.data;
        console.error(
          `Gemini request failed (attempt ${attempt + 1}): status=${status}, message=${err.message}`,
          errData ? JSON.stringify(errData).slice(0, 500) : ''
        );

        if (status && status !== 429 && status < 500) {
          throw err;
        }
      }
    }

    throw lastError;
  }

  async generateReply(userText, history = []) {
    // Map standard history array [{role, content}] to Gemini's format [{role, parts: [{text}]}]
    const contents = Array.isArray(history) ? history.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content || '' }]
    })) : [];

    contents.push({
      role: 'user',
      parts: [{ text: userText }]
    });

    return this.requestCompletion(contents, {
      systemInstruction: DEFAULT_SYSTEM_PROMPT,
      temperature: 0.5,
      maxTokens: 250,
    });
  }

  async analyzeBehavioralData(text) {
    const prompt = `
You are a clinical behavioral analyst. Analyze the following user transcript and extract behavioral intelligence.
Return ONLY a raw JSON object with the following exact structure, no markdown formatting:
{
  "sentimentScore": <Number between 0 and 1, where 0 is severe distress/negative and 1 is highly positive/stable>,
  "distressFlag": <Boolean, true ONLY if there are signs of self-harm, extreme burnout, or crisis>,
  "behavioralIndicators": [<Array of strings, e.g., "exhaustion", "isolation", "anxiety", "sleep deprivation", "overwhelm">],
  "crisisPhrases": [<Array of strings, containing EXACT concerning quotes from the transcript, if any>],
  "gpSummaryNote": "<A single concise, professional sentence summarizing the user's emotional state for a doctor>"
}

Transcript: "${text}"
`;

    const contents = [{
      role: 'user',
      parts: [{ text: prompt }]
    }];

    const content = await this.requestCompletion(contents, {
      temperature: 0,
      maxTokens: 250,
      responseMimeType: 'application/json'
    });

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      return JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse behavioral JSON:', content);
      return { 
        sentimentScore: 0.5, 
        distressFlag: false, 
        behavioralIndicators: [], 
        crisisPhrases: [], 
        gpSummaryNote: "Could not extract behavioral data." 
      };
    }
  }
}

// Keep the same export name as the routes expect `openaiService` variable
module.exports = new GeminiService();
