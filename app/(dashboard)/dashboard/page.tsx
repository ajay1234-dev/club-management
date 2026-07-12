import Link from "next/link";
import { redirect } from "next/navigation";
import { and, asc, desc, eq } from "drizzle-orm";
import {
  ArrowUpRight,
  Sparkles,
  CalendarDays,
  Users,
  Compass,
  Plus,
  ShieldCheck,
  ShieldAlert,
  BarChart3,
  Clock,
} from "lucide-react";

import { auth } from "@/auth";
import { getDb } from "@/config/db";
import { clubs, eventApplications, events, users } from "@/config/schema";
import { getClubEventStats } from "@/lib/repositories/events-repository";
import { getPlatformAnalytics } from "@/lib/repositories/admin-repository";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/layout/fade-in";

export const dynamic = "force-dynamic";

type UpcomingEventItem = {
  event: {
    id: string;
    title: string;
    description: string;
    category: string;
    venue: string;
    eventDate: Date | string;
    startTime: string;
    endTime: string;
    registrationDeadline: Date | string;
    maxParticipants: number;
    organizerDetails: string;
    posterUrl?: string | null;
    status: string;
    isPublished: boolean;
    createdAt: Date | string;
  };
  club: {
    name: string;
    slug: string;
    icon: string;
  };
};

type RecentRegistrationItem = {
  application: {
    id: string;
    eventId: string;
    studentId: string;
    status: string;
    createdAt: Date | string;
    updatedAt: Date | string;
  };
  event: {
    id: string;
    title: string;
  };
  club: {
    name: string;
  };
};

type AdminRegistrationItem = {
  applicationId: string;
  eventTitle: string;
  studentName: string;
  studentEmail: string;
  appliedAt: Date | string;
};

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const db = getDb();

  // ==========================================
  // STUDENT DASHBOARD
  // ==========================================
  if (role === "student") {
    // Fetch upcoming published events from active clubs
    const upcomingEvents = (await db
      .select({
        event: events,
        club: {
          name: clubs.name,
          slug: clubs.slug,
          icon: clubs.icon,
        },
      })
      .from(events)
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(
        and(eq(events.isPublished, true), eq(events.status, "Upcoming"), eq(clubs.isActive, true)),
      )
      .orderBy(asc(events.eventDate))
      .limit(4)) as unknown as UpcomingEventItem[];

    // Fetch student's recent applications
    const recentRegistrations = (await db
      .select({
        application: eventApplications,
        event: events,
        club: {
          name: clubs.name,
        },
      })
      .from(eventApplications)
      .innerJoin(events, eq(eventApplications.eventId, events.id))
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(eq(eventApplications.studentId, session.user.id))
      .orderBy(desc(eventApplications.createdAt))
      .limit(3)) as unknown as RecentRegistrationItem[];

    return (
      <div className="space-y-6">
        <FadeIn>
          <section className="paper-card grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="rounded-full border-black/10 bg-black/5 text-black/70"
              >
                <Sparkles className="size-3.5" />
                Student Portal
              </Badge>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">
                Welcome back, {session.user.name?.split(" ")[0]}.
              </h2>
              <p className="max-w-2xl text-base leading-7 text-black/60">
                Browse upcoming club workshops, manage your event registrations, and explore the
                campus directory.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-5 bg-black text-white hover:bg-black/90">
                  <Link href="/dashboard/events">
                    Browse Events
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link href="/dashboard/clubs">Explore Clubs</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {[
                {
                  label: "My Applications",
                  value: recentRegistrations.length,
                  href: "/dashboard/applications",
                },
                { label: "Campus Clubs", value: "11 Active", href: "/dashboard/clubs" },
                { label: "Live Events", value: upcomingEvents.length, href: "/dashboard/events" },
              ].map((stat) => (
                <Link key={stat.label} href={stat.href}>
                  <Card className="rounded-[1.75rem] border-black/10 bg-white/80 shadow-none hover:bg-black/[0.01] transition-colors cursor-pointer h-full">
                    <CardHeader className="space-y-2 pb-2">
                      <CardDescription className="text-black/50 text-xs">
                        {stat.label}
                      </CardDescription>
                      <CardTitle className="text-2xl text-black tracking-tight">
                        {stat.value}
                      </CardTitle>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        </FadeIn>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Upcoming Events Feed */}
          <FadeIn delay={0.06}>
            <Card className="paper-card border-black/10 bg-white/80">
              <CardHeader>
                <CardTitle className="text-xl text-black">Upcoming Events</CardTitle>
                <CardDescription className="text-black/60">
                  Active programs scheduled across campus clubs.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-black/45 text-sm">
                    No upcoming events scheduled right now.
                  </div>
                ) : (
                  upcomingEvents.map(({ event, club }: UpcomingEventItem) => {
                    const eventDate = new Date(event.eventDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });

                    return (
                      <div
                        key={event.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-black/5 bg-white hover:border-black/10 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-black/8 bg-black/5 text-sm font-semibold select-none">
                            {club.icon}
                          </span>
                          <div>
                            <p className="font-semibold text-black text-sm sm:text-base line-clamp-1">
                              {event.title}
                            </p>
                            <p className="text-xs text-black/50">
                              {club.name} • {event.venue}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <Badge
                            variant="outline"
                            className="rounded-full bg-black/5 text-black border-transparent text-[10px]"
                          >
                            {eventDate}
                          </Badge>
                          <p className="text-[10px] text-black/40 mt-1">{event.startTime}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Recent applications */}
          <FadeIn delay={0.1}>
            <Card className="paper-card border-black/10 bg-white/80">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl text-black">My Registrations</CardTitle>
                <CardDescription className="text-black/60">
                  Your recent event registration passes.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRegistrations.length === 0 ? (
                  <div className="text-center py-8 text-black/40 text-xs">
                    {"You haven't registered for any events yet."}
                  </div>
                ) : (
                  recentRegistrations.map(
                    ({ application, event, club }: RecentRegistrationItem) => (
                      <div
                        key={application.id}
                        className="p-3.5 rounded-2xl border border-black/8 bg-black/[0.01] space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-semibold uppercase tracking-wider text-black/45">
                            {club.name}
                          </span>
                          <Badge className="bg-emerald-50 border-emerald-200 text-emerald-700 rounded-full text-[9px] uppercase font-bold py-0">
                            {application.status}
                          </Badge>
                        </div>
                        <p className="font-semibold text-black text-sm line-clamp-1">
                          {event.title}
                        </p>
                        <p className="text-[10px] text-black/50">
                          Registered on {new Date(application.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    ),
                  )
                )}
                {recentRegistrations.length > 0 && (
                  <Button
                    asChild
                    variant="ghost"
                    className="w-full text-xs text-black/50 hover:text-black"
                  >
                    <Link href="/dashboard/applications">
                      View all applications ({recentRegistrations.length})
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    );
  }

  // ==========================================
  // CLUB ADMIN DASHBOARD
  // ==========================================
  if (role === "club_admin") {
    const clubId = session.user.clubId;
    if (!clubId) {
      return (
        <div className="paper-card p-6 text-center text-rose-500 bg-white">
          Admin profile is not linked to any club workspace.
        </div>
      );
    }

    const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId)).limit(1);
    if (!club) {
      return (
        <div className="paper-card p-6 text-center text-rose-500 bg-white">
          Club workspace not found.
        </div>
      );
    }

    const stats = await getClubEventStats(clubId);

    // Fetch recent registrations for club events
    const recentRegistrations = (await db
      .select({
        applicationId: eventApplications.id,
        eventTitle: events.title,
        studentName: users.displayName,
        studentEmail: users.email,
        appliedAt: eventApplications.createdAt,
      })
      .from(eventApplications)
      .innerJoin(events, eq(eventApplications.eventId, events.id))
      .innerJoin(users, eq(eventApplications.studentId, users.id))
      .where(eq(events.clubId, clubId))
      .orderBy(desc(eventApplications.createdAt))
      .limit(5)) as unknown as AdminRegistrationItem[];

    // Fetch upcoming events for club
    const upcomingEvents = (await db
      .select({ event: events })
      .from(events)
      .where(and(eq(events.clubId, clubId), eq(events.status, "Upcoming")))
      .orderBy(asc(events.eventDate))
      .limit(3)) as unknown as {
      event: {
        id: string;
        category: string;
        title: string;
        eventDate: Date | string;
        startTime: string;
      };
    }[];

    return (
      <div className="space-y-6">
        <FadeIn>
          <section className="paper-card grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="rounded-full border-black/10 bg-black/5 text-black/70"
              >
                <ShieldAlert className="size-3.5" />
                Club Admin Portal
              </Badge>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">
                {club.name} Workspace
              </h2>
              <p className="max-w-2xl text-base leading-7 text-black/60">
                Manage upcoming club activities, review student registrations, and view
                participation metrics.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-5 bg-black text-white hover:bg-black/90">
                  <Link href="/dashboard/events">
                    <Plus className="size-4 mr-1.5" />
                    Manage Events Workspace
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link href={`/dashboard/clubs/${club.slug}`}>View Public Profile</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {[
                { label: "Total Events", value: stats.totalEvents },
                { label: "Signups Received", value: stats.totalRegistrations },
                { label: "Published Events", value: stats.publishedEvents },
                { label: "Upcoming Events", value: stats.upcomingEvents },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="rounded-[1.5rem] border-black/10 bg-white/80 shadow-none"
                >
                  <CardHeader className="space-y-1 p-4 pb-2">
                    <CardDescription className="text-black/50 text-[10px] uppercase tracking-wider font-semibold">
                      {stat.label}
                    </CardDescription>
                    <CardTitle className="text-2xl text-black tracking-tight">
                      {stat.value}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        </FadeIn>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          {/* Recent Registrations log */}
          <FadeIn delay={0.06}>
            <Card className="paper-card border-black/10 bg-white/80">
              <CardHeader>
                <CardTitle className="text-xl text-black">Recent Event Signups</CardTitle>
                <CardDescription className="text-black/60">
                  Latest registration submissions from students.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentRegistrations.length === 0 ? (
                  <div className="text-center py-8 text-black/40 text-sm">
                    No signups received yet.
                  </div>
                ) : (
                  recentRegistrations.map((reg: AdminRegistrationItem) => (
                    <div
                      key={reg.applicationId}
                      className="flex items-center justify-between p-3.5 rounded-2xl border border-black/5 bg-white hover:border-black/10 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <p className="font-semibold text-black text-sm">{reg.studentName}</p>
                        <p className="text-[10px] text-black/50">
                          {reg.studentEmail} • Registered for{" "}
                          <span className="font-medium text-black">{reg.eventTitle}</span>
                        </p>
                      </div>
                      <span className="text-[10px] text-black/40 font-mono">
                        {new Date(reg.appliedAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </FadeIn>

          {/* Recent registrations schedule */}
          <FadeIn delay={0.1}>
            <Card className="paper-card border-black/10 bg-white/80">
              <CardHeader>
                <CardTitle className="text-xl text-black">Upcoming schedule</CardTitle>
                <CardDescription className="text-black/60">
                  Upcoming scheduled events for your club.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {upcomingEvents.length === 0 ? (
                  <div className="text-center py-8 text-black/40 text-xs">
                    No upcoming events scheduled.
                  </div>
                ) : (
                  upcomingEvents.map(
                    ({
                      event,
                    }: {
                      event: {
                        id: string;
                        category: string;
                        title: string;
                        eventDate: Date | string;
                        startTime: string;
                      };
                    }) => (
                      <div
                        key={event.id}
                        className="p-3.5 rounded-2xl border border-black/8 bg-black/[0.01] space-y-1"
                      >
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="rounded-full bg-black/5 text-black border-transparent text-[9px]"
                          >
                            {event.category}
                          </Badge>
                          <span className="text-[10px] font-semibold text-amber-600">Upcoming</span>
                        </div>
                        <p className="font-semibold text-black text-sm">{event.title}</p>
                        <p className="text-[10px] text-black/50 flex items-center gap-1">
                          <Clock className="size-3 text-black/35" />
                          {new Date(event.eventDate).toLocaleDateString()} at {event.startTime}
                        </p>
                      </div>
                    ),
                  )
                )}
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    );
  }

  // ==========================================
  // SUPER ADMIN DASHBOARD
  // ==========================================
  if (role === "super_admin") {
    const analytics = await getPlatformAnalytics();

    return (
      <div className="space-y-6">
        <FadeIn>
          <section className="paper-card grid gap-6 p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div className="space-y-4">
              <Badge
                variant="secondary"
                className="rounded-full border-black/10 bg-black/5 text-black/70"
              >
                <ShieldCheck className="size-3.5" />
                Super Admin Console
              </Badge>
              <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-black sm:text-5xl">
                Global Administration
              </h2>
              <p className="max-w-2xl text-base leading-7 text-black/60">
                System configuration overview and governance shortcuts. Adjust roles, activate
                clubs, and review events.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="rounded-full px-5 bg-black text-white hover:bg-black/90">
                  <Link href="/dashboard/admin">
                    Open Admin Controls
                    <ArrowUpRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full px-5">
                  <Link href="/dashboard/events">Monitor All Events</Link>
                </Button>
              </div>
            </div>

            <div className="grid gap-3 grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {[
                { label: "Total Clubs", value: analytics.totalClubs },
                { label: "Active Clubs", value: analytics.activeClubs },
                { label: "Total Students", value: analytics.totalStudents },
                { label: "Total Admins", value: analytics.totalAdmins },
              ].map((stat) => (
                <Card
                  key={stat.label}
                  className="rounded-[1.5rem] border-black/10 bg-white/80 shadow-none"
                >
                  <CardHeader className="space-y-1 p-4 pb-2">
                    <CardDescription className="text-black/50 text-[10px] uppercase tracking-wider font-semibold">
                      {stat.label}
                    </CardDescription>
                    <CardTitle className="text-2xl text-black tracking-tight">
                      {stat.value}
                    </CardTitle>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </section>
        </FadeIn>

        {/* System metrics breakdown */}
        <div className="grid gap-6 md:grid-cols-2">
          <FadeIn delay={0.06}>
            <Card className="paper-card border-black/10 bg-white/80 h-full">
              <CardHeader>
                <CardTitle className="text-xl text-black">Operations shortcuts</CardTitle>
                <CardDescription className="text-black/60">
                  Quick system management shortcuts.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {[
                  {
                    label: "Access Control",
                    desc: "Manage user profiles and roles",
                    href: "/dashboard/admin?tab=users",
                    icon: Users,
                  },
                  {
                    label: "Clubs Directory",
                    desc: "Activate or deactivate clubs",
                    href: "/dashboard/admin?tab=clubs",
                    icon: Compass,
                  },
                  {
                    label: "Campus Events",
                    desc: "View all campus events feed",
                    href: "/dashboard/events",
                    icon: CalendarDays,
                  },
                  {
                    label: "System Analytics",
                    desc: "Overall portal registrations",
                    href: "/dashboard/admin",
                    icon: BarChart3,
                  },
                ].map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="group rounded-2xl border border-black/8 bg-white/80 hover:bg-black/[0.01] hover:border-black/15 p-4 flex flex-col justify-between h-32 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <item.icon className="size-5 text-black/40 group-hover:text-black transition-colors" />
                      <ArrowUpRight className="size-4 text-black/0 group-hover:text-black/35 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    <div>
                      <p className="font-semibold text-black text-sm">{item.label}</p>
                      <p className="text-[10px] text-black/45 mt-0.5 line-clamp-1">{item.desc}</p>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Card className="paper-card border-black/10 bg-white/80 h-full">
              <CardHeader>
                <CardTitle className="text-xl text-black">Global Metrics</CardTitle>
                <CardDescription className="text-black/60">
                  Total numbers representing current portal engagement.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-relaxed text-black/75">
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="font-medium text-black">Total Events Hosted</span>
                  <span className="font-mono text-black">{analytics.totalEvents}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="font-medium text-black">Currently Published Events</span>
                  <span className="font-mono text-black">{analytics.publishedEvents}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 pb-2">
                  <span className="font-medium text-black">Upcoming Active Events</span>
                  <span className="font-mono text-black">{analytics.upcomingEvents}</span>
                </div>
                <div className="flex justify-between items-center pb-2">
                  <span className="font-medium text-black">Global Registrations</span>
                  <span className="font-mono text-black">{analytics.totalRegistrations}</span>
                </div>
              </CardContent>
            </Card>
          </FadeIn>
        </div>
      </div>
    );
  }

  return <div className="paper-card p-8 text-center bg-white">Access denied.</div>;
}
