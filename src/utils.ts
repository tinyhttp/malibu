import {
  randomBytes,
  createHash,
  pseudoRandomBytes,
  createHmac,
  timingSafeEqual,
} from "crypto";

/**
 * Rewrite of https://github.com/crypto-utils/uid-safe
 * @param length
 * @returns
 */
export function typeSafeUID(length: number): string {
  return randomBytes(length)
    .toString("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Rewrite of https://github.com/crypto-utils/rndm
 * @param length
 * @returns
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

export function hash(str: string): string {
  return createHash("sha1")
    .update(str, "ascii")
    .digest("base64")
    .replace(/=+$/, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

/**
 * Rewrite of https://github.com/suryagh/tsscmp
 * @param a
 * @param b
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
