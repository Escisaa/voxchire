import { ReactNode } from "react";
import { redirect } from "next/navigation";

import { isAuthenticated } from "@/lib/actions/auth.action";
import Sidebar from "@/components/Sidebar";

const Layout = async ({ children }: { children: ReactNode }) => {
  const isUserAuthenticated = await isAuthenticated();
  if (!isUserAuthenticated) redirect("/sign-in");

  return (
    <div className="flex min-h-screen bg-dark-100">
      <Sidebar />
      <main className="flex-1 ml-64 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-8 py-8">{children}</div>
      </main>
    </div>
  );
};

export default Layout;
