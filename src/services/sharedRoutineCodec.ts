import type { SharedRoutinePayloadV1 } from '@/domain/models';

const SHARED_ROUTINE_SCHEMA = 'gymtrack-routine';
const SHARED_ROUTINE_VERSION = 1;
const MAX_SHARED_EXERCISES = 60;
const MAX_SHARED_NAME_LENGTH = 80;
const MAX_RAW_PAYLOAD_LENGTH = 10_000;
const allowedKeys = new Set(['schema', 'version', 'name', 'exercises']);

export type SharedRoutineDecodeResult =
  | { status: 'valid'; payload: SharedRoutinePayloadV1 }
  | { status: 'unsupported-version' }
  | { status: 'invalid' };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function validateSharedRoutine(value: unknown): value is SharedRoutinePayloadV1 {
  if (!isRecord(value) || Object.keys(value).some((key) => !allowedKeys.has(key))) return false;
  if (value.schema !== SHARED_ROUTINE_SCHEMA || value.version !== SHARED_ROUTINE_VERSION) return false;
  if (typeof value.name !== 'string' || value.name.trim().length === 0 || value.name.length > MAX_SHARED_NAME_LENGTH) return false;
  if (!Array.isArray(value.exercises) || value.exercises.length === 0 || value.exercises.length > MAX_SHARED_EXERCISES) return false;
  if (!value.exercises.every((exerciseId) => typeof exerciseId === 'string' && exerciseId.length > 0 && exerciseId.length <= 100)) return false;
  return new Set(value.exercises).size === value.exercises.length;
}

export function encodeSharedRoutine(input: { name: string; exerciseIds: string[] }) {
  const payload: SharedRoutinePayloadV1 = {
    schema: SHARED_ROUTINE_SCHEMA,
    version: SHARED_ROUTINE_VERSION,
    name: input.name.trim(),
    exercises: [...input.exerciseIds],
  };
  if (!validateSharedRoutine(payload)) throw new Error('Esta rutina es demasiado grande o contiene datos que no se pueden compartir.');
  return JSON.stringify(payload);
}

export function decodeSharedRoutine(rawValue: string): SharedRoutineDecodeResult {
  if (!rawValue || rawValue.length > MAX_RAW_PAYLOAD_LENGTH) return { status: 'invalid' };
  try {
    const value: unknown = JSON.parse(rawValue);
    if (isRecord(value) && value.schema === SHARED_ROUTINE_SCHEMA && typeof value.version === 'number' && value.version !== SHARED_ROUTINE_VERSION) {
      return { status: 'unsupported-version' };
    }
    return validateSharedRoutine(value) ? { status: 'valid', payload: value } : { status: 'invalid' };
  } catch {
    return { status: 'invalid' };
  }
}
