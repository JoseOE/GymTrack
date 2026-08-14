import type { SQLiteDatabase } from 'expo-sqlite';

import { runMigrations } from '@/database/migrations';
import { seedDatabase } from '@/database/seed';

export const DATABASE_NAME = 'gymtrack.db';

export async function initializeDatabase(db: SQLiteDatabase) {
  await db.execAsync('PRAGMA journal_mode = WAL');
  await db.execAsync('PRAGMA foreign_keys = ON');
  await runMigrations(db);
  await seedDatabase(db);
}
