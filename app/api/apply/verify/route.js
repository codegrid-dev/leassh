import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { verifyCode, MAX_ATTEMPTS } from "@/app/lib/codes";

export const runtime = "nodejs";

// "Lock out after five failed attempts and require a fresh code."
// "On success set the record to verified and stamp the time."
//
// Verified is not consented. The consent gate is two steps away.
export async function POST(request) {
  const { applicantId, code } = await request.json().catch(() => ({}));
  if (!applicantId || !/^\d{6}$/.test(String(code || ""))) {
    return NextResponse.json({ error: "Enter the six digit code" }, { status: 400 });
  }

  const { data: row } = await db()
    .from("verification_codes")
    .select("id, code_hash, expires_at, attempts")
    .eq("applicant_id", applicantId)
    .is("consumed_at", null)
    .is("invalidated_at", null)
    .maybeSingle();

  if (!row) {
    return NextResponse.json({ error: "That code has expired. Send a new one." }, { status: 410 });
  }
  if (row.attempts >= MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many attempts. Send a new code.", lockedOut: true },
      { status: 429 }
    );
  }
  if (new Date(row.expires_at) < new Date()) {
    return NextResponse.json({ error: "That code has expired. Send a new one." }, { status: 410 });
  }

  if (!verifyCode(String(code), row.code_hash)) {
    const attempts = row.attempts + 1;
    await db().from("verification_codes").update({ attempts }).eq("id", row.id);
    return NextResponse.json(
      {
        error:
          attempts >= MAX_ATTEMPTS
            ? "Too many attempts. Send a new code."
            : "That code is not right. Check your email and try again.",
        lockedOut: attempts >= MAX_ATTEMPTS,
        attemptsLeft: Math.max(0, MAX_ATTEMPTS - attempts),
      },
      { status: attempts >= MAX_ATTEMPTS ? 429 : 401 }
    );
  }

  const now = new Date().toISOString();
  await db().from("verification_codes").update({ consumed_at: now }).eq("id", row.id);
  await db()
    .from("applicants")
    .update({ status: "verified", verified_at: now })
    .eq("id", applicantId)
    .eq("status", "pending_verification");

  return NextResponse.json({ ok: true, status: "verified" });
}
