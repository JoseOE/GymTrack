import type { SQLiteDatabase } from 'expo-sqlite';

import { getExercisesByIds } from '@/database/repositories/catalogRepository';
import { getActiveTrainingLocation, listAvailableExerciseIds } from '@/database/repositories/equipmentRepository';
import type {
  RoutinePreviewExercise, SharedRoutineImportPreparation, SharedRoutinePayloadV1,
} from '@/domain/models';
import { estimateExerciseDuration, estimateRoutineDuration } from '@/utils/duration';

export { decodeSharedRoutine, encodeSharedRoutine, validateSharedRoutine } from '@/services/sharedRoutineCodec';

export async function prepareSharedRoutineImport(
  db: SQLiteDatabase,
  userId: string,
  payload: SharedRoutinePayloadV1,
): Promise<SharedRoutineImportPreparation> {
  const exercises = await getExercisesByIds(db, payload.exercises);
  const foundIds = new Set(exercises.map((exercise) => exercise.id));
  const missingExerciseCount = payload.exercises.filter((exerciseId) => !foundIds.has(exerciseId)).length;
  if (missingExerciseCount > 0) return { status: 'missing-exercises', missingExerciseCount };

  const location = await getActiveTrainingLocation(db, userId);
  if (!location) throw new Error('Configura una ubicación de entrenamiento antes de importar una rutina.');
  const availableExerciseIds = await listAvailableExerciseIds(db, userId, location.id);
  const unavailableEquipmentCount = exercises.filter((exercise) => !availableExerciseIds.has(exercise.id)).length;
  const previewExercises: RoutinePreviewExercise[] = exercises.map((exercise) => ({
    exerciseId: exercise.id,
    name: exercise.name,
    muscle: exercise.primaryMuscle,
    targetMuscleId: exercise.primaryMuscleId,
    targetMuscleName: exercise.primaryMuscle,
    exerciseFamily: exercise.exerciseFamily,
    exerciseType: exercise.exerciseType,
    difficulty: exercise.difficulty,
    estimatedMinutes: estimateExerciseDuration(exercise),
  }));
  const estimatedDurationMinutes = estimateRoutineDuration(previewExercises);
  return {
    status: 'ready',
    unavailableEquipmentCount,
    preview: {
      name: payload.name.trim(),
      targetDurationMinutes: estimatedDurationMinutes,
      estimatedDurationMinutes,
      exercises: previewExercises,
      locationId: location.id,
      locationName: location.name,
      availabilityMessages: [],
    },
  };
}
