import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import openaiQueue from '@/lib/queue/openaiQueue'; // 🆕 Import the shared queue instance

export const runtime = 'nodejs';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_AI_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';

  // Apply rate limiting
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  // Extract JSON body
  const {
    job_description,
    resume
  } = await req.json();

  console.log("🧠 Generating for:", job_description);

  // Wrap OpenAI API call in queue
  try {
    const result = await openaiQueue.add(async () => {
      const response = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        max_tokens: 3000,
        messages: [
          {
            role: 'system',
            content: 'You are a smart AI assistant named Niko who generates modern ATS friendly resume from job description.',
          },
          {
            role: 'user',
            content: `Optimize this resume for job application with keywords from job description.

Job: ${job_description?.length > 300 ? job_description.substring(0, 300) + '...' : job_description}
Resume: ${typeof resume === 'string' && resume.length > 700 ? resume.substring(0, 700) + '...' : resume}

Instructions:
- Improve keywords for ATS compatibility  
- Use action verbs with metrics
- Make content engaging and natural
- Fix spelling/grammar issues

Return JSON format:
{
  "user_info": { same info from resume },
  "work_experience": [{"responsibilities": [string array]}],
  "skills": {
    "languages": [string array],
    "frameworks": [string array], 
    "databases": [string array],
    "tools & technologies": [string array],
    "other": [string array]
  },
  "projects": [{}],
  "education": {},
  "extra_curricular_activities": []
}`
          },
        ],
      });

      return response.choices[0].message.content;
    });

    console.log("✅ OpenAI API Success");

    return new Response(
      JSON.stringify({
        state: true,
        data: result,
        message: 'Success',
      }),
      {
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Cache-Control': 'no-cache',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
      }
    );
  } catch (error) {
    console.error("❌ OpenAI Queue Error:", error);
    return NextResponse.json(
      {
        state: false,
        error: error.message || 'Unexpected error in AI processing',
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  });
}
