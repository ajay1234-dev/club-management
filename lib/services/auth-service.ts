import { getRoleBySlug } from "@/lib/repositories/roles-repository";
import {
  createClubAdminProfile,
  createPasswordResetToken,
  createStudentProfile,
  createUser,
  consumePasswordResetToken,
  getUserByEmail,
  updateUserPassword,
} from "@/lib/repositories/users-repository";
import { hashPassword } from "@/lib/password";
import { createSecureToken, hashToken } from "@/lib/tokens";
import { getServerEnv } from "@/lib/env";
import { logger } from "@/lib/logger";
import { sendMail } from "@/lib/services/email-service";
import { getClubBySlug } from "@/lib/repositories/clubs-repository";

export async function registerUser(input: {
  role: "student" | "club_admin";
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string | null;
  studentId?: string;
  department?: string;
  graduationYear?: number | null;
  clubSlug?: string;
  designation?: string;
}) {
  const existingUser = await getUserByEmail(input.email);

  if (existingUser) {
    throw new Error("An account already exists for that email address.");
  }

  const role = await getRoleBySlug(input.role);

  if (!role) {
    throw new Error("Required role is not seeded.");
  }

  const passwordHash = await hashPassword(input.password);
  const displayName = `${input.firstName} ${input.lastName}`.trim();
  const club = input.clubSlug ? await getClubBySlug(input.clubSlug) : null;

  if (input.role === "club_admin" && !club) {
    throw new Error("Selected club could not be found.");
  }

  const user = await createUser({
    roleId: role.id,
    clubId: club?.id ?? null,
    firstName: input.firstName,
    lastName: input.lastName,
    displayName,
    email: input.email,
    phone: input.phone,
    passwordHash,
  });

  if (input.role === "student") {
    await createStudentProfile({
      userId: user.id,
      studentId: input.studentId ?? "",
      department: input.department ?? "",
      graduationYear: input.graduationYear ?? null,
    });
  }

  if (input.role === "club_admin") {
    await createClubAdminProfile({
      userId: user.id,
      clubId: club!.id,
      designation: input.designation ?? "Club Coordinator",
    });
  }

  return user;
}

export async function createPasswordResetLink(email: string) {
  const user = await getUserByEmail(email);

  if (!user) {
    return {
      success: true,
      skipped: true,
    };
  }

  const token = createSecureToken();
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30);

  await createPasswordResetToken({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const env = getServerEnv();
  const resetUrl = `${env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/reset-password?token=${token}`;

  await sendMail({
    to: email,
    subject: "Reset your Campus Club Hub password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
        <h2>Reset your password</h2>
        <p>Use the secure link below to reset your password. It expires in 30 minutes.</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
      </div>
    `,
  });

  logger.info("Password reset link created", { email: user.email, userId: user.id });

  return {
    success: true,
  };
}

export async function resetPassword(token: string, password: string) {
  const record = await consumePasswordResetToken(hashToken(token));

  if (!record) {
    throw new Error("The password reset token is invalid or expired.");
  }

  const passwordHash = await hashPassword(password);
  await updateUserPassword(record.userId, passwordHash);

  return {
    success: true,
  };
}
