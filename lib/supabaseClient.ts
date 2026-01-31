import { createClient } from '@supabase/supabase-js';

// Use environment variables or fallback to provided credentials
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://vydkhhnsbwarxpyadkpf.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'sb_publishable_rCL7K0HL9rT7IcIIL0IVQA_5PMfZZbv';

// Export a flag to check if the app is properly configured
export const isConfigured = !!(supabaseUrl && supabaseKey);

if (!isConfigured) {
  console.warn("Supabase credentials missing.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);
