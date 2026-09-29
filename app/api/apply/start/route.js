import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { validateDetails } from "@/app/lib/validate";
import { clientIp, ipIsOverLimit, turnstileOk } from "@/app/lib/guard";
import { issueCode } from "@/app/lib/issueCode";

export const runtime = "nodejs";

// Step 1. "This step writes to the database. On Continue, create the applicant
// record with a status of pending_verification."
//
// "A duplicate email resumes the existing record and re-sends a code rather
// than creating a second one."
export async function POST(request) {
  const body = await request.json().catch(() => ({}));

  // honeypot: a real person never fills this
  if (body.website) return NextResponse.json({ ok: true });

  const ip = clientIp(request);
  if (!(await turnstileOk(body.turnstileToken, ip))) {
    return NextResponse.json({ error: "Please complete the check and try again" }, { status: 400 });
  }

  const { errors, value } = validateDetails(body);
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const { data: existing } = await db()
    .from("applicants")
    .select("id, status")
    .eq("email", value.email)
    .maybeSingle();

  // Already finished. Do not leak that, and do not start again.
  if (existing?.status === "consented") {
    return NextResponse.json({ applicantId: existing.id, alreadyComplete: true });
  }

  let applicantId = existing?.id;

  if (applicantId) {
    await db()
      .from("applicants")
      .update({ first_name: value.firstName, last_name: value.lastName, mobile: value.mobile })
      .eq("id", applicantId);
  } else {
    if (await ipIsOverLimit(ip)) {
      return NextResponse.json({ error: "Too many applications from this connection. Try again later." }, { status: 429 });
    }
    const { data, error } = await db()
      .from("applicants")
      .insert({
        first_name: value.firstName,
        last_name: value.lastName,
        email: value.email,
        mobile: value.mobile,
        created_ip: ip,
      })
      .select("id")
      .single();
    if (error) return NextResponse.json({ error: "Could not start your application" }, { status: 500 });
    applicantId = data.id;
  }

  await issueCode(applicantId, value.email, value.firstName);
  return NextResponse.json({ applicantId, resumed: Boolean(existing) });
}
