import type { SQLiteDatabase } from 'expo-sqlite';

import { listExercisesForMuscles } from '@/database/repositories/catalogRepository';
import type { ActiveWorkout, CatalogExercise, RecentWorkout, RemoveWorkoutSetResult, WeeklyPlanDay, WorkoutExercise, WorkoutSet } from '@/domain/models';
import { getDefaultExerciseCount } from '@/services/weeklyPlanService';
import { createId } from '@/utils/id';

type ActiveHeaderRow = {
  session_id: string;
  routine_id: string | null;
  routine_name: string | null;
  display_name: string | null;
  started_at: string;
  scheduled_day_index: number | null;
  counts_toward_goal: number;
};

type ActiveExerciseRow = {
  workout_exercise_id: string;
  exercise_id: string;
  exercise_name: string;
  muscle_name: string;
  order_index: number;
  set_id: string | null;
  set_number: number | null;
  weight_kg: number | null;
  repetitions: number | null;
  completed: number | null;
};

type RoutineExerciseRow = { exercise_id: string; order_index: number; target_sets: number };

export async function getActiveWorkout(db: SQLiteDatabase, ownerUserId: string): Promise<ActiveWorkout | null> {
  const header = await db.getFirstAsync<ActiveHeaderRow>(
    `SELECT ws.id AS session_id, ws.routine_id, r.name AS routine_name, ws.display_name, ws.started_at,
      ws.scheduled_day_index, ws.counts_toward_goal
     FROM workout_session ws
     LEFT JOIN routine r ON r.id = ws.routine_id
     WHERE ws.status = 'active' AND ws.owner_user_id = ?
     ORDER BY ws.started_at DESC, ws.id DESC
     LIMIT 1`,
    ownerUserId,
  );
  if (!header) return null;

  const rows = await db.getAllAsync<ActiveExerciseRow>(
    `SELECT we.id AS workout_exercise_id, we.exercise_id, e.name AS exercise_name,
      mg.name AS muscle_name, we.order_index, sets.id AS set_id, sets.set_number,
      sets.weight_kg, sets.repetitions, sets.completed
     FROM workout_exercise we
     JOIN exercise e ON e.id = we.exercise_id
     JOIN muscle_group mg ON mg.id = e.primary_muscle_id
     LEFT JOIN workout_set sets ON sets.workout_exercise_id = we.id
     WHERE we.workout_session_id = ?
     ORDER BY we.order_index, sets.set_number`,
    header.session_id,
  );

  const exerciseMap = new Map<string, WorkoutExercise>();
  for (const row of rows) {
    let exercise = exerciseMap.get(row.workout_exercise_id);
    if (!exercise) {
      exercise = { id: row.workout_exercise_id, exerciseId: row.exercise_id, name: row.exercise_name, muscle: row.muscle_name, orderIndex: row.order_index, sets: [] };
      exerciseMap.set(row.workout_exercise_id, exercise);
    }
    if (row.set_id && row.set_number !== null) {
      exercise.sets.push({
        id: row.set_id,
        setNumber: row.set_number,
        weightKg: row.weight_kg ?? 0,
        repetitions: row.repetitions ?? 0,
        completed: row.completed === 1,
      });
    }
  }
  return {
    id: header.session_id,
    routineId: header.routine_id,
    routineName: header.routine_name,
    sessionName: header.display_name ?? header.routine_name ?? 'Entrenamiento',
    startedAt: header.started_at,
    scheduledDayIndex: header.scheduled_day_index,
    countsTowardGoal: header.counts_toward_goal === 1,
    exercises: [...exerciseMap.values()],
  };
}

function matchesScheduleMuscle(primaryMuscle: string, scheduleMuscle: string) {
  return primaryMuscle === scheduleMuscle || (scheduleMuscle === 'Hombro' && primaryMuscle.startsWith('Deltoide'));
}

async function getScheduleExercises(db: SQLiteDatabase, day: WeeklyPlanDay) {
  const muscleNames = day.muscles.map((muscle) => muscle.name);
  const catalog = await listExercisesForMuscles(db, muscleNames);
  const targetCount = getDefaultExerciseCount(day);
  const selected: CatalogExercise[] = [];
  let candidateIndex = 0;
  while (selected.length < targetCount) {
    let added = false;
    for (const muscle of muscleNames) {
      const candidates = catalog.filter((exercise) => matchesScheduleMuscle(exercise.primaryMuscle, muscle));
      const candidate = candidates[candidateIndex];
      if (candidate && !selected.some((exercise) => exercise.id === candidate.id)) {
        selected.push(candidate);
        added = true;
        if (selected.length === targetCount) break;
      }
    }
    if (!added) break;
    candidateIndex += 1;
  }
  return selected.map((exercise, orderIndex) => ({ exercise_id: exercise.id, order_index: orderIndex, target_sets: exercise.exerciseType === 'cardio' ? 1 : 3 }));
}

export async function startWorkout(db: SQLiteDatabase, ownerUserId: string, day: WeeklyPlanDay, isAdditional = false) {
  const active = await getActiveWorkout(db, ownerUserId);
  if (active) return active;

  const routine = await db.getFirstAsync<{ id: string; name: string }>(
    `SELECT r.id, r.name FROM routine r
     WHERE r.owner_user_id = ?
       AND NOT EXISTS (SELECT 1 FROM workout_session ws WHERE ws.routine_id = r.id)
     ORDER BY r.updated_at DESC LIMIT 1`,
    ownerUserId,
  );
  let exercises: RoutineExerciseRow[];
  if (routine) {
    exercises = await db.getAllAsync<RoutineExerciseRow>(
      'SELECT exercise_id, order_index, target_sets FROM routine_exercise WHERE routine_id = ? ORDER BY order_index',
      routine.id,
    );
  } else {
    exercises = await getScheduleExercises(db, day);
  }
  if (exercises.length === 0) throw new Error('No hay ejercicios disponibles para el plan de hoy.');

  const sessionId = createId('workout');
  const now = new Date().toISOString();
  const sessionName = routine?.name ?? day.displayName;
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      `INSERT INTO workout_session
        (id, routine_id, display_name, started_at, status, scheduled_day_index, counts_toward_goal, owner_user_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      sessionId,
      routine?.id ?? null,
      isAdditional ? `${sessionName} · Adicional` : sessionName,
      now,
      'active',
      day.dayIndex,
      isAdditional ? 0 : day.countsTowardGoal ? 1 : 0,
      ownerUserId,
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
  return getActiveWorkout(db, ownerUserId);
}

export async function saveWorkoutSet(db: SQLiteDatabase, ownerUserId: string, set: WorkoutSet) {
  await db.runAsync(
    `UPDATE workout_set SET weight_kg = ?, repetitions = ?, completed = ?
     WHERE id = ? AND EXISTS (
       SELECT 1 FROM workout_exercise exercise
       JOIN workout_session session ON session.id = exercise.workout_session_id
       WHERE exercise.id = workout_set.workout_exercise_id AND session.owner_user_id = ?
     )`,
    set.weightKg,
    set.repetitions,
    set.completed ? 1 : 0,
    set.id,
    ownerUserId,
  );
}

export async function addWorkoutSet(db: SQLiteDatabase, ownerUserId: string, workoutExerciseId: string) {
  const row = await db.getFirstAsync<{ max_number: number | null }>(
    `SELECT MAX(workout_set.set_number) AS max_number
     FROM workout_set
     JOIN workout_exercise exercise ON exercise.id = workout_set.workout_exercise_id
     JOIN workout_session session ON session.id = exercise.workout_session_id
     WHERE workout_set.workout_exercise_id = ? AND session.owner_user_id = ?`,
    workoutExerciseId,
    ownerUserId,
  );
  if (row?.max_number === null || row?.max_number === undefined) {
    throw new Error('El ejercicio no pertenece al usuario activo.');
  }
  await db.runAsync(
    `INSERT INTO workout_set (id, workout_exercise_id, set_number, weight_kg, repetitions, completed, created_at)
     VALUES (?, ?, ?, 0, 0, 0, ?)`,
    createId('set'),
    workoutExerciseId,
    row.max_number + 1,
    new Date().toISOString(),
  );
}

export async function deleteWorkoutSet(db: SQLiteDatabase, ownerUserId: string, setId: string): Promise<RemoveWorkoutSetResult> {
  const set = await db.getFirstAsync<{ completed: number; set_count: number }>(
    `SELECT target.completed,
      (SELECT COUNT(*) FROM workout_set siblings WHERE siblings.workout_exercise_id = target.workout_exercise_id) AS set_count
     FROM workout_set target
     JOIN workout_exercise exercise ON exercise.id = target.workout_exercise_id
     JOIN workout_session session ON session.id = exercise.workout_session_id
     WHERE target.id = ? AND session.owner_user_id = ?`,
    setId,
    ownerUserId,
  );
  if (!set) return 'not-found';
  if (set.completed === 1) return 'completed';
  if (set.set_count <= 1) return 'last-set';
  const result = await db.runAsync(
    `DELETE FROM workout_set WHERE id = ? AND completed = 0 AND EXISTS (
      SELECT 1 FROM workout_exercise exercise
      JOIN workout_session session ON session.id = exercise.workout_session_id
      WHERE exercise.id = workout_set.workout_exercise_id AND session.owner_user_id = ?
    )`,
    setId,
    ownerUserId,
  );
  return result.changes > 0 ? 'removed' : 'not-found';
}

export async function finishWorkout(db: SQLiteDatabase, ownerUserId: string, sessionId: string) {
  await db.runAsync(
    `UPDATE workout_session SET status = 'completed', completed_at = ?
     WHERE id = ? AND owner_user_id = ? AND status = 'active'`,
    new Date().toISOString(),
    sessionId,
    ownerUserId,
  );
}

export async function cancelWorkout(db: SQLiteDatabase, ownerUserId: string, sessionId: string) {
  await db.runAsync(
    `UPDATE workout_session SET status = 'cancelled', completed_at = NULL
     WHERE id = ? AND owner_user_id = ? AND status = 'active'`,
    sessionId,
    ownerUserId,
  );
}

export async function listRecentWorkouts(db: SQLiteDatabase, ownerUserId: string, limit = 8): Promise<RecentWorkout[]> {
  const rows = await db.getAllAsync<{
    id: string; completed_at: string; title: string | null; duration_minutes: number;
    exercise_count: number; set_count: number;
  }>(
    `SELECT ws.id, ws.completed_at,
      COALESCE(r.name, ws.display_name, GROUP_CONCAT(DISTINCT mg.name)) AS title,
      MAX(1, CAST((julianday(ws.completed_at) - julianday(ws.started_at)) * 1440 AS INTEGER)) AS duration_minutes,
      COUNT(DISTINCT we.id) AS exercise_count,
      COUNT(sets.id) AS set_count
     FROM workout_session ws
     LEFT JOIN routine r ON r.id = ws.routine_id
     JOIN workout_exercise we ON we.workout_session_id = ws.id
     JOIN exercise e ON e.id = we.exercise_id
     JOIN muscle_group mg ON mg.id = e.primary_muscle_id
     LEFT JOIN workout_set sets ON sets.workout_exercise_id = we.id
     WHERE ws.owner_user_id = ? AND ws.status = 'completed' AND ws.completed_at IS NOT NULL
     GROUP BY ws.id
     ORDER BY ws.completed_at DESC
     LIMIT ?`,
    ownerUserId,
    limit,
  );
  return rows.map((row) => ({ id: row.id, completedAt: row.completed_at, title: row.title ?? 'Entrenamiento libre', durationMinutes: row.duration_minutes, exerciseCount: row.exercise_count, setCount: row.set_count }));
}

export async function listCompletedDates(db: SQLiteDatabase, ownerUserId: string, sinceIso: string) {
  const rows = await db.getAllAsync<{ completed_at: string }>(
    `SELECT completed_at FROM workout_session
     WHERE owner_user_id = ? AND status = 'completed' AND completed_at IS NOT NULL AND completed_at >= ? ORDER BY completed_at`,
    ownerUserId,
    sinceIso,
  );
  return rows.map((row) => row.completed_at);
}

export async function listCompletedSessionSnapshots(db: SQLiteDatabase, ownerUserId: string, sinceIso: string) {
  return db.getAllAsync<{ completed_at: string; counts_toward_goal: number }>(
    `SELECT completed_at, counts_toward_goal FROM workout_session
     WHERE owner_user_id = ? AND status = 'completed' AND completed_at IS NOT NULL AND completed_at >= ?
     ORDER BY completed_at`,
    ownerUserId,
    sinceIso,
  );
}
