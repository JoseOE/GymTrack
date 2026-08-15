import type { SQLiteDatabase } from 'expo-sqlite';

import type { PendingRoutineSummary, RoutinePreview } from '@/domain/models';
import { createId } from '@/utils/id';

export async function saveRoutine(db: SQLiteDatabase, ownerUserId: string, preview: RoutinePreview) {
  const routineId = createId('routine');
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      `DELETE FROM routine WHERE owner_user_id = ?
       AND NOT EXISTS (SELECT 1 FROM workout_session ws WHERE ws.routine_id = routine.id)`,
      ownerUserId,
    );
    await transaction.runAsync(
      'INSERT INTO routine (id, name, estimated_minutes, created_at, updated_at, owner_user_id) VALUES (?, ?, ?, ?, ?, ?)',
      routineId,
      preview.name,
      preview.estimatedDurationMinutes,
      now,
      now,
      ownerUserId,
    );
    for (const [index, exercise] of preview.exercises.entries()) {
      await transaction.runAsync(
        `INSERT INTO routine_exercise
          (id, routine_id, exercise_id, order_index, target_sets, min_reps, max_reps, rest_seconds)
         VALUES (?, ?, ?, ?, 3, 8, 12, 90)`,
        createId('routine-exercise'),
        routineId,
        exercise.exerciseId,
        index,
      );
    }
  });
  return routineId;
}

export async function getPendingRoutineSummary(db: SQLiteDatabase, ownerUserId: string): Promise<PendingRoutineSummary | null> {
  const row = await db.getFirstAsync<{ id: string; name: string; estimated_minutes: number; exercise_count: number }>(
    `SELECT r.id, r.name, r.estimated_minutes, COUNT(re.id) AS exercise_count
     FROM routine r
     JOIN routine_exercise re ON re.routine_id = r.id
     WHERE r.owner_user_id = ?
       AND NOT EXISTS (SELECT 1 FROM workout_session ws WHERE ws.routine_id = r.id)
     GROUP BY r.id
     ORDER BY r.updated_at DESC
     LIMIT 1`,
    ownerUserId,
  );
  return row ? { id: row.id, name: row.name, estimatedMinutes: row.estimated_minutes, exerciseCount: row.exercise_count } : null;
}
