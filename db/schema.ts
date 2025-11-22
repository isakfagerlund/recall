import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

export const people = sqliteTable(
  'people',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    description: text('description'),
    createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp' }),
    deletedAt: integer('deleted_at', { mode: 'timestamp' }),
  },
  (table) => ({
    createdAtIdx: index('people_created_at_idx').on(table.createdAt),
    nameIdx: index('people_name_idx').on(table.name),
    deletedAtIdx: index('people_deleted_at_idx').on(table.deletedAt),
  })
);

export type PersonRow = typeof people.$inferSelect;
export type NewPersonRow = typeof people.$inferInsert;

