import { Hono } from 'hono';
import { cors } from 'hono/cors';
import type { Env } from './types/env';
import transcribe from './routes/transcribe';
import pull from './routes/sync/pull';
import push from './routes/sync/push';

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use('/*', cors());

// API routes
app.route('/api/transcribe', transcribe);

// Sync routes
const sync = new Hono<{ Bindings: Env }>();
sync.route('/pull', pull);
sync.route('/push', push);
app.route('/sync', sync);

// Health check
app.get('/health', (c) => {
  return c.json({ status: 'ok' });
});

export default app;
