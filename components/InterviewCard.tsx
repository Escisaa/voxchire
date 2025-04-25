"use client";

import { useState, useEffect } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "./ui/button";
import DisplayTechIcons from "./DisplayTechIcons";

import { cn, getRandomInterviewCover } from "@/lib/utils";
import {
  getFeedbackByInterviewId,
  checkUserCredits,
} from "@/lib/actions/general.action";

const InterviewCard = ({
  interviewId,
  userId,
  role,
  type,
  techstack,
  createdAt,
  feedback,
}: InterviewCardProps & { feedback?: any }) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [coverImage, setCoverImage] = useState("/covers/quora.png");

  const normalizedType = /mix/gi.test(type) ? "Mixed" : type;

  const badgeColor =
    {
      Behavioral: "bg-light-400",
      Mixed: "bg-light-600",
      Technical: "bg-light-800",
    }[normalizedType] || "bg-light-600";

  const formattedDate = dayjs(
    feedback?.createdAt || createdAt || Date.now()
  ).format("MMM D, YYYY");

  // Use useEffect to change the cover image after initial render
  useEffect(() => {
    if (interviewId) {
      setCoverImage(getRandomInterviewCover());
    }
  }, [interviewId]);

  const handleInterviewClick = async (e: React.MouseEvent) => {
    e.preventDefault();

    if (!userId) {
      toast.error("Please sign in to take an interview");
      return;
    }

    setLoading(true);
    try {
      const { credits, hasSubscription } = await checkUserCredits(userId);

      if (!hasSubscription && credits === 0) {
        toast.error("You're out of credits. Buy more to continue.");
        router.push("/billing");
        return;
      }

      router.push(`/interview/${interviewId}`);
    } catch (error) {
      console.error("Error checking credits:", error);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-border w-[360px] max-sm:w-full min-h-96">
      <div className="card-interview">
        <div>
          {/* Type Badge */}
          <div
            className={cn(
              "absolute top-0 right-0 w-fit px-4 py-2 rounded-bl-lg",
              badgeColor
            )}
          >
            <p className="badge-text ">{normalizedType}</p>
          </div>

          {/* Cover Image */}
          <Image
            src={coverImage}
            alt="cover-image"
            width={90}
            height={90}
            className="rounded-full object-fit size-[90px]"
          />

          {/* Interview Role */}
          <h3 className="mt-5 capitalize">{role} Interview</h3>

          {/* Date & Score */}
          <div className="flex flex-row gap-5 mt-3">
            <div className="flex flex-row gap-2">
              <Image
                src="/calendar.svg"
                width={22}
                height={22}
                alt="calendar"
              />
              <p>{formattedDate}</p>
            </div>

            <div className="flex flex-row gap-2 items-center">
              <Image src="/star.svg" width={22} height={22} alt="star" />
              <p>{feedback?.totalScore || "---"}/100</p>
            </div>
          </div>

          {/* Feedback or Placeholder Text */}
          <p className="line-clamp-2 mt-5">
            {feedback?.finalAssessment ||
              "You haven't taken this interview yet. Take it now to improve your skills."}
          </p>
        </div>

        <div className="flex flex-row justify-between">
          <DisplayTechIcons techStack={techstack} />

          {feedback ? (
            <Button asChild className="btn-primary">
              <Link
                href={`/interview/${interviewId}/feedback`}
                className="flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Loading...</span>
                  </>
                ) : (
                  "Check Feedback"
                )}
              </Link>
            </Button>
          ) : (
            <Button
              className="btn-primary"
              onClick={handleInterviewClick}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                "View Interview"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewCard;
