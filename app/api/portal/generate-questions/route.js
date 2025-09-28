import { NextResponse } from 'next/server';
import openai from '@/lib/openai/client';
import openaiQueue from '@/lib/queue/openaiQueue';
import { ratelimit } from '@/lib/ratelimiter/rateLimiter';

export async function POST(req) {
  try {

    const ip = req.headers.get('x-forwarded-for') || 'anonymous';
    const { success } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json({ state: false, error: 'Rate limit exceeded' }, { status: 429 });
    }

    const { resume, type, questionsCount = 5 } = await req.json();

    if (!resume) {
      return NextResponse.json(
        { state: false, error: 'Resume is required' },
        { status: 400 }
      );
    }

    const questions = await openaiQueue.add(async () => {
      const prompt = `Generate ${questionsCount} ${type || 'frontend-development'} interview questions based on this candidate's resume:\n\n${resume.substring(0, 800)}...`;

      console.log('AI Model:', 'mistralai/mistral-7b-instruct:free');
      console.log('Questions Count:', questionsCount);

      let response;
      try {
        response = await openai.chat.completions.create({
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
      } catch (apiError) {
        console.error('OpenAI API Error:', apiError);
        throw new Error(`API call failed: ${apiError.message}`);
      }

      console.log('Full OpenAI Response:', JSON.stringify(response, null, 2));
      
      const content = response.choices[0]?.message?.content || '';
      console.log('AI Response:', content);
      console.log('AI Response Length:', content.length);

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

      try {

        const parsed = JSON.parse(cleanedContent);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, questionsCount);
        }
      } catch (error) {
        console.log('JSON parsing failed, trying text extraction');
      }

      let questions = [];

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

          return line.replace(/^\d+\.\s*/, '')
                   .replace(/^[-*•]\s*/, '')
                   .replace(/^["']/, '').replace(/["']$/, '')
                   .replace(/^["']/, '').replace(/["']$/, '')
                   .trim();
        }).filter(q => q.length > 15 && q.includes('?')); // Filter out very short items and ensure it's a question

        questions = lines;
      }

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
      data: questions,
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
