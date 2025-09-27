import { NextResponse } from 'next/server';
import openai from '@/lib/openai/client';
import openaiQueue from '@/lib/queue/openaiQueue';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';

export async function POST(req) {
  try {
    // Rate limiting
    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { jobDescription, resume, type, questionsCount = 5 } = await req.json();

    if (!jobDescription && !resume) {
      return NextResponse.json(
        { state: false, error: 'Job description or resume is required' },
        { status: 400 }
      );
    }

    // Generate interview questions using OpenAI/OpenRouter
    const questions = await openaiQueue.add(async () => {
      const prompt = resume 
        ? `Generate ${questionsCount} ${type || 'frontend'} interview questions based on this candidate profile: ${resume.substring(0, 500)}...`
        : `Job Description: ${jobDescription}\n\nGenerate ${questionsCount} interview questions for this position.`;

      const response = await openai.chat.completions.create({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: `You are an expert interview question generator. Generate exactly ${questionsCount} relevant interview questions based on the provided information. Return ONLY a JSON array of strings, no other text. Example format: ["Question 1?", "Question 2?", "Question 3?"]`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      });

      const content = response.choices[0]?.message?.content || '';
      console.log('AI Response:', content);
      
      // Clean up Mistral AI response format
      const cleanedContent = content.replace(/^<s>\s*/, '').replace(/\s*<\/s>$/, '').trim();
      
      try {
        // Try to parse as JSON first
        const parsed = JSON.parse(cleanedContent);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, questionsCount);
        }
      } catch (error) {
        console.log('JSON parsing failed, trying text extraction');
      }
      
      // Extract questions from text - look for various patterns
      let questions = [];
      
      // Try to find JSON array in the text (more flexible matching)
      const jsonMatches = cleanedContent.match(/\[[\s\S]*?\]/g);
      if (jsonMatches) {
        for (const match of jsonMatches) {
          try {
            const parsed = JSON.parse(match);
            if (Array.isArray(parsed) && parsed.length > 0) {
              questions = parsed.filter(q => typeof q === 'string' && q.includes('?'));
              if (questions.length > 0) break;
            }
          } catch (e) {
            console.log('Failed to parse JSON match:', match);
          }
        }
      }
      
      // If no JSON found, extract numbered questions or lines with ?
      if (questions.length === 0) {
        const lines = cleanedContent.split('\n').filter(line => {
          const trimmed = line.trim();
          return trimmed && (
            trimmed.includes('?') || 
            /^\d+\./.test(trimmed) ||
            /^[-*•]/.test(trimmed) ||
            /^["'].*\?["']$/.test(trimmed)
          );
        }).map(line => {
          // Remove numbering, bullet points, and quotes
          return line.replace(/^\d+\.\s*/, '')
                   .replace(/^[-*•]\s*/, '')
                   .replace(/^["']/, '').replace(/["']$/, '')
                   .replace(/^["']/, '').replace(/["']$/, '')
                   .trim();
        }).filter(q => q.length > 15 && q.includes('?')); // Filter out very short items and ensure it's a question
        
        questions = lines;
      }
      
      // If still no questions, try to extract from any text that contains questions
      if (questions.length === 0) {
        const questionMatches = cleanedContent.match(/[^.!]*\?[^.!]*/g);
        if (questionMatches) {
          questions = questionMatches.map(q => q.trim()).filter(q => q.length > 15);
        }
      }
      
      if (questions.length === 0) {
        console.log('Raw AI response for debugging:', content);
        console.log('Cleaned AI response:', cleanedContent);
        console.log('Content length:', content.length);
        console.log('Content type:', typeof content);
        
        // Last resort: create basic questions based on type
        const fallbackQuestions = {
          frontend: [
            "Can you explain your experience with React and modern JavaScript frameworks?",
            "How do you approach responsive web design and cross-browser compatibility?",
            "What's your experience with state management in frontend applications?",
            "How do you optimize frontend performance and loading times?",
            "Can you describe your experience with testing frontend applications?"
          ],
          backend: [
            "Can you explain your experience with server-side development and APIs?",
            "How do you handle database design and optimization?",
            "What's your approach to authentication and security in backend systems?",
            "How do you ensure scalability and performance in backend services?",
            "Can you describe your experience with cloud deployment and DevOps?"
          ],
          general: [
            "Can you walk me through your technical background and experience?",
            "What programming languages and technologies are you most comfortable with?",
            "How do you approach problem-solving in technical projects?",
            "Can you describe a challenging technical problem you've solved?",
            "What's your experience with version control and collaborative development?"
          ]
        };
        
        const typeQuestions = fallbackQuestions[type] || fallbackQuestions.general;
        questions = typeQuestions.slice(0, questionsCount);
        console.log('Using fallback questions for type:', type);
      }
      
      return questions.slice(0, questionsCount);
    });

    return NextResponse.json({
      state: true,
      data: { questions },
      message: 'Questions generated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { state: false, error: 'Failed to generate questions', details: error.message },
      { status: 500 }
    );
  }
}
