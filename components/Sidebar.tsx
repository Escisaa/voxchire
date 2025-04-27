"use client";

import { useState, useEffect } from "react";
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

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };

    // Initial fetch
    fetchUser();

    // Fetch when the component gains focus after returning from Stripe
    const handleFocus = () => {
      if (document.location.pathname.includes("/billing")) {
        fetchUser();
      }
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // Fetch user data when pathname changes (e.g., after payment or interview completion)
  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
    };
    fetchUser();
  }, [pathname]);

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

  const handleNavigation = (path: string) => {
    setIsCollapsed(true);
    router.push(path);
  };

  return (
    <div
      className={`flex flex-col h-screen bg-slate-950 text-light-100 transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-64"
      } fixed left-0 top-0`}
    >
      {/* Logo, Company Name and Collapse Button */}
      <div className="flex items-center justify-between p-4 border-b border-light-400/20">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="VoxHire Logo" width={32} height={32} />
          {!isCollapsed && (
            <h2 className="text-xl font-bold text-primary-100">VoxHire</h2>
          )}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
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
          <Link
            key={item.path}
            href={item.path}
            className={`w-full flex items-center gap-3 px-4 py-3 transition-colors hover:bg-light-400/10 ${
              pathname === item.path ? "bg-light-400/10 text-primary-200" : ""
            } ${isCollapsed ? "justify-center" : ""}`}
          >
            <span className={pathname === item.path ? "text-primary-200" : ""}>
              {item.icon}
            </span>
            {!isCollapsed && <span>{item.title}</span>}
          </Link>
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
