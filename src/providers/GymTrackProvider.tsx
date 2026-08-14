import { useSQLiteContext } from 'expo-sqlite';
import { createContext, type PropsWithChildren, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { getProfile, saveProfile as persistProfile } from '@/database/repositories/profileRepository';
import {
  addWorkoutSet, deleteWorkoutSet, finishWorkout, getActiveWorkout, listCompletedDates,
  listRecentWorkouts, saveWorkoutSet, startWorkout,
} from '@/database/repositories/workoutRepository';
import type { ActiveWorkout, RecentWorkout, RoutinePreview, UserProfile, WeeklyProgress, WorkoutSet } from '@/domain/models';
import { generateRoutinePreview, type RoutineRequest, saveRoutine } from '@/services/gymTrackService';

type GymTrackContextValue = {
  loading: boolean;
  error: string | null;
  profile: UserProfile | null;
  activeWorkout: ActiveWorkout | null;
  recentWorkouts: RecentWorkout[];
  completedDates: string[];
  weeklyProgress: WeeklyProgress;
  refresh: () => Promise<void>;
  updateProfile: (profile: UserProfile) => Promise<void>;
  beginWorkout: () => Promise<ActiveWorkout>;
  updateSet: (set: WorkoutSet) => Promise<void>;
  addSet: (workoutExerciseId: string) => Promise<void>;
  removeSet: (setId: string) => Promise<boolean>;
  completeWorkout: (sessionId: string) => Promise<void>;
  previewRoutine: (request: RoutineRequest) => Promise<RoutinePreview>;
  acceptRoutine: (preview: RoutinePreview) => Promise<string>;
};

const GymTrackContext = createContext<GymTrackContextValue | null>(null);

function startOfWeekIso() {
  const date = new Date();
  const weekday = date.getDay() || 7;
  date.setDate(date.getDate() - weekday + 1);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

function historyStartIso() {
  const date = new Date();
  date.setDate(date.getDate() - 35);
  date.setHours(0, 0, 0, 0);
  return date.toISOString();
}

export function GymTrackProvider({ children }: PropsWithChildren) {
  const db = useSQLiteContext();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeWorkout, setActiveWorkout] = useState<ActiveWorkout | null>(null);
  const [recentWorkouts, setRecentWorkouts] = useState<RecentWorkout[]>([]);
  const [completedDates, setCompletedDates] = useState<string[]>([]);

  const refresh = useCallback(async () => {
    try {
      const [nextProfile, nextActive, nextRecent, nextDates] = await Promise.all([
        getProfile(db), getActiveWorkout(db), listRecentWorkouts(db), listCompletedDates(db, historyStartIso()),
      ]);
      setProfile(nextProfile);
      setActiveWorkout(nextActive);
      setRecentWorkouts(nextRecent);
      setCompletedDates(nextDates);
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

  const weeklyDates = useMemo(() => completedDates.filter((value) => value >= startOfWeekIso()), [completedDates]);
  const weeklyProgress = useMemo<WeeklyProgress>(() => ({
    completed: weeklyDates.length,
    target: 5,
    completedDays: [...new Set(weeklyDates.map((value) => new Date(value).getDay()))],
  }), [weeklyDates]);

  const value = useMemo<GymTrackContextValue>(() => ({
    loading,
    error,
    profile,
    activeWorkout,
    recentWorkouts,
    completedDates,
    weeklyProgress,
    refresh,
    updateProfile: async (nextProfile) => { setProfile(await persistProfile(db, nextProfile)); },
    beginWorkout: async () => {
      const workout = await startWorkout(db);
      if (!workout) throw new Error('No se pudo iniciar el entrenamiento.');
      setActiveWorkout(workout);
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
    removeSet: async (setId) => { const removed = await deleteWorkoutSet(db, setId); if (removed) setActiveWorkout(await getActiveWorkout(db)); return removed; },
    completeWorkout: async (sessionId) => { await finishWorkout(db, sessionId); await refresh(); },
    previewRoutine: (request) => generateRoutinePreview(db, request),
    acceptRoutine: (preview) => saveRoutine(db, preview),
  }), [activeWorkout, completedDates, db, error, loading, profile, recentWorkouts, refresh, weeklyProgress]);

  return <GymTrackContext.Provider value={value}>{children}</GymTrackContext.Provider>;
}

export function useGymTrack() {
  const context = useContext(GymTrackContext);
  if (!context) throw new Error('useGymTrack debe usarse dentro de GymTrackProvider.');
  return context;
}
