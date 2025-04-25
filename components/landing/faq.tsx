"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What makes your interview practice unique?",
    answer:
      "Our advanced AI interviewer conducts natural conversations that adapt to your responses in real-time, creating an authentic interview experience. You'll receive immediate, comprehensive feedback after each session to help you improve systematically.",
  },
  {
    question: "What types of interviews do you offer?",
    answer:
      "We offer a comprehensive range of interview types including technical interviews for software roles, behavioral interviews, leadership assessments, and industry-specific interviews across various sectors. Each interview is tailored to your experience level and career goals.",
  },
  {
    question: "How long should I practice before a real interview?",
    answer:
      "We recommend starting your preparation at least 1-2 weeks before your interview. This gives you time to practice multiple scenarios, receive feedback, and improve systematically. Many successful candidates complete 3-5 practice interviews, reviewing their feedback between sessions to focus on specific improvement areas.",
  },
  {
    question: "What kind of feedback will I receive?",
    answer:
      "After each interview, you receive a detailed performance analysis including an overall score, specific strengths, areas for improvement, and actionable recommendations. Our feedback covers both technical competency and communication skills to help you present yourself confidently and professionally.",
  },
  {
    question: "How do you ensure interview quality and relevance?",
    answer:
      "Our interview questions and scenarios are continuously updated based on real industry insights and current hiring trends. Each interview is structured to assess both your technical expertise and soft skills, ensuring comprehensive preparation for actual job interviews.",
  },
  {
    question: "What technical requirements do I need?",
    answer:
      "The platform is accessible through any modern web browser. You'll need a computer with a microphone and a stable internet connection. No additional software installation is required, making it convenient to practice interviews from anywhere.",
  },
];

export const FAQ = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="relative z-10 py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-gray-400 text-lg">
            Everything you need to know about preparing for your next interview
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 overflow-hidden"
            >
              <button
                className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-900/50 transition-colors"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-lg font-medium text-white">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-400 transition-transform ${
                    openIndex === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {openIndex === index && (
                <div className="px-6 pb-6">
                  <p className="text-gray-400">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
