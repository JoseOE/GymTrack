import type { SQLiteDatabase } from 'expo-sqlite';

import { listExercisesForMuscles } from '@/database/repositories/catalogRepository';
import { getActiveTrainingLocation, listAvailableExerciseIds } from '@/database/repositories/equipmentRepository';
import { saveRoutine } from '@/database/repositories/routineRepository';
import type { RoutinePreview } from '@/domain/models';

export type RoutineRequest = {
  muscles: string[];
  exercisesPerMuscle: number;
  durationMinutes: number;
};

export async function generateRoutinePreview(db: SQLiteDatabase, userId: string, request: RoutineRequest): Promise<RoutinePreview> {
  const location = await getActiveTrainingLocation(db, userId);
  if (!location) throw new Error('Configura una ubicación de entrenamiento antes de generar una rutina.');
  const availableIds = await listAvailableExerciseIds(db, userId, location.id);
  const selected = [];
  for (const muscle of request.muscles) {
    const options = (await listExercisesForMuscles(db, [muscle])).filter((exercise) => availableIds.has(exercise.id));
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
  if (fitted.length === 0) throw new Error(`No encontramos ejercicios compatibles con el equipo de ${location.name}.`);
  const requestedCount = request.exercisesPerMuscle * request.muscles.length;
  return {
    name: request.muscles.join(' + '),
    estimatedMinutes,
    exercises: fitted.map((exercise) => ({ exerciseId: exercise.id, name: exercise.name, muscle: exercise.primaryMuscle, estimatedMinutes: exercise.estimatedMinutes })),
    locationName: location.name,
    availabilityMessage: fitted.length < requestedCount
      ? `Encontramos ${fitted.length} ejercicios compatibles con el equipo de ${location.name}.`
      : null,
  };
}

export { saveRoutine };
