import { ratelimit } from '@/lib/ratelimiter/rateLimiter';
import OpenAI from 'openai';
import { NextRequest, NextResponse } from 'next/server';
import openaiQueue from '@/lib/queue/openaiQueue';

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
    interview_type, // New field to distinguish coding interviews
  } = await req.json();

  console.log("🧠 Generating for:", company, interview_style, position);

  try {
    const result = await openaiQueue.add(async () => {
      let response;
      
      // Check if this is a coding interview
      if (interview_type === 'coding') {
        response = await openai.chat.completions.create({
          model: 'meta-llama/llama-3.3-8b-instruct:free',
          max_tokens: 3000,
          messages: [
            {
              role: 'system',
              content: 'You are an expert coding interview question generator. Generate exactly 6 coding interview questions with specific difficulty levels and time limits. Base your questions on the candidate\'s actual resume content, experience, projects, and technologies they\'ve used. Make questions relevant to their specific background.',
            },
            {
              role: 'user',
              content: `Generate exactly 6 coding interview questions for ${position} at ${company} based on the candidate's resume.

CANDIDATE'S RESUME (sanitized):
${resume ? resume
  .replace(/\+91-\d+/g, '[PHONE]')
  .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
  .replace(/https?:\/\/[^\s]+/g, '[URL]')
  .replace(/www\.[^\s]+/g, '[URL]')
  .substring(0, 1500) : 'No resume provided'}

Requirements:
- 2 Easy questions (20 seconds each) - based on basic concepts from their resume
- 2 Medium questions (60 seconds each) - based on their actual projects/experience
- 2 Hard questions (120 seconds each) - based on advanced concepts they've worked with
- Questions should be practical coding problems related to their experience
- Include time limits and expected approach
- Make questions relevant to their specific tech stack and projects

Job: ${job_description}
Level: ${difficulty_level} | Experience: ${experience}
Skills: ${skills_required?.join(', ') || 'Not specified'}
Tech: ${tech_stack?.join(', ') || 'Not specified'}

Focus on:
- Technologies they've actually used (React, Next.js, Node.js, MongoDB, etc.)
- Projects they've worked on (Blog Post, Admin Dashboard, etc.)
- Companies they've worked for (ThinkAct.ai, Dolphant Group, etc.)
- Specific challenges they've faced in their experience

Return JSON format with this exact structure:
[
  {
    "id": 1,
    "question": "Question text here",
    "difficulty": "Easy",
    "timeLimit": 20,
    "expectedApproach": "Brief explanation of expected solution approach",
    "category": "Data Structures/Algorithm/System Design/etc"
  },
  {
    "id": 2,
    "question": "Question text here", 
    "difficulty": "Easy",
    "timeLimit": 20,
    "expectedApproach": "Brief explanation of expected solution approach",
    "category": "Data Structures/Algorithm/System Design/etc"
  },
  {
    "id": 3,
    "question": "Question text here",
    "difficulty": "Medium", 
    "timeLimit": 60,
    "expectedApproach": "Brief explanation of expected solution approach",
    "category": "Data Structures/Algorithm/System Design/etc"
  },
  {
    "id": 4,
    "question": "Question text here",
    "difficulty": "Medium",
    "timeLimit": 60, 
    "expectedApproach": "Brief explanation of expected solution approach",
    "category": "Data Structures/Algorithm/System Design/etc"
  },
  {
    "id": 5,
    "question": "Question text here",
    "difficulty": "Hard",
    "timeLimit": 120,
    "expectedApproach": "Brief explanation of expected solution approach", 
    "category": "Data Structures/Algorithm/System Design/etc"
  },
  {
    "id": 6,
    "question": "Question text here",
    "difficulty": "Hard",
    "timeLimit": 120,
    "expectedApproach": "Brief explanation of expected solution approach",
    "category": "Data Structures/Algorithm/System Design/etc"
  }
]`,
            },
          ],
        });
      } else {
        // Regular interview questions (existing logic)
        response = await openai.chat.completions.create({
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
      }

      const content = response.choices[0].message.content;
      console.log('AI Response:', content);

      // Clean the content more thoroughly
      let cleanedContent = content
        .replace(/^<s>\s*/, '') // Remove <s> prefix
        .replace(/\s*<\/s>$/, '') // Remove </s> suffix
        .replace(/^\[ASSISTANT\]\s*/, '') // Remove [ASSISTANT] prefix
        .replace(/^```json\s*/i, '') // Remove opening ```json
        .replace(/\s*```$/, '') // Remove closing ```
        .trim();
      
      // Additional cleaning - remove any remaining <s> at the start
      if (cleanedContent.startsWith('<s>')) {
        cleanedContent = cleanedContent.substring(3).trim();
      }
      
      console.log('Cleaned content:', cleanedContent);

      // Handle coding interview questions differently
      if (interview_type === 'coding') {
        try {
          const parsed = JSON.parse(cleanedContent);
          if (Array.isArray(parsed) && parsed.length === 6) {
            // Validate structure
            const validQuestions = parsed.filter(q => 
              q.id && q.question && q.difficulty && q.timeLimit && q.expectedApproach
            );
            if (validQuestions.length === 6) {
              return parsed;
            }
          }
        } catch (error) {
          console.log('JSON parsing failed for coding questions, using fallback');
        }

        // Fallback coding questions based on resume content
        const resumeText = resume ? resume
          .replace(/\+91-\d+/g, '[PHONE]')
          .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '[EMAIL]')
          .replace(/https?:\/\/[^\s]+/g, '[URL]')
          .replace(/www\.[^\s]+/g, '[URL]') : '';
        const hasReact = resumeText.toLowerCase().includes('react');
        const hasNode = resumeText.toLowerCase().includes('node');
        const hasMongoDB = resumeText.toLowerCase().includes('mongodb');
        const hasNextJS = resumeText.toLowerCase().includes('next');
        const hasNestJS = resumeText.toLowerCase().includes('nest');
        
        return [
          {
            id: 1,
            question: hasReact ? "Write a React component that displays a list of items with a search filter." : "Write a function to reverse a string.",
            difficulty: "Easy",
            timeLimit: 20,
            expectedApproach: hasReact ? "Use React hooks (useState) and array filter method" : "Use two pointers or built-in reverse method",
            category: hasReact ? "React Components" : "String Manipulation"
          },
          {
            id: 2,
            question: hasNode ? "Write a Node.js function to handle an HTTP GET request and return JSON data." : "Find the maximum element in an array.",
            difficulty: "Easy", 
            timeLimit: 20,
            expectedApproach: hasNode ? "Use Express.js or native HTTP module" : "Iterate through array and track maximum",
            category: hasNode ? "Node.js API" : "Array Operations"
          },
          {
            id: 3,
            question: hasMongoDB ? "Write a MongoDB query to find all documents where a field matches a specific value and sort by date." : "Implement a function to check if a string is a palindrome.",
            difficulty: "Medium",
            timeLimit: 60,
            expectedApproach: hasMongoDB ? "Use find() with filter and sort() methods" : "Use two pointers from start and end",
            category: hasMongoDB ? "Database Queries" : "String Algorithms"
          },
          {
            id: 4,
            question: hasNextJS ? "Implement a Next.js API route that handles POST requests and validates input data." : "Write a function to find the longest common subsequence of two strings.",
            difficulty: "Medium",
            timeLimit: 60,
            expectedApproach: hasNextJS ? "Use Next.js API routes with request validation" : "Dynamic programming approach",
            category: hasNextJS ? "Next.js API Routes" : "Dynamic Programming"
          },
          {
            id: 5,
            question: hasNestJS ? "Design a NestJS service with dependency injection that handles user authentication and authorization." : "Design a system to handle rate limiting for API requests.",
            difficulty: "Hard",
            timeLimit: 120,
            expectedApproach: hasNestJS ? "Use NestJS decorators, guards, and dependency injection" : "Use sliding window or token bucket algorithm",
            category: hasNestJS ? "NestJS Architecture" : "System Design"
          },
          {
            id: 6,
            question: "Implement a multi-tenant system architecture with proper data isolation and access control.",
            difficulty: "Hard",
            timeLimit: 120,
            expectedApproach: "Design tenant-aware data models and implement row-level security",
            category: "System Architecture"
          }
        ];
      } else {
        // Regular interview questions (existing logic)
        try {
          const parsed = JSON.parse(cleanedContent);
          if (Array.isArray(parsed)) {
            return parsed;
          } else if (typeof parsed === 'object' && parsed !== null) {
            // Convert object format to array
            return Object.values(parsed);
          }
        } catch (error) {
          console.log('JSON parsing failed, trying text extraction');
        }

        // Fallback: extract questions from text
        const questionMatches = cleanedContent.match(/[^.!]*\?[^.!]*/g);
        if (questionMatches) {
          return questionMatches.map(q => q.trim()).filter(q => q.length > 15);
        }

        // Final fallback questions
        const fallbackQuestions = [
          "Can you explain your experience with software development?",
          "What programming languages and frameworks are you most comfortable with?",
          "Describe a challenging project you worked on recently.",
          "How do you approach problem-solving in your development work?",
          "What are your thoughts on current technology trends?"
        ];
        
        console.log('Using fallback questions');
        return fallbackQuestions;
      }
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
