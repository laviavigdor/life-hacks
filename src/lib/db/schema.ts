import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const diary = sqliteTable('diary', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    entry: text('entry').notNull(),
    insights: text('insights', { mode: 'json' }),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`CURRENT_TIMESTAMP`),
}); 