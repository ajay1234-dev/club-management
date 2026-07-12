import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import { dbSchema } from "@/config/schema";
import { getServerEnv } from "@/lib/env";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Database = any;

let database: Database | null = null;

export function getDb(): Database {
  if (!database) {
    const { DATABASE_URL } = getServerEnv();
    const client = neon(DATABASE_URL);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    database = drizzle({ client, schema: dbSchema } as any);
  }

  return database!;
}
