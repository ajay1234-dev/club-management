import { and, desc, eq, like, sql } from "drizzle-orm";
import { getDb } from "@/config/db";
import { clubs, eventApplications, events, users } from "@/config/schema";

export type CreateEventInput = {
  clubId: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  eventDate: Date;
  startTime: string;
  endTime: string;
  registrationDeadline: Date;
  maxParticipants: number;
  organizerDetails: string;
  posterUrl?: string | null;
  status?: string;
  isPublished?: boolean;
  createdBy: string;
};

export type UpdateEventInput = Partial<Omit<CreateEventInput, "createdBy" | "clubId">>;

export async function listEvents(filters: {
  search?: string;
  category?: string;
  clubSlug?: string;
  status?: string;
  isPublished?: boolean;
  limit?: number;
  offset?: number;
  sortBy?: "latest" | "oldest" | "date_asc" | "date_desc";
}) {
  const db = getDb();
  const conditions = [];

  if (filters.search) {
    conditions.push(like(events.title, `%${filters.search}%`));
  }

  if (filters.category && filters.category !== "all") {
    conditions.push(eq(events.category, filters.category));
  }

  if (filters.status && filters.status !== "all") {
    conditions.push(eq(events.status, filters.status));
  }

  if (filters.isPublished !== undefined) {
    conditions.push(eq(events.isPublished, filters.isPublished));
  }

  const baseQuery = db
    .select({
      event: events,
      club: {
        id: clubs.id,
        name: clubs.name,
        slug: clubs.slug,
        color: clubs.color,
        icon: clubs.icon,
        logoUrl: clubs.logoUrl,
      },
    })
    .from(events)
    .innerJoin(clubs, eq(events.clubId, clubs.id));

  if (filters.clubSlug && filters.clubSlug !== "all") {
    conditions.push(eq(clubs.slug, filters.clubSlug));
  }

  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

  let finalQuery = baseQuery;
  if (whereClause) {
    finalQuery = finalQuery.where(whereClause) as typeof baseQuery;
  }

  let order = desc(events.createdAt);
  if (filters.sortBy === "oldest") {
    order = sql`${events.createdAt} asc`;
  } else if (filters.sortBy === "date_asc") {
    order = sql`${events.eventDate} asc`;
  } else if (filters.sortBy === "date_desc") {
    order = sql`${events.eventDate} desc`;
  }

  finalQuery = finalQuery.orderBy(order) as typeof baseQuery;

  if (filters.limit) {
    finalQuery = finalQuery.limit(filters.limit) as typeof baseQuery;
  }
  if (filters.offset) {
    finalQuery = finalQuery.offset(filters.offset) as typeof baseQuery;
  }

  return finalQuery;
}

export async function getEventById(id: string) {
  const db = getDb();
  const [result] = await db
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
    })
    .from(events)
    .innerJoin(clubs, eq(events.clubId, clubs.id))
    .where(eq(events.id, id))
    .limit(1);

  return result ?? null;
}

export async function createEvent(input: CreateEventInput) {
  const db = getDb();
  const [created] = await db
    .insert(events)
    .values({
      clubId: input.clubId,
      title: input.title,
      description: input.description,
      category: input.category,
      venue: input.venue,
      eventDate: input.eventDate,
      startTime: input.startTime,
      endTime: input.endTime,
      registrationDeadline: input.registrationDeadline,
      maxParticipants: input.maxParticipants,
      organizerDetails: input.organizerDetails,
      posterUrl: input.posterUrl ?? null,
      status: input.status ?? "Upcoming",
      isPublished: input.isPublished ?? false,
      createdBy: input.createdBy,
    })
    .returning();

  return created;
}

export async function updateEvent(id: string, input: UpdateEventInput) {
  const db = getDb();
  const [updated] = await db
    .update(events)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(eq(events.id, id))
    .returning();

  return updated;
}

export async function deleteEvent(id: string) {
  const db = getDb();
  const [deleted] = await db.delete(events).where(eq(events.id, id)).returning();
  return deleted ?? null;
}

export async function createApplication(eventId: string, studentId: string) {
  const db = getDb();
  const [app] = await db
    .insert(eventApplications)
    .values({
      eventId,
      studentId,
      status: "registered",
    })
    .returning();

  return app;
}

export async function checkApplicationExists(eventId: string, studentId: string) {
  const db = getDb();
  const [app] = await db
    .select()
    .from(eventApplications)
    .where(and(eq(eventApplications.eventId, eventId), eq(eventApplications.studentId, studentId)))
    .limit(1);

  return !!app;
}

export async function getStudentApplications(studentId: string) {
  const db = getDb();
  return db
    .select({
      application: eventApplications,
      event: events,
      club: {
        id: clubs.id,
        name: clubs.name,
        slug: clubs.slug,
        color: clubs.color,
        icon: clubs.icon,
      },
    })
    .from(eventApplications)
    .innerJoin(events, eq(eventApplications.eventId, events.id))
    .innerJoin(clubs, eq(events.clubId, clubs.id))
    .where(eq(eventApplications.studentId, studentId))
    .orderBy(desc(eventApplications.createdAt));
}

export async function getEventApplicationsList(eventId: string) {
  const db = getDb();
  return db
    .select({
      application: eventApplications,
      student: {
        id: users.id,
        displayName: users.displayName,
        email: users.email,
        phone: users.phone,
      },
    })
    .from(eventApplications)
    .innerJoin(users, eq(eventApplications.studentId, users.id))
    .where(eq(eventApplications.eventId, eventId))
    .orderBy(desc(eventApplications.createdAt));
}

export async function getClubEventStats(clubId: string) {
  const db = getDb();

  // Total events count
  const [totalRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(eq(events.clubId, clubId));

  // Published events count
  const [publishedRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(and(eq(events.clubId, clubId), eq(events.isPublished, true)));

  // Upcoming events count
  const [upcomingRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(and(eq(events.clubId, clubId), eq(events.status, "Upcoming")));

  // Total registrations count for the club's events
  const [registrationsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(eventApplications)
    .innerJoin(events, eq(eventApplications.eventId, events.id))
    .where(eq(events.clubId, clubId));

  return {
    totalEvents: Number(totalRes?.count ?? 0),
    publishedEvents: Number(publishedRes?.count ?? 0),
    upcomingEvents: Number(upcomingRes?.count ?? 0),
    totalRegistrations: Number(registrationsRes?.count ?? 0),
  };
}

export async function getGlobalEventStats() {
  const db = getDb();

  const [totalRes] = await db.select({ count: sql<number>`count(*)` }).from(events);
  const [publishedRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(eq(events.isPublished, true));
  const [upcomingRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(events)
    .where(eq(events.status, "Upcoming"));
  const [registrationsRes] = await db
    .select({ count: sql<number>`count(*)` })
    .from(eventApplications);

  return {
    totalEvents: Number(totalRes?.count ?? 0),
    publishedEvents: Number(publishedRes?.count ?? 0),
    upcomingEvents: Number(upcomingRes?.count ?? 0),
    totalRegistrations: Number(registrationsRes?.count ?? 0),
  };
}
