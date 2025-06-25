import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Memberships | Nutra-Vive",
  description:
    "Manage your subscription and explore premium benefits with Nutra-Vive memberships.",
};

export default function MembershipsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen">{children}</div>;
}
