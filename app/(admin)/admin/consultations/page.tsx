import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminConsultationDashboard from "@/components/admin/ConsultationDashboard";

export default async function AdminConsultationsPage() {
  return <AdminConsultationDashboard />;
}
