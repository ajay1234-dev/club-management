import { eq } from "drizzle-orm";

import { roles } from "@/config/schema";
import { getDb } from "@/config/db";
import type { UserRole } from "@/lib/constants/roles";

export async function getRoleBySlug(slug: UserRole) {
  const db = getDb();
  const [role] = await db.select().from(roles).where(eq(roles.slug, slug)).limit(1);
  return role ?? null;
}

export async function getRoleById(id: string) {
  const db = getDb();
  const [role] = await db.select().from(roles).where(eq(roles.id, id)).limit(1);
  return role ?? null;
}

export async function listRoles() {
  const db = getDb();
  return db.select().from(roles);
}
