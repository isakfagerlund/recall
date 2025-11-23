import { Hono } from 'hono';
import { storeSyncData } from '../../lib/db';
import { verifyHmacSignature } from '../../lib/auth';

const push = new Hono();

push.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const { syncKey, data, signature } = body;
    
    if (!syncKey || !data || !signature) {
      return c.json(
        { error: 'Missing required fields: syncKey, data, signature' },
        400
      );
    }
    
    // Verify HMAC signature
    const isValid = verifyHmacSignature(data, syncKey, signature);
    if (!isValid) {
      return c.json({ error: 'Invalid signature' }, 401);
    }
    
    // Store the encrypted data (for now, data is sent as-is, not encrypted)
    await storeSyncData(syncKey, data);
    
    return c.json({ success: true });
  } catch (error) {
    console.error('Error in push sync:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default push;

