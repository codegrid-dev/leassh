import { RX } from "./validate";

export const EXPERIENCE = [
  "Owned pets, no paid experience yet",
  "Under 1 year of paid experience",
  "1 to 3 years",
  "3 to 5 years",
  "Over 5 years",
  "Professional background, for example veterinary nursing or grooming",
];

export const HOURS = [
  "Up to 5 hours", "5 to 10 hours", "10 to 20 hours", "20 to 30 hours", "Over 30 hours",
];

export const BIO_MIN = 80;
export const RADIUS_MIN = 1, RADIUS_MAX = 20, RADIUS_DEFAULT = 3;

// Same rules on both sides. The browser's opinion is convenience; this is the
// one that counts.
export function validateProfile(body, serviceKeys) {
  const e = {};
  const postcode = String(body.postcode || "").trim().toUpperCase();
  const dob = String(body.dateOfBirth || "").trim();
  const bio = String(body.bio || "").trim();

  if (!RX.postcode.test(postcode)) e.postcode = "Please enter a valid UK postcode";

  // "Date of birth is a self-declaration and is checked against nothing. It
  //  backs up the 18 or over declaration on step 4." v2.0 dropped v1.0's hard
  //  age gate deliberately, so this only checks it is a real, sane date.
  const d = new Date(dob);
  if (!dob || Number.isNaN(d.getTime()) || d > new Date() || d.getFullYear() < 1900) {
    e.dateOfBirth = "Please enter your date of birth";
  }

  if (!EXPERIENCE.includes(body.experience)) e.experience = "Please choose your experience";
  if (!HOURS.includes(body.hoursAWeek)) e.hoursAWeek = "Please choose your availability";
  if (bio.length < BIO_MIN) e.bio = `Please write at least ${BIO_MIN} characters so owners get to know you`;
  if (!Array.isArray(body.animals) || body.animals.length === 0) {
    e.animals = "Please choose at least one";
  }

  const radius = Number(body.travelMiles);
  if (!Number.isFinite(radius) || radius < RADIUS_MIN || radius > RADIUS_MAX) {
    e.travelMiles = "Please choose how far you will travel";
  }

  // "At least one service with a price above zero is required."
  // "The typical range is a hint, not a constraint. Do not clamp what the
  //  applicant enters."
  const services = [];
  for (const [key, raw] of Object.entries(body.services || {})) {
    if (!serviceKeys.includes(key)) continue;
    const price = Number(raw);
    if (!Number.isFinite(price) || price <= 0) {
      e.services = "Put a price above zero against each service you tick";
      continue;
    }
    services.push({ key, price: Math.round(price * 100) / 100 });
  }
  if (!e.services && services.length === 0) {
    e.services = "Choose at least one service and enter a price for it";
  }

  return {
    errors: e,
    value: {
      postcode, dateOfBirth: dob, bio,
      experience: body.experience, hoursAWeek: body.hoursAWeek,
      animals: body.animals || [],
      attributes: Array.isArray(body.attributes) ? body.attributes : [],
      credentials: Array.isArray(body.credentials) ? body.credentials : [],
      travelMiles: radius,
      services,
    },
  };
}
