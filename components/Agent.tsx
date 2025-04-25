"use client";

import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { vapi } from "@/lib/vapi.sdk";
import { interviewer } from "@/constants";
import {
  createFeedback,
  checkUserCredits,
  deductCredit,
} from "@/lib/actions/general.action";
import UserAvatar from "./UserAvatar";

enum CallStatus {
  INACTIVE = "INACTIVE",
  CONNECTING = "CONNECTING",
  ACTIVE = "ACTIVE",
  FINISHED = "FINISHED",
}

interface SavedMessage {
  role: "user" | "system" | "assistant";
  content: string;
}

interface AgentProps {
  userName: string;
  userId?: string;
  interviewId?: string;
  feedbackId?: string;
  type: "generate" | "questions";
  questions?: string[];
  profileURL?: string;
  role?: string;
}

const Agent = ({
  userName,
  userId,
  interviewId,
  feedbackId,
  type,
  questions,
  profileURL,
  role,
}: AgentProps) => {
  const router = useRouter();
  const [callStatus, setCallStatus] = useState<CallStatus>(CallStatus.INACTIVE);
  const [messages, setMessages] = useState<SavedMessage[]>([]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastMessage, setLastMessage] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error) => {
      // Skip any console output for meeting ended messages
      if (error.message.includes("Meeting has ended")) {
        return;
      }
      // Only log and show toast for real errors
      console.error("Interview Error:", error);
      toast.error("Something went wrong with the interview. Please try again.");
    };

    vapi.on("call-start", onCallStart);
    vapi.on("call-end", onCallEnd);
    vapi.on("message", onMessage);
    vapi.on("speech-start", onSpeechStart);
    vapi.on("speech-end", onSpeechEnd);
    vapi.on("error", onError);

    return () => {
      vapi.off("call-start", onCallStart);
      vapi.off("call-end", onCallEnd);
      vapi.off("message", onMessage);
      vapi.off("speech-start", onSpeechStart);
      vapi.off("speech-end", onSpeechEnd);
      vapi.off("error", onError);
    };
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      console.log("handleGenerateFeedback");

      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
        earlyEnd: false,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/dashboard");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      if (type === "generate") {
        toast.success(
          "Interview generated successfully! Redirecting to dashboard..."
        );
        router.push("/dashboard");
      } else {
        handleGenerateFeedback(messages);
      }
    }
  }, [messages, callStatus, feedbackId, interviewId, router, type, userId]);

  const handleCall = async () => {
    if (!userId) {
      toast.error("Please sign in to take an interview");
      router.push("/sign-in");
      return;
    }

    setLoading(true);
    try {
      // Check microphone permissions first
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: true,
        });
        stream.getTracks().forEach((track) => track.stop()); // Release the stream
      } catch (error) {
        toast.error(
          "Microphone access is required for the interview. Please allow microphone access and try again."
        );
        setLoading(false);
        return;
      }

      // Only check credits for actual interviews, not generation
      if (type !== "generate") {
        const { credits, hasSubscription } = await checkUserCredits(userId);
        if (!hasSubscription && credits === 0) {
          toast.error("You're out of credits. Buy more to continue.");
          setLoading(false);
          return;
        }

        // Deduct credit before starting
        const success = await deductCredit(userId);
        if (!success) {
          toast.error("Failed to deduct credit. Please try again.");
          setLoading(false);
          return;
        }
      }

      setCallStatus(CallStatus.CONNECTING);

      if (type === "generate") {
        await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
          variableValues: {
            username: userName,
            userid: userId,
          },
        });
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        await vapi.start(interviewer, {
          variableValues: {
            questions: formattedQuestions,
            role: role || "General Position",
          },
        });
      }
    } catch (error: any) {
      console.error("Error starting interview:", error);
      toast.error(
        error.message || "Failed to start interview. Please try again."
      );
      setCallStatus(CallStatus.INACTIVE);
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    setCallStatus(CallStatus.FINISHED);
    vapi.stop();

    // If this is an actual interview (not generation) and we have messages
    if (type !== "generate" && messages.length > 0) {
      const { success, feedbackId: id } = await createFeedback({
        interviewId: interviewId!,
        userId: userId!,
        transcript: messages,
        feedbackId,
        earlyEnd: true,
      });

      if (success && id) {
        router.push(`/interview/${interviewId}/feedback`);
      } else {
        console.log("Error saving feedback");
        router.push("/dashboard");
      }
    }
  };

  return (
    <>
      <div className="call-view">
        {/* AI Interviewer Card */}
        <div className="card-interviewer">
          <div className="avatar">
            <Image
              src="/ai-avatar.png"
              alt="profile-image"
              width={65}
              height={54}
              className="object-cover"
            />
            {isSpeaking && <span className="animate-speak" />}
          </div>
          <h3>AI Interviewer</h3>
          {callStatus === CallStatus.CONNECTING && (
            <p className="text-sm text-gray-500">Connecting...</p>
          )}
        </div>

        {/* User Profile Card */}
        <div className="card-border">
          <div className="card-content">
            <UserAvatar name={userName} profileURL={profileURL} />
            <h3>{userName}</h3>
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="transcript-border">
          <div className="transcript">
            <p
              key={lastMessage}
              className={cn(
                "transition-opacity duration-500 opacity-0",
                "animate-fadeIn opacity-100"
              )}
            >
              {lastMessage}
            </p>
          </div>
        </div>
      )}

      <div className="w-full flex justify-center mt-8">
        {callStatus !== "ACTIVE" ? (
          <button
            className="relative btn-call"
            onClick={() => handleCall()}
            disabled={loading}
          >
            <span
              className={cn(
                "absolute animate-ping rounded-full opacity-75",
                callStatus !== "CONNECTING" && "hidden"
              )}
            />
            <span className="relative">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Preparing...</span>
                </div>
              ) : callStatus === "INACTIVE" || callStatus === "FINISHED" ? (
                "Call"
              ) : (
                ". . ."
              )}
            </span>
          </button>
        ) : (
          <button className="btn-disconnect" onClick={() => handleDisconnect()}>
            End
          </button>
        )}
      </div>
    </>
  );
};

export default Agent;
