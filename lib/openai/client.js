// lib/openai/client.js
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_AI_KEY,
  baseURL: "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.NEXT_APP_PRODUCTION_HOSTNAME || "http://localhost:3000", // Optional, for analytics
    "X-Title": "InterviewReady", // Optional, for analytics
  },
});

export default openai;
