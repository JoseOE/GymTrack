import type { SQLiteDatabase } from 'expo-sqlite';

import type { RoutinePreview } from '@/domain/models';
import { createId } from '@/utils/id';

export async function saveRoutine(db: SQLiteDatabase, preview: RoutinePreview) {
  const routineId = createId('routine');
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'INSERT INTO routine (id, name, estimated_minutes, created_at, updated_at) VALUES (?, ?, ?, ?, ?)',
      routineId,
      preview.name,
      preview.estimatedMinutes,
      now,
      now,
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
