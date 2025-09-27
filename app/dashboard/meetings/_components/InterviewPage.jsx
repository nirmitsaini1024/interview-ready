'use client';

import { useEffect, useState, useMemo } from "react";

import CallComponent from "./CallComponent";
import InterviewJoinScreen from "./InterviewJoinScreen";
import { toast } from "sonner";
import LoadingOverlay from "@/components/LoadingOverlay";
import InterviewCallComponent from "./InterviewCallComponent";

export default function InterviewPage({ interviewId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [interviewAccess, setInterviewAccess] = useState(false);
  const [showCallComponent, setShowCallComponent] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [validating, setValidating] = useState(false);

  const user = useMemo(() => ({ id: 'demo_user_123', name: 'Demo User' }), []);
  const isAuthenticated = true;
  const authLoading = false;

  useEffect(() => {
    validateUser();
  }, [interviewId]); // Remove user from dependencies since it's stable now

  async function validateUser() {
      if (!user?.id || validating) return; // Prevent multiple simultaneous requests

      try {
        setValidating(true);
        setLoadingMessage("Fetching Interview Details...");
        const response = await fetch(`/api/interview/validate/${interviewId}`)
        const result = await response.json();

                toast.success("Interview details loaded");

        if (!result.state) {
          if (result.error?.includes('Please create your interview')) {
            setInterviewAccess(true);
                    toast.error(err.message || 'Please create your interview');

          } else {
            setError(result.error || 'Validation failed');
            toast.error(err.message || 'Validation failed');
          }
          return;
        }

        if (result.state) {
          setInterviewAccess(true);
          setInterviewData(result?.data)
        }

      } catch (err) {

        setError('Something went wrong validating user');
      } finally {
        setLoading(false);
        setValidating(false);
      }
  }

  const handleJoinInterview = async () => {

    setShowCallComponent(true);
  };

  if (authLoading || loading) {
    return <div className="text-center mt-20 text-gray-600">Loading...</div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="text-center mt-20">
        <p className="text-red-600 font-semibold">Please sign in to continue</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-20">
        <h2 className="text-red-600 font-semibold text-lg mb-2">Error</h2>
        <p className="text-gray-700">{error}</p>
        <a href="/dashboard/report" className="text-blue-600 underline mt-4 block">
          Go to Report Dashboard
        </a>
      </div>
    );
  }

  if(loading){
      return(
        <>
          <LoadingOverlay text={loadingMessage} />
        </>
      )
    }

  if (showCallComponent) {
    if(interviewData?.type === "ADMISSION"){
      console.log("admission component")
      return <InterviewCallComponent interviewId={interviewId} interviewData={interviewData} />;
    } else{
      console.log("normal component")
      return <CallComponent interviewId={interviewId} interviewData={interviewData} />;
    }
  }

  if (!interviewAccess) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Dont have Interview access</h2>
        <p className="text-gray-700">Please create new interview.</p>
        <a href="/dashboard/interview/create" className="mt-4 text-blue-600 underline">Create Interview</a>
      </div>
    );
  }

  if (interviewAccess) {
    return <InterviewJoinScreen onJoinInterview={handleJoinInterview} interviewData={interviewData} />;
  }

  return null; // Fallback state
}
