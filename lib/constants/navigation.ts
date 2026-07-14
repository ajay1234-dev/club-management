import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  Sparkles,
  CalendarDays,
  Megaphone,
  ShieldCheck,
  BarChart3,
  Users,
  ClipboardList,
} from "lucide-react";

import type { UserRole } from "@/lib/constants/roles";

export type NavigationItem = {
  label: string;
  href: string;
  description: string;
  icon: LucideIcon;
  roles: UserRole[];
};

export const DASHBOARD_NAVIGATION: NavigationItem[] = [
  {
    label: "Overview",
    href: "/dashboard",
    description: "Portal snapshot and action items.",
    icon: LayoutDashboard,
    roles: ["student", "club_admin", "super_admin"],
  },
  {
    label: "Clubs",
    href: "/dashboard/clubs",
    description: "Club directory and memberships.",
    icon: Users,
    roles: ["student", "club_admin", "super_admin"],
  },
  {
    label: "Events",
    href: "/dashboard/events",
    description: "Upcoming event workflows and registration.",
    icon: CalendarDays,
    roles: ["student", "club_admin", "super_admin"],
  },
  {
    label: "My Applications",
    href: "/dashboard/applications",
    description: "Your registered event history.",
    icon: ClipboardList,
    roles: ["student"],
  },
  {
    label: "Notifications",
    href: "/dashboard/notifications",
    description: "Announcements and reminders.",
    icon: Megaphone,
    roles: ["student", "club_admin", "super_admin"],
  },
  {
    label: "Analytics",
    href: "/dashboard/analytics",
    description: "Engagement and participation insights.",
    icon: BarChart3,
    roles: ["club_admin", "super_admin"],
  },
  {
    label: "Approvals",
    href: "/dashboard/approvals",
    description: "Membership and event approvals.",
    icon: ShieldCheck,
    roles: ["club_admin", "super_admin"],
  },
  {
    label: "Admin",
    href: "/dashboard/admin",
    description: "System configuration and governance.",
    icon: Sparkles,
    roles: ["super_admin"],
  },
];
