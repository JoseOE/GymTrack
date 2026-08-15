export type Goal = 'Ganar músculo' | 'Ganar fuerza' | 'Perder grasa' | 'Mejorar condición física' | 'Salud general' | 'Mejorar salud';
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

export type OnboardingProfileInput = {
  displayName: string;
  heightCm: number;
  weightKg: number;
  goal: Goal;
  experienceLevel: ExperienceLevel;
  defaultWorkoutMinutes: number;
};

export type MuscleGroup = {
  id: string;
  name: string;
  parentId: string | null;
};

export type EquipmentType = 'free_weight' | 'machine' | 'cable' | 'bench' | 'rack' | 'bodyweight' | 'cardio' | 'accessory' | 'other';
export type TrainingLocationType = 'gym' | 'home' | 'other';

export type TrainingLocation = {
  id: string;
  ownerUserId: string;
  name: string;
  locationType: TrainingLocationType;
  isActive: boolean;
  isDefault: boolean;
  equipmentCount: number;
  createdAt: string;
  updatedAt: string;
};

export type EquipmentCatalogItem = {
  id: string;
  name: string;
  category: string;
  description: string;
  equipmentType: EquipmentType;
  catalogVersion: number;
  enabled: boolean;
};

export type EquipmentExerciseSummary = {
  id: string;
  name: string;
  muscle: string;
};

export type EquipmentDetails = EquipmentCatalogItem & {
  aliases: string[];
  exercises: EquipmentExerciseSummary[];
};

export type CustomEquipment = {
  id: string;
  ownerUserId: string;
  trainingLocationId: string;
  name: string;
  category: string | null;
  notes: string | null;
  source: 'manual' | 'ai';
  catalogMatchId: string | null;
  active: boolean;
  linkedExerciseIds: string[];
  createdAt: string;
  updatedAt: string;
};

export type WeeklyPlanSource = 'default' | 'manual' | 'ai';
export type WeeklyPlanSessionType = 'strength' | 'cardio' | 'rest';

export type WeeklyPlanMuscle = {
  id: string;
  name: string;
  orderIndex: number;
};

export type WeeklyPlanDay = {
  id: string;
  dayIndex: number;
  sessionType: WeeklyPlanSessionType;
  displayName: string;
  estimatedMinutes: number | null;
  isOptional: boolean;
  countsTowardGoal: boolean;
  targetExerciseCount: number | null;
  muscles: WeeklyPlanMuscle[];
};

export type WeeklyPlan = {
  id: string;
  userProfileId: string;
  name: string;
  source: WeeklyPlanSource;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  days: WeeklyPlanDay[];
};

export type WeeklyPlanDayDraft = Omit<WeeklyPlanDay, 'id'>;
export type WeeklyPlanDraft = {
  name: string;
  source: WeeklyPlanSource;
  days: WeeklyPlanDayDraft[];
};

export type CatalogExercise = {
  id: string;
  name: string;
  primaryMuscleId: string;
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

export type ExerciseMode = 'strength' | 'cardio';
export type CardioTimerState = 'idle' | 'running' | 'paused' | 'completed';

export type WorkoutExercise = {
  id: string;
  exerciseId: string;
  name: string;
  muscle: string;
  orderIndex: number;
  mode: ExerciseMode;
  targetDurationMinutes: number | null;
  cardioTimerState: CardioTimerState;
  cardioElapsedSeconds: number;
  cardioLastStartedAt: string | null;
  cardioCompleted: boolean;
  sets: WorkoutSet[];
};

export type ActiveWorkout = {
  id: string;
  routineId: string | null;
  routineName: string | null;
  sessionName: string;
  startedAt: string;
  scheduledDayIndex: number | null;
  countsTowardGoal: boolean;
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

export type PersonalRecordExerciseKey = 'bench_press' | 'squat' | 'deadlift';
export type PersonalRecordSource = 'manual' | 'workout' | 'test';

export type PersonalRecord = {
  id: string;
  ownerUserId: string;
  exerciseKey: PersonalRecordExerciseKey;
  weightKg: number;
  source: PersonalRecordSource;
  updatedAt: string;
};

export type RoutinePreviewExercise = {
  exerciseId: string;
  name: string;
  muscle: string;
  targetMuscleId: string;
  targetMuscleName: string;
  exerciseFamily: string;
  exerciseType: CatalogExercise['exerciseType'];
  difficulty: ExperienceLevel;
  estimatedMinutes: number;
  mode: ExerciseMode;
  targetDurationMinutes: number | null;
};

export type MuscleExerciseTarget = {
  muscleId: string;
  muscleName: string;
  exerciseCount: number;
};

export type CardioTarget = {
  durationMinutes: number;
};

export type RoutineRequest = {
  muscleTargets: MuscleExerciseTarget[];
  cardioTarget?: CardioTarget;
  targetDurationMinutes: number;
};

export type RoutinePreview = {
  name: string;
  targetDurationMinutes: number;
  warmUpEstimatedMinutes: number;
  strengthEstimatedMinutes: number;
  cardioEstimatedMinutes: number;
  mainWorkoutEstimatedMinutes: number;
  estimatedDurationMinutes: number;
  exercises: RoutinePreviewExercise[];
  locationId: string;
  locationName: string;
  availabilityMessages: string[];
};

export type WarmUpStep = {
  title: string;
  durationLabel: string;
  description: string;
};

export type WarmUpPlan = {
  kind: 'strength' | 'cardio';
  estimatedMinutes: number;
  steps: WarmUpStep[];
};

export type PendingRoutineSummary = {
  id: string;
  name: string;
  estimatedMinutes: number;
  exerciseCount: number;
};

export type SharedRoutinePayloadV1 = {
  schema: 'gymtrack-routine';
  version: 1;
  name: string;
  exercises: string[];
};

export type SharedRoutineExerciseV2 =
  | { exerciseId: string; mode: 'strength' }
  | { exerciseId: string; mode: 'cardio'; durationMinutes: number };

export type SharedRoutinePayloadV2 = {
  schema: 'gymtrack-routine';
  version: 2;
  name: string;
  exercises: SharedRoutineExerciseV2[];
};

export type SharedRoutinePayload = SharedRoutinePayloadV1 | SharedRoutinePayloadV2;

export type SharedRoutineImportPreparation =
  | { status: 'missing-exercises'; missingExerciseCount: number }
  | { status: 'ready'; preview: RoutinePreview; unavailableEquipmentCount: number; payloadVersion: 1 | 2 };
