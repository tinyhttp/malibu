import {
  randomBytes,
  createHash,
  pseudoRandomBytes,
  createHmac,
  timingSafeEqual,
} from "crypto";

/**
 * Generate a secure type safe UID with specified length.
 * Rewrite of https://github.com/crypto-utils/uid-safe
 * @param {Number} length UID length
 * @returns {String} Type safe UID
 */
export function typeSafeUID(length: number): string {
  return randomBytes(length)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Generate a (not secure) quick salt with specified length.
 * Rewrite of https://github.com/crypto-utils/rndm
 * @param {Number} length Salt length
 * @returns {String} Salt
 */
export function randomBase62(length: number): string {
  const availableCharacters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const byteLength = Buffer.byteLength(availableCharacters);
  let salt = "";
  for (let i = 0; i < length; i++) {
    salt += availableCharacters[Math.floor(byteLength * Math.random())];
  }

  return salt;
}

/**
 * Create a SHA1 hash from specified string
 * Rewrite of a function from https://github.com/pillarjs/csrf
 * @param {String} str Dirty string
 * @returns {String} Hashed string
 */
export function hash(str: string): string {
  return createHash("sha1")
    .update(str, "ascii")
    .digest("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Compare two keys, to check if they have the same creation duration.
 * Rewrite of https://github.com/suryagh/tsscmp
 * @param {String} a Key #1
 * @param {String} b Key #2
 * @returns {Boolean} Whether both keys matches or not
 */
export function timeSafeCompare(a: string, b: string): boolean {
  const key = pseudoRandomBytes(32);
  const aHMAC = createHmac("sha256", key).update(String(a)).digest();
  const bHMAC = createHmac("sha256", key).update(String(b)).digest();

  if (aHMAC.length !== bHMAC.length) {
    return false;
  }

  return timingSafeEqual(aHMAC, bHMAC);
}
