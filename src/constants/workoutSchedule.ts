import type { WeeklyPlanDraft, WeeklyPlanMuscle } from '@/domain/models';

const muscle = (id: string, name: string, orderIndex: number): WeeklyPlanMuscle => ({ id, name, orderIndex });

export const defaultWeeklyPlanTemplate: WeeklyPlanDraft = {
  name: 'Mi plan semanal',
  source: 'default',
  days: [
    { dayIndex: 1, sessionType: 'strength', displayName: 'Hombro + Bíceps + Tríceps + Antebrazo', estimatedMinutes: 70, isOptional: false, countsTowardGoal: true, targetExerciseCount: null, muscles: [muscle('hombro', 'Hombro', 0), muscle('biceps', 'Bíceps', 1), muscle('triceps', 'Tríceps', 2), muscle('antebrazo', 'Antebrazo', 3)] },
    { dayIndex: 2, sessionType: 'strength', displayName: 'Pecho + Espalda', estimatedMinutes: 60, isOptional: false, countsTowardGoal: true, targetExerciseCount: null, muscles: [muscle('pecho', 'Pecho', 0), muscle('espalda', 'Espalda', 1)] },
    { dayIndex: 3, sessionType: 'strength', displayName: 'Espalda + Bíceps + Antebrazo', estimatedMinutes: 65, isOptional: false, countsTowardGoal: true, targetExerciseCount: null, muscles: [muscle('espalda', 'Espalda', 0), muscle('biceps', 'Bíceps', 1), muscle('antebrazo', 'Antebrazo', 2)] },
    { dayIndex: 4, sessionType: 'strength', displayName: 'Pecho + Tríceps', estimatedMinutes: 55, isOptional: false, countsTowardGoal: true, targetExerciseCount: null, muscles: [muscle('pecho', 'Pecho', 0), muscle('triceps', 'Tríceps', 1)] },
    { dayIndex: 5, sessionType: 'strength', displayName: 'Pierna completa', estimatedMinutes: 75, isOptional: false, countsTowardGoal: true, targetExerciseCount: null, muscles: [muscle('cuadriceps', 'Cuádriceps', 0), muscle('femoral', 'Femoral', 1), muscle('gluteo', 'Glúteo', 2), muscle('pantorrilla', 'Pantorrilla', 3), muscle('aductores', 'Aductores', 4), muscle('abductores', 'Abductores', 5)] },
    { dayIndex: 6, sessionType: 'cardio', displayName: 'Cardio opcional', estimatedMinutes: 30, isOptional: true, countsTowardGoal: false, targetExerciseCount: null, muscles: [muscle('cardio', 'Cardio', 0)] },
    { dayIndex: 0, sessionType: 'rest', displayName: 'Descanso', estimatedMinutes: null, isOptional: false, countsTowardGoal: false, targetExerciseCount: null, muscles: [] },
  ],
};

export const dayMetadata = [
  { dayIndex: 0, dayName: 'Domingo', shortDay: 'D' },
  { dayIndex: 1, dayName: 'Lunes', shortDay: 'L' },
  { dayIndex: 2, dayName: 'Martes', shortDay: 'M' },
  { dayIndex: 3, dayName: 'Miércoles', shortDay: 'X' },
  { dayIndex: 4, dayName: 'Jueves', shortDay: 'J' },
  { dayIndex: 5, dayName: 'Viernes', shortDay: 'V' },
  { dayIndex: 6, dayName: 'Sábado', shortDay: 'S' },
] as const;

export function getDayMetadata(dayIndex: number) {
  const metadata = dayMetadata.find((day) => day.dayIndex === dayIndex);
  if (!metadata) throw new Error('Día semanal inválido.');
  return metadata;
}

export function getWeekDates(referenceDate: Date, weekOffset = 0) {
  const monday = new Date(referenceDate);
  const weekday = monday.getDay() || 7;
  monday.setDate(monday.getDate() - weekday + 1 + weekOffset * 7);
  monday.setHours(0, 0, 0, 0);
  return Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return date;
  });
}
