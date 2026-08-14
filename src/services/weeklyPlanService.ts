import { getDayMetadata } from '@/constants/workoutSchedule';
import type { WeeklyPlan, WeeklyPlanDay, WeeklyPlanDayDraft, WeeklyPlanDraft, WeeklyPlanMuscle } from '@/domain/models';

export function getPlanForDate(plan: WeeklyPlan, date: Date) {
  const day = plan.days.find((item) => item.dayIndex === date.getDay());
  if (!day) throw new Error('El plan activo no contiene el día solicitado.');
  return day;
}

export function getNextPlanDay(plan: WeeklyPlan, date: Date) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  return getPlanForDate(plan, nextDate);
}

export function getWeeklyTarget(plan: WeeklyPlan | WeeklyPlanDraft) {
  return plan.days.filter((day) => day.countsTowardGoal).length;
}

export function getDefaultExerciseCount(day: WeeklyPlanDay | WeeklyPlanDayDraft) {
  if (day.sessionType === 'rest') return 0;
  if (day.targetExerciseCount !== null) return day.targetExerciseCount;
  if (day.sessionType === 'cardio') return 1;
  if (day.muscles.length === 1) return 1;
  return Math.min(6, Math.max(3, day.muscles.length));
}

function sameMuscles(muscles: WeeklyPlanMuscle[], ids: string[]) {
  return muscles.length === ids.length && ids.every((id) => muscles.some((muscle) => muscle.id === id));
}

export function derivePlanDayDisplayName(day: Pick<WeeklyPlanDayDraft, 'sessionType' | 'muscles' | 'isOptional'>) {
  if (day.sessionType === 'rest') return 'Descanso';
  if (day.sessionType === 'cardio') return day.isOptional ? 'Cardio opcional' : 'Cardio';
  if (sameMuscles(day.muscles, ['cuadriceps', 'femoral', 'gluteo', 'pantorrilla', 'aductores', 'abductores'])) return 'Pierna completa';
  return day.muscles.map((muscle) => muscle.name).join(' + ');
}

export function validateWeeklyPlan(plan: WeeklyPlanDraft) {
  if (plan.days.length !== 7) throw new Error('El plan debe contener exactamente 7 días.');
  const dayIndexes = new Set(plan.days.map((day) => day.dayIndex));
  if (dayIndexes.size !== 7 || [...dayIndexes].some((dayIndex) => dayIndex < 0 || dayIndex > 6)) throw new Error('Cada día de la semana debe aparecer una sola vez.');
  for (const day of plan.days) {
    const muscleIds = day.muscles.map((muscle) => muscle.id);
    if (new Set(muscleIds).size !== muscleIds.length) throw new Error(`${getDayMetadata(day.dayIndex).dayName} tiene músculos duplicados.`);
    if (day.sessionType === 'rest' && (day.muscles.length > 0 || day.estimatedMinutes !== null || day.isOptional || day.countsTowardGoal)) throw new Error('Los días de descanso no pueden tener músculos, duración ni contar para el objetivo.');
    if (day.sessionType !== 'rest' && (!day.estimatedMinutes || day.estimatedMinutes <= 0)) throw new Error(`${getDayMetadata(day.dayIndex).dayName} necesita una duración válida.`);
    if (day.sessionType === 'strength' && day.muscles.length === 0) throw new Error(`${getDayMetadata(day.dayIndex).dayName} necesita al menos un músculo.`);
    if (day.sessionType === 'cardio' && day.muscles.length === 0) throw new Error(`${getDayMetadata(day.dayIndex).dayName} necesita el grupo Cardio.`);
    if (day.targetExerciseCount !== null && (day.targetExerciseCount < 1 || day.targetExerciseCount > 20)) throw new Error('La cantidad objetivo de ejercicios no es válida.');
  }
  const target = getWeeklyTarget(plan);
  if (target < 1 || target > 7) throw new Error('El objetivo semanal debe estar entre 1 y 7 días.');
}

export function toWeeklyPlanDraft(plan: WeeklyPlan): WeeklyPlanDraft {
  return {
    name: plan.name,
    source: plan.source,
    days: plan.days.map(({ dayIndex, sessionType, displayName, estimatedMinutes, isOptional, countsTowardGoal, targetExerciseCount, muscles }) => ({
      dayIndex,
      sessionType,
      displayName,
      estimatedMinutes,
      isOptional,
      countsTowardGoal,
      targetExerciseCount,
      muscles: muscles.map((muscle) => ({ ...muscle })),
    })),
  };
}
