import { drizzle } from 'drizzle-orm/expo-sqlite';
import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { openDatabaseSync } from 'expo-sqlite';
import migrations from './migrations/migrations.js';

// Open database with change listeners enabled for Live Queries
const expoDb = openDatabaseSync('recall.db', {
  enableChangeListener: true,
});

// Initialize Drizzle
export const db = drizzle(expoDb);

// Initialize database - run migrations
export async function initializeDatabase(): Promise<void> {
  try {
    await migrate(db, migrations);
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

