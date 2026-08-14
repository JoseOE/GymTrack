import type { SQLiteDatabase } from 'expo-sqlite';

import type { ActiveWorkout, RecentWorkout, WorkoutExercise, WorkoutSet } from '@/domain/models';
import { createId } from '@/utils/id';

type ActiveRow = {
  session_id: string;
  routine_id: string | null;
  routine_name: string | null;
  started_at: string;
  workout_exercise_id: string;
  exercise_id: string;
  exercise_name: string;
  muscle_name: string;
  order_index: number;
  set_id: string;
  set_number: number;
  weight_kg: number;
  repetitions: number;
  completed: number;
};

type RoutineExerciseRow = { exercise_id: string; order_index: number; target_sets: number };

export async function getActiveWorkout(db: SQLiteDatabase): Promise<ActiveWorkout | null> {
  const rows = await db.getAllAsync<ActiveRow>(
    `SELECT ws.id AS session_id, ws.routine_id, r.name AS routine_name, ws.started_at,
      we.id AS workout_exercise_id, we.exercise_id, e.name AS exercise_name, mg.name AS muscle_name,
      we.order_index, sets.id AS set_id, sets.set_number, sets.weight_kg, sets.repetitions, sets.completed
     FROM workout_session ws
     LEFT JOIN routine r ON r.id = ws.routine_id
     JOIN workout_exercise we ON we.workout_session_id = ws.id
     JOIN exercise e ON e.id = we.exercise_id
     JOIN muscle_group mg ON mg.id = e.primary_muscle_id
     JOIN workout_set sets ON sets.workout_exercise_id = we.id
     WHERE ws.status = 'active'
     ORDER BY ws.started_at DESC, we.order_index, sets.set_number`,
  );
  if (rows.length === 0) return null;
  const first = rows[0];
  const exerciseMap = new Map<string, WorkoutExercise>();
  for (const row of rows.filter((item) => item.session_id === first.session_id)) {
    let exercise = exerciseMap.get(row.workout_exercise_id);
    if (!exercise) {
      exercise = { id: row.workout_exercise_id, exerciseId: row.exercise_id, name: row.exercise_name, muscle: row.muscle_name, orderIndex: row.order_index, sets: [] };
      exerciseMap.set(row.workout_exercise_id, exercise);
    }
    exercise.sets.push({ id: row.set_id, setNumber: row.set_number, weightKg: row.weight_kg, repetitions: row.repetitions, completed: row.completed === 1 });
  }
  return { id: first.session_id, routineId: first.routine_id, routineName: first.routine_name, startedAt: first.started_at, exercises: [...exerciseMap.values()] };
}

export async function startWorkout(db: SQLiteDatabase) {
  const active = await getActiveWorkout(db);
  if (active) return active;
  const routine = await db.getFirstAsync<{ id: string }>('SELECT id FROM routine ORDER BY updated_at DESC LIMIT 1');
  let exercises: RoutineExerciseRow[];
  if (routine) {
    exercises = await db.getAllAsync<RoutineExerciseRow>(
      'SELECT exercise_id, order_index, target_sets FROM routine_exercise WHERE routine_id = ? ORDER BY order_index',
      routine.id,
    );
  } else {
    const names = ['Jalón al pecho agarre abierto', 'Remo sentado polea baja', 'Curl mancuernas'];
    const rows = await db.getAllAsync<{ id: string; name: string }>(
      'SELECT id, name FROM exercise WHERE name IN (?, ?, ?)',
      names,
    );
    const byName = new Map(rows.map((row) => [row.name, row.id]));
    exercises = names.map((name, orderIndex) => ({ exercise_id: byName.get(name) ?? '', order_index: orderIndex, target_sets: 3 })).filter((item) => item.exercise_id);
  }
  if (exercises.length === 0) throw new Error('No hay ejercicios disponibles para iniciar la sesión.');

  const sessionId = createId('workout');
  const now = new Date().toISOString();
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'INSERT INTO workout_session (id, routine_id, started_at, status) VALUES (?, ?, ?, ?)',
      sessionId,
      routine?.id ?? null,
      now,
      'active',
    );
    for (const exercise of exercises) {
      const workoutExerciseId = createId('workout-exercise');
      await transaction.runAsync(
        'INSERT INTO workout_exercise (id, workout_session_id, exercise_id, order_index) VALUES (?, ?, ?, ?)',
        workoutExerciseId,
        sessionId,
        exercise.exercise_id,
        exercise.order_index,
      );
      for (let setNumber = 1; setNumber <= exercise.target_sets; setNumber += 1) {
        await transaction.runAsync(
          `INSERT INTO workout_set
            (id, workout_exercise_id, set_number, weight_kg, repetitions, completed, created_at)
           VALUES (?, ?, ?, 0, 0, 0, ?)`,
          createId('set'),
          workoutExerciseId,
          setNumber,
          now,
        );
      }
    }
  });
  return getActiveWorkout(db);
}

export async function saveWorkoutSet(db: SQLiteDatabase, set: WorkoutSet) {
  await db.runAsync(
    'UPDATE workout_set SET weight_kg = ?, repetitions = ?, completed = ? WHERE id = ?',
    set.weightKg,
    set.repetitions,
    set.completed ? 1 : 0,
    set.id,
  );
}

export async function addWorkoutSet(db: SQLiteDatabase, workoutExerciseId: string) {
  const row = await db.getFirstAsync<{ next_number: number }>(
    'SELECT COALESCE(MAX(set_number), 0) + 1 AS next_number FROM workout_set WHERE workout_exercise_id = ?',
    workoutExerciseId,
  );
  await db.runAsync(
    `INSERT INTO workout_set (id, workout_exercise_id, set_number, weight_kg, repetitions, completed, created_at)
     VALUES (?, ?, ?, 0, 0, 0, ?)`,
    createId('set'),
    workoutExerciseId,
    row?.next_number ?? 1,
    new Date().toISOString(),
  );
}

export async function deleteWorkoutSet(db: SQLiteDatabase, setId: string) {
  const result = await db.runAsync('DELETE FROM workout_set WHERE id = ? AND completed = 0', setId);
  return result.changes > 0;
}

export async function finishWorkout(db: SQLiteDatabase, sessionId: string) {
  await db.runAsync(
    `UPDATE workout_session SET status = 'completed', completed_at = ? WHERE id = ? AND status = 'active'`,
    new Date().toISOString(),
    sessionId,
  );
}

export async function listRecentWorkouts(db: SQLiteDatabase, limit = 8): Promise<RecentWorkout[]> {
  const rows = await db.getAllAsync<{
    id: string; completed_at: string; title: string | null; duration_minutes: number;
    exercise_count: number; set_count: number;
  }>(
    `SELECT ws.id, ws.completed_at,
      COALESCE(r.name, GROUP_CONCAT(DISTINCT mg.name)) AS title,
      MAX(1, CAST((julianday(ws.completed_at) - julianday(ws.started_at)) * 1440 AS INTEGER)) AS duration_minutes,
      COUNT(DISTINCT we.id) AS exercise_count,
      COUNT(sets.id) AS set_count
     FROM workout_session ws
     LEFT JOIN routine r ON r.id = ws.routine_id
     JOIN workout_exercise we ON we.workout_session_id = ws.id
     JOIN exercise e ON e.id = we.exercise_id
     JOIN muscle_group mg ON mg.id = e.primary_muscle_id
     JOIN workout_set sets ON sets.workout_exercise_id = we.id
     WHERE ws.status = 'completed' AND ws.completed_at IS NOT NULL
     GROUP BY ws.id
     ORDER BY ws.completed_at DESC
     LIMIT ?`,
    limit,
  );
  return rows.map((row) => ({ id: row.id, completedAt: row.completed_at, title: row.title ?? 'Entrenamiento libre', durationMinutes: row.duration_minutes, exerciseCount: row.exercise_count, setCount: row.set_count }));
}

export async function listCompletedDates(db: SQLiteDatabase, sinceIso: string) {
  const rows = await db.getAllAsync<{ completed_at: string }>(
    `SELECT completed_at FROM workout_session
     WHERE status = 'completed' AND completed_at IS NOT NULL AND completed_at >= ? ORDER BY completed_at`,
    sinceIso,
  );
  return rows.map((row) => row.completed_at);
}
