import { neon } from '@neondatabase/serverless';

/**
 * Get a database client instance
 */
function getDbClient(databaseUrl: string | undefined) {
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not configured');
  }
  return neon(databaseUrl);
}

/**
 * Initialize the sync_data table if it doesn't exist
 */
async function initializeDatabase(
  databaseUrl: string | undefined
): Promise<void> {
  const sql = getDbClient(databaseUrl);
  await sql`
    CREATE TABLE IF NOT EXISTS sync_data (
      sync_key TEXT PRIMARY KEY,
      encrypted_data TEXT NOT NULL,
      updated_at TIMESTAMP NOT NULL DEFAULT NOW()
    )
  `;
}

/**
 * Store sync data for a given sync key
 */
export async function storeSyncData(
  syncKey: string,
  encryptedData: string,
  databaseUrl?: string
): Promise<void> {
  await initializeDatabase(databaseUrl);
  const sql = getDbClient(databaseUrl);

  await sql`
    INSERT INTO sync_data (sync_key, encrypted_data, updated_at)
    VALUES (${syncKey}, ${encryptedData}, NOW())
    ON CONFLICT (sync_key) 
    DO UPDATE SET 
      encrypted_data = EXCLUDED.encrypted_data,
      updated_at = NOW()
  `;
}

/**
 * Get sync data for a given sync key
 */
export async function getSyncData(
  syncKey: string,
  databaseUrl?: string
): Promise<string | null> {
  await initializeDatabase(databaseUrl);
  const sql = getDbClient(databaseUrl);

  const result = (await sql`
    SELECT encrypted_data
    FROM sync_data
    WHERE sync_key = ${syncKey}
    LIMIT 1
  `) as { encrypted_data: string }[];

  if (result.length === 0) {
    return null;
  }

  return result[0].encrypted_data;
}
