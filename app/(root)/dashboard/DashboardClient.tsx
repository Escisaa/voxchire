"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import InterviewCard from "@/components/InterviewCard";

const StartInterviewButton = () => {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = () => {
    setLoading(true);
    router.push("/interview");
  };

  return (
    <Button
      onClick={handleClick}
      className="btn-primary max-sm:w-full"
      disabled={loading}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          "Start an Interview"
        )}
      </div>
    </Button>
  );
};

interface DashboardClientProps {
  user: any;
  interviews: any[];
  hasPastInterviews: boolean;
}

const DashboardClient = ({
  user,
  interviews,
  hasPastInterviews,
}: DashboardClientProps) => {
  const router = useRouter();

  // Force a refresh when the component mounts or becomes visible
  useEffect(() => {
    // When the component becomes visible again (e.g., tab focus)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        router.refresh();
      }
    };

    // Add visibility change listener
    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Force an immediate refresh when dashboard is loaded
    router.refresh();

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [router]);

  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice real interview questions & get instant feedback
          </p>

          <StartInterviewButton />
        </div>

        <Image
          src="/robot.png"
          alt="robo-dude"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>

      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>

        <div className="interviews-section">
          {hasPastInterviews ? (
            interviews?.map((interview) => (
              <InterviewCard
                key={interview.id}
                userId={user?.id}
                interviewId={interview.id}
                role={interview.role}
                type={interview.type}
                techstack={interview.techstack}
                createdAt={interview.createdAt}
                feedback={interview.feedback}
              />
            ))
          ) : (
            <p>You haven&apos;t taken any interviews yet</p>
          )}
        </div>
      </section>
    </>
  );
};

export default DashboardClient;
