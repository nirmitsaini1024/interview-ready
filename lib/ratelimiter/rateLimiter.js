
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, '60 s'), // 100 requests per 60 seconds (very lenient for development)
});

