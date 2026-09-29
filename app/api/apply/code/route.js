import { NextResponse } from "next/server";
import { db } from "@/app/lib/db";
import { sendIsOverLimit } from "@/app/lib/guard";
import { issueCode } from "@/app/lib/issueCode";

export const runtime = "nodejs";

// "send a new code". Rate limited, and it invalidates whatever was live.
export async function POST(request) {
  const { applicantId } = await request.json().catch(() => ({}));
  if (!applicantId) return NextResponse.json({ error: "Missing application" }, { status: 400 });

  const { data: a } = await db()
    .from("applicants")
    .select("id, email, first_name, status")
    .eq("id", applicantId)
    .maybeSingle();
  if (!a) return NextResponse.json({ error: "Missing application" }, { status: 404 });
  if (a.status === "consented") return NextResponse.json({ ok: true });

  if (await sendIsOverLimit(applicantId)) {
    return NextResponse.json({ error: "Too many codes requested. Try again later." }, { status: 429 });
  }

  await issueCode(a.id, a.email, a.first_name);
  return NextResponse.json({ ok: true });
}
