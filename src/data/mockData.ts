import type { Exercise, WorkoutDay } from '@/types/workout';

export const weekPlan: WorkoutDay[] = [
  { shortDay: 'X', day: 'Miércoles', date: 12, workout: 'Espalda + Bíceps + Antebrazo', duration: '65 min', status: 'completed' },
  { shortDay: 'J', day: 'Jueves', date: 13, workout: 'Pecho + Tríceps', duration: '55 min', status: 'completed' },
  { shortDay: 'V', day: 'Viernes', date: 14, workout: 'Pierna completa', duration: '75 min', status: 'today' },
  { shortDay: 'S', day: 'Sábado', date: 15, workout: 'Cardio opcional', duration: '30 min', status: 'upcoming' },
  { shortDay: 'D', day: 'Domingo', date: 16, workout: 'Descanso', status: 'rest' },
  { shortDay: 'L', day: 'Lunes', date: 17, workout: 'Hombro + Bíceps + Tríceps + Antebrazo', duration: '70 min', status: 'upcoming' },
  { shortDay: 'M', day: 'Martes', date: 18, workout: 'Pecho + Espalda', duration: '60 min', status: 'upcoming' },
];

export const weeklyProgress = {
  completed: 2,
  target: 5,
  completedDays: ['X', 'J'] as readonly string[],
} as const;

export const exercises: Exercise[] = [
  { id: 'pull-down', name: 'Jalón al pecho', muscle: 'Espalda', sets: [{ number: 1, weight: 45, reps: 12, completed: true }, { number: 2, weight: 50, reps: 10, completed: true }, { number: 3, weight: 50, reps: 10, completed: false }] },
  { id: 'row', name: 'Remo sentado', muscle: 'Espalda', sets: [{ number: 1, weight: 40, reps: 12, completed: false }, { number: 2, weight: 45, reps: 10, completed: false }, { number: 3, weight: 45, reps: 10, completed: false }] },
  { id: 'curl', name: 'Curl con mancuernas', muscle: 'Bíceps', sets: [{ number: 1, weight: 12, reps: 12, completed: false }, { number: 2, weight: 12, reps: 10, completed: false }, { number: 3, weight: 12, reps: 10, completed: false }] },
];
