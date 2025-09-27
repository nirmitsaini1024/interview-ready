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

  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  const {
    job_description,
    company,
    interview_style,
    position,
    difficulty_level,
    experience,
    resume,
    skills_required,
    tech_stack,
  } = await req.json();

  console.log("🧠 Generating for:", company, interview_style, position);

  try {
    const result = await openaiQueue.add(async () => {
      const response = await openai.chat.completions.create({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        max_tokens: 3000,
        messages: [
          {
            role: 'system',
            content: 'You are a smart AI assistant named Buddy who generates modern top interview questions based on the given data.',
          },
          {
            role: 'user',
            content: `Generate 10 interview questions for ${position} at ${company}.

Job: ${job_description}
Level: ${difficulty_level} | Experience: ${experience}
Skills: ${skills_required?.join(', ') || 'Not specified'}
Tech: ${tech_stack?.join(', ') || 'Not specified'}

Resume: ${typeof resume === 'string' && resume.length > 500 ? resume.substring(0, 500) + '...' : resume || 'Not provided'}

Generate technical questions covering:
- Coding/algorithm
- System design
- Framework best practices
- Problem solving
- Architecture

Return JSON format: {"Question 1": "...", "Question 2": "...", etc}`,
          },
        ],
      });

      return response.choices[0].message.content;
    });

    console.log("✅ OpenRouter API Success");

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
    console.error("❌ OpenRouter Queue Error:", error);
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
