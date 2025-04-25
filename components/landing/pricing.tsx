import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter Pack",
    price: "$4.99",
    description: "Perfect for trying out the platform",
    features: [
      "5 AI Interview Sessions",
      "Real-time Feedback",
      "Performance Analytics",
      "Never Expires",
      "Email Support",
    ],
    cta: "Get Started",
    popular: false,
    costPerCredit: "$0.99 per credit",
  },
  {
    name: "Value Pack",
    price: "$9.99",
    description: "Best for thorough preparation",
    features: [
      "10 AI Interview Sessions",
      "Real-time Feedback",
      "Performance Analytics",
      "Never Expires",
      "Priority Support",
      "Better Value ($1.00/credit)",
    ],
    cta: "Get Started",
    popular: true,
    costPerCredit: "$1.00 per credit",
  },
  {
    name: "6 Months Unlimited",
    price: "$39.99",
    description: "Perfect for active job seekers",
    features: [
      "Unlimited Interviews for 6 Months",
      "Real-time Feedback",
      "Advanced Analytics",
      "Priority Support",
      "Best for Regular Practice",
      "Valid for 180 Days",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "1 Year Unlimited",
    price: "$69.99",
    description: "Best value for long-term prep",
    features: [
      "Unlimited Interviews for 1 Year",
      "Real-time Feedback",
      "Advanced Analytics",
      "Priority Support",
      "Maximum Flexibility",
      "Valid for 365 Days",
    ],
    cta: "Get Started",
    popular: false,
  },
];

export const Pricing = () => {
  return (
    <section id="pricing" className="relative z-10 py-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Simple, Credit-Based Pricing
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Choose the perfect plan for your interview preparation needs.
            Credits never expire!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={
                "relative p-6 rounded-2xl max-w-md mx-auto w-full " +
                (plan.popular
                  ? "bg-gradient-to-b from-[#14549d]/20 to-black border-[#14549d]"
                  : "bg-gradient-to-b from-gray-900 to-black border-gray-800") +
                " border hover:border-[#14549d] transition-all duration-300"
              }
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <div className="bg-[#14549d] text-white text-sm font-semibold px-3 py-1 rounded-full">
                    Best Value
                  </div>
                </div>
              )}

              <div className="text-center mb-8">
                <h3 className="text-xl font-bold text-white mb-2">
                  {plan.name}
                </h3>
                <div className="flex items-center justify-center gap-1">
                  <span className="text-4xl font-bold text-white">
                    {plan.price}
                  </span>
                </div>
                {plan.costPerCredit && (
                  <span className="text-sm text-gray-400">
                    {plan.costPerCredit}
                  </span>
                )}
                <p className="text-gray-400 mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#14549d]" />
                    <span className="text-gray-300">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={
                  "w-full py-6 " +
                  (plan.popular
                    ? "bg-[#14549d] hover:bg-[#14549d]/90"
                    : "bg-gray-800 hover:bg-gray-700") +
                  " text-white rounded-full"
                }
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
