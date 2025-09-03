import { createClient } from '@supabase/supabase-js';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

if (!process.env.SUPABASE_URL) {
  throw new Error(
    "SUPABASE_URL must be set. Please add your Supabase project URL to secrets.",
  );
}

if (!process.env.SUPABASE_ANON_KEY) {
  throw new Error(
    "SUPABASE_ANON_KEY must be set. Please add your Supabase anon key to secrets.",
  );
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Please add your Supabase database URL to secrets.",
  );
}

// Create Supabase client for authentication
export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Create PostgreSQL connection for Drizzle ORM
const client = postgres(process.env.DATABASE_URL, { 
  max: 10,
  ssl: 'require',
  idle_timeout: 20,
  connect_timeout: 60
});

export const db = drizzle(client, { schema });