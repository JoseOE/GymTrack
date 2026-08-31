import type { SQLiteDatabase } from 'expo-sqlite';

import type { PersonalRecord, PersonalRecordExerciseKey, PersonalRecordSource } from '@/domain/models';
import { createId } from '@/utils/id';

type PersonalRecordRow = {
  id: string;
  owner_user_id: string;
  exercise_key: PersonalRecordExerciseKey;
  weight_kg: number;
  source: PersonalRecordSource;
  updated_at: string;
};

function mapPersonalRecord(row: PersonalRecordRow): PersonalRecord {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    exerciseKey: row.exercise_key,
    weightKg: row.weight_kg,
    source: row.source,
    updatedAt: row.updated_at,
  };
}

export async function listPersonalRecords(db: SQLiteDatabase, ownerUserId: string): Promise<PersonalRecord[]> {
  const rows = await db.getAllAsync<PersonalRecordRow>(
    `SELECT id, owner_user_id, exercise_key, weight_kg, source, updated_at
     FROM personal_record
     WHERE owner_user_id = ?
     ORDER BY updated_at DESC`,
    ownerUserId,
  );
  return rows.map(mapPersonalRecord);
}

export async function savePersonalRecord(
  db: SQLiteDatabase,
  ownerUserId: string,
  exerciseKey: PersonalRecordExerciseKey,
  weightKg: number,
): Promise<PersonalRecord | null> {
  if (!Number.isFinite(weightKg) || weightKg < 0) throw new Error('El peso debe ser un número mayor o igual a cero.');

  if (weightKg === 0) {
    await db.runAsync(
      'DELETE FROM personal_record WHERE owner_user_id = ? AND exercise_key = ?',
      ownerUserId,
      exerciseKey,
    );
    return null;
  }

  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO personal_record (id, owner_user_id, exercise_key, weight_kg, source, updated_at)
     VALUES (?, ?, ?, ?, 'manual', ?)
     ON CONFLICT(owner_user_id, exercise_key) DO UPDATE SET
       weight_kg = excluded.weight_kg,
       source = excluded.source,
       updated_at = excluded.updated_at`,
    createId('personal-record'),
    ownerUserId,
    exerciseKey,
    weightKg,
    now,
  );

  const saved = await db.getFirstAsync<PersonalRecordRow>(
    `SELECT id, owner_user_id, exercise_key, weight_kg, source, updated_at
     FROM personal_record
     WHERE owner_user_id = ? AND exercise_key = ?`,
    ownerUserId,
    exerciseKey,
  );
  if (!saved) throw new Error('No se pudo recuperar el récord guardado.');
  return mapPersonalRecord(saved);
}
