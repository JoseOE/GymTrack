import type { SQLiteDatabase } from 'expo-sqlite';

import { schemaV1 } from '@/database/schema/v1';
import { schemaV2 } from '@/database/schema/v2';
import { schemaV3 } from '@/database/schema/v3';
import { schemaV4 } from '@/database/schema/v4';

type Migration = { version: number; name: string; sql: string };

const migrations: Migration[] = [
  { version: 1, name: 'initial_local_gym_schema', sql: schemaV1 },
  { version: 2, name: 'single_active_workout_and_session_name', sql: schemaV2 },
  { version: 3, name: 'profile_weekly_plans_and_workout_snapshots', sql: schemaV3 },
  { version: 4, name: 'authenticated_user_local_data_isolation', sql: schemaV4 },
];

export async function runMigrations(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);

  const applied = await db.getAllAsync<{ version: number }>('SELECT version FROM _migrations');
  const appliedVersions = new Set(applied.map((item) => item.version));

  for (const migration of migrations) {
    if (appliedVersions.has(migration.version)) continue;
    await db.withExclusiveTransactionAsync(async (transaction) => {
      await transaction.execAsync(migration.sql);
      await transaction.runAsync(
        'INSERT INTO _migrations (version, name, applied_at) VALUES (?, ?, ?)',
        migration.version,
        migration.name,
        new Date().toISOString(),
      );
    });
  }
}
