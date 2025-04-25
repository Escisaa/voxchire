import { Zap, Brain, BarChart, Clock, Shield, Video } from "lucide-react";

const features = [
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Interviews",
    description:
      "Experience realistic interviews with our advanced AI that adapts to your responses in real-time.",
  },
  {
    icon: <BarChart className="w-6 h-6" />,
    title: "Detailed Feedback",
    description:
      "Get comprehensive feedback on your performance, including communication skills, technical accuracy, and areas for improvement.",
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Practice Anytime",
    description:
      "24/7 access to interview practice sessions. Practice at your own pace, whenever you want.",
  },
  {
    icon: <Video className="w-6 h-6" />,
    title: "Video Analysis",
    description:
      "Advanced video analysis of your body language, facial expressions, and speaking patterns.",
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Industry Specific",
    description:
      "Tailored interviews for different industries and roles, from tech to finance.",
  },
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Results",
    description:
      "Get immediate feedback and scoring after each interview session.",
  },
];

export const Features = () => {
  return (
    <section id="features" className="relative z-10 py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Supercharge Your Interview Preparation
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Our AI-powered platform provides everything you need to ace your
            next interview
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-gray-800 hover:border-[#14549d] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-[#14549d]/10 flex items-center justify-center mb-4">
                <div className="text-[#14549d]">{feature.icon}</div>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
