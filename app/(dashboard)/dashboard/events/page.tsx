import { redirect } from "next/navigation";
import { ComponentProps } from "react";
import { and, desc, eq, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { getDb } from "@/config/db";
import { clubs, eventApplications, events, users } from "@/config/schema";
import { listClubs } from "@/lib/repositories/clubs-repository";
import { getClubEventStats, getGlobalEventStats } from "@/lib/repositories/events-repository";
import { ClubAdminView } from "@/components/events/club-admin-view";
import { StudentView } from "@/components/events/student-view";
import { SuperAdminView } from "@/components/events/super-admin-view";

export const dynamic = "force-dynamic";

export default async function EventsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const role = session.user.role;
  const db = getDb();

  // 1. Club Admin View
  if (role === "club_admin") {
    const clubId = session.user.clubId;
    if (!clubId) {
      return (
        <div className="paper-card p-8 text-center text-rose-600 bg-white">
          Your account is not associated with any club workspace. Please contact institutional
          admin.
        </div>
      );
    }

    const [club] = await db.select().from(clubs).where(eq(clubs.id, clubId)).limit(1);
    if (!club) {
      return (
        <div className="paper-card p-8 text-center text-rose-600 bg-white">
          Associated club workspace not found.
        </div>
      );
    }

    // Fetch club events (published + drafts)
    const clubEvents = await db
      .select({
        event: events,
      })
      .from(events)
      .where(eq(events.clubId, clubId))
      .orderBy(desc(events.createdAt));

    // Fetch club event registrations
    const registrations = await db
      .select({
        applicationId: eventApplications.id,
        eventId: eventApplications.eventId,
        eventTitle: events.title,
        studentName: users.displayName,
        studentEmail: users.email,
        studentPhone: users.phone,
        appliedAt: eventApplications.createdAt,
      })
      .from(eventApplications)
      .innerJoin(events, eq(eventApplications.eventId, events.id))
      .innerJoin(users, eq(eventApplications.studentId, users.id))
      .where(eq(events.clubId, clubId))
      .orderBy(desc(eventApplications.createdAt));

    const stats = await getClubEventStats(clubId);

    return (
      <ClubAdminView
        clubName={club.name}
        clubIcon={club.icon}
        eventsList={clubEvents as unknown as ComponentProps<typeof ClubAdminView>["eventsList"]}
        registrationsList={
          registrations as unknown as ComponentProps<typeof ClubAdminView>["registrationsList"]
        }
        stats={stats}
      />
    );
  }

  // 2. Student View
  if (role === "student") {
    // Fetch all published events with current registration state
    const studentEvents = await db
      .select({
        event: events,
        club: {
          id: clubs.id,
          name: clubs.name,
          slug: clubs.slug,
          color: clubs.color,
          icon: clubs.icon,
          logoUrl: clubs.logoUrl,
          contactEmail: clubs.contactEmail,
          websiteUrl: clubs.websiteUrl,
          facultyCoordinator: clubs.facultyCoordinator,
          studentCoordinator: clubs.studentCoordinator,
        },
        registrationCount: sql<number>`CAST((select count(*) from ${eventApplications} where ${eventApplications.eventId} = ${events.id}) AS INTEGER)`,
        isUserRegistered: sql<boolean>`((select count(*) from ${eventApplications} where ${eventApplications.eventId} = ${events.id} and ${eventApplications.studentId} = ${session.user.id}) > 0)`,
      })
      .from(events)
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .where(and(eq(events.isPublished, true), eq(clubs.isActive, true)))
      .orderBy(desc(events.createdAt));

    const clubsList = await listClubs();
    const activeClubs = clubsList.filter((c: { isActive: boolean }) => c.isActive);

    return (
      <StudentView
        eventsList={studentEvents as unknown as ComponentProps<typeof StudentView>["eventsList"]}
        clubsList={activeClubs as unknown as ComponentProps<typeof StudentView>["clubsList"]}
      />
    );
  }

  // 3. Super Admin View
  if (role === "super_admin") {
    // Fetch all events (including draft ones) from all clubs
    const adminEvents = await db
      .select({
        event: events,
        club: {
          id: clubs.id,
          name: clubs.name,
          slug: clubs.slug,
          color: clubs.color,
          icon: clubs.icon,
        },
        registrationCount: sql<number>`CAST((select count(*) from ${eventApplications} where ${eventApplications.eventId} = ${events.id}) AS INTEGER)`,
      })
      .from(events)
      .innerJoin(clubs, eq(events.clubId, clubs.id))
      .orderBy(desc(events.createdAt));

    const clubsList = await listClubs();
    const stats = await getGlobalEventStats();

    return (
      <SuperAdminView
        eventsList={adminEvents as unknown as ComponentProps<typeof SuperAdminView>["eventsList"]}
        clubsList={clubsList as unknown as ComponentProps<typeof SuperAdminView>["clubsList"]}
        stats={stats}
      />
    );
  }

  return <div className="paper-card p-8 text-center bg-white">Access denied.</div>;
}
