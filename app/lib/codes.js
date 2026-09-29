import { randomInt, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// "The code is generated server side, stored as a hash, expires in 15 minutes."
//
// Six digits is a small space, so the hash is scrypt with a per-code salt rather
// than a bare digest. Online guessing is capped at five attempts by the schema;
// scrypt is what makes the stored value useless if the table ever leaks.

export const CODE_TTL_MINUTES = 15;
export const MAX_ATTEMPTS = 5;

export const newCode = () => String(randomInt(0, 1_000_000)).padStart(6, "0");

export function hashCode(code) {
  const salt = randomBytes(16);
  const hash = scryptSync(code, salt, 32);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyCode(code, stored) {
  const [scheme, saltHex, hashHex] = String(stored || "").split("$");
  if (scheme !== "scrypt" || !saltHex || !hashHex) return false;
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(code, Buffer.from(saltHex, "hex"), expected.length);
  return timingSafeEqual(expected, actual);
}

export const expiryFromNow = () =>
  new Date(Date.now() + CODE_TTL_MINUTES * 60_000).toISOString();
