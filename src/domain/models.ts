export type Goal = 'Ganar músculo' | 'Ganar fuerza' | 'Perder grasa' | 'Mejorar salud';
export type ExperienceLevel = 'Principiante' | 'Intermedio' | 'Avanzado';

export type UserProfile = {
  id: string;
  displayName: string;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  experienceLevel: ExperienceLevel;
  defaultWorkoutMinutes: number;
  createdAt: string;
  updatedAt: string;
};

export type CatalogExercise = {
  id: string;
  name: string;
  primaryMuscle: string;
  exerciseFamily: string;
  movementPattern: string;
  exerciseType: 'compound' | 'isolation' | 'cardio';
  difficulty: ExperienceLevel;
  unilateral: boolean;
  estimatedMinutes: number;
  tags: string[];
};

export type WorkoutSet = {
  id: string;
  setNumber: number;
  weightKg: number;
  repetitions: number;
  completed: boolean;
};

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  muscle: string;
  orderIndex: number;
  sets: WorkoutSet[];
};

export type ActiveWorkout = {
  id: string;
  routineId: string | null;
  routineName: string | null;
  sessionName: string;
  startedAt: string;
  exercises: WorkoutExercise[];
};

export type RemoveWorkoutSetResult = 'removed' | 'completed' | 'last-set' | 'not-found';

export type RecentWorkout = {
  id: string;
  completedAt: string;
  title: string;
  durationMinutes: number;
  exerciseCount: number;
  setCount: number;
};

export type WeeklyProgress = {
  completed: number;
  target: number;
  completedDays: number[];
};

export type RoutinePreviewExercise = {
  exerciseId: string;
  name: string;
  muscle: string;
  estimatedMinutes: number;
};

export type RoutinePreview = {
  name: string;
  estimatedMinutes: number;
  exercises: RoutinePreviewExercise[];
};

export type PendingRoutineSummary = {
  id: string;
  name: string;
  estimatedMinutes: number;
  exerciseCount: number;
};
