import { randomBytes, scryptSync, timingSafeEqual } from "crypto";

const KEYLEN = 64;
const SALT_LEN = 16;

/** Format: scrypt$<salt_hex>$<hash_hex> */
export function hashPassword(plain: string): string {
  const salt = randomBytes(SALT_LEN);
  const hash = scryptSync(plain, salt, KEYLEN);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

export function verifyPassword(plain: string, stored: string | null): boolean {
  if (!stored || !stored.startsWith("scrypt$")) {
    return false;
  }
  const parts = stored.split("$");
  if (parts.length !== 3) return false;
  const [, saltHex, hashHex] = parts;
  const salt = Buffer.from(saltHex, "hex");
  const expected = Buffer.from(hashHex, "hex");
  const actual = scryptSync(plain, salt, expected.length);
  return timingSafeEqual(actual, expected);
}
