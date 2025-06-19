import AdminProductsDashboard from "@/components/admin/AdminProductsDashboard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AdminProductsPage() {
  const { userId } = await auth();

  // if (!userId) {
  //   redirect("/sign-in");
  // }

  // Add admin role check here
  // const user = await User.findOne({ clerkId: userId });
  // if (user?.role !== 'admin') {
  //   redirect('/');
  // }

  return <AdminProductsDashboard />;
}
