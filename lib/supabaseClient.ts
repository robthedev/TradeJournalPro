import { createClient } from '@supabase/supabase-js';

// Use environment variables (Vite uses import.meta.env) or fallback to provided credentials
// Safely access import.meta.env to avoid runtime crashes if it's undefined or types are missing
const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://vydkhhnsbwarxpyadkpf.supabase.co';
const supabaseKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'sb_publishable_rCL7K0HL9rT7IcIIL0IVQA_5PMfZZbv';

// Export a flag to check if the app is properly configured
export const isConfigured = !!(supabaseUrl && supabaseKey);

if (!isConfigured) {
  console.warn("Supabase credentials missing.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);