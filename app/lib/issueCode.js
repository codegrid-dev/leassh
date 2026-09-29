import { db } from "./db";
import { newCode, hashCode, expiryFromNow } from "./codes";
import { sendVerificationCode } from "./mail";

// "Resending invalidates the previous code." The schema allows at most one
// live code per applicant via a partial unique index, so the invalidation has
// to happen before the insert, not after.
export async function issueCode(applicantId, email, firstName) {
  await db()
    .from("verification_codes")
    .update({ invalidated_at: new Date().toISOString() })
    .eq("applicant_id", applicantId)
    .is("consumed_at", null)
    .is("invalidated_at", null);

  const code = newCode();
  await db().from("verification_codes").insert({
    applicant_id: applicantId,
    code_hash: hashCode(code),
    expires_at: expiryFromNow(),
  });
  await sendVerificationCode({ to: email, firstName, code });
}
