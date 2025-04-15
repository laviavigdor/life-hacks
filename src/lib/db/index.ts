import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { diary } from './schema';
import { eq } from 'drizzle-orm';

// Initialize SQLite database
const sqlite = new Database('life-hacks.db');
export const db = drizzle(sqlite);

// Export table schemas
export { diary };

// Helper functions for diary entries
export async function getDiaryEntries() {
    return db.select().from(diary).all();
}

export async function createDiaryEntry(entry: string) {
    return db.insert(diary).values({
        entry,
        insights: null,
    }).run();
}

// Type for insights object
interface Insights {
    activity?: string;
    metrics?: Array<{
        type: string;
        value: number;
        unit: string;
    }>;
}

export async function updateDiaryInsights(id: number, insights: Insights) {
    return db.update(diary)
        .set({ insights })
        .where(eq(diary.id, id))
        .run();
} 