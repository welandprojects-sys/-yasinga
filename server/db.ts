import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please ensure the PostgreSQL database is configured.",
  );
}

// Create PostgreSQL connection for Drizzle ORM
const client = postgres(process.env.DATABASE_URL, { 
  max: 10
});

export const db = drizzle(client, { schema });