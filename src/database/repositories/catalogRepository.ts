import type { SQLiteDatabase } from 'expo-sqlite';

import type { CatalogExercise, EquipmentExerciseSummary, ExperienceLevel, MuscleGroup } from '@/domain/models';

type ExerciseRow = {
  id: string;
  name: string;
  primary_muscle_id: string;
  primary_muscle: string;
  exercise_family: string;
  movement_pattern: string;
  exercise_type: CatalogExercise['exerciseType'];
  difficulty: ExperienceLevel;
  unilateral: number;
  estimated_minutes: number;
  tags: string;
};

function mapExercise(row: ExerciseRow): CatalogExercise {
  return {
    id: row.id,
    name: row.name,
    primaryMuscleId: row.primary_muscle_id,
    primaryMuscle: row.primary_muscle,
    exerciseFamily: row.exercise_family,
    movementPattern: row.movement_pattern,
    exerciseType: row.exercise_type,
    difficulty: row.difficulty,
    unilateral: row.unilateral === 1,
    estimatedMinutes: row.estimated_minutes,
    tags: JSON.parse(row.tags) as string[],
  };
}

const exerciseSelect = `SELECT e.id, e.name, e.primary_muscle_id, m.name AS primary_muscle, e.exercise_family,
  e.movement_pattern, e.exercise_type, e.difficulty, e.unilateral, e.estimated_minutes, e.tags
  FROM exercise e JOIN muscle_group m ON m.id = e.primary_muscle_id`;

export async function listExercisesForMuscleIds(db: SQLiteDatabase, muscleIds: string[]) {
  if (muscleIds.length === 0) return [];
  const placeholders = muscleIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<ExerciseRow>(
    `${exerciseSelect} WHERE e.active = 1 AND (
      e.primary_muscle_id IN (${placeholders})
      OR e.primary_muscle_id IN (
        SELECT id FROM muscle_group WHERE parent_id IN (${placeholders})
      )
    ) ORDER BY m.name, e.name`,
    [...muscleIds, ...muscleIds],
  );
  return rows.map(mapExercise);
}

export async function listExercisesForMuscles(db: SQLiteDatabase, muscles: string[]) {
  if (muscles.length === 0) return [];
  const placeholders = muscles.map(() => '?').join(', ');
  const groups = await db.getAllAsync<{ id: string }>(
    `SELECT id FROM muscle_group WHERE name IN (${placeholders}) ORDER BY name`,
    muscles,
  );
  return listExercisesForMuscleIds(db, groups.map((group) => group.id));
}

export async function getExercisesByNames(db: SQLiteDatabase, names: string[]) {
  if (names.length === 0) return [];
  const placeholders = names.map(() => '?').join(', ');
  const rows = await db.getAllAsync<ExerciseRow>(`${exerciseSelect} WHERE e.name IN (${placeholders})`, names);
  const byName = new Map(rows.map((row) => [row.name, mapExercise(row)]));
  return names.flatMap((name) => byName.get(name) ?? []);
}

export async function getExercisesByIds(db: SQLiteDatabase, exerciseIds: string[]) {
  if (exerciseIds.length === 0) return [];
  const placeholders = exerciseIds.map(() => '?').join(', ');
  const rows = await db.getAllAsync<ExerciseRow>(`${exerciseSelect} WHERE e.active = 1 AND e.id IN (${placeholders})`, exerciseIds);
  const byId = new Map(rows.map((row) => [row.id, mapExercise(row)]));
  return exerciseIds.flatMap((exerciseId) => byId.get(exerciseId) ?? []);
}

export async function listMuscleGroups(db: SQLiteDatabase): Promise<MuscleGroup[]> {
  const rows = await db.getAllAsync<{ id: string; name: string; parent_id: string | null }>(
    `SELECT id, name, parent_id FROM muscle_group
     ORDER BY CASE WHEN parent_id IS NULL THEN 0 ELSE 1 END, name`,
  );
  return rows.map((row) => ({ id: row.id, name: row.name, parentId: row.parent_id }));
}

export async function listExerciseSummaries(db: SQLiteDatabase): Promise<EquipmentExerciseSummary[]> {
  return db.getAllAsync<EquipmentExerciseSummary>(
    `SELECT exercise.id, exercise.name, muscle.name AS muscle
     FROM exercise
     JOIN muscle_group muscle ON muscle.id = exercise.primary_muscle_id
     WHERE exercise.active = 1
     ORDER BY muscle.name, exercise.name`,
  );
}
