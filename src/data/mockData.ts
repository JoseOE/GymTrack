import type { Exercise, WorkoutDay } from '@/types/workout';

export const weekPlan: WorkoutDay[] = [
  { shortDay: 'L', day: 'Lunes', date: 12, workout: 'Hombro + Bíceps + Tríceps + Antebrazo', duration: '70 min', status: 'completed' },
  { shortDay: 'M', day: 'Martes', date: 13, workout: 'Pecho + Espalda', duration: '60 min', status: 'completed' },
  { shortDay: 'X', day: 'Miércoles', date: 14, workout: 'Espalda + Bíceps + Antebrazo', duration: '65 min', status: 'today' },
  { shortDay: 'J', day: 'Jueves', date: 15, workout: 'Pecho + Tríceps', duration: '55 min', status: 'upcoming' },
  { shortDay: 'V', day: 'Viernes', date: 16, workout: 'Pierna completa', duration: '75 min', status: 'upcoming' },
  { shortDay: 'S', day: 'Sábado', date: 17, workout: 'Cardio opcional', duration: '30 min', status: 'upcoming' },
  { shortDay: 'D', day: 'Domingo', date: 18, workout: 'Descanso', status: 'rest' },
];

export const exercises: Exercise[] = [
  { id: 'pull-down', name: 'Jalón al pecho', muscle: 'Espalda', sets: [{ number: 1, weight: 45, reps: 12, completed: true }, { number: 2, weight: 50, reps: 10, completed: true }, { number: 3, weight: 50, reps: 10, completed: false }] },
  { id: 'row', name: 'Remo sentado', muscle: 'Espalda', sets: [{ number: 1, weight: 40, reps: 12, completed: false }, { number: 2, weight: 45, reps: 10, completed: false }, { number: 3, weight: 45, reps: 10, completed: false }] },
  { id: 'curl', name: 'Curl con mancuernas', muscle: 'Bíceps', sets: [{ number: 1, weight: 12, reps: 12, completed: false }, { number: 2, weight: 12, reps: 10, completed: false }, { number: 3, weight: 12, reps: 10, completed: false }] },
];
