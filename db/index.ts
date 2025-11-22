import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

// Open database with change listeners enabled for Live Queries
const expoDb = openDatabaseSync('recall.db', {
  enableChangeListener: true,
});

// Initialize Drizzle
export const db = drizzle(expoDb);

// Initialize database - create tables if they don't exist
export async function initializeDatabase(): Promise<void> {
  try {
    // Create people table
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS people (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at INTEGER NOT NULL,
        updated_at INTEGER
      );
    `);

    // Create indexes
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS people_created_at_idx ON people(created_at);
      CREATE INDEX IF NOT EXISTS people_name_idx ON people(name);
    `);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

