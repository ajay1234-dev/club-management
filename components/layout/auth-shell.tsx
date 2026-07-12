"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FadeIn } from "@/components/layout/fade-in";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
};

const highlights = [
  "Role-based onboarding for students, club admins, and super admins.",
  "Reset links and email delivery through Resend.",
  "JWT session handling with protected routes and RBAC guards.",
];

export function AuthShell({ title, description, children }: AuthShellProps) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/login";
  const isSignupPage = pathname === "/signup";

  return (
    <div className="mx-auto grid min-h-[calc(100vh-1px)] w-full max-w-7xl items-stretch gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-8">
      <FadeIn className="flex flex-col justify-between rounded-[2rem] border border-black/10 bg-white/75 p-6 shadow-[0_24px_70px_-35px_rgba(0,0,0,0.35)] backdrop-blur-md lg:p-8">
        <div className="space-y-6">
          <Link href="/" className="inline-flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-2xl border border-black/10 bg-black text-sm font-semibold text-white">
              CCH
            </span>
            <span>
              <span className="block text-sm font-semibold text-black">Campus Club Hub</span>
              <span className="block text-xs text-black/55">Minimal paper + pencil workspace</span>
            </span>
          </Link>

          <div className="space-y-3">
            <Badge
              variant="secondary"
              className="rounded-full border-black/10 bg-black/5 text-black/70"
            >
              <Sparkles className="size-3.5" />
              Phase 1 foundation
            </Badge>
            <h1 className="max-w-xl text-5xl font-extrabold tracking-tighter leading-[1.05] text-black sm:text-6xl">
              {title}
            </h1>
            <p className="max-w-xl text-base leading-7 text-black/65">{description}</p>
          </div>

          <Card className="rounded-[1.75rem] border-black/10 bg-black/[0.02] p-5 shadow-none">
            <div className="space-y-4">
              {highlights.map((item) => (
                <div key={item} className="flex gap-3 text-sm leading-6 text-black/70">
                  <Check className="mt-1 size-4 shrink-0 text-black/55" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3 text-sm text-black/60">
          {!isLoginPage && (
            <Button variant="outline" className="rounded-full">
              <Link href="/login">Log in</Link>
            </Button>
          )}
          {!isSignupPage && (
            <Button className="rounded-full px-5">
              <Link href="/signup">Create account</Link>
            </Button>
          )}
          <Separator orientation="vertical" className="hidden h-6 bg-black/10 md:block" />
          <span className="font-medium text-black/50">Vercel-ready, Neon-ready, future-proof.</span>
        </div>
      </FadeIn>

      <FadeIn delay={0.08} className="flex items-center">
        <div className="paper-card w-full p-6 sm:p-8">{children}</div>
      </FadeIn>
    </div>
  );
}
