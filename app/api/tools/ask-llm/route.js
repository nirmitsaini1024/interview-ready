import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_AI_KEY,
  baseURL: "https://openrouter.ai/api/v1",
});

let sessions = new Map();

export async function POST(req) {
  const body = await req.json();
  const { sessionId, prompt, answer, end } = body;

  if (end && sessionId) {
    const session = sessions.get(sessionId);
    if (!session) return NextResponse.json({ error: 'Invalid session' }, { status: 400 });

    const reportPrompt = `Generate a detailed mock interview report based on the following Q&A session:\n\n${session.questions
      .map((q, i) => `Q: ${q}\nA: ${session.answers[i] || "No answer"}`)
      .join('\n\n')}`;

    const reportRes = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      max_tokens: 3000,
      messages: [{ role: 'user', content: reportPrompt }],
    });

    sessions.delete(sessionId);

    return NextResponse.json({ report: reportRes.choices[0].message.content });
  }

  // Start session
  if (!sessionId && prompt) {
    const qRes = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      max_tokens: 3000,
      messages: [{ role: 'user', content: `Generate 10 mock interview questions on ${prompt}. Only output the questions.` }],
    });

    const questions = qRes.choices[0].message.content.split('\n').filter(Boolean);
    const newSessionId = crypto.randomUUID();

    sessions.set(newSessionId, { questions, answers: [], current: 0 });

    return NextResponse.json({ sessionId: newSessionId, question: questions[0] });
  }

  // Handle answer & get next question
  if (sessionId && typeof answer === 'string') {
    const session = sessions.get(sessionId);
    if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

    session.answers[session.current] = answer;
    session.current += 1;

    if (session.current < session.questions.length) {
      return NextResponse.json({ question: session.questions[session.current] });
    } else {
      return NextResponse.json({ end: true });
    }
  }

  return NextResponse.json({ error: 'Bad request' }, { status: 400 });
}
