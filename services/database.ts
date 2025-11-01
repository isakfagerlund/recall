import * as SQLite from 'expo-sqlite';
import { ContactNote } from '@/types';

const DB_NAME = 'recall.db';

let db: SQLite.SQLiteDatabase | null = null;

export async function initDatabase(): Promise<void> {
  try {
    db = await SQLite.openDatabaseAsync(DB_NAME);

    // Create notes table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS notes (
        id TEXT PRIMARY KEY NOT NULL,
        contactId TEXT NOT NULL,
        content TEXT NOT NULL,
        createdAt INTEGER NOT NULL,
        updatedAt INTEGER NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_contactId ON notes(contactId);
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    await initDatabase();
  }
  return db!;
}

export async function getNoteByContactId(contactId: string): Promise<ContactNote | null> {
  try {
    const database = await getDatabase();
    const result = await database.getFirstAsync<ContactNote>(
      'SELECT * FROM notes WHERE contactId = ? LIMIT 1',
      [contactId]
    );
    return result || null;
  } catch (error) {
    console.error('Failed to get note:', error);
    throw error;
  }
}

export async function getAllNotes(): Promise<ContactNote[]> {
  try {
    const database = await getDatabase();
    const results = await database.getAllAsync<ContactNote>(
      'SELECT * FROM notes ORDER BY updatedAt DESC'
    );
    return results;
  } catch (error) {
    console.error('Failed to get all notes:', error);
    throw error;
  }
}

export async function saveNote(note: Omit<ContactNote, 'id' | 'createdAt' | 'updatedAt'>): Promise<ContactNote> {
  try {
    const database = await getDatabase();
    const now = Date.now();

    // Check if note exists for this contact
    const existing = await getNoteByContactId(note.contactId);

    if (existing) {
      // Update existing note
      await database.runAsync(
        'UPDATE notes SET content = ?, updatedAt = ? WHERE contactId = ?',
        [note.content, now, note.contactId]
      );
      return {
        ...existing,
        content: note.content,
        updatedAt: now,
      };
    } else {
      // Create new note
      const id = `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await database.runAsync(
        'INSERT INTO notes (id, contactId, content, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)',
        [id, note.contactId, note.content, now, now]
      );
      return {
        id,
        contactId: note.contactId,
        content: note.content,
        createdAt: now,
        updatedAt: now,
      };
    }
  } catch (error) {
    console.error('Failed to save note:', error);
    throw error;
  }
}

export async function deleteNote(contactId: string): Promise<void> {
  try {
    const database = await getDatabase();
    await database.runAsync('DELETE FROM notes WHERE contactId = ?', [contactId]);
  } catch (error) {
    console.error('Failed to delete note:', error);
    throw error;
  }
}

export async function searchNotes(query: string): Promise<ContactNote[]> {
  try {
    const database = await getDatabase();
    const results = await database.getAllAsync<ContactNote>(
      'SELECT * FROM notes WHERE content LIKE ? ORDER BY updatedAt DESC',
      [`%${query}%`]
    );
    return results;
  } catch (error) {
    console.error('Failed to search notes:', error);
    throw error;
  }
}
