import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabaseInstance: SupabaseClient | null = null;

export const createClient = () => {
  if (!supabaseInstance) {
    supabaseInstance = createBrowserClient(
      supabaseUrl!,
      supabaseKey!,
    );
  }
  return supabaseInstance;
};