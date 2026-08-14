import type { SQLiteDatabase } from 'expo-sqlite';

import type { CatalogExercise, ExperienceLevel } from '@/domain/models';

type ExerciseRow = {
  id: string;
  name: string;
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

const exerciseSelect = `SELECT e.id, e.name, m.name AS primary_muscle, e.exercise_family,
  e.movement_pattern, e.exercise_type, e.difficulty, e.unilateral, e.estimated_minutes, e.tags
  FROM exercise e JOIN muscle_group m ON m.id = e.primary_muscle_id`;

export async function listExercisesForMuscles(db: SQLiteDatabase, muscles: string[]) {
  if (muscles.length === 0) return [];
  const placeholders = muscles.map(() => '?').join(', ');
  const rows = await db.getAllAsync<ExerciseRow>(
    `${exerciseSelect} WHERE e.active = 1 AND (m.name IN (${placeholders}) OR m.parent_id IN (
      SELECT id FROM muscle_group WHERE name IN (${placeholders})
    )) ORDER BY m.name, e.name`,
    [...muscles, ...muscles],
  );
  return rows.map(mapExercise);
}

export async function getExercisesByNames(db: SQLiteDatabase, names: string[]) {
  if (names.length === 0) return [];
  const placeholders = names.map(() => '?').join(', ');
  const rows = await db.getAllAsync<ExerciseRow>(`${exerciseSelect} WHERE e.name IN (${placeholders})`, names);
  const byName = new Map(rows.map((row) => [row.name, mapExercise(row)]));
  return names.flatMap((name) => byName.get(name) ?? []);
}
