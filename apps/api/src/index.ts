import { Hono } from 'hono';
import transcribe from './routes/transcribe';
import pull from './routes/sync/pull';
import push from './routes/sync/push';

const app = new Hono();

// Simple CORS middleware
app.use('/*', async (c, next) => {
  c.header('Access-Control-Allow-Origin', '*');
  c.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  c.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (c.req.method === 'OPTIONS') {
    return c.text('', 204);
  }
  
  await next();
});

// API routes
app.route('/api/transcribe', transcribe);

// Sync routes
const sync = new Hono();
sync.route('/pull', pull);
sync.route('/push', push);
app.route('/sync', sync);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;

