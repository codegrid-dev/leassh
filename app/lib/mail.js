import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.MAIL_FROM || "Leashh <noreply@leashh.com>";

// Plain words, British English, no exclamation marks, per the brand voice.
export async function sendVerificationCode({ to, firstName, code }) {
  const subject = `${code} is your Leashh code`;
  const text = [
    `Hello ${firstName},`,
    ``,
    `Your Leashh code is ${code}.`,
    ``,
    `Enter it on the sign-up page to confirm your email address. It expires in 15 minutes.`,
    ``,
    `If you did not start an application, you can ignore this email.`,
  ].join("\n");

  if (!resend) {
    console.log(`[mail disabled] code for ${to}: ${code}`);
    return { skipped: true };
  }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, text });
  if (error) throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
  // The send key is restricted and cannot read the account, so this log line is
  // the only handle we have when an applicant says nothing arrived.
  console.log(`[mail] verification code sent, resend id ${data?.id}`);
  return { sent: true, id: data?.id };
}

// "The confirmation email is a second notice. Repeat the disclosure wording,
//  repeat that identity checks happen with the other company, and link both
//  legal documents, so there is a timestamped copy in the applicant's own
//  inbox."
export async function sendConfirmation({ to, firstName, reference, postcode, miles }) {
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "https://leashh.com").replace(/\/$/, "");
  const subject = `Your Leashh application, ${reference}`;
  const text = [
    `Hello ${firstName},`,
    ``,
    `Your application is complete. Your reference is ${reference}. Keep it somewhere safe.`,
    ``,
    `What happens next.`,
    `Leashh introduces Pet Nannies to pet owners. The Pet Nanny network itself is operated by a separate pet services company. We pass your application to that company so it can assess you, contact you and complete your onboarding. It is a separate data controller and will give you its own privacy notice when it first contacts you. If you would like its name before then, email privacy@leashh.com and we will tell you.`,
    ``,
    `Your identity checks happen later, with that company.`,
    `Leashh has not checked your identity and has not asked you for any documents. Before you can be approved, the operating company will verify who you are and ask for whatever paperwork it needs, which may include a background check. Submitting the form does not approve you.`,
    ``,
    `It usually contacts you within five working days. Once approved, your profile goes live to owners within ${miles} miles of ${postcode}.`,
    ``,
    `Pet Nanny Terms: ${site}/terms`,
    `Privacy Notice: ${site}/privacy`,
  ].join("\n");

  if (!resend) {
    console.log(`[mail disabled] confirmation for ${to}: ${reference}`);
    return { skipped: true };
  }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, text });
  if (error) throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
  console.log(`[mail] confirmation sent, resend id ${data?.id}`);
  return { sent: true, id: data?.id };
}

// Someone re-applying with an address that has already completed.
//
// The API answers exactly as it would for a new application, because a
// different answer would let anyone check which addresses have applied, and
// the record holds a home postcode. The truth goes to the inbox instead, so
// only the person who owns it learns anything.
export async function sendAlreadyApplied({ to, firstName, reference }) {
  const subject = "You have already applied to Leashh";
  const text = [
    `Hello ${firstName},`,
    ``,
    `Someone just started a Leashh application with this email address, but you have already applied.`,
    ``,
    `Your reference is ${reference}. There is nothing more for you to do, and you do not need a code.`,
    ``,
    `The company that operates the Pet Nanny network will contact you directly, usually within five working days.`,
    ``,
    `If this was not you, you can ignore this email. Nothing has changed on your application.`,
  ].join("\n");

  if (!resend) {
    console.log(`[mail disabled] already-applied notice for ${to}: ${reference}`);
    return { skipped: true };
  }
  const { data, error } = await resend.emails.send({ from: FROM, to, subject, text });
  if (error) throw new Error(`Resend: ${error.message || JSON.stringify(error)}`);
  console.log(`[mail] already-applied notice sent, resend id ${data?.id}`);
  return { sent: true, id: data?.id };
}
