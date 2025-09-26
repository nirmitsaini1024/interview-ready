// lib/queue/openaiQueue.js
import PQueue from "p-queue";

// OpenAI/OpenRouter rate limiting queue
const openaiQueue = new PQueue({
  concurrency: 5,       
  interval: 1000,      // 1 second
  intervalCap: 10,     // Max 10 requests per second
  timeout: 30000,      // 30 second timeout per request
});

export default openaiQueue;
