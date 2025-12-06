import { createHash } from "crypto";
import type { Env } from "../types/env";

/**
 * Verify HMAC signature for authentication
 * Note: This matches the client-side implementation which uses a simple hash approach
 */
export function verifyHmacSignature(
  data: string,
  key: string,
  signature: string,
): boolean {
  // Match the client-side implementation: hash(data + ":" + key)
  const combined = `${data}:${key}`;
  const hash = createHash("sha256");
  hash.update(combined);
  const expectedSignature = hash.digest("base64");
  return expectedSignature === signature;
}

/**
 * Validate API key using salt and stored hash
 */
export function validateApiKey(
  apiKey: string,
  salt: string,
  storedHash: string,
): boolean {
  // Hash the provided API key with the salt
  const combined = `${apiKey}${salt}`;
  const hash = createHash("sha256");
  hash.update(combined);
  const computedHash = hash.digest("hex");
  return computedHash === storedHash;
}
