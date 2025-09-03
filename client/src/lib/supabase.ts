import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://llwshsrhvsjxnjaotafb.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxsd3Noc3JodnNqeG5qYW90YWZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzMzODEsImV4cCI6MjA3MTg0OTM4MX0.K8MUrt60zIdyfx6FhW05KfoUxASBcky_K5K-cviygA4';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
