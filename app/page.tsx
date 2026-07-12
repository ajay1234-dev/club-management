import Link from "next/link";
import { ArrowRight, Check, Sparkles } from "lucide-react";

import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { FadeIn } from "@/components/layout/fade-in";
import { CLUB_SEED } from "@/lib/constants/clubs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        <section className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-20">
          <FadeIn className="space-y-8">
            <div className="space-y-5">
              <Badge
                variant="secondary"
                className="rounded-full border-black/10 bg-black/5 text-black/70"
              >
                <Sparkles className="size-3.5" />
                One portal for all 11 clubs
              </Badge>
              <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-black sm:text-6xl">
                Campus Club Hub keeps every club in one calm, protected workspace.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-black/65 sm:text-lg">
                A production-ready Next.js 15 foundation with role-based authentication, Neon
                PostgreSQL, Drizzle ORM, secure password reset flows, and a paper-sketch interface
                built for six developers to extend without rewrites.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button asChild className="rounded-full px-6">
                <Link href="/signup">
                  Get started
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full px-6">
                <Link href="/login">Sign in</Link>
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {[
                "JWT sessions and middleware protection",
                "Sealed password reset workflow with email delivery",
                "Reusable layouts, shared validators, and repository pattern",
              ].map((item) => (
                <div
                  key={item}
                  className="flex gap-3 rounded-2xl border border-black/8 bg-white/70 p-4 text-sm leading-6 text-black/70"
                >
                  <Check className="mt-1 size-4 shrink-0 text-black/55" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </FadeIn>

          <FadeIn delay={0.1} className="grid gap-4">
            <Card className="paper-card border-black/10 bg-white/80">
              <CardHeader>
                <CardTitle className="text-2xl text-black">Foundation snapshot</CardTitle>
                <CardDescription className="text-black/60">
                  Architecture first. Feature flags later.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-black/8 bg-black/[0.02] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-black/35">Database</p>
                  <p className="mt-2 text-sm text-black/70">
                    Drizzle schema for users, roles, clubs, profiles, sessions, and reset tokens.
                  </p>
                </div>
                <div className="rounded-2xl border border-black/8 bg-black/[0.02] p-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-black/35">Security</p>
                  <p className="mt-2 text-sm text-black/70">
                    bcrypt hashing, RBAC, protected layouts, and edge middleware checks.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="paper-card border-black/10 bg-white/80">
              <CardHeader>
                <CardTitle className="text-2xl text-black">Seeded clubs</CardTitle>
                <CardDescription className="text-black/60">
                  The portal starts with all 11 college clubs already defined.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {CLUB_SEED.slice(0, 6).map((club) => (
                  <div
                    key={club.slug}
                    className="rounded-2xl border border-black/8 bg-black/[0.02] px-4 py-3 text-sm text-black/70"
                  >
                    {club.icon} {club.name}
                  </div>
                ))}
              </CardContent>
            </Card>
          </FadeIn>
        </section>

        <section
          id="architecture"
          className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14"
        >
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                title: "Scalable structure",
                description:
                  "Route groups, services, repositories, and validators are separated so Phase 2 and Phase 3 can land cleanly.",
              },
              {
                title: "Aesthetic direction",
                description:
                  "Off-white paper background, black pencil outlines, soft shadows, and restrained color for a calm campus feel.",
              },
              {
                title: "Operational readiness",
                description:
                  "Vercel deployment, Neon database, Resend email hooks, Cloudinary-ready image support, and env validation are prepared.",
              },
            ].map((card) => (
              <Card key={card.title} className="paper-card border-black/10 bg-white/80">
                <CardHeader>
                  <CardTitle className="text-xl text-black">{card.title}</CardTitle>
                  <CardDescription className="text-black/60">{card.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
