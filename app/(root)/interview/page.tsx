"use client";

import { useEffect, useState } from "react";
import Agent from "@/components/Agent";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { useRouter } from "next/navigation";

const Page = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-primary-200 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      <Agent
        userName={user.name}
        userId={user.id}
        type="generate"
        profileURL={user.profileURL}
      />
    </>
  );
};

export default Page;
