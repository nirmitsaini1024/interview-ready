import { useState, useEffect, useRef, useCallback } from 'react';
import Vapi from '@vapi-ai/web';
import { useAuth } from '@/app/context/AuthContext';
import { extractNameFromResume, getFirstName } from '@/lib/utils/extractNameFromResume';
import { useReport } from './useReport';

export const useVapi = (interviewData, interviewId) => {
  const [assistantSpeaking, setAssistantSpeaking] = useState(false);
  const [liveMessages, setLiveMessages] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [callActive, setCallActive] = useState(false);
  const [vapiError, setVapiError] = useState('');

  const conversationsRef = useRef([]);
  const vapi = new Vapi(process.env.NEXT_PUBLIC_VAPI_KEY);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const stopVapi = useCallback(() => {
    vapi.stop();
    setCallActive(false);
    console.log('VAPI session stopped');
  }, [vapi]);

  const stopCall = useCallback(() => {
    stopVapi();
    setCallActive(false);
    console.log('User stopped the call');
  }, [vapi]);

  const chat = useCallback(() => {
    // Extract name from resume
    const fullName = extractNameFromResume(interviewData?.resume);
    const firstName = getFirstName(fullName);
    
    const assistantOptions = {
      name: 'AI Recruiter',
      firstMessage: `Hi ${firstName}, how are you? Ready for your ${interviewData?.company} ${interviewData?.position} interview? `,
      transcriber: {
        provider: 'deepgram',
        model: 'nova-2',
        language: 'en-US',
      },
      voice: {
        provider: 'vapi',
        voiceId: 'Neha',
        fallbackPlan: {
          voices: [
            { provider: 'cartesia', voiceId: '248be419-c632-4f23-adf1-5324ed7dbf1d' },
            { provider: 'playht', voiceId: 'jennifer' },
          ],
        },
      },
      model: {
        provider: 'openai',
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `

              You are an AI recruiter conducting a ${interviewData?.position} interview at ${interviewData?.company}.
              The candidate's name is ${firstName} (extracted from their resume).
              
              INTERVIEW FLOW:
              1. First, ask ONE general question: "Tell me about yourself and your background"
              2. Wait for their response
              3. After they respond, ask questions from the PRE-GENERATED QUESTION LIST below
              
              CANDIDATE INFO:
              - Name: ${firstName} (${fullName})
              
              POSITION DETAILS:
              - Role: ${interviewData?.position}
              - Company: ${interviewData?.company}
              - Job Description: ${interviewData?.job_description || 'Not provided'}
              
              PRE-GENERATED QUESTIONS (based on candidate's resume and position):
              ${interviewData?.questions ? JSON.stringify(interviewData.questions, null, 2) : 'No questions provided'}
              
              GUIDELINES:
              - Ask questions from the pre-generated list above
              - Ask one question at a time and wait for response
              - Ask follow-up questions based on their answers
              - Keep the conversation natural and flowing
              
              Always wait for user's response before asking the next question.
              Ask a total of 5-6 questions maximum.

            `.trim(),
          },
        ],
        tools: [{ type: 'endCall' }],
      },
      startSpeakingPlan: {
        waitSeconds: 2,
      },
      stopSpeakingPlan: {
        numWords: 1,
        voiceSeconds: 0.1,
        backoffSeconds: 0,
      },
    };

    vapi.start(assistantOptions);
    setCallActive(true);

    vapi.on('speech-start', () => {
      console.log('Assistant speech has started.');
      setAssistantSpeaking(true);
    });

    vapi.on('speech-end', () => {
      console.log('Assistant speech has ended.');
      setAssistantSpeaking(false);
    });

    vapi.on('call-start', () => {
      console.log('Call has started.');
    });

    vapi.on('call-end', () => {
      console.log('Call has ended.');
      setCallActive(false);
    });

    vapi.on('message', (message) => {
      console.log('Vapi Message:', message);

      if (message?.type === 'transcript') {
        setLiveMessages(message.transcript);
      }

      if (message?.type === 'conversation-update') {
        console.log('Conversation update:', message.conversation);
        conversationsRef.current = message?.conversation; // <- update ref
      }

      if (message?.type === 'transcript' && message.transcriptType === 'final') {
        setChatMessages((prev) => [...prev, message]);
      }
    });

    vapi.on('error', (e) => {
      console.log('Vapi Error:', e);
      setVapiError('Error with voice assistant');

      try {
              stopCall(); 

      } catch (error) {
        console.error('Error handling call after VAPI error:', error);
      }
    });

    vapi.send({
      type: 'add-message',
      message: {
        role: 'system',
        content: 'The user has pressed the button, say peanuts',
      },
    });

  }, [interviewData, interviewId]);

  useEffect(() => {
    return () => {
      vapi.stop();
    };
  }, [vapi]);

  return {
    assistantSpeaking,
    liveMessages,
    chatMessages,
    callActive,
    chat,
    stopCall,
    vapiError,
    conversationsRef,
  };
};