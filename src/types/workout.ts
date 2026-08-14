export type WorkoutDay = {
  shortDay: string;
  day: string;
  date: number;
  workout: string;
  duration?: string;
  status: 'completed' | 'today' | 'upcoming' | 'rest';
};

export type Exercise = {
  id: string;
  name: string;
  muscle: string;
  sets: { number: number; weight: number; reps: number; completed: boolean }[];
};
