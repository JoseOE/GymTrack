import type { CardioTimerState } from '@/domain/models';

export const MIN_CARDIO_DURATION_MINUTES = 10;
export const MAX_CARDIO_DURATION_MINUTES = 60;
export const CARDIO_DURATION_STEP_MINUTES = 5;
export const DEFAULT_CARDIO_DURATION_MINUTES = 30;

export type CardioTimerSnapshot = {
  state: CardioTimerState;
  targetDurationMinutes: number;
  elapsedSeconds: number;
  lastStartedAt: string | null;
};

export function isValidCardioDuration(minutes: number) {
  return Number.isInteger(minutes)
    && minutes >= MIN_CARDIO_DURATION_MINUTES
    && minutes <= MAX_CARDIO_DURATION_MINUTES
    && minutes % CARDIO_DURATION_STEP_MINUTES === 0;
}

export function getCardioElapsedSeconds(snapshot: CardioTimerSnapshot, nowMs = Date.now()) {
  const persisted = Math.max(0, Math.floor(snapshot.elapsedSeconds));
  if (snapshot.state !== 'running' || !snapshot.lastStartedAt) return persisted;
  const startedAtMs = new Date(snapshot.lastStartedAt).getTime();
  if (!Number.isFinite(startedAtMs)) return persisted;
  return persisted + Math.max(0, Math.floor((nowMs - startedAtMs) / 1000));
}

export function getCardioRemainingSeconds(snapshot: CardioTimerSnapshot, nowMs = Date.now()) {
  const targetSeconds = snapshot.targetDurationMinutes * 60;
  return Math.max(0, targetSeconds - getCardioElapsedSeconds(snapshot, nowMs));
}

export function formatTimer(seconds: number) {
  const safeSeconds = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safeSeconds / 60);
  const remainder = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}`;
}
