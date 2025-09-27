'use client';

import { useEffect, useRef, useState } from "react";
import {
  Video,
  PhoneOff,
  Mic,
  MicOff,
  VideoOff,
  PhoneIcon,
  Loader,
  Loader2,
  Cross,
  X
} from "lucide-react";
import { useRouter } from "next/navigation";
import generateReport from "@/app/service/interview/generateReport";
import submitInteviewAttempt from "@/app/service/interview/submitInteviewAttempt";
import saveInterviewReport from "@/app/service/interview/saveInterviewReport";
import { deriveStatus, extractScoreAndRecommendation, parseGeneratedReport } from "@/lib/utils/helper";
import { toast } from "sonner";
import LoadingOverlay from "@/components/LoadingOverlay";
import avatar from '../../../../public/avatar.jpg'
import CameraComponent from "./CameraComponent";
import Image from "next/image";
import updateInterviewDuration from "@/app/service/interview/updateInterviewDuration";
import Link from "next/link";
import Modal from "@/components/Modal";

export default function VideoCallUI({
  interviewId,
  interviewData,
  startCall,
  stopCall,
  assistantSpeaking,
  chatMessages,
  conversationsRef,
  onErrorCall
}) {
  const [callTime, setCallTime] = useState(0);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [callStatus, setCallStatus] = useState(false);
  const [callStartTime, setCallStartTime] = useState();
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [buttonStatus, setButtonStatus] = useState(true);

  const router = useRouter();
  const endCallTriggered = useRef(false);
  const isMounted = useRef(true);

  if (!interviewId || !interviewData) {

    toast("Invalid interviewId or interviewData. Please try again.");

    return null; // Render nothing if the required props are missing
  }

  const toggleMic = () => {
    toast("Mic access is required and cannot be disabled during the interview.");
  };

  useEffect(() => {
    if (!callStatus) return;
    const timer = setInterval(() => {
      setCallTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [callStatus]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const handleStartCall = () => {
    setIsLoading(true)
    setButtonStatus(false)

    startCall()
    setCallStartTime(new Date().toISOString())
    toast("Call started, wait for a few seconds...")

    setTimeout(() => {
      setIsLoading(false)
      setButtonStatus(true)
      setCallStatus(true)
    }, 8000)
  }

  const handleEndCall = async () => {
    if (endCallTriggered.current) return;
    endCallTriggered.current = true;

    try {
      stopCall();
      setCallStatus(false);
      toast("Call ended");
      setButtonStatus(false);
      setLoading(true);

      const generatedReport = await handleGenerateReport();
      if (!generatedReport?.status || !generatedReport?.data) {
        return;
      }

      const status = await deriveStatus(interviewData?.duration, interviewData?.current_duration, callTime);
      const updateInterviewDB = await updateInterviewDuration(callTime, interviewId, status)

      if (!updateInterviewDB.state) {

        toast.error("Error: ", updateInterviewDB.error);
      }
      setLoadingMessage("Saving Report...");

      const submitAttempt = await submitInteviewAttempt(
        interviewId,
        callStartTime,
        status,
        conversationsRef
      );

      if (!submitAttempt?.state || !submitAttempt?.data?.id) {
        toast.error("❌ Failed to submit the attempt");
        return;
      }

      const parsedResult = parseGeneratedReport(generatedReport.data);
      if (!parsedResult) {
        toast.error("❌ Failed to parse report");
        return;
      }

      const { score, recommendation } = extractScoreAndRecommendation(parsedResult);

      const saveReport = await saveInterviewReport(
        interviewId,
        submitAttempt.data.id,
        score,
        recommendation,
        parsedResult,
        callTime
      );

      if (!saveReport?.state) {
        toast.error("Failed to save report");
        return;
      }

      toast.success("Report submitted successfully");
    } catch (err) {

      toast.error("Unexpected error occurred during end call");
      setLoading(false)
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setCallTime(0);
        router.push("/dashboard/report");
      }
    }
  };

  const handleGenerateReport = async () => {
    setLoadingMessage("Generating Report...");
    const result = await generateReport(conversationsRef);
    if (!result.state) {
      toast.error(result.error);
      return false;
    }
    toast.success("Report generated Successfully");
    return {
      status: true,
      data: result.data
    };
  };

  useEffect(() => {
    if (onErrorCall) {

      handleEndCall();
    }
  }, [onErrorCall]);

  useEffect(() => {

    const durationInSeconds = Number(interviewData?.duration) * 60; // Convert minutes to seconds
    const currentDurationInSeconds = Number(interviewData?.current_duration) || 0;
    const durationLeft = durationInSeconds - currentDurationInSeconds;
    const threshold = durationLeft;

    if (isNaN(durationLeft) || durationLeft <= 0) return;

    if (!callStatus) return;

    if (callTime >= threshold) {

      handleEndCall();
    }

    if (callTime > threshold - 10) {
      const secondsLeft = threshold - callTime;
      if (secondsLeft > 0) {
        toast.warning(`You have ${secondsLeft} seconds left`);
      }
    }
  }, [callTime, callStatus, interviewData?.duration, interviewData?.current_duration]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  if (loading) {
    return (
      <>
        <LoadingOverlay text={loadingMessage} />
      </>
    )
  }

  return (
    <div className="relative w-full h-[400px] bg-gray-700 text-white flex items-center justify-center overflow-hidden">
      <div className="absolute top-4 left-4 text-sm bg-gray-900/70 px-3 py-1 rounded-full">
        {formatTime(callTime)}
      </div>

      {}
      <div className="absolute top-4 right-4 w-40 h-28 shadow-2xl bg-gray-500 rounded-lg overflow-hidden">
        <CameraComponent isVisible={!isVideoOff} />
      </div>

      {}
      <div className="flex flex-col items-center gap-2">
        <div className="w-40 h-40 rounded-full overflow-hidden border-4 shadow-2xl border-gray-600">
          <Image
            src={avatar}
            alt="User Avatar"
            className="w-full h-full object-cover"
          />
        </div>
        {assistantSpeaking && (
          <h2 className="text-lg font-semibold mt-2">Assistant Speaking...</h2>
        )}

      </div>

      {}
      <div className="absolute bottom-6 w-full flex justify-center gap-6">
        {}
        <button
          className="bg-gray-800 hover:bg-gray-500 cursor-pointer rounded-full p-4"
          onClick={toggleMic}
          title="Toggle Mic"
        >
          <Mic className="text-white" />
        </button>

        {}
        <button
          className="bg-gray-800 hover:bg-gray-500 cursor-pointer rounded-full p-4"
          onClick={() => setIsVideoOff(!isVideoOff)}
          title="Toggle Video"
        >
          {isVideoOff ? (
            <VideoOff className="text-white" />
          ) : (
            <Video className="text-white" />
          )}
        </button>

        {}
        {callStatus ? (
          <button
            disabled={!buttonStatus}
            className={`flex gap-2 items-center rounded-full px-5 py-3 text-sm font-medium transition-colors
            ${callStatus && buttonStatus ? 'bg-red-600 hover:bg-red-500' : 'bg-gray-500 cursor-not-allowed'}
            text-white`}
            onClick={handleEndCall}
            title="End Call"
          >
            <PhoneOff className="h-4 w-4" />
            End Call
          </button>
        ) : (
          <button
            disabled={!buttonStatus}
            onClick={handleStartCall}
            title="Start Call"
            className={`flex gap-2 items-center rounded-full px-5 py-3 text-sm font-medium transition-colors cursor-pointer
              ${buttonStatus ? 'bg-indigo-700 hover:bg-indigo-900' : 'bg-gray-500 cursor-not-allowed'}
              text-white`}
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <PhoneIcon className="h-4 w-4" />
                Start Call
              </>
            )}
          </button>
        )}
      </div>

    </div>

  );
}
