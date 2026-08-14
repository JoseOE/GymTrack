export type WorkoutScheduleEntry = {
  dayIndex: number;
  shortDay: string;
  dayName: string;
  workoutName: string;
  muscles: string[];
  estimatedMinutes: number | null;
  isRest: boolean;
  isOptional: boolean;
};

export const workoutSchedule: readonly WorkoutScheduleEntry[] = [
  { dayIndex: 1, shortDay: 'L', dayName: 'Lunes', workoutName: 'Hombro + Bíceps + Tríceps + Antebrazo', muscles: ['Hombro', 'Bíceps', 'Tríceps', 'Antebrazo'], estimatedMinutes: 70, isRest: false, isOptional: false },
  { dayIndex: 2, shortDay: 'M', dayName: 'Martes', workoutName: 'Pecho + Espalda', muscles: ['Pecho', 'Espalda'], estimatedMinutes: 60, isRest: false, isOptional: false },
  { dayIndex: 3, shortDay: 'X', dayName: 'Miércoles', workoutName: 'Espalda + Bíceps + Antebrazo', muscles: ['Espalda', 'Bíceps', 'Antebrazo'], estimatedMinutes: 65, isRest: false, isOptional: false },
  { dayIndex: 4, shortDay: 'J', dayName: 'Jueves', workoutName: 'Pecho + Tríceps', muscles: ['Pecho', 'Tríceps'], estimatedMinutes: 55, isRest: false, isOptional: false },
  { dayIndex: 5, shortDay: 'V', dayName: 'Viernes', workoutName: 'Pierna completa', muscles: ['Cuádriceps', 'Femoral', 'Glúteo', 'Pantorrilla', 'Aductores', 'Abductores'], estimatedMinutes: 75, isRest: false, isOptional: false },
  { dayIndex: 6, shortDay: 'S', dayName: 'Sábado', workoutName: 'Cardio opcional', muscles: ['Cardio'], estimatedMinutes: 30, isRest: false, isOptional: true },
  { dayIndex: 0, shortDay: 'D', dayName: 'Domingo', workoutName: 'Descanso', muscles: [], estimatedMinutes: null, isRest: true, isOptional: false },
];

export function getScheduleForDate(date: Date) {
  const entry = workoutSchedule.find((item) => item.dayIndex === date.getDay());
  if (!entry) throw new Error('No se encontró el plan para este día.');
  return entry;
}

export function getNextSchedule(date: Date) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 1);
  return getScheduleForDate(nextDate);
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
