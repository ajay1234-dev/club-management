"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { DASHBOARD_NAVIGATION } from "@/lib/constants/navigation";
import type { UserRole } from "@/lib/constants/roles";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

type DashboardSidebarProps = {
  role: UserRole;
  name: string;
  email?: string | null;
};

export function DashboardSidebar({ role, name, email }: DashboardSidebarProps) {
  const pathname = usePathname();
  const items = DASHBOARD_NAVIGATION.filter((item) => item.roles.includes(role));

  return (
    <aside className="hidden min-h-screen w-80 shrink-0 border-r border-black/10 bg-white/70 px-5 py-6 backdrop-blur-md lg:flex lg:flex-col">
      <div className="flex items-center gap-3">
        <span className="flex size-11 items-center justify-center rounded-2xl border border-black/10 bg-black text-sm font-semibold text-white shadow-sm">
          CCH
        </span>
        <div>
          <p className="text-sm font-semibold text-black">Campus Club Hub</p>
          <p className="text-xs text-black/50">Enterprise club operations</p>
        </div>
      </div>

      <Separator className="my-6 bg-black/10" />

      <div className="space-y-2">
        {items.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm transition-all",
                active
                  ? "border-black/15 bg-black text-white shadow-md"
                  : "border-transparent bg-transparent text-black/70 hover:border-black/8 hover:bg-white/80 hover:text-black",
              )}
            >
              <Icon className="mt-0.5 size-4 shrink-0" />
              <span className="flex flex-col">
                <span className="font-medium">{item.label}</span>
                <span className={cn("text-xs", active ? "text-white/65" : "text-black/45")}>
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <div className="mt-auto space-y-4 rounded-3xl border border-black/10 bg-black/[0.02] p-4">
        <div>
          <p className="text-sm font-medium text-black">{name}</p>
          <p className="text-xs text-black/50">{email}</p>
        </div>
        <Badge
          variant="secondary"
          className="rounded-full border-black/10 bg-white/80 text-black/70"
        >
          {role.replace("_", " ")}
        </Badge>
      </div>
    </aside>
  );
}
