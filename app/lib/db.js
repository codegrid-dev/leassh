import { createClient } from "@supabase/supabase-js";

// Server only. The service role key bypasses row level security, so this
// module must never be imported from a client component. Every table has RLS
// enabled with no policies, which means this is the only way in.
if (typeof window !== "undefined") {
  throw new Error("app/lib/db.js is server only");
}

export const db = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } }
);
