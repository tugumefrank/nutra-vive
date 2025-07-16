import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import { AccountSidebar } from "./components/AccountSidebar";
import { AccountHeader } from "./components/AccountHeader";
import { MobileNavigation } from "./components/MobileNavigation";

interface AccountLayoutProps {
  children: ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-900 dark:to-gray-800">
      {/* Desktop Layout */}
      <div className="hidden md:flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-gray-700/50">
          <AccountSidebar />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <AccountHeader />
          <main className="flex-1 overflow-y-auto">
            <div className="p-6">{children}</div>
          </main>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="md:hidden">
        <div className="pb-20">
          <AccountHeader />
          <main className="p-4">{children}</main>
        </div>
        <MobileNavigation />
      </div>
    </div>
  );
}
