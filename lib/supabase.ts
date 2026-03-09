import { createClient } from '@supabase/supabase-js';

// Use the environment variables you added in Vercel
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://gsfpvruwnaxscvgpkuvj.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_GRfHyWH8gUxhKz_86-3Uhw_gkSEdkOD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);