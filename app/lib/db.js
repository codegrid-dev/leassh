import { createClient } from "@supabase/supabase-js";

// Server only. The service role key bypasses row level security, so this
// module must never be imported from a client component. Every table has RLS
// enabled with no policies, which means this is the only way in.
if (typeof window !== "undefined") {
  throw new Error("app/lib/db.js is server only");
}

// Created on first use, not at import time. Building the client at module
// scope makes the whole build fail when the environment is not configured,
// which is what happens on a fresh deploy before the variables are set. A
// missing variable should break the request that needs it, with a message
// that says so, not the build.
let client = null;

export function db() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }

  client = createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}
