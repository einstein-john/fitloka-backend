"use strict";

const crypto = require("crypto");

/** Matches `src/utils/password.util.ts` (scrypt, 16-byte salt, 64-byte key). */
function hashPassword(plain) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(plain, salt, 64);
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

module.exports = { hashPassword };
