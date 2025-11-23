-- Initial schema migration
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
