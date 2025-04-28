"use client";

import { ReactNode, useState, useCallback, memo, useMemo } from "react";
import Sidebar from "@/components/Sidebar";

interface RootLayoutClientProps {
  children: ReactNode;
}

// Even more aggressive memoization of the main content area
const MainContent = memo(
  ({
    children,
    isSidebarCollapsed,
  }: {
    children: ReactNode;
    isSidebarCollapsed: boolean;
  }) => {
    // Cache the CSS class calculation
    const mainClasses = useMemo(() => {
      return `flex-1 transition-all duration-300 ${
        isSidebarCollapsed ? "ml-20" : "ml-64"
      }`;
    }, [isSidebarCollapsed]);

    return (
      <main className={mainClasses}>
        <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
      </main>
    );
  },
  // Custom comparison function to prevent unnecessary re-renders
  (prevProps, nextProps) => {
    // Only re-render if the sidebar state or children actually changed
    return (
      prevProps.isSidebarCollapsed === nextProps.isSidebarCollapsed &&
      prevProps.children === nextProps.children
    );
  }
);

MainContent.displayName = "MainContent";

const RootLayoutClient = ({ children }: RootLayoutClientProps) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Even more aggressive memoization of the callback
  const handleSidebarToggle = useCallback((collapsed: boolean) => {
    // Only update state if it actually changed
    setIsSidebarCollapsed((prev) => {
      if (prev !== collapsed) {
        return collapsed;
      }
      return prev;
    });
  }, []);

  // Memoize the entire layout structure
  return useMemo(
    () => (
      <div className="flex min-h-screen bg-dark-100">
        <Sidebar onToggle={handleSidebarToggle} />
        <MainContent isSidebarCollapsed={isSidebarCollapsed}>
          {children}
        </MainContent>
      </div>
    ),
    [children, handleSidebarToggle, isSidebarCollapsed]
  );
};

export default RootLayoutClient;
