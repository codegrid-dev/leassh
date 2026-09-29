import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { RX, cleanEmail } from "@/app/lib/validate";
import { issueCode } from "@/app/lib/issueCode";

export const runtime = "nodejs";

// "Change your email address matters. A typo at step 1 otherwise traps the
// applicant here with no way out."
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const applicantId = body.applicantId;
  const email = cleanEmail(body.email);

  if (!applicantId) return NextResponse.json({ error: "Missing application" }, { status: 400 });
  if (!RX.email.test(email)) {
    return NextResponse.json({ errors: { email: "Please enter a valid email address" } }, { status: 422 });
  }

  const { data: a } = await db
    .from("applicants")
    .select("id, first_name, email, status")
    .eq("id", applicantId)
    .maybeSingle();
  if (!a) return NextResponse.json({ error: "Missing application" }, { status: 404 });
  if (a.status === "consented") return NextResponse.json({ error: "Already submitted" }, { status: 409 });

  if (email !== a.email) {
    // the address is unique, so a collision means that inbox is already in play
    const { data: clash } = await db
      .from("applicants")
      .select("id")
      .eq("email", email)
      .neq("id", applicantId)
      .maybeSingle();
    if (clash) {
      return NextResponse.json(
        { errors: { email: "That address is already on another application" } },
        { status: 409 }
      );
    }
    // a changed address is an unverified address again
    await db
      .from("applicants")
      .update({ email, status: "pending_verification", verified_at: null })
      .eq("id", applicantId);
  }

  await issueCode(applicantId, email, a.first_name);
  return NextResponse.json({ ok: true });
}
