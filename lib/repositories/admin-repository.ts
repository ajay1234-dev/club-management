import { eq, sql } from "drizzle-orm";
import { getDb } from "@/config/db";
import {
  clubs,
  users,
  roles,
  studentProfiles,
  clubAdminProfiles,
  eventApplications,
  events,
} from "@/config/schema";

export async function listAllUsers() {
  const db = getDb();
  return db
    .select({
      user: users,
      role: roles,
      studentProfile: studentProfiles,
      clubAdminProfile: clubAdminProfiles,
      club: {
        id: clubs.id,
        name: clubs.name,
      },
    })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .leftJoin(studentProfiles, eq(users.id, studentProfiles.userId))
    .leftJoin(clubAdminProfiles, eq(users.id, clubAdminProfiles.userId))
    .leftJoin(clubs, eq(users.clubId, clubs.id))
    .orderBy(users.createdAt);
}

export async function listAllClubsAdmin() {
  const db = getDb();
  return db
    .select({
      club: clubs,
      adminCount: sql<number>`(
        select count(*) from ${users} 
        inner join ${roles} on ${users}.role_id = ${roles}.id 
        where ${users}.club_id = ${clubs}.id and ${roles}.slug = 'club_admin'
      )`,
    })
    .from(clubs)
    .orderBy(clubs.name);
}

export async function toggleClubActiveStatus(clubId: string, isActive: boolean) {
  const db = getDb();
  const [updated] = await db
    .update(clubs)
    .set({
      isActive,
      updatedAt: new Date(),
    })
    .where(eq(clubs.id, clubId))
    .returning();

  return updated;
}

export async function updateUserRole(userId: string, targetRoleSlug: string) {
  const db = getDb();

  // Find role by slug
  const [role] = await db
    .select()
    .from(roles)
    .where(eq(roles.slug, targetRoleSlug as "student" | "club_admin" | "super_admin"))
    .limit(1);
  if (!role) {
    throw new Error(`Role ${targetRoleSlug} does not exist.`);
  }

  const [updated] = await db
    .update(users)
    .set({
      roleId: role.id,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

export async function resetUserPasswordHash(userId: string, newPasswordHash: string) {
  const db = getDb();
  const [updated] = await db
    .update(users)
    .set({
      passwordHash: newPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updated;
}

export async function getPlatformAnalytics() {
  const db = getDb();

  // Total Clubs
  const [clubsRes] = await db.select({ count: sql<number>`count(*)` }).from(clubs);
  const [activeClubsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(clubs)
    .where(eq(clubs.isActive, true));

  // Users by roles
  const [studentsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(roles.slug, "student"));

  const [adminsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(roles.slug, "club_admin"));

  const [superAdminsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(users)
    .innerJoin(roles, eq(users.roleId, roles.id))
    .where(eq(roles.slug, "super_admin"));

  // Events
  const [eventsRes] = await db.select({ count: sql<number>`count(*)` }).from(events);
  const [publishedEventsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(eq(events.isPublished, true));
  const [upcomingEventsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(eq(events.status, "Upcoming"));

  // Registrations
  const [registrationsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(eventApplications);

  return {
    totalClubs: Number(clubsRes?.count ?? 0),
    activeClubs: Number(activeClubsRes?.count ?? 0),
    totalStudents: Number(studentsRes?.count ?? 0),
    totalAdmins: Number(adminsRes?.count ?? 0),
    totalSuperAdmins: Number(superAdminsRes?.count ?? 0),
    totalEvents: Number(eventsRes?.count ?? 0),
    publishedEvents: Number(publishedEventsRes?.count ?? 0),
    upcomingEvents: Number(upcomingEventsRes?.count ?? 0),
    totalRegistrations: Number(registrationsRes?.count ?? 0),
  };
}
