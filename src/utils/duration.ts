import type { CatalogExercise, ExerciseMode, RoutinePreviewExercise } from '@/domain/models';

export const MIN_ROUTINE_DURATION_MINUTES = 20;
export const MAX_ROUTINE_DURATION_MINUTES = 180;
export const ROUTINE_DURATION_STEP_MINUTES = 5;

type StrengthPrescription = {
  targetSets?: number;
  minReps?: number;
  maxReps?: number;
  restSeconds?: number;
};

export function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  if (safeMinutes < 60) return `${safeMinutes} min`;
  const hours = Math.floor(safeMinutes / 60);
  const remainingMinutes = safeMinutes % 60;
  return remainingMinutes === 0 ? `${hours} h` : `${hours} h ${remainingMinutes} min`;
}

export function estimateExerciseDuration(
  exercise: Pick<CatalogExercise, 'exerciseType' | 'estimatedMinutes'>,
  prescription: StrengthPrescription = {},
) {
  if (exercise.exerciseType === 'cardio') return Math.max(1, Math.round(exercise.estimatedMinutes));

  const targetSets = prescription.targetSets ?? 3;
  const minReps = prescription.minReps ?? 8;
  const maxReps = prescription.maxReps ?? 12;
  const restSeconds = prescription.restSeconds ?? 90;
  if (targetSets <= 0 || minReps <= 0 || maxReps < minReps || restSeconds < 0) {
    return Math.max(1, Math.round(exercise.estimatedMinutes));
  }

  const averageReps = (minReps + maxReps) / 2;
  const executionSeconds = targetSets * averageReps * 3.5;
  const restTimeSeconds = Math.max(0, targetSets - 1) * restSeconds;
  const setupAndTransitionSeconds = 60;
  return Math.max(1, Math.round((executionSeconds + restTimeSeconds + setupAndTransitionSeconds) / 60));
}

export type RoutineDurationBreakdown = {
  warmUpEstimatedMinutes: number;
  strengthEstimatedMinutes: number;
  cardioEstimatedMinutes: number;
  mainWorkoutEstimatedMinutes: number;
  totalEstimatedMinutes: number;
};

export function calculateRoutineDurationBreakdown(
  exercises: Pick<RoutinePreviewExercise, 'estimatedMinutes' | 'mode'>[],
): RoutineDurationBreakdown {
  const strengthEstimatedMinutes = exercises
    .filter((exercise) => exercise.mode === 'strength')
    .reduce((total, exercise) => total + exercise.estimatedMinutes, 0);
  const cardioEstimatedMinutes = exercises
    .filter((exercise) => exercise.mode === 'cardio')
    .reduce((total, exercise) => total + exercise.estimatedMinutes, 0);
  const warmUpEstimatedMinutes = strengthEstimatedMinutes > 0 ? 7 : cardioEstimatedMinutes > 0 ? 5 : 0;
  const mainWorkoutEstimatedMinutes = strengthEstimatedMinutes + cardioEstimatedMinutes;
  return {
    warmUpEstimatedMinutes,
    strengthEstimatedMinutes,
    cardioEstimatedMinutes,
    mainWorkoutEstimatedMinutes,
    totalEstimatedMinutes: warmUpEstimatedMinutes + mainWorkoutEstimatedMinutes,
  };
}

export function estimateRoutineDuration(exercises: Pick<RoutinePreviewExercise, 'estimatedMinutes' | 'mode'>[]) {
  return calculateRoutineDurationBreakdown(exercises).totalEstimatedMinutes;
}

export type PersistedRoutinePrescription = {
  exerciseType: CatalogExercise['exerciseType'];
  catalogEstimatedMinutes: number;
  mode: ExerciseMode;
  targetDurationMinutes: number | null;
  targetSets: number;
  minReps: number;
  maxReps: number;
  restSeconds: number;
};

export function estimatePersistedRoutineDuration(exercises: PersistedRoutinePrescription[]) {
  const mainWorkoutEstimatedMinutes = exercises.reduce((total, exercise) => {
    if (exercise.mode === 'cardio') {
      return total + Math.max(1, Math.round(exercise.targetDurationMinutes ?? exercise.catalogEstimatedMinutes));
    }
    return total + estimateExerciseDuration(
      { exerciseType: exercise.exerciseType, estimatedMinutes: exercise.catalogEstimatedMinutes },
      exercise,
    );
  }, 0);
  const hasStrength = exercises.some((exercise) => exercise.mode === 'strength');
  const warmUpEstimatedMinutes = hasStrength ? 7 : exercises.length > 0 ? 5 : 0;
  return mainWorkoutEstimatedMinutes + warmUpEstimatedMinutes;
}

export function describeDurationDifference(targetMinutes: number, estimatedMinutes: number) {
  const difference = estimatedMinutes - targetMinutes;
  if (difference === 0) return 'Tu rutina está cerca de tu duración objetivo.';
  if (Math.abs(difference) <= 10) {
    return `Tu rutina está cerca de tu duración objetivo: aproximadamente ${formatDuration(Math.abs(difference))} por ${difference > 0 ? 'encima' : 'debajo'}.`;
  }
  if (difference > 0) {
    return `Tu rutina está estimada en ${formatDuration(estimatedMinutes)}, aproximadamente ${formatDuration(difference)} por encima de tu objetivo de ${formatDuration(targetMinutes)}.`;
  }
  return `Tu rutina está aproximadamente ${formatDuration(Math.abs(difference))} por debajo de tu objetivo.`;
}
