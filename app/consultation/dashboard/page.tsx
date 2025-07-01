import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { MainLayout } from "@/components/layout/MainLayout";
import UserConsultationDashboard from "@/components/consultation/UserConsultationDashboard";

export default async function ConsultationDashboardPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/consultation/dashboard");
  }

  return (
    <MainLayout>
      <UserConsultationDashboard />
    </MainLayout>
  );
}

export const metadata = {
  title: "My Consultations - Nutra-Vive",
  description: "View your nutrition consultations, messages from consultants, and download meal plans.",
};