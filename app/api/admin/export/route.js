import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { db } from "@/app/lib/db";
import { toCsv } from "@/app/lib/csv";

export const runtime = "nodejs";

// Column order for the file the client opens. Matches applicant_export, which
// is itself gated on consented, so an unconsented record cannot reach here.
const COLUMNS = [
  "reference", "first_name", "last_name", "email", "mobile", "date_of_birth",
  "postcode", "experience", "hours_a_week", "travel_miles", "services",
  "animals", "attributes", "credentials", "bio",
  "age_uk", "accurate", "onward_transfer", "identity_checks", "self_employed",
  "licences", "terms_privacy", "marketing_email", "marketing_sms",
  "declarations_version", "verified_at", "consented_at", "created_at",
];

const passwordOk = (given) => {
  const expected = process.env.ADMIN_EXPORT_PASSWORD;
  if (!expected) return false;           // never open when unconfigured
  const a = Buffer.from(String(given ?? ""));
  const b = Buffer.from(expected);
  // timingSafeEqual throws on a length mismatch, so compare lengths separately
  // and still run the comparison, to keep the timing flat.
  const same = a.length === b.length && timingSafeEqual(a, b);
  return same;
};

export async function POST(request) {
  const form = await request.formData().catch(() => null);
  const password = form?.get("password");

  if (!passwordOk(password)) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const { data, error } = await db()
    .from("applicant_export")
    .select(COLUMNS.join(","))
    .order("consented_at", { ascending: true });
  if (error) {
    return NextResponse.json({ error: "Could not read the applications" }, { status: 500 });
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(toCsv(COLUMNS, data || []), {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="leashh-applications-${stamp}.csv"`,
      "cache-control": "no-store, max-age=0",
    },
  });
}
