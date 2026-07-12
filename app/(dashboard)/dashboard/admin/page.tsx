import { redirect } from "next/navigation";
import { ComponentProps } from "react";
import { auth } from "@/auth";
import {
  listAllUsers,
  listAllClubsAdmin,
  getPlatformAnalytics,
} from "@/lib/repositories/admin-repository";
import { SuperAdminDashboard } from "@/components/admin/super-admin-dashboard";
import { FadeIn } from "@/components/layout/fade-in";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "super_admin") {
    redirect("/dashboard");
  }

  // Fetch all system tables for governance view
  const users = await listAllUsers();
  const clubs = await listAllClubsAdmin();
  const analytics = await getPlatformAnalytics();

  return (
    <FadeIn>
      <SuperAdminDashboard
        usersList={users as unknown as ComponentProps<typeof SuperAdminDashboard>["usersList"]}
        clubsList={clubs as unknown as ComponentProps<typeof SuperAdminDashboard>["clubsList"]}
        analytics={analytics}
      />
    </FadeIn>
  );
}
