import {
  boolean,
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

import { CLUB_SEED } from "@/lib/constants/clubs";
import { ROLE_VALUES } from "@/lib/constants/roles";

export const roleNameEnum = pgEnum("role_name", ROLE_VALUES);

export const roles = pgTable("roles", {
  id: uuid().defaultRandom().primaryKey(),
  slug: roleNameEnum("slug").notNull().unique(),
  label: varchar({ length: 100 }).notNull(),
  description: text().notNull(),
  isSystemRole: boolean().notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const clubs = pgTable("clubs", {
  id: uuid().defaultRandom().primaryKey(),
  slug: varchar({ length: 120 }).notNull().unique(),
  name: varchar({ length: 160 }).notNull().unique(),
  description: text().notNull(),
  focus: varchar({ length: 160 }).notNull(),
  color: varchar({ length: 80 }).notNull(),
  icon: varchar({ length: 16 }).notNull(),
  websiteUrl: varchar("website_url", { length: 255 }),
  contactEmail: varchar("contact_email", { length: 255 }),
  logoUrl: text("logo_url"),
  facultyCoordinator: varchar("faculty_coordinator", { length: 160 }),
  studentCoordinator: varchar("student_coordinator", { length: 160 }),
  category: varchar("category", { length: 80 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const users = pgTable(
  "users",
  {
    id: uuid().defaultRandom().primaryKey(),
    roleId: uuid("role_id")
      .notNull()
      .references(() => roles.id, { onDelete: "restrict" }),
    clubId: uuid("club_id").references(() => clubs.id, { onDelete: "set null" }),
    firstName: varchar({ length: 80 }).notNull(),
    lastName: varchar({ length: 80 }).notNull(),
    displayName: varchar({ length: 180 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    phone: varchar({ length: 30 }),
    passwordHash: text("password_hash").notNull(),
    isEmailVerified: boolean("is_email_verified").notNull().default(false),
    lastLoginAt: timestamp({ withTimezone: true }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("users_role_id_idx").on(t.roleId), index("users_club_id_idx").on(t.clubId)],
);

export const studentProfiles = pgTable("student_profiles", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" })
    .unique(),
  studentId: varchar({ length: 40 }).notNull().unique(),
  department: varchar({ length: 120 }).notNull(),
  graduationYear: integer("graduation_year"),
  bio: text(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const clubAdminProfiles = pgTable(
  "club_admin_profiles",
  {
    id: uuid().defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" })
      .unique(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    designation: varchar({ length: 120 }).notNull(),
    approvalStatus: varchar({ length: 40 }).notNull().default("pending"),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("club_admin_profiles_club_id_idx").on(t.clubId)],
);

export const sessions = pgTable("sessions", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: varchar({ length: 255 }).notNull().unique(),
  expires: timestamp({ withTimezone: true }).notNull(),
  ipAddress: varchar({ length: 64 }),
  userAgent: text("user_agent"),
  revokedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const passwordResetTokens = pgTable("password_reset_tokens", {
  id: uuid().defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tokenHash: varchar({ length: 128 }).notNull().unique(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  usedAt: timestamp({ withTimezone: true }),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const events = pgTable(
  "events",
  {
    id: uuid().defaultRandom().primaryKey(),
    clubId: uuid("club_id")
      .notNull()
      .references(() => clubs.id, { onDelete: "cascade" }),
    title: varchar({ length: 160 }).notNull(),
    description: text().notNull(),
    category: varchar({ length: 80 }).notNull(), // Technical, Cultural, Sports, etc.
    venue: varchar({ length: 160 }).notNull(),
    eventDate: timestamp("event_date", { withTimezone: true }).notNull(),
    startTime: varchar("start_time", { length: 20 }).notNull(), // e.g. "14:00"
    endTime: varchar("end_time", { length: 20 }).notNull(), // e.g. "17:00"
    registrationDeadline: timestamp("registration_deadline", { withTimezone: true }).notNull(),
    maxParticipants: integer("max_participants").notNull(),
    organizerDetails: text("organizer_details").notNull(),
    posterUrl: text("poster_url"),
    status: varchar({ length: 40 }).notNull().default("Upcoming"), // Upcoming, Ongoing, Completed
    isPublished: boolean("is_published").notNull().default(false),
    createdBy: uuid("created_by")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index("events_club_id_idx").on(t.clubId), index("events_created_by_idx").on(t.createdBy)],
);

export const eventApplications = pgTable(
  "event_applications",
  {
    id: uuid().defaultRandom().primaryKey(),
    eventId: uuid("event_id")
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    studentId: uuid("student_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    status: varchar({ length: 40 }).notNull().default("registered"), // registered, cancelled, attended
    createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [unique("unique_event_student").on(t.eventId, t.studentId)],
);

export const schemaSeed = {
  roles: ROLE_VALUES.map((slug) => ({
    slug,
    label: slug
      .split("_")
      .map((part) => part[0].toUpperCase() + part.slice(1))
      .join(" "),
    description:
      slug === "student"
        ? "Student accounts for club discovery, event registration, and participation tracking."
        : slug === "club_admin"
          ? "Club admin accounts for managing club content, events, and approvals."
          : "Super admin accounts for institutional governance and system oversight.",
  })),
  clubs: CLUB_SEED,
};

export const dbSchema = {
  roles,
  clubs,
  users,
  studentProfiles,
  clubAdminProfiles,
  sessions,
  passwordResetTokens,
  events,
  eventApplications,
};
