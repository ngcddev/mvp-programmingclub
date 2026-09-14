import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Solo la URL y la anon key (protegidas por RLS) pueden ser NEXT_PUBLIC_*.
// La service_role key nunca debe pasar por variables NEXT_PUBLIC_*: eso la
// expondría al bundle del cliente y saltaría RLS por completo.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// null si faltan las variables, para que getMedicamentos() use el fallback en vez de romper
export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
