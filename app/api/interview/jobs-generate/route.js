
import openaiQueue from '@/lib/queue/openaiQueue';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';

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

  try {
    const body = await req.json();
    const { jobDescription } = body;

    if (!jobDescription || typeof jobDescription !== 'string' || jobDescription.trim() === '') {
      return new Response(JSON.stringify({
        state: false,
        error: 'Invalid or missing jobDescription in request body',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const prompt = `You are a smart AI assistant that extracts detailed interview metadata from a job description. Extract job metadata from this description and return a JSON object with these fields:

Job Description: ${jobDescription}

Return JSON with:
- interview_name: job role/title
- job_description: full description
- company: company name or ""
- location: job location (default "India")
- experience: required years (default "Not specified")
- difficulty_level: easy/medium/hard (default "medium")
- interview_type: technical/HR/behavioral (default "technical")
- Requirements: array of requirements
- Tech_Stack: array of technologies/tools
- Skills: array of skills needed
- Employment_Type: Full-time/Part-time/Contract
- interview_style: one-on-one/panel/group
- duration: interview time in minutes (default 30)
- status: open/closed/upcoming (default "open")
- interview_time: current date in ISO format

If any field is missing, use defaults specified. Only return JSON.`;

    const result = await openaiQueue.add(async () => {
      return await openai.chat.completions.create({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      });
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result) {
          const text = chunk.choices[0]?.delta?.content;
          if (text) {
            controller.enqueue(encoder.encode(text));
          }
        }
        controller.close();
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
      },
    });

  } catch (error) {
    console.error('[API ERROR]', error);
    return new Response(JSON.stringify({
      state: false,
      error: 'Internal server error',
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
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

