import { StatusError } from 'expo-server';
import { storeSyncData } from '@/lib/sync/db';
import { createHash } from 'crypto';

/**
 * Create HMAC signature for verification
 * Note: This matches the client-side implementation which uses a simple hash approach
 */
function verifyHmacSignature(
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

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { syncKey, data, signature } = body;
    
    if (!syncKey || !data || !signature) {
      throw new StatusError(400, 'Missing required fields: syncKey, data, signature');
    }
    
    // Verify HMAC signature
    const isValid = verifyHmacSignature(data, syncKey, signature);
    if (!isValid) {
      throw new StatusError(401, 'Invalid signature');
    }
    
    // Store the encrypted data (for now, data is sent as-is, not encrypted)
    await storeSyncData(syncKey, data);
    
    return Response.json({ success: true });
  } catch (error) {
    if (error instanceof StatusError) {
      throw error;
    }
    console.error('Error in push sync:', error);
    throw new StatusError(500, 'Internal server error');
  }
}

