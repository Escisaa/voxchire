"use client";

import AuthForm from "@/components/AuthForm";
import { useSearchParams } from "next/navigation";

const Page = () => {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return_to");

  return <AuthForm type="sign-in" returnTo={returnTo} />;
};

export default Page;
