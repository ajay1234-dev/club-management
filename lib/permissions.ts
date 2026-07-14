import type { UserRole } from "@/lib/constants/roles";

export function isRouteAllowed(role: UserRole, pathname: string) {
  // Only super_admin can access system-wide governance
  if (pathname.startsWith("/dashboard/admin") && role !== "super_admin") {
    return false;
  }

  // Students cannot access approval dashboards or analytics pages
  if (
    (pathname.startsWith("/dashboard/approvals") || pathname.startsWith("/dashboard/analytics")) &&
    role === "student"
  ) {
    return false;
  }

  return true;
}
