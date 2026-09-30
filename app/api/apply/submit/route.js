import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { MANDATORY, OPTIONAL, reference } from "@/app/lib/declarations";
import { clientIp } from "@/app/lib/guard";
import { sendConfirmation } from "@/app/lib/mail";

export const runtime = "nodejs";

// Step 4. "Only on submit does the record become eligible for transfer. Set a
// distinct status such as consented and make that the gate on the export."
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { applicantId, accepted } = body;
  if (!applicantId) return NextResponse.json({ error: "Missing application" }, { status: 400 });

  const { data: a } = await db()
    .from("applicants")
    .select("id, status, first_name, email, postcode, travel_miles, reference")
    .eq("id", applicantId)
    .maybeSingle();
  if (!a) return NextResponse.json({ error: "Missing application" }, { status: 404 });
  if (a.status === "pending_verification") {
    return NextResponse.json({ error: "Confirm your email first" }, { status: 409 });
  }
  // Submitting twice must not issue a second reference or re-send the email.
  if (a.status === "consented") {
    return NextResponse.json({ ok: true, reference: a.reference, alreadySubmitted: true });
  }

  // Step 3 has to be done, or the summary they just agreed to was empty.
  const { count: serviceCount } = await db()
    .from("applicant_services")
    .select("service_key", { count: "exact", head: true })
    .eq("applicant_id", applicantId);
  if (!serviceCount) {
    return NextResponse.json({ error: "Finish your answers first" }, { status: 409 });
  }

  // "All seven start unticked. No pre-ticked boxes anywhere, and no
  //  'agree to everything' box." Re-checked here because the browser's
  //  tick is not evidence.
  const ticked = accepted && typeof accepted === "object" ? accepted : {};
  const missing = MANDATORY.filter((k) => ticked[k] !== true);
  if (missing.length) {
    return NextResponse.json(
      { error: "Please confirm every declaration above before you submit", missing },
      { status: 422 }
    );
  }

  // Current version of each wording, so the stored agreement resolves back to
  // the exact text that was on screen.
  const { data: texts } = await db()
    .from("declaration_texts")
    .select("key, version")
    .in("key", [...MANDATORY, ...OPTIONAL]);
  const latest = new Map();
  for (const t of texts || []) {
    if (!latest.has(t.key) || t.version > latest.get(t.key)) latest.set(t.key, t.version);
  }

  const now = new Date().toISOString();
  const rows = [...MANDATORY, ...OPTIONAL]
    .filter((k) => latest.has(k))
    .map((k) => ({
      applicant_id: applicantId,
      key: k,
      version: latest.get(k),
      accepted: MANDATORY.includes(k) ? true : ticked[k] === true,
      accepted_at: now,
    }));

  await db().from("applicant_declarations").delete().eq("applicant_id", applicantId);
  const { error: decErr } = await db().from("applicant_declarations").insert(rows);
  if (decErr) return NextResponse.json({ error: "Could not record your declarations" }, { status: 500 });

  const ref = a.reference || reference();
  const { error: upErr } = await db()
    .from("applicants")
    .update({ status: "consented", consented_at: now, consent_ip: clientIp(request), reference: ref })
    .eq("id", applicantId)
    .neq("status", "consented");
  if (upErr) return NextResponse.json({ error: "Could not submit your application" }, { status: 500 });

  // "The confirmation email is a second notice. Repeat the disclosure wording,
  //  repeat that identity checks happen with the other company, and link both
  //  legal documents." A failure here must not lose a submitted application.
  try {
    await sendConfirmation({
      to: a.email, firstName: a.first_name, reference: ref,
      postcode: a.postcode, miles: a.travel_miles,
    });
  } catch (e) {
    console.error("[submit] confirmation email failed", ref, e?.message);
  }

  return NextResponse.json({ ok: true, reference: ref });
}
