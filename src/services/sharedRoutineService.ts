import type { SQLiteDatabase } from 'expo-sqlite';

import { getExercisesByIds } from '@/database/repositories/catalogRepository';
import { getActiveTrainingLocation, listAvailableExerciseIds } from '@/database/repositories/equipmentRepository';
import type {
  ExerciseMode, RoutinePreviewExercise, SharedRoutineImportPreparation, SharedRoutinePayload,
} from '@/domain/models';
import { calculateRoutineDurationBreakdown, estimateExerciseDuration } from '@/utils/duration';

export { decodeSharedRoutine, encodeSharedRoutine, validateSharedRoutine } from '@/services/sharedRoutineCodec';

export async function prepareSharedRoutineImport(
  db: SQLiteDatabase,
  userId: string,
  payload: SharedRoutinePayload,
): Promise<SharedRoutineImportPreparation> {
  const exerciseIds = payload.version === 1 ? payload.exercises : payload.exercises.map((exercise) => exercise.exerciseId);
  const catalogExercises = await getExercisesByIds(db, exerciseIds);
  const foundIds = new Set(catalogExercises.map((exercise) => exercise.id));
  const missingExerciseCount = exerciseIds.filter((exerciseId) => !foundIds.has(exerciseId)).length;
  if (missingExerciseCount > 0) return { status: 'missing-exercises', missingExerciseCount };

  const v2ById = new Map(payload.version === 2 ? payload.exercises.map((exercise) => [exercise.exerciseId, exercise]) : []);
  let v1CardioIncluded = false;
  const exercises = catalogExercises.flatMap((exercise) => {
    if (payload.version === 2) {
      const shared = v2ById.get(exercise.id);
      const catalogMode: ExerciseMode = exercise.exerciseType === 'cardio' ? 'cardio' : 'strength';
      if (!shared || shared.mode !== catalogMode) throw new Error(`La prescripción de ${exercise.name} no coincide con el catálogo local.`);
      return [{ exercise, mode: shared.mode, targetDurationMinutes: shared.mode === 'cardio' ? shared.durationMinutes : null }];
    }
    const mode: ExerciseMode = exercise.exerciseType === 'cardio' ? 'cardio' : 'strength';
    if (mode === 'cardio' && v1CardioIncluded) return [];
    if (mode === 'cardio') v1CardioIncluded = true;
    return [{ exercise, mode, targetDurationMinutes: mode === 'cardio' ? exercise.estimatedMinutes : null }];
  });

  const location = await getActiveTrainingLocation(db, userId);
  if (!location) throw new Error('Configura una ubicación de entrenamiento antes de importar una rutina.');
  const availableExerciseIds = await listAvailableExerciseIds(db, userId, location.id);
  const unavailableEquipmentCount = exercises.filter(({ exercise }) => !availableExerciseIds.has(exercise.id)).length;
  const previewExercises: RoutinePreviewExercise[] = exercises.map(({ exercise, mode, targetDurationMinutes }) => ({
    exerciseId: exercise.id,
    name: exercise.name,
    muscle: exercise.primaryMuscle,
    targetMuscleId: exercise.primaryMuscleId,
    targetMuscleName: exercise.primaryMuscle,
    exerciseFamily: exercise.exerciseFamily,
    exerciseType: exercise.exerciseType,
    difficulty: exercise.difficulty,
    estimatedMinutes: mode === 'cardio' ? targetDurationMinutes ?? exercise.estimatedMinutes : estimateExerciseDuration(exercise),
    mode,
    targetDurationMinutes,
  }));
  const duration = calculateRoutineDurationBreakdown(previewExercises);
  return {
    status: 'ready',
    unavailableEquipmentCount,
    payloadVersion: payload.version,
    preview: {
      name: payload.name.trim(),
      targetDurationMinutes: duration.totalEstimatedMinutes,
      warmUpEstimatedMinutes: duration.warmUpEstimatedMinutes,
      strengthEstimatedMinutes: duration.strengthEstimatedMinutes,
      cardioEstimatedMinutes: duration.cardioEstimatedMinutes,
      mainWorkoutEstimatedMinutes: duration.mainWorkoutEstimatedMinutes,
      estimatedDurationMinutes: duration.totalEstimatedMinutes,
      exercises: previewExercises,
      locationId: location.id,
      locationName: location.name,
      availabilityMessages: [],
    },
  };
}
