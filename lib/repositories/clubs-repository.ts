import { eq } from "drizzle-orm";

import { clubs } from "@/config/schema";
import { getDb } from "@/config/db";

export async function listClubs() {
  const db = getDb();
  return db.select().from(clubs);
}

export async function getClubById(id: string) {
  const db = getDb();
  const [club] = await db.select().from(clubs).where(eq(clubs.id, id)).limit(1);
  return club ?? null;
}

export async function getClubBySlug(slug: string) {
  const db = getDb();
  const [club] = await db.select().from(clubs).where(eq(clubs.slug, slug)).limit(1);
  return club ?? null;
}
