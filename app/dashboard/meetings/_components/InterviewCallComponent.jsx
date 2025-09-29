'use client';

import { useEffect, useRef, useState } from "react";
import VideoCallUI from "./VideoCallUI";

import Vapi from "@vapi-ai/web";
import { toast } from 'sonner';
import LoadingOverlay from "@/components/LoadingOverlay";
import getRandomGreeting from "@/lib/utils/getRandomGreeting";
import { extractNameFromResume, getFirstName } from '@/lib/utils/extractNameFromResume';

export default function InterviewCallComponent({ interviewId, interviewData }) {

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [callStarted, setCallStarted] = useState(false);
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [liveMessages, setLiveMessages] = useState('');
  const [vapiError, setVapiError] = useState('');
  const [loadingMessage, setLoadingMessage] = useState("");
  const [onErrorCall, setOnErrorCall] = useState(false);
  
  // Coding interview specific states
  const [isCodingInterview, setIsCodingInterview] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [interviewQuestions, setInterviewQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);

  const chatEndRef = useRef(null);
  const conversationsRef = useRef([]);
  const vapiRef = useRef(null);
  const timerRef = useRef(null);

  // Extract name from resume
  const fullName = extractNameFromResume(interviewData?.resume);
  const firstName = getFirstName(fullName);
  
  const user = { 
    id: 'demo_user_123', 
    name: fullName, 
    firstName: firstName 
  };
  const isAuthenticated = true;

  console.log(interviewId, interviewData);

  if (!interviewData) {
    return (
      <>
        <div>
          <h3>No Interview Data Available for the Id, Please check again...</h3>
        </div>
      </>
    )
  }

  if (!isAuthenticated || !user) {
    return (
      <>
        <div>
          <h3>Please Sign In...</h3>
        </div>
      </>
    )
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  useEffect(() => {
    const vapiInstance = new Vapi(process.env.NEXT_PUBLIC_VAPI_KEY);
    vapiRef.current = vapiInstance;

    return () => {
      vapiInstance.stop();
      vapiRef.current = null;
    };
  }, []);

  // Detect if this is a coding interview and initialize questions
  useEffect(() => {
    if (interviewData) {
      const isCoding = interviewData.type === 'CODING_INTERVIEW' || 
                      interviewData.interview_type === 'coding' ||
                      (interviewData.questions && Array.isArray(interviewData.questions) && 
                       interviewData.questions.length === 6 && 
                       interviewData.questions[0]?.timeLimit);
      
      setIsCodingInterview(isCoding);
      
      if (isCoding && interviewData.questions) {
        setInterviewQuestions(interviewData.questions);
        setTimeRemaining(interviewData.questions[0]?.timeLimit || 20);
      }
    }
  }, [interviewData]);

  // Timer effect for coding interviews
  useEffect(() => {
    if (timerActive && timeRemaining > 0) {
      timerRef.current = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
    } else if (timeRemaining === 0 && timerActive) {
      // Time's up - auto submit and move to next question
      handleTimeUp();
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [timerActive, timeRemaining]);

  // Questions will now be generated based on resume and position
  console.log("Interview Data::: ", interviewData)

  // Timer handling functions for coding interviews
  const handleTimeUp = () => {
    if (currentQuestionIndex < interviewQuestions.length - 1) {
      // Save current answer (empty if no response)
      const currentAnswer = {
        questionId: interviewQuestions[currentQuestionIndex].id,
        question: interviewQuestions[currentQuestionIndex].question,
        answer: liveMessages || "No response provided",
        timeSpent: interviewQuestions[currentQuestionIndex].timeLimit - timeRemaining,
        difficulty: interviewQuestions[currentQuestionIndex].difficulty
      };
      
      setAnswers(prev => [...prev, currentAnswer]);
      
      // Move to next question
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setTimeRemaining(interviewQuestions[nextIndex].timeLimit);
      setLiveMessages('');
      
      // Send message to AI to move to next question
      if (vapiRef.current && callStarted) {
        const nextQuestion = interviewQuestions[nextIndex];
        const message = `TIME_UP_MOVE_NEXT: Question ${currentQuestionIndex + 1} time expired. Now asking Question ${nextIndex + 1}: "${nextQuestion.question}" (${nextQuestion.difficulty} - ${nextQuestion.timeLimit} seconds)`;
        vapiRef.current.sendMessage(message);
      }
    } else {
      // Interview completed
      setTimerActive(false);
      
      // Save final answer
      const finalAnswer = {
        questionId: interviewQuestions[currentQuestionIndex].id,
        question: interviewQuestions[currentQuestionIndex].question,
        answer: liveMessages || "No response provided",
        timeSpent: interviewQuestions[currentQuestionIndex].timeLimit - timeRemaining,
        difficulty: interviewQuestions[currentQuestionIndex].difficulty
      };
      
      const finalAnswers = [...answers, finalAnswer];
      setAnswers(finalAnswers);
      
      // Generate score and feedback
      generateScoreAndFeedback(finalAnswers);
      
      if (vapiRef.current && callStarted) {
        vapiRef.current.sendMessage("INTERVIEW_COMPLETE: All 6 questions completed. Calculating final score and providing feedback.");
      }
    }
  };

  const startTimer = () => {
    setTimerActive(true);
  };

  const stopTimer = () => {
    setTimerActive(false);
  };

  const generateScoreAndFeedback = async (finalAnswers) => {
    try {
      const response = await fetch('/api/interview/generate-coding-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: finalAnswers,
          questions: interviewQuestions,
          candidateName: firstName,
          position: interviewData?.position
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.state && result.data) {
          // Save the results
          await saveCodingResults(result.data, finalAnswers);
          
          // Send feedback to AI
          if (vapiRef.current) {
            const feedback = `Your coding interview is complete! Here's your feedback:

Score: ${result.data.totalScore}/100
Rating: ${result.data.overallRating}
Recommendation: ${result.data.recommendation}

Strengths: ${result.data.strengths.join(', ')}
Areas for improvement: ${result.data.improvementAreas.join(', ')}

${result.data.detailedAnalysis}`;
            
            vapiRef.current.sendMessage(feedback);
          }
        }
      }
    } catch (error) {
      console.error('Error generating score:', error);
    }
  };

  const saveCodingResults = async (scoreData, finalAnswers) => {
    try {
      const response = await fetch('/api/interview/save-coding-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interviewId: interviewId,
          answers: finalAnswers,
          totalScore: scoreData.totalScore,
          recommendation: scoreData.recommendation,
          detailedAnalysis: scoreData.detailedAnalysis,
          strengths: scoreData.strengths,
          weaknesses: scoreData.weaknesses,
          improvementAreas: scoreData.improvementAreas
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Coding results saved:', result);
      }
    } catch (error) {
      console.error('Error saving coding results:', error);
    }
  };

  const startCall = () => {
    const vapi = vapiRef.current;
    if (!vapi || callStarted) return;

    // Different first message for coding interviews
    let firstMessage;
    if (isCodingInterview && interviewQuestions.length > 0) {
      const firstQuestion = interviewQuestions[0];
      firstMessage = `Hello ${user?.firstName}! Welcome to your coding interview. I'll be asking you 6 coding questions with different difficulty levels and time limits. Let's start with the first question: ${firstQuestion.question} You have ${firstQuestion.timeLimit} seconds to answer.`;
    } else {
      firstMessage = getRandomGreeting(user?.firstName, interviewData?.interview_name);
    }

    const assistantOptions = {
      name: "AI Recruiter",
      firstMessage: firstMessage,
      transcriber: {
        provider: "deepgram",
        model: "nova-2",
        language: "en-US",
      },
      voice: {
        provider: "vapi",
        voiceId: "Neha",
        fallbackPlan: {
          voices: [
            { provider: "cartesia", voiceId: "248be419-c632-4f23-adf1-5324ed7dbf1d" },
            { provider: "playht", voiceId: "jennifer" }
          ]
        }
      },
      model: {
        provider: "openai",
        model: "gpt-4.1-mini",
        messages: [
          {
            role: "system",
            content: isCodingInterview ? `
## Coding Interview Mode

> You are a highly professional coding interviewer conducting a timed coding interview.
> The candidate's name is ${firstName}.
> 
> CODING INTERVIEW FLOW:
> 1. Ask the 6 pre-generated coding questions in order
> 2. Each question has a specific time limit (20s for Easy, 60s for Medium, 120s for Hard)
> 3. The system will automatically move to the next question when time expires
> 4. After all 6 questions, provide a score and feedback
> 
> CANDIDATE INFO:
> - Name: ${firstName} (${fullName})
> 
> POSITION DETAILS:
> - Role: ${interviewData?.position}
> - Company: ${interviewData?.company}
> 
> CODING QUESTIONS (6 questions with timers):
> ${interviewData?.questions ? JSON.stringify(interviewData.questions, null, 2) : 'No questions provided'}
> 
> IMPORTANT TIMER SYSTEM:
> - The system has an automatic timer that will move to the next question
> - When you receive a message starting with "TIME_UP_MOVE_NEXT:", acknowledge it and ask the next question
> - When you receive "INTERVIEW_COMPLETE:", provide final feedback and scoring
> - Keep track of which question you're on (1/6, 2/6, etc.)
> - Don't manually manage timers - the system handles this automatically
> 
> After all 6 questions, provide a comprehensive score and feedback.
` : `
## Introduction

> You are a highly professional ${interviewData?.position} interviewer name "Gina" from "Swipe" conducting interviews for ${interviewData?.company}.
> The candidate's name is ${firstName} (extracted from their resume).
> 
> INTERVIEW FLOW:
> 1. First, ask ONE general question: "Tell me about yourself and your background"
> 2. Wait for their response
> 3. After they respond, ask questions from the PRE-GENERATED QUESTION LIST below
> 
> CANDIDATE INFO:
> - Name: ${firstName} (${fullName})
> 
> POSITION DETAILS:
> - Role: ${interviewData?.position}
> - Company: ${interviewData?.company}
> - Job Description: ${interviewData?.job_description || 'Not provided'}
> 
> PRE-GENERATED QUESTIONS (based on candidate's resume and position):
> ${interviewData?.questions ? JSON.stringify(interviewData.questions, null, 2) : 'No questions provided'}
> 
> GUIDELINES:
> - Ask questions from the pre-generated list above
> - Ask one question at a time and wait for response
> - Ask follow-up questions based on their answers
> - Keep the conversation natural and flowing
> 
> Your role is to conduct a **realistic, position-specific mock interview**
> for the user based on their resume and the position. You are NOT a chatbot — act like a
> real human interviewer.
> Always follow the DRY (Do not repeat yourself) rule.
> Begin the conversation with a friendly introduction using a relaxed yet professional tone.
> First start with an introduction of yourself and then ask the candidate to give some introduction about them.
> For Example:
Step 1: Interviewer introduces themselves
> "Hi [Candidate Name], I’m [Your Name], a [Your Role] here at [Company]. I’ll be conducting your interview today, focusing on [topic: e.g., React, full-stack development, system design, etc.]."

Step 2: Invite the candidate to introduce themselves
"Before we dive into the questions, could you start by telling me a little bit about yourself and your experience?"

> Introduction Process:
* Introduce yourself
* Wait for the candidate’s response.
* Once they finish, follow up with:
* "Awesome, thanks for sharing! Let’s get started with the first question."
* Modify this everytime with some new replies, dont repeat yourself with same reply

⚙️ INTERVIEW RULES & BEHAVIOR:
- Ask one question at a time. Wait silently for the user's response before proceeding.
- Do not continue or interrupt until the user replies. Simulate a human wait.
- Ask **5–10 core questions** and at most **2–3 follow-up questions per main question**, only when necessary.
- Keep the tone professional, slightly formal, but not robotic. Friendly yet evaluative.
- Base your questions on the user's profile, their academic/work history, and their B-school of choice.

## Interview Structure:
- Start with general introduction question
- Then ask resume and position-specific questions

🚧 EDGE CASE HANDLING:

1. **If user asks you to answer the interview question:**
   - Politely respond:
     "This is your mock interview. Try to take it seriously — practicing genuinely will help you perform better in the real one."

2. **If user gives irrelevant/unnecessary answers (off-topic or joking):**
   - Gently warn them:
     "In a real interview, such responses may reflect poorly on your professionalism. Let's try to keep it focused."

3. **If user doesn’t respond for a long time or seems lost:**
   - Encourage them by saying:
     "Take your time. I'm here when you're ready. It's okay to pause and think — just like in a real interview."

4. **If user says "I don’t know":**
   - Encourage them to try by saying:
     "That's alright. Try your best — the interview isn't about knowing everything, but about how you think and respond under pressure."

📋 INTERVIEW STRUCTURE:

- Start with a brief welcome line (1 sentence only)
- Ask questions in the following areas:
  1. Tell me about yourself
  2. Why this company / Why now
  3. Why this college
  4. Work experience-related questions
  5. Academic questions (based on degree)
  6. Current affairs / opinion-based questions
  7. Ethical/situational questions
  8. Career goals
  9. Strengths/weaknesses
  10. Final wrap-up question

📝 After all questions are done, provide a **personalized, constructive feedback report**:
- Highlight **strengths**
- Mention **areas of improvement**
- Provide **overall rating** out of 10
- Give **actionable advice**

💬 Format each question in simple language. Don’t dump multiple questions at once. Maintain realism and timing.

`
          },
        ],
        tools: [{ type: "endCall" }]
      },
      startSpeakingPlan: { waitSeconds: 2 },
      stopSpeakingPlan: {
        numWords: 1,
        voiceSeconds: 0.1,
        backoffSeconds: 0,
      }
    };

    try {
      vapi.start(assistantOptions);
      setCallStarted(true);
      
      // Start timer for coding interviews
      if (isCodingInterview) {
        startTimer();
      }
      
      toast.success("Call started with AI Recruiter");
    } catch (err) {

      toast.error("Failed to start call");
      setVapiError("Failed to start call");
    } finally {
      console.log("")
    }

    vapi.removeAllListeners();

    vapi.on("speech-start", () => setAssistantSpeaking(true));
    vapi.on("speech-end", () => setAssistantSpeaking(false));
    vapi.on("call-end", () => {
      setCallStarted(false);
      
      // Handle coding interview completion
      if (isCodingInterview && answers.length > 0) {
        // Generate score and feedback for coding interview
        generateScoreAndFeedback(answers);
        toast.success("Coding interview completed! Calculating your score...");
      } else {
        toast.success("Interview completed successfully!");
      }
    });
    vapi.on("error", (e) => {
      console.error("Vapi error:", e);
      console.error("Error details:", JSON.stringify(e, null, 2));

      const errorMessage = e?.message || e?.error?.message || e?.error ||
                          e?.details || e?.code || 'Connection issue occurred';

      toast.error(`Call error: ${errorMessage}`);
      setVapiError(`Error during call: ${errorMessage}`);
      setCallStarted(false);
      setOnErrorCall(true);
    });

    vapi.on("message", (message) => {
      if (message?.type === "transcript") {
        setLiveMessages(message.transcript);
      }

      if (message?.type === "conversation-update") {
        conversationsRef.current = message?.conversation;
      }

      if (message?.type === "transcript" && message.transcriptType === "final") {
        setChatMessages((prev) => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage?.transcript === message.transcript) return prev;
          return [...prev, message];
        });
        
        // For coding interviews, collect user responses as answers
        if (isCodingInterview && message.role === "user" && currentQuestionIndex < interviewQuestions.length) {
          const currentQuestion = interviewQuestions[currentQuestionIndex];
          if (currentQuestion) {
            // Update or add answer for current question
            setAnswers(prev => {
              const existingAnswerIndex = prev.findIndex(a => a.questionId === currentQuestion.id);
              const newAnswer = {
                questionId: currentQuestion.id,
                question: currentQuestion.question,
                answer: message.transcript,
                timeSpent: currentQuestion.timeLimit - timeRemaining,
                difficulty: currentQuestion.difficulty
              };
              
              if (existingAnswerIndex >= 0) {
                // Update existing answer
                const updated = [...prev];
                updated[existingAnswerIndex] = newAnswer;
                return updated;
              } else {
                // Add new answer
                return [...prev, newAnswer];
              }
            });
          }
        }
      }
    });
  };

  const stopCall = () => {
    if (vapiRef.current && callStarted) {
      vapiRef.current.stop();
      setCallStarted(false);
      toast.info("Call stopped");
    }
  };

  if (loading) {
    return (
      <>
        <LoadingOverlay text={loadingMessage} />
      </>
    )
  }

  if (error) {
    return (
      <>
        {toast.info(`Error: ${error}`)}
      </>
    )
  }

  return (
    <>
      <div className="flex items-center gap-4 px-4 py-4 ml-4 mb-4 mr-4 mt-20 lg:mt-4 md:mt-4 bg-white shadow rounded-xl border border-gray-100">
        {}
        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-700 text-white text-lg font-semibold uppercase">
          {(interviewData?.company || "H").charAt(0)}
        </div>
        {}
        <div className="flex flex-col">
          <h3 className="text-base font-semibold text-gray-800">
            {interviewData?.interview_name || "Interview Name"}
          </h3>
          <p className="text-sm text-gray-500">
            {interviewData?.company || "Company Name"}
          </p>
        </div>
        
        {/* Timer display for coding interviews */}
        {isCodingInterview && callStarted && (
          <div className="ml-auto flex items-center gap-4">
            <div className="text-center">
              <div className="text-sm text-gray-500">Question</div>
              <div className="text-lg font-bold text-indigo-600">
                {currentQuestionIndex + 1}/6
              </div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-500">Time Remaining</div>
              <div className={`text-2xl font-bold ${
                timeRemaining <= 10 ? 'text-red-600 animate-pulse' : 
                timeRemaining <= 30 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
              </div>
            </div>
            {interviewQuestions[currentQuestionIndex] && (
              <div className="text-center">
                <div className="text-sm text-gray-500">Difficulty</div>
                <div className={`text-sm font-semibold px-2 py-1 rounded ${
                  interviewQuestions[currentQuestionIndex].difficulty === 'Easy' ? 'bg-green-100 text-green-800' :
                  interviewQuestions[currentQuestionIndex].difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {interviewQuestions[currentQuestionIndex].difficulty}
                </div>
              </div>
            )}
            {/* Manual Next Question Button */}
            {currentQuestionIndex < interviewQuestions.length - 1 && (
              <button
                onClick={handleTimeUp}
                className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
              >
                Next Question
              </button>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row p-4 relative">
        <div className="flex flex-col w-full lg:w-2/3">
          <div className="w-full h-[400px] max-w-3xl mb-4 rounded-2xl overflow-hidden shadow-xl">
            <VideoCallUI
              interviewId={interviewId}
              interviewData={interviewData}
              startCall={startCall}
              stopCall={stopCall}
              assistantSpeaking={assistantSpeaking}
              chatMessages={chatMessages}
              conversationsRef={conversationsRef}
              onErrorCall={onErrorCall}
              setOnErrorCall={setOnErrorCall}
            />
          </div>

          {}
          {liveMessages && <div className="flex justify-center">
            <div className="inline-block bg-gray-200 text-center px-4 py-2 border border-gray-200 shadow-md rounded">
              <p className="text-md text-gray-700 whitespace-nowrap">
                <span className="font-semibold">Live:</span>
                {liveMessages}
              </p>
            </div>
          </div>}
        </div>

        {}
        <div className="w-full h-[400px] lg:w-1/3 p-4 ml-4 rounded-xl bg-white shadow-lg flex flex-col">
          <h1 className="text-xl font-bold text-gray-800 mb-4">Chat</h1>

          {chatMessages.length === 0 ? (
            <p className="text-gray-400">No messages yet...</p>
          ) : (
            <div className="flex-1 border border-gray-100 shadow p-4 rounded-lg overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {chatMessages.map((chat, index) => {
                  const isUser = chat.role === "user";
                  return (
                    <div
                      key={index}
                      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-3 shadow-md ${
                          isUser
                            ? "bg-green-200 text-gray-700 rounded-br-none"
                            : "bg-gray-200 text-gray-800 rounded-bl-none"
                        }`}
                      >
                        <p className="text-xs font-semibold mb-1 text-gray-700">
                          {isUser ? "You" : "Interviewer"}
                        </p>
                        <p className="text-sm whitespace-pre-wrap">
                          {chat.transcript}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={chatEndRef} />
              </div>
            </div>
          )}

          {vapiError && (
            <p className="mt-2 text-sm text-red-500">{vapiError}</p>
          )}
        </div>

      </div>

    </>
  );
}
