"use client";

import { useRouter } from "next/navigation";
import HeroSection from "@/components/landing/herosection";
import { Features } from "@/components/landing/features";
import { Pricing } from "@/components/landing/pricing";
import { FAQ } from "@/components/landing/faq";
import { Footer } from "@/components/landing/footer";
import Navbar from "@/components/landing/navbar";
import { Comparison } from "@/components/landing/comparison";
import { Testimonials } from "@/components/landing/testimonials";

export default function LandingPage() {
  const router = useRouter();

  const handleGetStarted = () => {
    router.push("/sign-up");
  };

  return (
    <main>
      <Navbar onGetStartedClick={handleGetStarted} />
      <HeroSection onGetStartedClick={handleGetStarted} />
      <Features />
      <Comparison />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
