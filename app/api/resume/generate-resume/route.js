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
        model: 'openai/gpt-4o',
        messages: [
          {
            role: 'system',
            content: 'You are a smart AI assistant named Niko who generates modern ATS friendly resume from job description.',
          },
          {
            role: 'user',
            content: `
You are an expert resume writer and an ATS optimization specialist. 
 Based on the resume and job description provided, generate an improved, 
 ATS-optimized resume in the JSON format specified below.

# IMPORTANT: Do not change any of the static details from the resume such as:

- Rephrase my resume based on the given job description above to make it more ATS-friendly

- Please use this framework: "Action Verb + Noun + Metric + [Strategy Optional] + Outcome = 1 bulleted achievement."

- Please rewrite the resume in a more engaging and natural way. Use nondramatic language.

- Rewrite my resume to align with the following job description

- Proofread my resume and suggest improvements for clarity and readability, check any spelling mistake or grammer mistake

- Analyze my resume for ATS optimization based on this job description.

- Add keywords in the resume based on the job description to imporve ATS score.

- add 10 additional new keywords to my resume to improve ATS compatibility with the given job description

- Use a more personalized resume voice to make my content sound less robotic.

- Rewrite my resume to remove overly formal or repetitive AI-generated phrasing while keeping it professional. 

- Adjust my resume tone to sound more natural and engaging, avoiding stiff or overly polished language. 

- Edit my resume to include a mix of sentence structures that feel more natural and human-written.

## Input:

Job Description: ${job_description}
resume: ${resume}

## Output Format:
- Provide the output in the json format

{
  "user_info": {
    same from the resume
  },
  "work_experience": [
    {
      extract from resume
      "responsibilities": [
            (string array)
        ]
    }
  ],
  "skills": {
    "languages": (programming languages - [string array]),
    "frameworks":(frameworks - [string array]),
    "databases": (databases - [string array]),
    "tools & technologies": (tools & technologies like DevOps, Testing, Cloud & Infrastructure - [string array]),
    "other": (other industry realted tools or tech like (Jira, Agile, Scrum, etc) - [string array]),
  },
  "projects": [ 
    {
    }
  ],
  "education": {
    same from the resume
  },
  "extra_curricular_activities": [
    same from the resume
  ]
}
`
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
