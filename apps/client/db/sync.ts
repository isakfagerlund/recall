import { db } from "@/db";
import { people as peopleTable, PersonRow } from "@/db/schema";
import { Person } from "@/types/person";
import { eq } from "drizzle-orm";

/**
 * Get all people for sync (including soft-deleted)
 */
export async function getAllPeopleForSync(): Promise<Person[]> {
  const rows = await db.select().from(peopleTable);

  return rows.map((row: PersonRow) => ({
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    input: row.input,
    createdAt:
      row.createdAt instanceof Date ? row.createdAt : new Date(row.createdAt),
    updatedAt:
      row.updatedAt instanceof Date
        ? row.updatedAt
        : row.updatedAt
          ? new Date(row.updatedAt)
          : undefined,
    deletedAt:
      row.deletedAt instanceof Date
        ? row.deletedAt
        : row.deletedAt
          ? new Date(row.deletedAt)
          : undefined,
  }));
}

/**
 * Upsert people from sync data, handling conflicts with last-write-wins
 */
export async function upsertPeopleFromSync(people: Person[]): Promise<void> {
  for (const person of people) {
    const existing = await db
      .select()
      .from(peopleTable)
      .where(eq(peopleTable.id, person.id))
      .limit(1);

    if (existing.length > 0) {
      const existingPerson = existing[0];
      const existingUpdatedAt =
        existingPerson.updatedAt instanceof Date
          ? existingPerson.updatedAt
          : existingPerson.updatedAt
            ? new Date(existingPerson.updatedAt)
            : null;

      const incomingUpdatedAt = person.updatedAt ?? person.createdAt;

      // Last-write-wins: if incoming is newer or equal, update
      if (!existingUpdatedAt || incomingUpdatedAt >= existingUpdatedAt) {
        await db
          .update(peopleTable)
          .set({
            name: person.name,
            description: person.description || null,
            input: person.input,
            updatedAt: incomingUpdatedAt,
            deletedAt: person.deletedAt ?? null,
          })
          .where(eq(peopleTable.id, person.id));
      }
    } else {
      // Insert new person
      await db.insert(peopleTable).values({
        id: person.id,
        name: person.name,
        description: person.description || null,
        input: person.input,
        createdAt: person.createdAt,
        updatedAt: person.updatedAt ?? null,
        deletedAt: person.deletedAt ?? null,
      });
    }
  }
}

/**
 * Mark all people as synced with the given timestamp
 */
export async function markAsSynced(timestamp: Date): Promise<void> {
  // Update synced_at for all people
  const rows = await db.select().from(peopleTable);
  for (const row of rows) {
    await db
      .update(peopleTable)
      .set({
        syncedAt: timestamp,
      })
      .where(eq(peopleTable.id, row.id));
  }
}

/**
 * Mark all people as needing sync (clear synced_at)
 */
export async function markAllAsUnsynced(): Promise<void> {
  await db.update(peopleTable).set({ syncedAt: null });
}
