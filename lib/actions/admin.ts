"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { hashPassword } from "@/lib/password";
import {
  toggleClubActiveStatus,
  updateUserRole,
  resetUserPasswordHash,
} from "@/lib/repositories/admin-repository";

export async function toggleClubStatusAction(clubId: string, isActive: boolean) {
  const session = await auth();

  if (!session?.user || session.user.role !== "super_admin") {
    return { success: false, error: "Unauthorized. Super Admin privilege required." };
  }

  try {
    const club = await toggleClubActiveStatus(clubId, isActive);
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard/clubs");
    revalidatePath("/dashboard");
    return { success: true, club };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to update club status.";
    return { success: false, error: message };
  }
}

export async function updateUserRoleAction(userId: string, targetRoleSlug: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "super_admin") {
    return { success: false, error: "Unauthorized. Super Admin privilege required." };
  }

  if (!["student", "club_admin", "super_admin"].includes(targetRoleSlug)) {
    return { success: false, error: "Invalid role specified." };
  }

  try {
    const user = await updateUserRole(userId, targetRoleSlug);
    revalidatePath("/dashboard/admin");
    revalidatePath("/dashboard");
    return { success: true, user };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to change user role.";
    return { success: false, error: message };
  }
}

export async function resetUserPasswordAction(userId: string, newPassword: string) {
  const session = await auth();

  if (!session?.user || session.user.role !== "super_admin") {
    return { success: false, error: "Unauthorized. Super Admin privilege required." };
  }

  if (newPassword.length < 12) {
    return { success: false, error: "Password must be at least 12 characters." };
  }

  try {
    const passwordHash = await hashPassword(newPassword);
    await resetUserPasswordHash(userId, passwordHash);
    return { success: true };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to reset password.";
    return { success: false, error: message };
  }
}
