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
        updated_at INTEGER,
        deleted_at INTEGER,
        synced_at INTEGER,
        sync_version INTEGER
      );
    `);

    // Add columns if they don't exist (for existing databases)
    // SQLite will throw an error if the column already exists, so we catch and ignore it
    const columnsToAdd = [
      'deleted_at',
      'synced_at',
      'sync_version',
    ];
    
    for (const column of columnsToAdd) {
      try {
        let columnType = 'INTEGER';
        expoDb.execSync(`
          ALTER TABLE people ADD COLUMN ${column} ${columnType};
        `);
      } catch (error) {
        // Column already exists or table doesn't exist yet, ignore error
        // The column will be created by CREATE TABLE IF NOT EXISTS for new tables
      }
    }

    // Create indexes
    expoDb.execSync(`
      CREATE INDEX IF NOT EXISTS people_created_at_idx ON people(created_at);
      CREATE INDEX IF NOT EXISTS people_name_idx ON people(name);
      CREATE INDEX IF NOT EXISTS people_deleted_at_idx ON people(deleted_at);
      CREATE INDEX IF NOT EXISTS people_synced_at_idx ON people(synced_at);
    `);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

