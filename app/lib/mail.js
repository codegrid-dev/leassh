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
