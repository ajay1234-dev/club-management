import { and, eq, isNull } from "drizzle-orm";

import { clubAdminProfiles, passwordResetTokens, studentProfiles, users } from "@/config/schema";
import { getDb } from "@/config/db";

type CreateUserInput = {
  roleId: string;
  clubId?: string | null;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string | null;
  passwordHash: string;
};

export async function getUserByEmail(email: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.email, email.toLowerCase())).limit(1);
  return user ?? null;
}

export async function getUserById(id: string) {
  const db = getDb();
  const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return user ?? null;
}

export async function createUser(input: CreateUserInput) {
  const db = getDb();
  const [createdUser] = await db
    .insert(users)
    .values({
      roleId: input.roleId,
      clubId: input.clubId ?? null,
      firstName: input.firstName,
      lastName: input.lastName,
      displayName: input.displayName,
      email: input.email.toLowerCase(),
      phone: input.phone ?? null,
      passwordHash: input.passwordHash,
    })
    .returning();

  return createdUser;
}

export async function createStudentProfile(input: {
  userId: string;
  studentId: string;
  department: string;
  graduationYear?: number | null;
}) {
  const db = getDb();
  const [profile] = await db
    .insert(studentProfiles)
    .values({
      userId: input.userId,
      studentId: input.studentId,
      department: input.department,
      graduationYear: input.graduationYear ?? null,
    })
    .returning();

  return profile;
}

export async function createClubAdminProfile(input: {
  userId: string;
  clubId: string;
  designation: string;
}) {
  const db = getDb();
  const [profile] = await db
    .insert(clubAdminProfiles)
    .values({
      userId: input.userId,
      clubId: input.clubId,
      designation: input.designation,
      approvalStatus: "pending",
    })
    .returning();

  return profile;
}

export async function updateUserPassword(userId: string, passwordHash: string) {
  const db = getDb();
  const [updatedUser] = await db
    .update(users)
    .set({
      passwordHash,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
}

export async function touchUserLogin(userId: string) {
  const db = getDb();
  const [updatedUser] = await db
    .update(users)
    .set({
      lastLoginAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning();

  return updatedUser;
}

export async function createPasswordResetToken(input: {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}) {
  const db = getDb();
  const [token] = await db
    .insert(passwordResetTokens)
    .values({
      userId: input.userId,
      tokenHash: input.tokenHash,
      expiresAt: input.expiresAt,
    })
    .returning();

  return token;
}

export async function consumePasswordResetToken(tokenHash: string) {
  const db = getDb();
  const [record] = await db
    .select()
    .from(passwordResetTokens)
    .where(and(eq(passwordResetTokens.tokenHash, tokenHash), isNull(passwordResetTokens.usedAt)))
    .limit(1);

  if (!record) {
    return null;
  }

  if (record.expiresAt.getTime() < Date.now()) {
    return null;
  }

  await db
    .update(passwordResetTokens)
    .set({
      usedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(passwordResetTokens.id, record.id));

  return record;
}
