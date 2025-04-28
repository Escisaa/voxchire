"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Settings,
  LogOut,
  ChevronLeft,
  Coins,
} from "lucide-react";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { signOut } from "@/lib/actions/auth.action";

const Sidebar = ({ onToggle }: { onToggle?: (collapsed: boolean) => void }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Fetch user data once on initial load and only refresh on focus events
  // This significantly reduces the number of API calls
  useEffect(() => {
    let isMounted = true;
    let fetchInProgress = false;

    const fetchUser = async () => {
      if (fetchInProgress) return; // Prevent multiple simultaneous fetches

      try {
        fetchInProgress = true;
        const userData = await getCurrentUser();

        // Only update state if component is still mounted
        if (!isMounted) return;

        // Don't overwrite existing user unless we have new data
        if (userData) {
          setUser(userData);
        } else if (!user && window.location.pathname !== "/sign-in") {
          // If we couldn't get user data and we're not already on the sign-in page
          // Check localStorage for backup user ID from Stripe checkout
          const storedUserId = localStorage.getItem("stripe_checkout_user_id");
          if (storedUserId) {
            // We had a user ID in localStorage, which suggests a session issue
            // Redirect to sign-in with return path
            localStorage.removeItem("stripe_checkout_user_id");
            const returnPath = encodeURIComponent(window.location.pathname);
            router.push(
              `/sign-in?return_to=${returnPath}&session_expired=true`
            );
          }
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        fetchInProgress = false;
      }
    };

    // Initial fetch
    fetchUser();

    // Setup listeners for focus events only - removed pathname dependency
    window.addEventListener("focus", fetchUser);

    return () => {
      isMounted = false;
      window.removeEventListener("focus", fetchUser);
    };
  }, [router, user]); // Removed pathname dependency

  // Pre-fetch dashboard data on mount to make navigation instant
  useEffect(() => {
    // Use prefetch to load route data in the background
    router.prefetch("/dashboard");
    router.prefetch("/billing");
  }, [router]);

  // Add effect to notify parent component of sidebar state changes
  useEffect(() => {
    if (onToggle) {
      onToggle(isCollapsed);
    }
  }, [isCollapsed, onToggle]);

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={24} />,
      path: "/dashboard",
    },
    {
      title: "Billing",
      icon: <CreditCard size={24} />,
      path: "/billing",
    },
    {
      title: "Settings",
      icon: <Settings size={24} />,
      path: "/settings",
    },
  ];

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true);
      await signOut();
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  // Toggle sidebar function
  const toggleSidebar = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    // Also notify parent immediately
    if (onToggle) {
      onToggle(newState);
    }
  };

  // Optimize navigation by being more aggressive with prefetching
  const handleNavigation = useCallback(
    (path: string) => {
      // Only trigger navigation if we're not already on this path
      if (pathname !== path) {
        // Pre-activate the route before actually navigating
        // This makes navigation feel instant
        document.body.style.cursor = "wait";

        // Use setTimeout to allow the UI to update before navigation
        // This creates a smoother visual transition
        setTimeout(() => {
          // Special handling for dashboard to ensure fresh data
          if (path === "/dashboard") {
            // Use router.refresh() before navigation to clear any cached data
            router.refresh();
            // Then navigate to dashboard
            router.push(path);
          } else {
            // Normal navigation for other routes
            router.push(path);
          }
          document.body.style.cursor = "default";
        }, 10);
      } else if (path === "/dashboard" && pathname === "/dashboard") {
        // If already on dashboard, just refresh the data
        router.refresh();
      }
    },
    [pathname, router]
  );

  return (
    <div
      className={`flex flex-col h-screen bg-slate-950 text-light-100 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } fixed left-0 top-0 z-50`}
    >
      {/* Logo, Company Name and Collapse Button */}
      <div className="flex items-center justify-between p-4 border-b border-light-400/20">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => handleNavigation("/dashboard")}
        >
          <Image src="/logo.svg" alt="VoxHire Logo" width={32} height={32} />
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-primary-100">VoxHire</h2>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 hover:bg-light-400/10 rounded-full"
        >
          <ChevronLeft
            size={20}
            className={`text-light-100 transition-transform ${
              isCollapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Credits Display */}
      <div
        className={`flex items-center gap-2 p-4 border-b border-light-400/20 ${
          isCollapsed ? "justify-center" : ""
        }`}
      >
        <div className="flex items-center gap-2">
          <Coins size={24} className="text-primary-200" />
          {!isCollapsed && <span className="text-sm">Credits</span>}
        </div>
        <span className="text-primary-200 font-bold">
          {user?.subscription ? "∞" : user?.credits || 0}
        </span>
      </div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4">
        {menuItems.map((item) => (
          <div
            key={item.path}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-light-400/10 cursor-pointer ${
              pathname === item.path ? "bg-light-400/10 text-primary-200" : ""
            } ${isCollapsed ? "justify-center" : ""}`}
            onClick={() => handleNavigation(item.path)}
          >
            <span className={pathname === item.path ? "text-primary-200" : ""}>
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.title}</span>}
          </div>
        ))}
      </div>

      {/* Sign Out Button */}
      <button
        onClick={handleSignOut}
        disabled={isSigningOut}
        className={`flex items-center gap-3 px-4 py-4 text-destructive-100 hover:bg-light-400/10 transition-colors ${
          isCollapsed ? "justify-center" : ""
        } ${isSigningOut ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        {isSigningOut ? (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-destructive-100 border-t-transparent rounded-full animate-spin" />
            {!isCollapsed && <span>Signing out...</span>}
          </div>
        ) : (
          <>
            <LogOut size={24} />
            {!isCollapsed && <span>Sign Out</span>}
          </>
        )}
      </button>
    </div>
  );
};

export default Sidebar;
