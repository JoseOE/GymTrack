import type {
  RoutinePreviewExercise, SharedRoutineExerciseV2, SharedRoutinePayload, SharedRoutinePayloadV1, SharedRoutinePayloadV2,
} from '@/domain/models';
import { isValidCardioDuration } from '@/utils/cardioTimer';

const SHARED_ROUTINE_SCHEMA = 'gymtrack-routine';
const CURRENT_SHARED_ROUTINE_VERSION = 2;
const MAX_SHARED_EXERCISES = 60;
const MAX_SHARED_NAME_LENGTH = 80;
const MAX_RAW_PAYLOAD_LENGTH = 10_000;
const payloadKeys = new Set(['schema', 'version', 'name', 'exercises']);
const strengthExerciseKeys = new Set(['exerciseId', 'mode']);
const cardioExerciseKeys = new Set(['exerciseId', 'mode', 'durationMinutes']);

export type SharedRoutineDecodeResult =
  | { status: 'valid'; payload: SharedRoutinePayload }
  | { status: 'unsupported-version' }
  | { status: 'invalid' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, allowed: Set<string>) {
  const keys = Object.keys(value);
  return keys.length === allowed.size && keys.every((key) => allowed.has(key));
}

function isValidExerciseId(value: unknown): value is string {
  return typeof value === 'string' && value.length > 0 && value.length <= 100;
}

function hasValidEnvelope(value: Record<string, unknown>) {
  return hasExactKeys(value, payloadKeys)
    && value.schema === SHARED_ROUTINE_SCHEMA
    && typeof value.name === 'string'
    && value.name.trim().length > 0
    && value.name.length <= MAX_SHARED_NAME_LENGTH
    && Array.isArray(value.exercises)
    && value.exercises.length > 0
    && value.exercises.length <= MAX_SHARED_EXERCISES;
}

export function validateSharedRoutineV1(value: unknown): value is SharedRoutinePayloadV1 {
  if (!isRecord(value) || !hasValidEnvelope(value) || value.version !== 1 || !Array.isArray(value.exercises)) return false;
  if (!value.exercises.every(isValidExerciseId)) return false;
  return new Set(value.exercises).size === value.exercises.length;
}

function validateV2Exercise(value: unknown): value is SharedRoutineExerciseV2 {
  if (!isRecord(value) || !isValidExerciseId(value.exerciseId)) return false;
  if (value.mode === 'strength') return hasExactKeys(value, strengthExerciseKeys);
  return value.mode === 'cardio'
    && hasExactKeys(value, cardioExerciseKeys)
    && typeof value.durationMinutes === 'number'
    && isValidCardioDuration(value.durationMinutes);
}

export function validateSharedRoutineV2(value: unknown): value is SharedRoutinePayloadV2 {
  if (!isRecord(value) || !hasValidEnvelope(value) || value.version !== 2 || !Array.isArray(value.exercises)) return false;
  if (!value.exercises.every(validateV2Exercise)) return false;
  const ids = value.exercises.map((exercise) => exercise.exerciseId);
  return new Set(ids).size === ids.length && value.exercises.filter((exercise) => exercise.mode === 'cardio').length <= 1;
}

export function validateSharedRoutine(value: unknown): value is SharedRoutinePayload {
  return validateSharedRoutineV1(value) || validateSharedRoutineV2(value);
}

export function encodeSharedRoutine(input: { name: string; exercises: RoutinePreviewExercise[] }) {
  const exercises: SharedRoutineExerciseV2[] = input.exercises.map((exercise) => exercise.mode === 'cardio'
    ? { exerciseId: exercise.exerciseId, mode: 'cardio', durationMinutes: exercise.targetDurationMinutes ?? exercise.estimatedMinutes }
    : { exerciseId: exercise.exerciseId, mode: 'strength' });
  const payload: SharedRoutinePayloadV2 = {
    schema: SHARED_ROUTINE_SCHEMA,
    version: CURRENT_SHARED_ROUTINE_VERSION,
    name: input.name.trim(),
    exercises,
  };
  if (!validateSharedRoutineV2(payload)) throw new Error('Esta rutina es demasiado grande o contiene datos que no se pueden compartir.');
  return JSON.stringify(payload);
}

export function decodeSharedRoutine(rawValue: string): SharedRoutineDecodeResult {
  if (!rawValue || rawValue.length > MAX_RAW_PAYLOAD_LENGTH) return { status: 'invalid' };
  try {
    const value: unknown = JSON.parse(rawValue);
    if (isRecord(value) && value.schema === SHARED_ROUTINE_SCHEMA && typeof value.version === 'number'
      && value.version !== 1 && value.version !== CURRENT_SHARED_ROUTINE_VERSION) {
      return { status: 'unsupported-version' };
    }
    return validateSharedRoutine(value) ? { status: 'valid', payload: value } : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}
