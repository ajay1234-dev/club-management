import { config } from "dotenv";
config({ path: ".env.local" });

import { getDb } from "@/config/db";
import { clubs, roles } from "@/config/schema";
import { schemaSeed } from "@/config/schema";

async function seed() {
  const database = getDb();

  for (const role of schemaSeed.roles) {
    await database
      .insert(roles)
      .values(role)
      .onConflictDoUpdate({
        target: roles.slug,
        set: {
          label: role.label,
          description: role.description,
          updatedAt: new Date(),
        },
      });
  }

  for (const club of schemaSeed.clubs) {
    await database
      .insert(clubs)
      .values({
        slug: club.slug,
        name: club.name,
        description: club.description,
        focus: club.focus,
        color: club.color,
        icon: club.icon,
        websiteUrl: club.websiteUrl,
        contactEmail: club.contactEmail,
        logoUrl: club.logoUrl,
        facultyCoordinator: club.facultyCoordinator,
        studentCoordinator: club.studentCoordinator,
        category: club.category,
      })
      .onConflictDoUpdate({
        target: clubs.slug,
        set: {
          name: club.name,
          description: club.description,
          focus: club.focus,
          color: club.color,
          icon: club.icon,
          websiteUrl: club.websiteUrl ?? null,
          contactEmail: club.contactEmail ?? null,
          logoUrl: club.logoUrl ?? null,
          facultyCoordinator: club.facultyCoordinator ?? null,
          studentCoordinator: club.studentCoordinator ?? null,
          category: club.category ?? null,
          updatedAt: new Date(),
        },
      });
  }

  console.log(`Seeded ${schemaSeed.roles.length} roles and ${schemaSeed.clubs.length} clubs.`);
}

seed().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
