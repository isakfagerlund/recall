import { StatusError } from 'expo-server';
import { getSyncData } from '@/lib/sync/db';
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

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const syncKey = url.searchParams.get('syncKey');
    const timestamp = url.searchParams.get('timestamp');
    const signature = url.searchParams.get('signature');
    
    if (!syncKey || !timestamp || !signature) {
      throw new StatusError(400, 'Missing required query parameters: syncKey, timestamp, signature');
    }
    
    // Verify HMAC signature
    const isValid = verifyHmacSignature(timestamp, syncKey, signature);
    if (!isValid) {
      throw new StatusError(401, 'Invalid signature');
    }
    
    // Get the stored data
    const data = await getSyncData(syncKey);
    
    if (!data) {
      return Response.json({ data: null });
    }
    
    return Response.json({ data });
  } catch (error) {
    if (error instanceof StatusError) {
      throw error;
    }
    console.error('Error in pull sync:', error);
    throw new StatusError(500, 'Internal server error');
  }
}

