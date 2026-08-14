import { useSQLiteContext } from 'expo-sqlite';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { listMuscleGroups } from '@/database/repositories/catalogRepository';
import { getProfile, saveProfile as persistProfile } from '@/database/repositories/profileRepository';
import { getPendingRoutineSummary } from '@/database/repositories/routineRepository';
import { ensureActiveWeeklyPlan, resetWeeklyPlanToDefault, saveWeeklyPlan } from '@/database/repositories/weeklyPlanRepository';
import {
  addWorkoutSet, cancelWorkout, deleteWorkoutSet, finishWorkout, getActiveWorkout, listCompletedDates,
  listCompletedSessionSnapshots, listRecentWorkouts, saveWorkoutSet, startWorkout,
} from '@/database/repositories/workoutRepository';
import type {
  ActiveWorkout, MuscleGroup, PendingRoutineSummary, RecentWorkout, RemoveWorkoutSetResult, RoutinePreview,
  UserProfile, WeeklyPlan, WeeklyPlanDraft, WeeklyProgress, WorkoutSet,
} from '@/domain/models';
import { generateRoutinePreview, type RoutineRequest, saveRoutine } from '@/services/gymTrackService';
import { getPlanForDate, getWeeklyTarget } from '@/services/weeklyPlanService';

type CompletedSnapshot = { completed_at: string; counts_toward_goal: number };

type GymTrackContextValue = {
  loading: boolean;
  error: string | null;
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [pendingRoutine, setPendingRoutine] = useState<PendingRoutineSummary | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [completedDates, setCompletedDates] = useState<string[]>([]);
  const [completedSnapshots, setCompletedSnapshots] = useState<CompletedSnapshot[]>([]);

  const refresh = useCallback(async () => {
    try {
      const nextProfile = await getProfile(db);
      const [nextPlan, nextMuscles, nextActive, nextPending, nextRecent, nextDates, nextSnapshots] = await Promise.all([
        ensureActiveWeeklyPlan(db, nextProfile.id), listMuscleGroups(db), getActiveWorkout(db),
        getPendingRoutineSummary(db), listRecentWorkouts(db), listCompletedDates(db, historyStartIso()),
        listCompletedSessionSnapshots(db, historyStartIso()),
      ]);
      setProfile(nextProfile);
      setWeeklyPlan(nextPlan);
      setMuscleGroups(nextMuscles);
      setActiveWorkout(nextActive);
      setPendingRoutine(nextPending);
      setRecentWorkouts(nextRecent);
      setCompletedDates(nextDates);
      setCompletedSnapshots(nextSnapshots);
      setError(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron cargar los datos locales.');
    } finally {
      setLoading(false);
    }
  }, [db]);

  useEffect(() => {
    const timer = setTimeout(() => { void refresh(); }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

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

  const value = useMemo<GymTrackContextValue>(() => ({
    loading,
    error,
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
    updateProfile: async (nextProfile) => { setProfile(await persistProfile(db, nextProfile)); },
    updateWeeklyPlan: async (draft) => {
      if (!profile) throw new Error('No se encontró el perfil local.');
      await saveWeeklyPlan(db, profile.id, { ...draft, source: 'manual' });
      await refresh();
    },
    resetWeeklyPlan: async () => {
      if (!profile) throw new Error('No se encontró el perfil local.');
      await resetWeeklyPlanToDefault(db, profile.id);
      await refresh();
    },
    beginWorkout: async (options) => {
      if (!weeklyPlan) throw new Error('No se encontró un plan semanal activo.');
      const todayPlan = getPlanForDate(weeklyPlan, new Date());
      const isAdditional = options?.allowRest === true;
      if (todayPlan.sessionType === 'rest' && !isAdditional) throw new Error('Hoy es día de descanso.');
      const cardio = muscleGroups.find((muscle) => muscle.id === 'cardio');
      const sessionPlan = todayPlan.sessionType === 'rest' && isAdditional
        ? { ...todayPlan, sessionType: 'cardio' as const, displayName: 'Entrenamiento adicional', estimatedMinutes: 30, isOptional: true, countsTowardGoal: false, muscles: cardio ? [{ ...cardio, orderIndex: 0 }] : [] }
        : todayPlan;
      if (sessionPlan.muscles.length === 0) throw new Error('No hay músculos configurados para esta sesión.');
      const workout = await startWorkout(db, sessionPlan, isAdditional);
      if (!workout) throw new Error('No se pudo iniciar el entrenamiento.');
      setActiveWorkout(workout);
      setPendingRoutine(null);
      return workout;
    },
    updateSet: async (set) => {
      setActiveWorkout((current) => current ? {
        ...current,
        exercises: current.exercises.map((exercise) => ({ ...exercise, sets: exercise.sets.map((item) => item.id === set.id ? set : item) })),
      } : current);
      await saveWorkoutSet(db, set);
    },
    addSet: async (workoutExerciseId) => { await addWorkoutSet(db, workoutExerciseId); setActiveWorkout(await getActiveWorkout(db)); },
    removeSet: async (setId) => { const result = await deleteWorkoutSet(db, setId); if (result === 'removed') setActiveWorkout(await getActiveWorkout(db)); return result; },
    completeWorkout: async (sessionId) => { await finishWorkout(db, sessionId); await refresh(); },
    cancelActiveWorkout: async (sessionId) => { await cancelWorkout(db, sessionId); await refresh(); },
    previewRoutine: (request) => generateRoutinePreview(db, request),
    acceptRoutine: async (preview) => { const routineId = await saveRoutine(db, preview); setPendingRoutine(await getPendingRoutineSummary(db)); return routineId; },
  }), [activeWorkout, completedDates, db, error, loading, muscleGroups, pendingRoutine, profile, recentWorkouts, refresh, todayCompletedWorkout, weeklyPlan, weeklyProgress]);

  return <GymTrackContext.Provider value={value}>{children}</GymTrackContext.Provider>;
}

export function useGymTrack() {
  const context = useContext(GymTrackContext);
  if (!context) throw new Error('useGymTrack debe usarse dentro de GymTrackProvider.');
  return context;
}
