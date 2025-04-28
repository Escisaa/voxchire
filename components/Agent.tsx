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

// Global console patching to suppress VAPI ejection messages
// This needs to be outside the component to ensure it runs early
if (typeof window !== "undefined") {
  // Save original console methods
  const originalConsoleError = console.error;
  const originalConsoleLog = console.log;
  const originalConsoleWarn = console.warn;

  // Helper function to check if any argument contains ejection-related text
  const containsEjectionMessage = (args: any[]) => {
    for (const arg of args) {
      // Check strings directly
      if (
        typeof arg === "string" &&
        (arg.includes("Meeting has ended") ||
          arg.includes("ejection") ||
          arg.includes("meeting"))
      ) {
        return true;
      }

      // Check error objects with message property
      if (arg && typeof arg === "object") {
        // Check error.message
        if (
          arg.message &&
          typeof arg.message === "string" &&
          (arg.message.includes("Meeting has ended") ||
            arg.message.includes("ejection") ||
            arg.message.includes("meeting"))
        ) {
          return true;
        }

        // Check for nested error objects
        if (
          arg.error &&
          arg.error.message &&
          typeof arg.error.message === "string" &&
          (arg.error.message.includes("Meeting has ended") ||
            arg.error.message.includes("ejection") ||
            arg.error.message.includes("meeting"))
        ) {
          return true;
        }

        // Check JSON stringified object for ejection messages
        try {
          const jsonStr = JSON.stringify(arg);
          if (
            jsonStr.includes("Meeting has ended") ||
            jsonStr.includes("ejection") ||
            jsonStr.includes("meeting")
          ) {
            return true;
          }
        } catch (e) {
          // Ignore errors from stringification
        }
      }
    }
    return false;
  };

  // Override console.error to filter out ejection messages
  console.error = function (...args) {
    if (containsEjectionMessage(args)) {
      return; // Don't output anything
    }

    // For all other errors, use the original method
    originalConsoleError.apply(console, args);
  };

  // Also patch console.log for the same messages
  console.log = function (...args) {
    if (containsEjectionMessage(args)) {
      return; // Don't output anything
    }

    // For all other logs, use the original method
    originalConsoleLog.apply(console, args);
  };

  // Also patch console.warn for completeness
  console.warn = function (...args) {
    if (containsEjectionMessage(args)) {
      return; // Don't output anything
    }

    // For all other warnings, use the original method
    originalConsoleWarn.apply(console, args);
  };

  // Extra coverage: Use MutationObserver to remove console errors from DOM
  // This helps with browser devtools that might display errors directly
  setTimeout(() => {
    try {
      const observer = new MutationObserver((mutations) => {
        // Check added nodes for console error elements
        mutations.forEach((mutation) => {
          if (mutation.addedNodes && mutation.addedNodes.length > 0) {
            for (let i = 0; i < mutation.addedNodes.length; i++) {
              const node = mutation.addedNodes[i];
              // Check if the added node is an element
              if (node.nodeType === 1) {
                // Look for text content containing ejection messages
                const element = node as Element;
                if (
                  element.textContent &&
                  (element.textContent.includes("Meeting has ended") ||
                    element.textContent.includes("ejection") ||
                    element.textContent.includes("meeting"))
                ) {
                  // Check if this is a console error element (various browsers use different classes)
                  if (
                    element.classList &&
                    (element.classList.contains("console-error-level") ||
                      element.classList.contains("console-error") ||
                      element.classList.toString().includes("error"))
                  ) {
                    // Hide or remove the element
                    (element as HTMLElement).style.display = "none";
                    // Optionally, completely remove it
                    element.remove();
                  }
                }
              }
            }
          }
        });
      });

      // Start observing the document with the configured parameters
      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });
    } catch (e) {
      // Silently fail if browser doesn't support MutationObserver
    }
  }, 1000); // Delay to ensure document is ready
}

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
  const [generationComplete, setGenerationComplete] = useState(false);

  useEffect(() => {
    const onCallStart = () => {
      setCallStatus(CallStatus.ACTIVE);
    };

    const onCallEnd = () => {
      setCallStatus(CallStatus.FINISHED);
    };

    const onMessage = (message: Message) => {
      if (message.type === "transcript" && message.transcriptType === "final") {
        // Only log in development mode
        if (process.env.NODE_ENV === "development") {
          console.log("Got transcript message:", message);
        }

        const newMessage = { role: message.role, content: message.transcript };
        setMessages((prev) => [...prev, newMessage]);

        // Update the last message immediately
        setLastMessage(message.transcript);

        // Mark generation as complete when we receive the final message
        if (type === "generate" && message.role === "assistant") {
          setGenerationComplete(true);
        }
      }
    };

    const onSpeechStart = () => {
      setIsSpeaking(true);
    };

    const onSpeechEnd = () => {
      setIsSpeaking(false);
    };

    const onError = (error: Error | any) => {
      // Check for ejection/meeting ended messages in any format
      const errorMessage =
        typeof error === "string"
          ? error
          : error?.message || JSON.stringify(error);

      if (
        errorMessage.includes("Meeting has ended") ||
        errorMessage.includes("ejection") ||
        errorMessage.includes("meeting")
      ) {
        // Silently handle ejection errors - no logs at all

        // If the error is because meeting has ended, we should finish gracefully
        if (
          callStatus === CallStatus.ACTIVE ||
          callStatus === CallStatus.CONNECTING
        ) {
          setCallStatus(CallStatus.FINISHED);
        }
        return;
      }

      // Only log non-ejection or empty errors for debugging
      if (process.env.NODE_ENV === "development") {
        console.log("VAPI error structure:", JSON.stringify(error, null, 2));
      }

      // Comprehensive check for empty or non-critical errors
      const isEmptyError =
        error === null ||
        error === undefined ||
        (typeof error === "object" && Object.keys(error).length === 0) ||
        error?.message === "" ||
        (error?.message === undefined && Object.keys(error).length <= 1); // Sometimes there's just a name property

      if (isEmptyError) {
        // Silently handle empty errors - no logs at all

        // Also treat as normal end
        if (
          callStatus === CallStatus.ACTIVE ||
          callStatus === CallStatus.CONNECTING
        ) {
          setCallStatus(CallStatus.FINISHED);
        }
        return;
      }

      // Only log real errors in development mode
      if (process.env.NODE_ENV === "development") {
        console.error("Real Interview Error:", error);
      }

      // Still show toast for real errors
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
    // Only log in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("Messages updated:", messages.length, "messages");
    }

    // Only update last message from array if we have messages and haven't directly set it
    if (
      messages.length > 0 &&
      messages[messages.length - 1].content !== lastMessage
    ) {
      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("Updating last message from array");
      }
      setLastMessage(messages[messages.length - 1].content);
    }

    const handleGenerateFeedback = async (messages: SavedMessage[]) => {
      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("handleGenerateFeedback");
      }

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
        // Only log in development mode
        if (process.env.NODE_ENV === "development") {
          console.log("Error saving feedback");
        }
        router.push("/dashboard");
      }
    };

    if (callStatus === CallStatus.FINISHED) {
      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Call finished, type:",
          type,
          "generationComplete:",
          generationComplete
        );
      }

      // Use a flag to prevent showing multiple toasts
      let redirected = false;

      if (type === "generate" && generationComplete) {
        toast.success(
          "Interview generated successfully! Redirecting to dashboard..."
        );
        router.push("/dashboard");
        redirected = true;
      } else if (type !== "generate") {
        if (messages.length > 0) {
          handleGenerateFeedback(messages);
          redirected = true;
        } else {
          // Only log in development mode
          if (process.env.NODE_ENV === "development") {
            console.log("No messages to generate feedback from");
          }
          // Only show this error if we have no messages when the call is finished
          toast.error("No interview data was recorded. Please try again.");
          router.push("/dashboard");
          redirected = true;
        }
      } else if (!redirected) {
        // Silent redirect only if no other action taken
        // Only log in development mode
        if (process.env.NODE_ENV === "development") {
          console.log("Generation was not completed, redirecting silently");
        }
        router.push("/dashboard");
      }
    }
  }, [
    messages,
    callStatus,
    feedbackId,
    interviewId,
    router,
    type,
    userId,
    generationComplete,
    lastMessage,
  ]);

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
        // Make sure we reset the generationComplete flag
        setGenerationComplete(false);

        // Log the workflow ID being used only in development
        if (process.env.NODE_ENV === "development") {
          console.log(
            "Starting workflow with ID:",
            process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID
          );
        }

        // Add error handling specifically for the workflow call
        try {
          // Log only in development
          if (process.env.NODE_ENV === "development") {
            console.log("Starting generation with variables:", {
              username: userName,
              userid: userId,
            });
          }

          await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID!, {
            variableValues: {
              username: userName,
              userid: userId,
            },
          });

          // Log only in development
          if (process.env.NODE_ENV === "development") {
            console.log("Generation started successfully");
          }
        } catch (vapiError) {
          // Log error only in development mode
          if (process.env.NODE_ENV === "development") {
            console.error("VAPI generation start error:", vapiError);
          }

          // Try to get more details about the error
          let errorMessage = "Error starting the interview generation.";
          if (typeof vapiError === "object" && vapiError !== null) {
            errorMessage =
              (vapiError as any).message || JSON.stringify(vapiError);
          }

          toast.error(`${errorMessage} Please try again.`);
          setCallStatus(CallStatus.INACTIVE);
          setLoading(false);
          return;
        }
      } else {
        let formattedQuestions = "";
        if (questions) {
          formattedQuestions = questions
            .map((question) => `- ${question}`)
            .join("\n");
        }

        try {
          // Log only in development
          if (process.env.NODE_ENV === "development") {
            console.log("Starting interview with variables:", {
              questions: formattedQuestions ? "Present" : "Not provided",
              role: role || "General Position",
            });
          }

          await vapi.start(interviewer, {
            variableValues: {
              questions: formattedQuestions,
              role: role || "General Position",
            },
          });

          // Log only in development
          if (process.env.NODE_ENV === "development") {
            console.log("Interview started successfully");
          }
        } catch (vapiError) {
          // Log error only in development mode
          if (process.env.NODE_ENV === "development") {
            console.error("VAPI interview start error:", vapiError);
          }

          // Try to get more details about the error
          let errorMessage = "Error starting the interview.";
          if (typeof vapiError === "object" && vapiError !== null) {
            errorMessage =
              (vapiError as any).message || JSON.stringify(vapiError);
          }

          toast.error(`${errorMessage} Please try again.`);
          setCallStatus(CallStatus.INACTIVE);
          setLoading(false);
          return;
        }
      }
    } catch (error: any) {
      // Log only in development mode
      if (process.env.NODE_ENV === "development") {
        console.error("Error starting interview:", error);
      }
      toast.error(
        error.message || "Failed to start interview. Please try again."
      );
      setCallStatus(CallStatus.INACTIVE);
    }
    setLoading(false);
  };

  const handleDisconnect = async () => {
    // No logging, just perform the action

    // Set status to FINISHED before stopping to prevent race conditions with error events
    setCallStatus(CallStatus.FINISHED);

    try {
      // Stop the call with error handling
      await vapi.stop();
      // No success logging
    } catch (error) {
      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("Error stopping VAPI call, but continuing:", error);
      }
      // Don't change the call status even if there's an error
    }

    if (type === "generate") {
      setGenerationComplete(false);
    }

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
        // Only log in development mode
        if (process.env.NODE_ENV === "development") {
          console.log("Error saving feedback");
        }
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
