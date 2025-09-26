
import geminiQueue from '@/lib/queue/geminiQueue';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import { GoogleGenAI } from '@google/genai';
import { NextRequest, NextResponse } from 'next/server';


export const runtime = 'nodejs';

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
});

export async function POST(req) {
  const ip = req.headers.get('x-forwarded-for') || 'anonymous';

  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
  }

  const { conversations } = await req.json();

  try {
    // Enqueue the Gemini task
    const response = await geminiQueue.add(async () => {
      return await ai.models.generateContent({
        model: "gemini-1.5-flash",
        contents: [
          {
            role: "user",
            parts: [
          {
            text: `### Interview Transcript

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


**Note**: Strictly follow this output format, dont generate any additional character/string/object/array

`
          }
        ]
          }
        ],
        config: {
          systemInstruction: "You are a smart AI assistant name Niko who generates Indepth Report card for an interview based on the given data",
        },
      });
    });

    console.log(response.text);

    return new Response(JSON.stringify({
      state: true,
      data: response.text,
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
    console.error('Gemini Error:', err);
    return new Response(JSON.stringify({
      state: false,
      error: "Gemini API failed",
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
