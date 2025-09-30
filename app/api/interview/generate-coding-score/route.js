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

    const { answers, questions, candidateName, position } = await req.json();

    if (!answers || !questions) {
      return NextResponse.json(
        { state: false, error: 'Answers and questions are required' },
        { status: 400 }
      );
    }

    const scoreAnalysis = await openaiQueue.add(async () => {
      const prompt = `Analyze this coding interview performance and provide a comprehensive score and feedback.

CANDIDATE: ${candidateName || 'Anonymous'}
POSITION: ${position || 'Software Developer'}

INTERVIEW QUESTIONS AND ANSWERS:
${questions.map((q, index) => `
Question ${index + 1} (${q.difficulty} - ${q.timeLimit}s):
${q.question}
Expected Approach: ${q.expectedApproach}
Category: ${q.category}

Candidate's Answer:
${answers[index]?.answer || 'No answer provided'}
Time Spent: ${answers[index]?.timeSpent || 0} seconds
`).join('\n')}

Please provide a comprehensive analysis in the following JSON format:
{
  "totalScore": 85,
  "recommendation": true,
  "recommendationText": "Strong candidate with good problem-solving skills",
  "detailedAnalysis": "Detailed analysis of performance...",
  "strengths": ["Good algorithmic thinking", "Clear communication"],
  "weaknesses": ["Could improve on system design", "Needs more practice with complex algorithms"],
  "improvementAreas": ["Practice more system design problems", "Work on time management"],
  "questionScores": [
    {"questionId": 1, "score": 8, "feedback": "Good approach, minor optimization needed"},
    {"questionId": 2, "score": 7, "feedback": "Correct solution but could be more efficient"}
  ],
  "overallRating": "Good",
  "hiringRecommendation": "Proceed to next round"
}

Scoring Criteria:
- Easy questions: 0-10 points each
- Medium questions: 0-15 points each  
- Hard questions: 0-20 points each
- Total possible: 100 points

Consider:
- Correctness of solution
- Approach and methodology
- Time management
- Communication clarity
- Code quality (if applicable)
- Problem-solving process`;

      const response = await openai.chat.completions.create({
        model: 'mistralai/mistral-7b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'You are an expert coding interview evaluator. Analyze the candidate\'s performance and provide detailed feedback with scores. Return ONLY valid JSON, no other text.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.3
      });

      const content = response.choices[0]?.message?.content || '';
      console.log('AI Response for scoring:', content);

      // Clean and parse the JSON response
      let cleanedContent = content.trim();
      
      // Remove any markdown code blocks
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/```json\n?/, '').replace(/```\n?$/, '');
      } else if (cleanedContent.startsWith('```')) {
        cleanedContent = cleanedContent.replace(/```\n?/, '').replace(/```\n?$/, '');
      }

      try {
        const parsed = JSON.parse(cleanedContent);

        // Normalize score to a number within 0-100
        const rawScore = parsed.totalScore ?? parsed.score ?? 0;
        const numericScore = Math.max(0, Math.min(100, Number(rawScore) || 0));
        parsed.totalScore = numericScore;

        // Ensure recommendation is a boolean based on score
        if (typeof parsed.recommendation === 'string') {
          parsed.recommendation = numericScore >= 70;
        } else if (typeof parsed.recommendation !== 'boolean') {
          parsed.recommendation = numericScore >= 70;
        }

        return parsed;
      } catch (parseError) {
        console.error('JSON parse error for scoring:', parseError);
        
        // Fallback scoring
        const totalQuestions = Array.isArray(questions) ? questions.length : 0;
        const answeredQuestions = Array.isArray(answers)
          ? answers.filter(a => typeof a?.answer === 'string' && a.answer.trim().length > 0 && a.answer.trim() !== 'No response provided').length
          : 0;
        const baseScore = Math.round((answeredQuestions / totalQuestions) * 100);
        
        return {
          totalScore: baseScore,
          recommendation: baseScore >= 70,
          recommendationText: baseScore >= 70 ? "Strong candidate" : baseScore >= 50 ? "Average candidate" : "Needs improvement",
          detailedAnalysis: `Candidate answered ${answeredQuestions} out of ${totalQuestions} questions. Base score calculated from completion rate.`,
          strengths: answeredQuestions >= Math.ceil(totalQuestions * 0.66) ? ["Good participation", "Attempted most questions"] : ["Showed effort"],
          weaknesses: answeredQuestions < Math.ceil(totalQuestions * 0.5) ? ["Limited responses", "Time management issues"] : ["Could improve response quality"],
          improvementAreas: ["Practice more coding problems", "Work on time management", "Improve problem-solving approach"],
          questionScores: (Array.isArray(questions) ? questions : []).map((q, index) => {
            const answered = Array.isArray(answers) && typeof answers[index]?.answer === 'string' && answers[index].answer.trim().length > 0 && answers[index].answer.trim() !== 'No response provided';
            return {
              questionId: q.id,
              score: answered ? (q.difficulty === 'Easy' ? 8 : q.difficulty === 'Medium' ? 10 : 12) : 0,
              feedback: answered ? "Answered the question" : "No response provided"
            };
          }),
          overallRating: baseScore >= 70 ? "Good" : baseScore >= 50 ? "Average" : "Needs Improvement",
          hiringRecommendation: baseScore >= 70 ? "Proceed to next round" : baseScore >= 50 ? "Consider for junior role" : "Not recommended"
        };
      }
    });

    return NextResponse.json({
      state: true,
      data: scoreAnalysis,
      message: 'Coding interview score generated successfully'
    }, { status: 200 });

  } catch (error) {
    console.error('Error generating coding interview score:', error);
    return NextResponse.json({
      state: false,
      error: 'Failed to generate score',
      details: error.message
    }, { status: 500 });
  }
}
