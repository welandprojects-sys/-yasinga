import { createClient } from '@supabase/supabase-js';

// Using the same environment variables as the server
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://llwshsrhvsjxnjaotafb.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsd3Noc3JodnNqeG5qYW90YWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY2NjM0NzAsImV4cCI6MjA3MjIzOTQ3MH0.Pn1H0ZMl-FI6UJXQWgqNStlVlr6TWYQ8CgKnKN1Tw5Y";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);