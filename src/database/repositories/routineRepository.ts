import type { SQLiteDatabase } from 'expo-sqlite';

import type { PendingRoutineSummary, RoutinePreview } from '@/domain/models';
import { estimatePersistedRoutineDuration, type PersistedRoutinePrescription } from '@/utils/duration';
import { createId } from '@/utils/id';

type PersistedRoutineRow = {
  exercise_type: 'compound' | 'isolation' | 'cardio';
  estimated_minutes: number;
  exercise_mode: 'strength' | 'cardio';
  target_duration_minutes: number | null;
  target_sets: number;
  min_reps: number;
  max_reps: number;
  rest_seconds: number;
};

export async function recalculateRoutineEstimatedMinutes(db: SQLiteDatabase, ownerUserId: string, routineId: string) {
  const rows = await db.getAllAsync<PersistedRoutineRow>(
    `SELECT e.exercise_type, e.estimated_minutes, re.exercise_mode, re.target_duration_minutes,
      re.target_sets, re.min_reps, re.max_reps, re.rest_seconds
     FROM routine_exercise re
     JOIN routine r ON r.id = re.routine_id
     JOIN exercise e ON e.id = re.exercise_id
     WHERE re.routine_id = ? AND r.owner_user_id = ?
     ORDER BY re.order_index`,
    routineId,
    ownerUserId,
  );
  if (rows.length === 0) throw new Error('La rutina ya no contiene ejercicios válidos.');
  const prescriptions: PersistedRoutinePrescription[] = rows.map((row) => ({
    exerciseType: row.exercise_type,
    catalogEstimatedMinutes: row.estimated_minutes,
    mode: row.exercise_mode,
    targetDurationMinutes: row.target_duration_minutes,
    targetSets: row.target_sets,
    minReps: row.min_reps,
    maxReps: row.max_reps,
    restSeconds: row.rest_seconds,
  }));
  const estimatedMinutes = estimatePersistedRoutineDuration(prescriptions);
  await db.runAsync(
    `UPDATE routine SET estimated_minutes = ?, updated_at = ?
     WHERE id = ? AND owner_user_id = ? AND estimated_minutes <> ?`,
    estimatedMinutes,
    new Date().toISOString(),
    routineId,
    ownerUserId,
    estimatedMinutes,
  );
  return estimatedMinutes;
}

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
          (id, routine_id, exercise_id, order_index, target_sets, min_reps, max_reps, rest_seconds,
           exercise_mode, target_duration_minutes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        createId('routine-exercise'),
        routineId,
        exercise.exerciseId,
        index,
        exercise.mode === 'cardio' ? 0 : 3,
        exercise.mode === 'cardio' ? 0 : 8,
        exercise.mode === 'cardio' ? 0 : 12,
        exercise.mode === 'cardio' ? 0 : 90,
        exercise.mode,
        exercise.targetDurationMinutes,
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
  if (!row) return null;
  const estimatedMinutes = await recalculateRoutineEstimatedMinutes(db, ownerUserId, row.id);
  return { id: row.id, name: row.name, estimatedMinutes, exerciseCount: row.exercise_count };
}
