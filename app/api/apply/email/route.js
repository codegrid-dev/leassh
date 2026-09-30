import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { RX, cleanEmail } from "@/app/lib/validate";
import { issueCode } from "@/app/lib/issueCode";
import { sendAlreadyApplied } from "@/app/lib/mail";
import { clientIp, ipIsOverLimit } from "@/app/lib/guard";

export const runtime = "nodejs";

// "Change your email address matters. A typo at step 1 otherwise traps the
// applicant here with no way out."
//
// It has to work from a completed record too. Someone who re-applies with an
// address that already finished is parked on this screen with no back button,
// so this is their only exit. There, changing the address is not editing the
// finished application, it is starting a new one.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const applicantId = body.applicantId;
  const email = cleanEmail(body.email);

  if (!applicantId) return NextResponse.json({ error: "Missing application" }, { status: 400 });
  if (!RX.email.test(email)) {
    return NextResponse.json({ errors: { email: "Please enter a valid email address" } }, { status: 422 });
  }

  const { data: a } = await db()
    .from("applicants")
    .select("id, first_name, last_name, mobile, email, status")
    .eq("id", applicantId)
    .maybeSingle();
  if (!a) return NextResponse.json({ error: "Missing application" }, { status: 404 });

  // Whatever is already on the new address decides what happens next.
  const { data: target } = email === a.email ? { data: a } : await db()
    .from("applicants")
    .select("id, first_name, status, reference")
    .eq("email", email)
    .maybeSingle();

  // The new address has already completed. Same reasoning as /start: the
  // response must not reveal that, so the inbox is told instead.
  if (target && target.id !== a.id && target.status === "consented") {
    try {
      await sendAlreadyApplied({
        to: email, firstName: target.first_name, reference: target.reference,
      });
    } catch (e) {
      console.error("[email] already-applied notice failed", e?.message);
    }
    return NextResponse.json({ ok: true, applicantId: target.id });
  }

  // An unfinished application already sits on the new address, so continue it
  // rather than refusing or creating a duplicate.
  if (target && target.id !== a.id) {
    await issueCode(target.id, email, target.first_name);
    return NextResponse.json({ ok: true, applicantId: target.id });
  }

  // This record is finished, so the new address starts a fresh application
  // carrying over the name and mobile they already typed.
  if (a.status === "consented") {
    const ip = clientIp(request);
    if (await ipIsOverLimit(ip)) {
      return NextResponse.json(
        { error: "Too many applications from this connection. Try again later." },
        { status: 429 }
      );
    }
    const { data: created, error } = await db()
      .from("applicants")
      .insert({
        first_name: a.first_name, last_name: a.last_name, mobile: a.mobile,
        email, created_ip: ip,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "Could not start your application" }, { status: 500 });
    await issueCode(created.id, email, a.first_name);
    return NextResponse.json({ ok: true, applicantId: created.id });
  }

  // The ordinary case: fix a typo on an unfinished application. A changed
  // address is an unverified address again.
  if (email !== a.email) {
    await db()
      .from("applicants")
      .update({ email, status: "pending_verification", verified_at: null })
      .eq("id", applicantId);
  }
  await issueCode(applicantId, email, a.first_name);
  return NextResponse.json({ ok: true, applicantId });
}
