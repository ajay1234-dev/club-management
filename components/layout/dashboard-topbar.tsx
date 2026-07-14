"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, Sparkles } from "lucide-react";

import { DASHBOARD_NAVIGATION } from "@/lib/constants/navigation";
import type { UserRole } from "@/lib/constants/roles";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type DashboardTopbarProps = {
  role: UserRole;
  name: string;
};

export function DashboardTopbar({ role, name }: DashboardTopbarProps) {
  const pathname = usePathname();
  const items = DASHBOARD_NAVIGATION.filter((item) => item.roles.includes(role));

  return (
    <header className="sticky top-0 z-20 border-b border-black/10 bg-white/75 backdrop-blur-md lg:border-none lg:bg-transparent">
      <div className="flex items-center justify-between gap-3 px-4 py-4 lg:px-8 lg:py-6">
        <div className="flex items-center gap-3">
          <Sheet>
            <SheetTrigger render={<Button variant="outline" size="icon" className="lg:hidden" />}>
              <Menu className="size-4" />
              <span className="sr-only">Open navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px] p-0">
              <div className="flex h-full flex-col bg-white p-5">
                <SheetHeader className="text-left">
                  <SheetTitle>Campus Club Hub</SheetTitle>
                  <SheetDescription>
                    Paper-inspired control surface for the campus portal.
                  </SheetDescription>
                </SheetHeader>
                <Separator className="my-5 bg-black/10" />
                <div className="space-y-2">
                  {items.map((item) => {
                    const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition-all",
                          active
                            ? "border-black/15 bg-black text-white"
                            : "border-black/8 bg-black/[0.02] text-black/70 hover:bg-black/[0.04] hover:text-black",
                        )}
                      >
                        <Icon className="size-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </SheetContent>
          </Sheet>
          <div>
            <p className="text-xs uppercase tracking-[0.26em] text-black/35">Workspace</p>
            <h1 className="text-lg font-semibold text-black">
              {items.find((item) => pathname === item.href)?.label ?? "Overview"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className="hidden rounded-full border-black/10 bg-black/5 text-black/70 sm:inline-flex"
          >
            <Sparkles className="size-3.5" />
            {role.replace("_", " ")}
          </Badge>
          <div className="rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70 shadow-sm">
            {name}
          </div>
        </div>
      </div>
    </header>
  );
}
