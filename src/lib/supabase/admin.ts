import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// SERVER-ONLY. Uses the Supabase service role key, which bypasses Row
// Level Security entirely. Never import this into a Client Component and
// never expose SUPABASE_SERVICE_ROLE_KEY to the browser.
//
// This exists for the one case where a signed-in user legitimately has no
// `profiles` row yet and therefore can't do anything under normal RLS:
// redeeming an invite code for the very first time.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
