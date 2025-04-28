"use client";

import { useEffect, useState, useCallback, useMemo, memo } from "react";
import { Button } from "@/components/ui/button";
import { Coins, Check } from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import {
  createStripeCheckoutSession,
  verifyAndProcessPayment,
} from "@/lib/actions/general.action";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// Memoize the credit packages to prevent re-renders
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
    price: 49.99,
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
    price: 89.99,
    features: [
      "Unlimited interviews",
      "Valid for 1 year",
      "Perfect for long-term preparation",
    ],
    priceId: "price_1RFgLzG0PfCKs8gBfrPat8J4",
  },
];

// Memoize the Package component to prevent re-renders
const PackageCard = memo(
  ({
    pkg,
    isProcessing,
    processingPackage,
    onPurchase,
  }: {
    pkg: any;
    isProcessing: boolean;
    processingPackage: string | null;
    onPurchase: (priceId: string, packageName: string) => void;
  }) => {
    return (
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
            <p className="text-3xl font-bold text-light-100">${pkg.price}</p>
            {pkg.costPerCredit && (
              <p className="text-sm text-light-400">
                ${pkg.costPerCredit} per credit
              </p>
            )}
          </div>
          <ul className="space-y-3">
            {pkg.features.map((feature: string, index: number) => (
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
            onClick={() => onPurchase(pkg.priceId, pkg.name)}
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
    );
  }
);

PackageCard.displayName = "PackageCard";

const BillingPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingPackage, setProcessingPackage] = useState<string | null>(
    null
  );
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use a more efficient user fetching strategy
  const fetchUser = useCallback(async () => {
    try {
      // Use a local variable to store loading state to prevent double fetches
      let isFetching = true;
      setLoading(true);

      const userData = await getCurrentUser();

      if (!userData) {
        // If no user data, redirect to sign-in with return path
        const returnPath = encodeURIComponent("/billing");
        router.push(`/sign-in?return_to=${returnPath}`);
        return null;
      }

      // Only update state if the component is still mounted and we're still fetching
      if (isFetching) {
        setUser(userData);
        setLoading(false);
      }

      return userData;
    } catch (error) {
      console.error("Error fetching user:", error);
      setLoading(false);
      return null;
    }
  }, [router]);

  // Fetch user data only once on initial mount
  useEffect(() => {
    // Prefetch the dashboard page for faster navigation
    router.prefetch("/dashboard");

    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const success = searchParams.get("success");
    const cancelled = searchParams.get("cancelled");
    const sessionId = searchParams.get("session_id");
    const userId = searchParams.get("user_id");

    // Clear URL parameters immediately to prevent double processing
    if (success || cancelled) {
      window.history.replaceState({}, "", "/billing");
    }

    // Handle cancellation only if coming from Stripe
    if (cancelled === "true") {
      toast.info("Payment cancelled. You can try again when you're ready.");

      // If we have a user ID in the URL, use it to help with session recovery
      if (userId) {
        // Check if current user is different from the one in the URL
        if (user && user.id !== userId) {
          // Force a session refresh to try to restore the correct user
          fetchUser();
        }
      } else {
        // Try to get user ID from localStorage as fallback
        const storedUserId = localStorage.getItem("stripe_checkout_user_id");
        if (storedUserId) {
          localStorage.removeItem("stripe_checkout_user_id"); // Clean up
          // If current user is different from stored ID, force refresh
          if (user && user.id !== storedUserId) {
            fetchUser();
          }
        } else {
          // Always refresh user data on cancel as a safety measure
          fetchUser();
        }
      }
      return;
    }

    // Only process if we have both success and sessionId parameters
    if (!success || !sessionId) return;

    // Prevent processing if already processing
    if (isProcessing) return;

    const processPayment = async () => {
      try {
        setIsProcessing(true);
        setProcessingPackage(null);

        if (success === "true") {
          // Get the current user first to ensure we have the right user context
          const currentUser = await fetchUser();
          if (!currentUser) {
            toast.error("Session expired. Please sign in again.");
            router.push("/sign-in?return_to=" + encodeURIComponent("/billing"));
            return;
          }

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
            // Refresh user data after payment processing
            await fetchUser();
          } else {
            toast.error(result.error || "Failed to process payment");
            // Ensure user state is preserved even if payment failed
            await fetchUser();
          }
        }
      } catch (error) {
        console.error("Error processing payment:", error);
        toast.error("Failed to process payment. Please contact support.");
        // Ensure user state is preserved even on error
        await fetchUser();
      } finally {
        setIsProcessing(false);
        setProcessingPackage(null);
      }
    };

    processPayment();
  }, [searchParams, isProcessing, fetchUser, router]);

  // Memoize the handlePurchase function
  const handlePurchase = useCallback(
    async (priceId: string, packageName: string) => {
      if (!user) {
        toast.error("Please sign in to make a purchase");
        router.push("/sign-in");
        return;
      }
      if (isProcessing) return; // Prevent multiple clicks while processing

      try {
        setIsProcessing(true);
        setProcessingPackage(packageName);

        // Store current user ID to ensure we can retrieve it later
        const userId = user.id;

        const response = await createStripeCheckoutSession(userId, priceId);

        if (response.error) {
          toast.error(response.error);
          setIsProcessing(false);
          setProcessingPackage(null);
          return;
        }

        if (response.url) {
          // Store user ID in localStorage as a backup for session recovery
          localStorage.setItem("stripe_checkout_user_id", userId);
          window.location.href = response.url;
        } else {
          toast.error("Failed to create checkout session. Please try again.");
          setIsProcessing(false);
          setProcessingPackage(null);
        }
      } catch (error) {
        console.error("Error creating checkout session:", error);
        toast.error("Failed to create checkout session. Please try again.");
        setIsProcessing(false);
        setProcessingPackage(null);
      }
    },
    [user, isProcessing, router]
  );

  // Memoize the credits display
  const creditsDisplay = useMemo(() => {
    if (loading) return "Loading...";
    if (user?.subscription) return "∞";
    return user?.credits || 0;
  }, [loading, user]);

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
              {creditsDisplay}
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
          <PackageCard
            key={pkg.name + pkg.credits}
            pkg={pkg}
            isProcessing={isProcessing}
            processingPackage={processingPackage}
            onPurchase={handlePurchase}
          />
        ))}
      </div>
    </div>
  );
};

export default BillingPage;
