import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';

// Open database with change listeners enabled for Live Queries
const expoDb = openDatabaseSync('recall.db', {
  enableChangeListener: true,
});

// Initialize Drizzle
export const db = drizzle(expoDb);

// Migration tracking table
const MIGRATIONS_TABLE = 'drizzle_migrations';

/**
 * Initialize the migrations tracking table
 */
function initializeMigrationsTable(): void {
  try {
    expoDb.execSync(`
      CREATE TABLE IF NOT EXISTS ${MIGRATIONS_TABLE} (
        id TEXT PRIMARY KEY NOT NULL,
        hash TEXT NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  } catch (error) {
    console.error('Error creating migrations table:', error);
    throw error;
  }
}

/**
 * Check if a migration has been applied
 */
function isMigrationApplied(migrationId: string): boolean {
  try {
    const result = expoDb.getAllSync<{ id: string }>(
      `SELECT id FROM ${MIGRATIONS_TABLE} WHERE id = ?`,
      [migrationId]
    );
    return result.length > 0;
  } catch (error) {
    console.error('Error checking migration status:', error);
    return false;
  }
}

/**
 * Mark a migration as applied
 */
function markMigrationApplied(migrationId: string, hash: string): void {
  try {
    const now = Date.now();
    expoDb.execSync(
      `INSERT INTO ${MIGRATIONS_TABLE} (id, hash, created_at) VALUES (?, ?, ?)`,
      [migrationId, hash, now]
    );
  } catch (error) {
    console.error('Error marking migration as applied:', error);
    throw error;
  }
}


/**
 * Run a single migration
 */
function runMigration(migrationId: string, sql: string): void {
  try {
    // Execute migration SQL
    expoDb.execSync(sql);
    
    // Calculate hash (simple hash for tracking)
    const hash = migrationId; // Simplified - in production use proper hash
    
    // Mark as applied
    markMigrationApplied(migrationId, hash);
    console.log(`Applied migration: ${migrationId}`);
  } catch (error) {
    console.error(`Error running migration ${migrationId}:`, error);
    throw error;
  }
}

/**
 * Initialize database using migrations
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Initialize migrations table
    initializeMigrationsTable();

    // Define migrations in order
    const migrations = [
      {
        id: '0000_initial',
        sql: `
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

          CREATE INDEX IF NOT EXISTS people_created_at_idx ON people(created_at);
          CREATE INDEX IF NOT EXISTS people_name_idx ON people(name);
          CREATE INDEX IF NOT EXISTS people_deleted_at_idx ON people(deleted_at);
          CREATE INDEX IF NOT EXISTS people_synced_at_idx ON people(synced_at);
        `,
      },
      {
        id: '0001_add_calendar_fields',
        sql: `
          -- Add calendar event fields to people table
          -- Use try-catch pattern for SQLite compatibility
          -- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
          -- So we check if column exists first by attempting to query it
        `,
      },
    ];

    // Apply migrations in order
    for (const migration of migrations) {
      if (!isMigrationApplied(migration.id)) {
        if (migration.id === '0001_add_calendar_fields') {
          // Handle calendar fields migration with column existence checks
          const columnsToAdd = [
            { name: 'calendar_event_id', type: 'TEXT' },
            { name: 'calendar_event_title', type: 'TEXT' },
            { name: 'calendar_event_start_date', type: 'INTEGER' },
            { name: 'calendar_event_end_date', type: 'INTEGER' },
          ];

          for (const column of columnsToAdd) {
            try {
              // Try to query the column - if it fails, column doesn't exist
              expoDb.getAllSync(`SELECT ${column.name} FROM people LIMIT 1`);
              // Column exists, skip
            } catch (error) {
              // Column doesn't exist, add it
              try {
                expoDb.execSync(
                  `ALTER TABLE people ADD COLUMN ${column.name} ${column.type};`
                );
              } catch (alterError) {
                // Ignore if column already exists (race condition)
                console.log(`Column ${column.name} may already exist, skipping`);
              }
            }
          }

          // Create index for calendar_event_id
          try {
            expoDb.execSync(`
              CREATE INDEX IF NOT EXISTS people_calendar_event_id_idx ON people(calendar_event_id);
            `);
          } catch (error) {
            // Index may already exist
            console.log('Index may already exist, skipping');
          }

          markMigrationApplied(migration.id, migration.id);
          console.log(`Applied migration: ${migration.id}`);
        } else {
          runMigration(migration.id, migration.sql);
        }
      } else {
        console.log(`Migration ${migration.id} already applied, skipping`);
      }
    }
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

