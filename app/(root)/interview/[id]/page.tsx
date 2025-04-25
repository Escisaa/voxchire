"use client";

import Image from "next/image";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";

import Agent from "@/components/Agent";
import { getRandomInterviewCover } from "@/lib/utils";

import {
  getFeedbackByInterviewId,
  getInterviewById,
} from "@/lib/actions/general.action";
import { getCurrentUser } from "@/lib/actions/auth.action";
import DisplayTechIcons from "@/components/DisplayTechIcons";

interface RouteParams {
  params: {
    id: string;
  };
}

const InterviewDetails = ({ params }: RouteParams) => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const user = await getCurrentUser();
        const interview = await getInterviewById(params.id);
        if (!interview) {
          redirect("/");
          return;
        }

        const feedback = await getFeedbackByInterviewId({
          interviewId: params.id,
          userId: user?.id!,
        });

        setData({ user, interview, feedback });
      } catch (error) {
        console.error("Error fetching interview data:", error);
        redirect("/");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;
  const { user, interview, feedback } = data;

  return (
    <>
      <div className="flex flex-row gap-4 justify-between">
        <div className="flex flex-row gap-4 items-center max-sm:flex-col">
          <div className="flex flex-row gap-4 items-center">
            <Image
              src={getRandomInterviewCover()}
              alt="cover-image"
              width={40}
              height={40}
              className="rounded-full object-cover size-[40px]"
            />
            <h3 className="capitalize">{interview.role} Interview</h3>
          </div>

          <DisplayTechIcons techStack={interview.techstack} />
        </div>

        <p className="bg-dark-200 px-4 py-2 rounded-lg h-fit">
          {interview.type}
        </p>
      </div>

      <Agent
        userName={user?.name!}
        userId={user?.id}
        interviewId={params.id}
        type="questions"
        questions={interview.questions}
        feedbackId={feedback?.id}
        role={interview.role}
      />
    </>
  );
};

export default InterviewDetails;
