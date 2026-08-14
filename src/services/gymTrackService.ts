import type { SQLiteDatabase } from 'expo-sqlite';

import { listExercisesForMuscles } from '@/database/repositories/catalogRepository';
import { saveRoutine } from '@/database/repositories/routineRepository';
import type { RoutinePreview } from '@/domain/models';

export type RoutineRequest = {
  muscles: string[];
  exercisesPerMuscle: number;
  durationMinutes: number;
};

export async function generateRoutinePreview(db: SQLiteDatabase, request: RoutineRequest): Promise<RoutinePreview> {
  const selected = [];
  for (const muscle of request.muscles) {
    const options = await listExercisesForMuscles(db, [muscle]);
    const shuffled = [...options].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, request.exercisesPerMuscle));
  }
  const unique = [...new Map(selected.map((exercise) => [exercise.id, exercise])).values()];
  const fitted = [];
  let estimatedMinutes = 0;
  for (const exercise of unique) {
    if (fitted.length > 0 && estimatedMinutes + exercise.estimatedMinutes > request.durationMinutes) break;
    fitted.push(exercise);
    estimatedMinutes += exercise.estimatedMinutes;
  }
  if (fitted.length === 0) throw new Error('No se encontraron ejercicios para esa selección.');
  return {
    name: request.muscles.join(' + '),
    estimatedMinutes,
    exercises: fitted.map((exercise) => ({ exerciseId: exercise.id, name: exercise.name, muscle: exercise.primaryMuscle, estimatedMinutes: exercise.estimatedMinutes })),
  };
}

export { saveRoutine };
