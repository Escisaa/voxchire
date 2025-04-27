// components/landing/HeroSection.tsx
"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface HeroSectionProps {
  onGetStartedClick: () => void;
}

const HeroSection = ({ onGetStartedClick }: HeroSectionProps) => {
  const scrollToFeatures = () => {
    const featuresSection = document.getElementById("features");
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-32 pb-12">
          <motion.div
            className="flex flex-col items-center md:items-start max-w-2xl mb-12 md:mb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1
              className="text-4xl md:text-6xl font-bold text-white mb-6 text-center md:text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Ace Your Interviews with{" "}
              <span className="text-[#90c4ff]">AI-Powered</span> Practice
            </motion.h1>
            <motion.p
              className="text-lg md:text-xl mb-8 text-center md:text-left text-gray-400"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Practice job interviews with AI-powered mock sessions and get
              real-time feedback to improve your skills and confidence.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 w-full md:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="relative">
                <div className="absolute -inset-[1px] rounded-full">
                  <div className="absolute inset-0 animate-glow-circle" />
                </div>
                <Button
                  onClick={onGetStartedClick}
                  className="relative bg-white text-black hover:bg-white/90 py-6 px-8 text-lg rounded-full transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get started for free
                </Button>
              </div>
              <Button
                variant="outline"
                onClick={scrollToFeatures}
                className="border-white/20 text-white hover:bg-white/10 py-6 px-8 text-lg rounded-full transition-all duration-200"
              >
                Learn More
              </Button>
            </motion.div>
          </motion.div>

          {/* AI Interviewer Image */}
          <motion.div
            className="relative w-full max-w-md md:max-w-lg flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.4 }}
          >
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />
            <div className="relative w-[400px] h-[400px] flex items-center justify-center">
              <Image
                src="/robot.png"
                alt="AI Interviewer"
                width={400}
                height={400}
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default HeroSection;

// Add these animations to your globals.css
/*
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-20px); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-float {
  animation: float 6s ease-in-out infinite;
}

.animate-float-delay-1 {
  animation: float 6s ease-in-out 1s infinite;
}

.animate-float-delay-2 {
  animation: float 6s ease-in-out 2s infinite;
}

.animate-fade-in {
  animation: fadeIn 1s ease-out forwards;
}

.animate-fade-in-delay {
  animation: fadeIn 1s ease-out 0.3s forwards;
  opacity: 0;
}

.animate-fade-in-delay-2 {
  animation: fadeIn 1s ease-out 0.6s forwards;
  opacity: 0;
}
*/
