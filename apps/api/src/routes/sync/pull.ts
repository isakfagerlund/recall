import { Hono } from 'hono';
import { getSyncData } from '../../lib/db';
import { verifyHmacSignature } from '../../lib/auth';

const pull = new Hono();

pull.get('/', async (c) => {
  try {
    const syncKey = c.req.query('syncKey');
    const timestamp = c.req.query('timestamp');
    const signature = c.req.query('signature');
    
    if (!syncKey || !timestamp || !signature) {
      return c.json(
        { error: 'Missing required query parameters: syncKey, timestamp, signature' },
        400
      );
    }
    
    // Verify HMAC signature
    const isValid = verifyHmacSignature(timestamp, syncKey, signature);
    if (!isValid) {
      return c.json({ error: 'Invalid signature' }, 401);
    }
    
    // Get the stored data
    const data = await getSyncData(syncKey);
    
    if (!data) {
      return c.json({ data: null });
    }
    
    return c.json({ data });
  } catch (error) {
    console.error('Error in pull sync:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default pull;

