import { createClient } from "@supabase/supabase-js";

export function createSupabaseService(envs: Env) {
  const supabaseService = createClient(
    envs.SUPABASE_PROJECT_URL,
    envs.SUPABASE_ANON_KEY,
  );

  return supabaseService;
}
