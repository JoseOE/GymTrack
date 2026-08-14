import { useSQLiteContext } from 'expo-sqlite';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

import { listMuscleGroups } from '@/database/repositories/catalogRepository';
import {
  archiveLegacyAndStartFresh, ensureUserWorkspace, getLegacyDataStatus, linkLegacyData,
  saveOnboardingProfile,
} from '@/database/repositories/localAccountRepository';
import { saveProfile as persistProfile } from '@/database/repositories/profileRepository';
import { getPendingRoutineSummary } from '@/database/repositories/routineRepository';
import { ensureActiveWeeklyPlan, resetWeeklyPlanToDefault, saveWeeklyPlan } from '@/database/repositories/weeklyPlanRepository';
import {
  addWorkoutSet, cancelWorkout, deleteWorkoutSet, finishWorkout, getActiveWorkout, listCompletedDates,
  listCompletedSessionSnapshots, listRecentWorkouts, saveWorkoutSet, startWorkout,
} from '@/database/repositories/workoutRepository';
import type {
  ActiveWorkout, MuscleGroup, OnboardingProfileInput, PendingRoutineSummary, RecentWorkout, RemoveWorkoutSetResult,
  RoutinePreview, UserProfile, WeeklyPlan, WeeklyPlanDraft, WeeklyProgress, WorkoutSet,
} from '@/domain/models';
import { useAuth } from '@/providers/AuthProvider';
import { generateRoutinePreview, type RoutineRequest, saveRoutine } from '@/services/gymTrackService';
import { getPlanForDate, getWeeklyTarget } from '@/services/weeklyPlanService';

type CompletedSnapshot = { completed_at: string; counts_toward_goal: number };

type GymTrackContextValue = {
  loading: boolean;
  error: string | null;
  localReady: boolean;
  legacyMigrationRequired: boolean;
  pendingOnboardingProfile: OnboardingProfileInput | null;
  profile: UserProfile | null;
  weeklyPlan: WeeklyPlan | null;
  muscleGroups: MuscleGroup[];
  activeWorkout: ActiveWorkout | null;
  todayCompletedWorkout: RecentWorkout | null;
  pendingRoutine: PendingRoutineSummary | null;
  recentWorkouts: RecentWorkout[];
  completedDates: string[];
  weeklyProgress: WeeklyProgress;
  refresh: () => Promise<void>;
  linkLegacyWorkspace: () => Promise<void>;
  startFreshWorkspace: () => Promise<void>;
  completeLocalOnboarding: (input: OnboardingProfileInput) => Promise<void>;
  prepareCustomOnboarding: (input: OnboardingProfileInput) => void;
  clearCustomOnboarding: () => void;
  updateProfile: (profile: UserProfile) => Promise<void>;
  updateWeeklyPlan: (draft: WeeklyPlanDraft) => Promise<void>;
  resetWeeklyPlan: () => Promise<void>;
  beginWorkout: (options?: { allowRest?: boolean }) => Promise<ActiveWorkout>;
  updateSet: (set: WorkoutSet) => Promise<void>;
  addSet: (workoutExerciseId: string) => Promise<void>;
  removeSet: (setId: string) => Promise<RemoveWorkoutSetResult>;
  completeWorkout: (sessionId: string) => Promise<void>;
  cancelActiveWorkout: (sessionId: string) => Promise<void>;
  previewRoutine: (request: RoutineRequest) => Promise<RoutinePreview>;
  acceptRoutine: (preview: RoutinePreview) => Promise<string>;
};

const GymTrackContext = createContext<GymTrackContextValue | null>(null);

function startOfWeek() {
  const date = new Date();
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  date.setHours(0, 0, 0, 0);
  return date;
}

function historyStartIso() {
  const date = new Date();
  date.setDate(date.getDate() - 35);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function localDateKey(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function isSameLocalDay(left: string, right: Date) {
  const date = new Date(left);
  return date.getFullYear() === right.getFullYear() && date.getMonth() === right.getMonth() && date.getDate() === right.getDate();
}

export function GymTrackProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const { accountProfile, updateDisplayName, user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedUserId, setLoadedUserId] = useState<string | null>(null);
  const [legacyMigrationRequired, setLegacyMigrationRequired] = useState(false);
  const [pendingOnboardingProfile, setPendingOnboardingProfile] = useState<OnboardingProfileInput | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [pendingRoutine, setPendingRoutine] = useState<PendingRoutineSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [completedSnapshots, setCompletedSnapshots] = useState<CompletedSnapshot[]>([]);
  const refreshId = useRef(0);

  const clearPrivateState = useCallback(() => {
    setLoadedUserId(null);
    setProfile(null);
    setWeeklyPlan(null);
    setActiveWorkout(null);
    setPendingRoutine(null);
    setRecentWorkouts([]);
    setCompletedDates([]);
    setCompletedSnapshots([]);
    setPendingOnboardingProfile(null);
  }, []);

  const refresh = useCallback(async () => {
    const requestId = ++refreshId.current;
    if (!user) {
      clearPrivateState();
      setLegacyMigrationRequired(false);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const legacy = await getLegacyDataStatus(db, user.id);
      if (requestId !== refreshId.current) return;
      if (legacy.requiresDecision) {
        clearPrivateState();
        setLegacyMigrationRequired(true);
        setError(null);
        return;
      }
      setLegacyMigrationRequired(false);
      const nextProfile = await ensureUserWorkspace(db, user.id, accountProfile?.displayName ?? 'Atleta');
      const [nextPlan, nextMuscles, nextActive, nextPending, nextRecent, nextDates, nextSnapshots] = await Promise.all([
        ensureActiveWeeklyPlan(db, user.id), listMuscleGroups(db), getActiveWorkout(db, user.id),
        getPendingRoutineSummary(db, user.id), listRecentWorkouts(db, user.id), listCompletedDates(db, user.id, historyStartIso()),
        listCompletedSessionSnapshots(db, user.id, historyStartIso()),
      ]);
      if (requestId !== refreshId.current) return;
      setProfile(nextProfile);
      setWeeklyPlan(nextPlan);
      setMuscleGroups(nextMuscles);
      setActiveWorkout(nextActive);
      setPendingRoutine(nextPending);
      setRecentWorkouts(nextRecent);
      setCompletedDates(nextDates);
      setCompletedSnapshots(nextSnapshots);
      setLoadedUserId(user.id);
      setError(null);
    } catch (reason) {
      if (requestId !== refreshId.current) return;
      clearPrivateState();
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los datos locales.');
    } finally {
      if (requestId === refreshId.current) setLoading(false);
    }
  }, [accountProfile, clearPrivateState, db, user]);

  useEffect(() => {
    const timer = setTimeout(() => {
      clearPrivateState();
      setLoading(Boolean(user));
      void refresh();
    }, 0);
    return () => clearTimeout(timer);
  }, [clearPrivateState, refresh, user]);

  const weeklyProgress = useMemo<WeeklyProgress>(() => {
    const weekStart = startOfWeek();
    const thisWeek = completedSnapshots.filter((snapshot) => new Date(snapshot.completed_at) >= weekStart);
    const goalDates = new Set(thisWeek.filter((snapshot) => snapshot.counts_toward_goal === 1).map((snapshot) => localDateKey(snapshot.completed_at)));
    return {
      completed: goalDates.size,
      target: weeklyPlan ? getWeeklyTarget(weeklyPlan) : 0,
      completedDays: [...new Set(thisWeek.map((snapshot) => new Date(snapshot.completed_at).getDay()))],
    };
  }, [completedSnapshots, weeklyPlan]);
  const todayCompletedWorkout = useMemo(() => recentWorkouts.find((workout) => isSameLocalDay(workout.completedAt, new Date())) ?? null, [recentWorkouts]);
  const requireUserId = useCallback(() => {
    if (!user || loadedUserId !== user.id) throw new Error('Los datos del usuario activo todavía no están disponibles.');
    return user.id;
  }, [loadedUserId, user]);

  const value: GymTrackContextValue = {
    loading,
    error,
    localReady: Boolean(user && loadedUserId === user.id),
    legacyMigrationRequired,
    pendingOnboardingProfile,
    profile,
    weeklyPlan,
    muscleGroups,
    activeWorkout,
    todayCompletedWorkout,
    pendingRoutine,
    recentWorkouts,
    completedDates,
    weeklyProgress,
    refresh,
    linkLegacyWorkspace: async () => {
      if (!user) throw new Error('La sesión ya no está disponible.');
      await linkLegacyData(db, user.id, accountProfile?.displayName ?? 'Atleta');
      await refresh();
    },
    startFreshWorkspace: async () => {
      if (!user) throw new Error('La sesión ya no está disponible.');
      await archiveLegacyAndStartFresh(db, user.id, accountProfile?.displayName ?? 'Atleta');
      await refresh();
    },
    completeLocalOnboarding: async (input) => {
      if (!user) throw new Error('La sesión ya no está disponible.');
      await saveOnboardingProfile(db, user.id, input);
      await ensureActiveWeeklyPlan(db, user.id);
      await refresh();
    },
    prepareCustomOnboarding: (input) => setPendingOnboardingProfile(input),
    clearCustomOnboarding: () => setPendingOnboardingProfile(null),
    updateProfile: async (nextProfile) => {
      const userId = requireUserId();
      if (nextProfile.id !== userId) throw new Error('El perfil no pertenece al usuario activo.');
      const saved = await persistProfile(db, nextProfile);
      await updateDisplayName(saved.displayName);
      setProfile(saved);
    },
    updateWeeklyPlan: async (draft) => {
      const userId = requireUserId();
      await saveWeeklyPlan(db, userId, { ...draft, source: 'manual' });
      await refresh();
    },
    resetWeeklyPlan: async () => { await resetWeeklyPlanToDefault(db, requireUserId()); await refresh(); },
    beginWorkout: async (options) => {
      const userId = requireUserId();
      if (!weeklyPlan) throw new Error('No se encontró un plan semanal activo.');
      const todayPlan = getPlanForDate(weeklyPlan, new Date());
      const isAdditional = options?.allowRest === true;
      if (todayPlan.sessionType === 'rest' && !isAdditional) throw new Error('Hoy es día de descanso.');
      const cardio = muscleGroups.find((muscle) => muscle.id === 'cardio');
      const sessionPlan = todayPlan.sessionType === 'rest' && isAdditional
        ? { ...todayPlan, sessionType: 'cardio' as const, displayName: 'Entrenamiento adicional', estimatedMinutes: 30, isOptional: true, countsTowardGoal: false, muscles: cardio ? [{ ...cardio, orderIndex: 0 }] : [] }
        : todayPlan;
      if (sessionPlan.muscles.length === 0) throw new Error('No hay músculos configurados para esta sesión.');
      const workout = await startWorkout(db, userId, sessionPlan, isAdditional);
      if (!workout) throw new Error('No se pudo iniciar el entrenamiento.');
      setActiveWorkout(workout);
      setPendingRoutine(null);
      return workout;
    },
    updateSet: async (set) => {
      const userId = requireUserId();
      setActiveWorkout((current) => current ? {
        ...current,
        exercises: current.exercises.map((exercise) => ({ ...exercise, sets: exercise.sets.map((item) => item.id === set.id ? set : item) })),
      } : current);
      await saveWorkoutSet(db, userId, set);
    },
    addSet: async (workoutExerciseId) => {
      const userId = requireUserId();
      await addWorkoutSet(db, userId, workoutExerciseId);
      setActiveWorkout(await getActiveWorkout(db, userId));
    },
    removeSet: async (setId) => {
      const userId = requireUserId();
      const result = await deleteWorkoutSet(db, userId, setId);
      if (result === 'removed') setActiveWorkout(await getActiveWorkout(db, userId));
      return result;
    },
    completeWorkout: async (sessionId) => { await finishWorkout(db, requireUserId(), sessionId); await refresh(); },
    cancelActiveWorkout: async (sessionId) => { await cancelWorkout(db, requireUserId(), sessionId); await refresh(); },
    previewRoutine: (request) => generateRoutinePreview(db, request),
    acceptRoutine: async (preview) => {
      const userId = requireUserId();
      const routineId = await saveRoutine(db, userId, preview);
      setPendingRoutine(await getPendingRoutineSummary(db, userId));
      return routineId;
    },
  };

  return <GymTrackContext.Provider value={value}>{children}</GymTrackContext.Provider>;
}

export function useGymTrack() {
  const context = useContext(GymTrackContext);
  if (!context) throw new Error('useGymTrack debe usarse dentro de GymTrackProvider.');
  return context;
}
