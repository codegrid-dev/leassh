import { db } from "./db";

// "Rate limit record creation by IP. This endpoint is the obvious spam target."
const IP_WINDOW_MINUTES = 60;
const IP_MAX_RECORDS = 5;
const SEND_WINDOW_MINUTES = 60;
const SEND_MAX_CODES = 5;

export function clientIp(request) {
  const fwd = request.headers.get("x-forwarded-for");
  return fwd ? fwd.split(",")[0].trim() : request.headers.get("x-real-ip") || null;
}

export async function ipIsOverLimit(ip) {
  if (!ip) return false;
  const since = new Date(Date.now() - IP_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await db()
    .from("applicants")
    .select("id", { count: "exact", head: true })
    .eq("created_ip", ip)
    .gte("created_at", since);
  return (count ?? 0) >= IP_MAX_RECORDS;
}

export async function sendIsOverLimit(applicantId) {
  const since = new Date(Date.now() - SEND_WINDOW_MINUTES * 60_000).toISOString();
  const { count } = await db()
    .from("verification_codes")
    .select("id", { count: "exact", head: true })
    .eq("applicant_id", applicantId)
    .gte("created_at", since);
  return (count ?? 0) >= SEND_MAX_CODES;
}

// Cloudflare Turnstile. Skipped when no secret is configured so the flow stays
// testable locally.
export async function turnstileOk(token, ip) {
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) return true;
  const form = new URLSearchParams({ secret, response: token || "" });
  if (ip) form.set("remoteip", ip);
  try {
    const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      body: form,
    });
    const json = await res.json();
    return json.success === true;
  } catch {
    return false;
  }
}
