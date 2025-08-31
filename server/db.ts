import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. This should be automatically provided by Replit database.",
  );
}

// Create PostgreSQL connection for Drizzle ORM using Replit's built-in database
const client = postgres(process.env.DATABASE_URL, { 
  max: 10,
  ssl: 'require'
});

export const db = drizzle(client, { schema });