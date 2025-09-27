
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

  const { conversations } = await req.json();

  try {

    const response = await openaiQueue.add(async () => {
      return await openai.chat.completions.create({
        model: 'meta-llama/llama-3.3-8b-instruct:free',
        max_tokens: 3000,
        messages: [
          {
            role: "system",
            content: "You are a smart AI assistant name Niko who generates Indepth Report card for an interview based on the given data"
          },
          {
            role: "user",
            content: `### Interview Transcript

The following is a structured array of messages between the candidate and the interviewer. Use this conversation to evaluate the candidate:

${JSON.stringify(conversations, null, 2)}

---

### 14. **Candidate Feedback Summary (Internal Use)**

> **Instructions:**
> Based on the conversation above, generate a complete interview evaluation report.
> Follow the rubric and format strictly.
> Return output in **valid JSON only**. Do not include markdown or explanations.

---

#### **Skill Evaluation Rubric**

| Category                 | Rating (1–5) | Notes                                                      |
| ------------------------ | ------------ | ---------------------------------------------------------- |
| Technical Knowledge      |              | (Understanding of topic, accuracy, completeness)           |
| Communication            |              | (Clarity, structure, confidence, terminology)              |
| Problem Solving Approach |              | (Logic, reasoning, explanation style)                      |
| Confidence & Composure   |              | (Calmness, honesty, attitude)                              |
| Best Practices & Style   |              | (Standards, patterns, cleanliness of thought)              |

---

#### **Overall Summary (2–3 lines)**

Provide a brief summary of the candidate's overall performance, style, and impression in 2–3 lines.

---

#### **Reasons for Selection or Rejection (8–10 Bullet Points)**

List up to 10 concise reasons that justify either selecting or rejecting the candidate.
Keep each point short and specific to the candidate's performance.

---

#### **Final Verdict (Internal Use)**
Give score out of 10 and give recommendation (YES or NO)
> \`\`\`json
> {
>   "recommendation": "YES" // or "NO",
>   "score": "8"  // give score out of 10
> }
> \`\`\`

> This section is **internal only** and should reflect the final decision.
> Do not repeat full notes here—only the final YES or NO.

Output Format Example:
{
  "skill_evaluation": {
    "technical_knowledge": {
      "rating": "",
      "notes": ""
    },
    "communication_clarity": {
      "rating": "",
      "notes": ""
    },
    "problem_solving_approach": {
      "rating": "",
      "notes": ""
    },
    "collaboration_and_team_fit": {
      "rating": "",
      "notes": ""
    },
    "time_management": {
      "rating": "",
      "notes": ""
    }
  },
  "overall_summary": "",
  "reasons": [
  ],
  "most_frequent_words_used_in_conversations": "",
  "question_wise_feedback": [
      {
      "question": "",
      "score": "",
      "feedback": ""
    }
  ],
  "key_strengths": [],
  "areas_for_improvement": [],
  "topics_to_focus_on": [],
  "suggested_learning_resources": [
  {
      "name": "",
      "url": "" // provide some youtube url for the related topics
  }
  ],
  "final_verdict": {
    "recommendation": "",
    "score": ""
  }
}

**Note**: Strictly follow this output format, dont generate any additional character/string/object/array`

          }
        ],
      });
    });

    console.log(response.choices[0].message.content);

    return new Response(JSON.stringify({
      state: true,
      data: response.choices[0].message.content,
      message: "Success",
    }), {
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    });
  } catch (err) {
    console.error('OpenAI Error:', err);
    return new Response(JSON.stringify({
      state: false,
      error: "OpenAI API failed",
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
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
