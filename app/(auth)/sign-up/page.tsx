"use client";

import { Suspense } from "react";
import AuthForm from "@/components/AuthForm";

const SignUpContent = () => {
  return <AuthForm type="sign-up" />;
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}
