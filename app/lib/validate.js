// Shared validators. Everything here runs again on the server after the
// browser has had its say, because the browser's opinion is not evidence.

export const RX = {
  email: /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i,
  // "Mobile accepts 07 and +44, and strips spaces and brackets before storing."
  mobile: /^(?:\+44|0)\d{9,10}$/,
  postcode: /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i,
};

export const cleanMobile = (v) => String(v || "").replace(/[\s()-]/g, "");
export const cleanEmail = (v) => String(v || "").trim().toLowerCase();

// Messages say what to do, never "invalid input".
export function validateDetails(body) {
  const errors = {};
  const firstName = String(body.firstName || "").trim();
  const lastName = String(body.lastName || "").trim();
  const email = cleanEmail(body.email);
  const mobile = cleanMobile(body.mobile);

  if (!firstName) errors.firstName = "Please enter your first name";
  if (!lastName) errors.lastName = "Please enter your last name";
  if (!RX.email.test(email)) errors.email = "Please enter a valid email address";
  if (!RX.mobile.test(mobile)) errors.mobile = "Please enter a valid UK mobile number";

  return { errors, value: { firstName, lastName, email, mobile } };
}
