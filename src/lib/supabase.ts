import { createClient } from '@supabase/supabase-js';

// These will need to be replaced with your actual Supabase project details!
// You can find them in your Supabase Dashboard under Settings > API.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
