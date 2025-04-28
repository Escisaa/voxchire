import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import Sidebar from "@/components/Sidebar";
import RootLayoutClient from "./RootLayoutClient";

// Prevent caching for dynamic routes
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return <RootLayoutClient>{children}</RootLayoutClient>;
};

export default Layout;
