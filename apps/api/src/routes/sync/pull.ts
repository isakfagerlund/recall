import { Hono } from 'hono';
import type { Env } from '../../types/env';
import { getSyncData } from '../../lib/db';
import { verifyHmacSignature } from '../../lib/auth';

const pull = new Hono<{ Bindings: Env }>();

pull.get('/', async (c) => {
  try {
    const syncKey = c.req.query('syncKey');
    const timestamp = c.req.query('timestamp');
    const signature = c.req.query('signature');

    if (!syncKey || !timestamp || !signature) {
      return c.json(
        {
          error:
            'Missing required query parameters: syncKey, timestamp, signature',
        },
        400
      );
    }

    // Verify HMAC signature
    const isValid = verifyHmacSignature(timestamp, syncKey, signature);
    if (!isValid) {
      return c.json({ error: 'Invalid signature' }, 401);
    }

    // Get the stored data
    const data = await getSyncData(syncKey, c.env.DATABASE_URL);

    if (!data) {
      return c.json({ data: null });
    }

    return c.json({ data });
  } catch (error) {
    console.error('Error in pull sync:', error);
    const message =
      error instanceof Error ? error.message : 'Internal server error';
    return c.json({ error: message }, 500);
  }
});

export default pull;
