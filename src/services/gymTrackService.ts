import type { SQLiteDatabase } from 'expo-sqlite';

import { listExercisesForMuscleIds } from '@/database/repositories/catalogRepository';
import { getActiveTrainingLocation, listAvailableExerciseIds } from '@/database/repositories/equipmentRepository';
import { saveRoutine } from '@/database/repositories/routineRepository';
import type { CatalogExercise, RoutinePreview, RoutinePreviewExercise, RoutineRequest } from '@/domain/models';
import {
  calculateRoutineDurationBreakdown, estimateExerciseDuration, MAX_ROUTINE_DURATION_MINUTES, MIN_ROUTINE_DURATION_MINUTES,
} from '@/utils/duration';
import { isValidCardioDuration } from '@/utils/cardioTimer';

function shuffled<T>(items: T[]) {
  return [...items].sort(() => Math.random() - 0.5);
}

function toPreviewExercise(
  exercise: CatalogExercise,
  targetMuscleId: string,
  targetMuscleName: string,
  targetDurationMinutes: number | null = null,
): RoutinePreviewExercise {
  const mode = exercise.exerciseType === 'cardio' ? 'cardio' : 'strength';
  return {
    exerciseId: exercise.id,
    name: exercise.name,
    muscle: exercise.primaryMuscle,
    targetMuscleId,
    targetMuscleName,
    exerciseFamily: exercise.exerciseFamily,
    exerciseType: exercise.exerciseType,
    difficulty: exercise.difficulty,
    estimatedMinutes: mode === 'cardio' && targetDurationMinutes !== null
      ? targetDurationMinutes
      : estimateExerciseDuration(exercise),
    mode,
    targetDurationMinutes: mode === 'cardio' ? targetDurationMinutes ?? exercise.estimatedMinutes : null,
  };
}

function validateRoutineRequest(request: RoutineRequest) {
  if (request.muscleTargets.length === 0 && !request.cardioTarget) throw new Error('Selecciona al menos un grupo muscular o Cardio.');
  if (!Number.isInteger(request.targetDurationMinutes) || request.targetDurationMinutes < MIN_ROUTINE_DURATION_MINUTES || request.targetDurationMinutes > MAX_ROUTINE_DURATION_MINUTES) {
    throw new Error(`La duración objetivo debe estar entre ${MIN_ROUTINE_DURATION_MINUTES} y ${MAX_ROUTINE_DURATION_MINUTES} minutos.`);
  }
  const muscleIds = new Set<string>();
  for (const target of request.muscleTargets) {
    if (target.muscleId === 'cardio') throw new Error('Cardio debe configurarse mediante una duración.');
    if (!target.muscleId || !target.muscleName.trim()) throw new Error('La selección contiene un músculo inválido.');
    if (muscleIds.has(target.muscleId)) throw new Error(`El músculo ${target.muscleName} está duplicado.`);
    if (!Number.isInteger(target.exerciseCount) || target.exerciseCount < 1 || target.exerciseCount > 6) {
      throw new Error(`${target.muscleName} debe solicitar entre 1 y 6 ejercicios.`);
    }
    muscleIds.add(target.muscleId);
  }
  if (request.cardioTarget && !isValidCardioDuration(request.cardioTarget.durationMinutes)) {
    throw new Error('La duración de Cardio debe estar entre 10 y 60 minutos, en incrementos de 5.');
  }
}

function getPreviewDurationFields(exercises: RoutinePreviewExercise[]) {
  const duration = calculateRoutineDurationBreakdown(exercises);
  return {
    warmUpEstimatedMinutes: duration.warmUpEstimatedMinutes,
    strengthEstimatedMinutes: duration.strengthEstimatedMinutes,
    cardioEstimatedMinutes: duration.cardioEstimatedMinutes,
    mainWorkoutEstimatedMinutes: duration.mainWorkoutEstimatedMinutes,
    estimatedDurationMinutes: duration.totalEstimatedMinutes,
  };
}

export async function generateRoutinePreview(db: SQLiteDatabase, userId: string, request: RoutineRequest): Promise<RoutinePreview> {
  validateRoutineRequest(request);
  const location = await getActiveTrainingLocation(db, userId);
  if (!location) throw new Error('Configura una ubicación de entrenamiento antes de generar una rutina.');
  const availableIds = await listAvailableExerciseIds(db, userId, location.id);
  const selected: RoutinePreviewExercise[] = [];
  const selectedIds = new Set<string>();
  const availabilityMessages: string[] = [];

  for (const target of request.muscleTargets) {
    const options = shuffled(
      (await listExercisesForMuscleIds(db, [target.muscleId]))
        .filter((exercise) => availableIds.has(exercise.id) && !selectedIds.has(exercise.id)),
    );
    const matches = options.slice(0, target.exerciseCount);
    for (const exercise of matches) {
      selected.push(toPreviewExercise(exercise, target.muscleId, target.muscleName));
      selectedIds.add(exercise.id);
    }
    if (matches.length < target.exerciseCount) {
      availabilityMessages.push(`${target.muscleName}: solicitaste ${target.exerciseCount} ejercicios y encontramos ${matches.length} compatibles con ${location.name}.`);
    }
  }

  if (request.cardioTarget) {
    const options = shuffled(
      (await listExercisesForMuscleIds(db, ['cardio']))
        .filter((exercise) => exercise.exerciseType === 'cardio' && availableIds.has(exercise.id) && !selectedIds.has(exercise.id)),
    );
    const cardio = options[0];
    if (cardio) {
      selected.push(toPreviewExercise(cardio, 'cardio', 'Cardio', request.cardioTarget.durationMinutes));
      selectedIds.add(cardio.id);
    } else if (selected.length > 0) {
      availabilityMessages.push(`No encontramos equipo de cardio disponible en ${location.name}.`);
    } else {
      throw new Error(`No encontramos equipo de cardio disponible en ${location.name}.`);
    }
  }

  if (selected.length === 0) throw new Error(`No encontramos ejercicios compatibles con el equipo de ${location.name}.`);
  return {
    name: [...request.muscleTargets.map((target) => target.muscleName), ...(request.cardioTarget ? ['Cardio'] : [])].join(' + '),
    targetDurationMinutes: request.targetDurationMinutes,
    ...getPreviewDurationFields(selected),
    exercises: selected,
    locationId: location.id,
    locationName: location.name,
    availabilityMessages,
  };
}

export async function replaceRoutinePreviewExercise(
  db: SQLiteDatabase,
  userId: string,
  preview: RoutinePreview,
  exerciseIndex: number,
  recentlyReplacedExerciseIds: string[] = [],
): Promise<RoutinePreview> {
  const current = preview.exercises[exerciseIndex];
  if (!current) throw new Error('El ejercicio que intentas cambiar ya no está disponible.');
  const location = await getActiveTrainingLocation(db, userId);
  if (!location || location.id !== preview.locationId) {
    throw new Error('La ubicación activa cambió. Regenera la rutina antes de reemplazar ejercicios.');
  }
  const availableIds = await listAvailableExerciseIds(db, userId, location.id);
  const routineIds = new Set(preview.exercises.map((exercise) => exercise.exerciseId));
  const alternatives = (await listExercisesForMuscleIds(db, [current.targetMuscleId]))
    .filter((exercise) => availableIds.has(exercise.id) && !routineIds.has(exercise.id));
  const withoutRecent = alternatives.filter((exercise) => !recentlyReplacedExerciseIds.includes(exercise.id));
  const candidates = withoutRecent.length > 0 ? withoutRecent : alternatives;
  const replacement = shuffled(candidates).sort((left, right) => {
    const leftScore = Number(left.exerciseFamily !== current.exerciseFamily) * 2 + Number(left.difficulty === current.difficulty);
    const rightScore = Number(right.exerciseFamily !== current.exerciseFamily) * 2 + Number(right.difficulty === current.difficulty);
    return rightScore - leftScore;
  })[0];
  if (!replacement) {
    throw new Error(`No encontramos otra alternativa disponible para ${current.targetMuscleName} en ${location.name}.`);
  }

  const exercises = preview.exercises.map((exercise, index) => index === exerciseIndex
    ? toPreviewExercise(replacement, current.targetMuscleId, current.targetMuscleName, current.targetDurationMinutes)
    : exercise);
  return { ...preview, exercises, ...getPreviewDurationFields(exercises) };
}

export { saveRoutine };
