// In your DashLayout component:
import { DesktopSidebar } from "@/components/admin/DesktopSidebar";
import Navbar from "@/components/admin/Navbar";
import { SidebarProvider } from "../contexts/SidebarContext";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function DashLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // Add admin role check here
  // const user = await User.findOne({ clerkId: userId });
  // if (user?.role !== 'admin') {
  //   redirect('/');
  // }
  return (
    <SidebarProvider>
      <div className="flex h-screen overflow-hidden">
        <DesktopSidebar />
        <div className="flex flex-col flex-1 transition-all duration-500">
          <Navbar />
          <main className="flex-1 overflow-y-auto bg-[#E2E8F0] dark:bg-[#0D1224]">
            <div className="pt-0">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
