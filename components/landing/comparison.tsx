import { X, Check } from "lucide-react";

export const Comparison = () => {
  return (
    <section className="relative z-10 py-24 px-4 sm:px-6 lg:px-8 bg-black">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">
            Traditional vs AI-Powered Interview Prep
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            See how VoxHire revolutionizes the way you prepare for technical
            interviews
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Traditional Way */}
          <div className="relative p-8 rounded-3xl bg-[#1a1a1a] border border-[#ff9898]/20">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-3xl font-bold text-[#ff9898]">
                Traditional Interview Prep
              </h2>
              <div className="flex items-center justify-center bg-[#ff9898]/20 rounded-full p-2">
                <X className="w-6 h-6 text-[#ff9898]" />
              </div>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-2 text-gray-300">
                • Practice with static question banks that don't adapt
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                • Rely on generic feedback from online forums
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                • Memorize answers without understanding context
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                • Struggle with mock interviews that don't feel real
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                • Miss out on personalized improvement areas
              </li>
            </ul>
          </div>

          {/* VoxHire Way */}
          <div className="relative p-8 rounded-3xl bg-[#0a1a14] border border-[#4ade80]/20">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-3xl font-bold text-[#4ade80]">
                VoxHire's AI-Powered Prep
              </h2>
              <div className="flex items-center justify-center bg-[#4ade80]/20 rounded-full p-2">
                <Check className="w-6 h-6 text-[#4ade80]" />
              </div>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-2 text-gray-300">
                • Get dynamic questions tailored to your experience
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                • Receive real-time feedback on your responses
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                • Practice with AI that simulates real interviewers
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                • Track your progress with detailed analytics
              </li>
              <li className="flex items-start gap-2 text-gray-300">
                • Get personalized tips for improvement
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
