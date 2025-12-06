import { Hono } from "hono";
import { cors } from "hono/cors";
import type { Context, Next } from "hono";
import type { Env } from "./types/env";
import { validateApiKey } from "./lib/auth";
import transcribe from "./routes/transcribe";
import pull from "./routes/sync/pull";
import push from "./routes/sync/push";

const app = new Hono<{ Bindings: Env }>();

// CORS middleware
app.use("/*", cors());

/**
 * API key authentication middleware
 * Checks for API key in Authorization header (Bearer token) or X-API-Key header
 */
async function apiKeyAuth(c: Context<{ Bindings: Env }>, next: Next) {
  // Skip auth for health check
  if (c.req.path === "/health") {
    await next();
    return;
  }

  const authHeader = c.req.header("Authorization");
  const apiKeyHeader = c.req.header("X-API-Key");

  // Extract API key from Authorization header (Bearer token) or X-API-Key header
  let apiKey: string | undefined;
  if (authHeader?.startsWith("Bearer ")) {
    apiKey = authHeader.substring(7);
  } else if (apiKeyHeader) {
    apiKey = apiKeyHeader;
  }

  if (!apiKey) {
    return c.json({ error: "Missing API key" }, 401);
  }

  // Validate API key
  const isValid = validateApiKey(
    apiKey,
    c.env.API_KEY_SALT,
    c.env.API_KEY_HASH,
  );

  if (!isValid) {
    return c.json({ error: "Invalid API key" }, 401);
  }

  await next();
}

// Apply API key auth middleware to all routes except health check
app.use("/*", apiKeyAuth);

// API routes
app.route("/api/transcribe", transcribe);

// Sync routes
const sync = new Hono<{ Bindings: Env }>();
sync.route("/pull", pull);
sync.route("/push", push);
app.route("/sync", sync);

// Health check
app.get("/health", (c) => {
  return c.json({ status: "ok" });
});

export default app;
