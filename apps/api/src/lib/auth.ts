import { createHash } from 'crypto';

/**
 * Verify HMAC signature for authentication
 * Note: This matches the client-side implementation which uses a simple hash approach
 */
export function verifyHmacSignature(
  data: string,
  key: string,
  signature: string
): boolean {
  // Match the client-side implementation: hash(data + ":" + key)
  const combined = `${data}:${key}`;
  const hash = createHash('sha256');
  hash.update(combined);
  const expectedSignature = hash.digest('base64');
  return expectedSignature === signature;
}

