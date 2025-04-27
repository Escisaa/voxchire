"use client";

import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

const SignInContent = () => {
  return <AuthForm type="sign-in" />;
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
