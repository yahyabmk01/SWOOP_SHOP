
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = 'https://gsfpvruwnaxscvgpkuvj.supabase.co';
const supabaseAnonKey = 'sb_publishable_GRfHyWH8gUxhKz_86-3Uhw_gkSEdkOD';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
