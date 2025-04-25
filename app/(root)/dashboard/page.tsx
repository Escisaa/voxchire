import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { getInterviewsByUserId } from "@/lib/actions/general.action";
import DashboardClient from "@/app/(root)/dashboard/DashboardClient";

export default async function Home() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const interviews = await getInterviewsByUserId(user.id);
  const hasPastInterviews = Boolean(interviews && interviews.length > 0);

  return (
    <div className="root-layout">
      <DashboardClient
        user={{ id: user.id }}
        interviews={interviews || []}
        hasPastInterviews={hasPastInterviews}
      />
    </div>
  );
}
