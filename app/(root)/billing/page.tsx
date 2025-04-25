"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Coins, Check } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  createStripeCheckoutSession,
  verifyAndProcessPayment,
} from "@/lib/actions/general.action";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

const creditPackages = [
  {
    name: "Paid Credits",
    credits: 5,
    price: 4.99,
    costPerCredit: 0.99,
    features: ["5 AI Interview Sessions", "For casual users", "Never expires"],
    priceId: "price_1RG0VGG0PfCKs8gBfriSqZGF",
  },
  {
    name: "Paid Credits",
    credits: 10,
    price: 9.99,
    costPerCredit: 1.0,
    features: ["10 AI Interview Sessions", "For medium usage", "Never expires"],
    priceId: "price_1RFgFpG0PfCKs8gBn5vPS92f",
  },
  {
    name: "Unlimited 6M",
    credits: "Unlimited",
    price: 39.99,
    features: [
      "Unlimited interviews",
      "Valid for 6 months",
      "Best value for regular practice",
    ],
    priceId: "price_1RFgI7G0PfCKs8gBUtouZngv",
  },
  {
    name: "Unlimited 1Y",
    credits: "Unlimited",
    price: 69.99,
    features: [
      "Unlimited interviews",
      "Valid for 1 year",
      "Perfect for long-term preparation",
    ],
    priceId: "price_1RFgLzG0PfCKs8gBfrPat8J4",
  },
];

const BillingPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPackage, setProcessingPackage] = useState<string | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  const fetchUser = useCallback(async () => {
    const userData = await getCurrentUser();
    setUser(userData);
    return userData;
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  useEffect(() => {
    const success = searchParams.get("success");
    const sessionId = searchParams.get("session_id");

    // Only process if we have both success and sessionId parameters
    if (!success || !sessionId) return;

    // Prevent processing if already processing
    if (isProcessing) return;

    const processPayment = async () => {
      try {
        setIsProcessing(true);
        setProcessingPackage(null);

        // Clear URL parameters immediately to prevent double processing
        window.history.replaceState({}, "", "/billing");

        if (success === "true") {
          const result = await verifyAndProcessPayment(sessionId);
          if (result.success) {
            if (result.credits) {
              toast.success(
                `Payment successful! ${result.credits} credits have been added to your account.`
              );
            } else if (result.subscription) {
              toast.success(
                "Payment successful! Your unlimited subscription is now active."
              );
            }
            await fetchUser(); // Refresh user data
          } else {
            toast.error(result.error || "Failed to process payment");
          }
        } else if (success === "false") {
          toast.error("Payment cancelled or failed. Please try again.");
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        toast.error("Failed to process payment. Please contact support.");
      } finally {
        setIsProcessing(false);
        setProcessingPackage(null);
      }
    };

    processPayment();
  }, [searchParams, isProcessing, fetchUser]);

  const handlePurchase = async (priceId: string, packageName: string) => {
    if (!user) return;
    if (isProcessing) return; // Prevent multiple clicks while processing

    try {
      setIsProcessing(true);
      setProcessingPackage(packageName);
      const response = await createStripeCheckoutSession(user.id, priceId);

      if (response.error) {
        toast.error(response.error);
        return;
      }

      if (response.url) {
        // Clear any existing URL parameters before redirecting
        window.history.replaceState({}, "", "/billing");
        window.location.href = response.url;
      } else {
        toast.error("Failed to create checkout session. Please try again.");
      }
    } catch (error) {
      console.error("Error creating checkout session:", error);
      toast.error("Failed to create checkout session. Please try again.");
    } finally {
      setIsProcessing(false);
      setProcessingPackage(null);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-primary-100">Billing</h2>

      {/* Credits Section */}
      <div className="card-border w-full">
        <div className="card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Coins size={24} className="text-primary-200" />
              <h3 className="text-primary-100">Available Credits</h3>
            </div>
            <span className="text-2xl font-bold text-primary-200">
              {isProcessing
                ? "Updating..."
                : user?.subscription
                ? "∞"
                : user?.credits || 0}
              {user?.subscription && (
                <span className="text-sm ml-2">
                  (until{" "}
                  {new Date(user.subscription.expiresAt).toLocaleDateString()})
                </span>
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Credit Packages */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {creditPackages.map((pkg) => (
          <div key={pkg.name + pkg.credits} className="card-border">
            <div className="card p-6 space-y-6">
              <div className="text-center space-y-2">
                <h3 className="text-primary-100">{pkg.name}</h3>
                <div className="flex items-center justify-center gap-2">
                  <Coins size={20} className="text-primary-200" />
                  <span className="text-2xl font-bold text-primary-200">
                    {pkg.credits}
                  </span>
                </div>
                <p className="text-3xl font-bold text-light-100">
                  ${pkg.price}
                </p>
                {pkg.costPerCredit && (
                  <p className="text-sm text-light-400">
                    ${pkg.costPerCredit} per credit
                  </p>
                )}
              </div>
              <ul className="space-y-3">
                {pkg.features.map((feature, index) => (
                  <li
                    key={index}
                    className="flex items-center gap-2 text-light-100"
                  >
                    <Check size={16} className="text-primary-200" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button
                onClick={() => handlePurchase(pkg.priceId, pkg.name)}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing && processingPackage === pkg.name ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                ) : (
                  "Buy Now"
                )}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BillingPage;
