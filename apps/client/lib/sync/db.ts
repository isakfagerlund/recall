import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL ?? "");

/**
 * Initialize the sync_data table if it doesn't exist
 */
export async function initializeDatabase(): Promise<void> {
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
): Promise<void> {
  await initializeDatabase();

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
export async function getSyncData(syncKey: string): Promise<string | null> {
  await initializeDatabase();

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
