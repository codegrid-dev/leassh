import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { validateProfile } from "@/app/lib/profile";

export const runtime = "nodejs";

// Step 3. "Save progress on this step too, so a long form is not lost to a
// dropped connection." Writing the profile does not consent to anything: the
// record stays 'verified' until step 4 is submitted.
export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const { applicantId } = body;
  if (!applicantId) return NextResponse.json({ error: "Missing application" }, { status: 400 });

  const { data: a } = await db()
    .from("applicants")
    .select("id, status")
    .eq("id", applicantId)
    .maybeSingle();
  if (!a) return NextResponse.json({ error: "Missing application" }, { status: 404 });
  if (a.status === "pending_verification") {
    return NextResponse.json({ error: "Confirm your email first" }, { status: 409 });
  }
  if (a.status === "consented") {
    return NextResponse.json({ error: "Already submitted" }, { status: 409 });
  }

  const { data: catalogue } = await db().from("services").select("key");
  const keys = (catalogue || []).map((s) => s.key);

  const { errors, value } = validateProfile(body, keys);
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const { error } = await db()
    .from("applicants")
    .update({
      postcode: value.postcode,
      date_of_birth: value.dateOfBirth,
      experience: value.experience,
      hours_a_week: value.hoursAWeek,
      bio: value.bio,
      animals: value.animals,
      attributes: value.attributes,
      credentials: value.credentials,
      travel_miles: value.travelMiles,
    })
    .eq("id", applicantId);
  if (error) return NextResponse.json({ error: "Could not save your answers" }, { status: 500 });

  // Replace rather than merge, so unticking a service removes it.
  await db().from("applicant_services").delete().eq("applicant_id", applicantId);
  if (value.services.length) {
    await db().from("applicant_services").insert(
      value.services.map((s) => ({
        applicant_id: applicantId, service_key: s.key, price: s.price,
      }))
    );
  }

  return NextResponse.json({ ok: true });
}
