import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import { db } from './index';

// Run migrations
console.log('Running migrations...');
migrate(db, { migrationsFolder: './drizzle' });
console.log('Migrations complete!'); 