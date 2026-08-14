import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { listExerciseSummaries } from '@/database/repositories/catalogRepository';
import {
  createCustomEquipment, createTrainingLocation, deleteCustomEquipment, deleteTrainingLocation,
  linkCustomEquipmentExercise, listCustomEquipment, listEquipmentCatalog, listTrainingLocations,
  setActiveTrainingLocation, setDefaultTrainingLocation, setEquipmentEnabled, unlinkCustomEquipmentExercise,
  updateCustomEquipment, updateTrainingLocation,
} from '@/database/repositories/equipmentRepository';
import type {
  CustomEquipment, EquipmentCatalogItem, EquipmentExerciseSummary, TrainingLocation, TrainingLocationType,
} from '@/domain/models';
import { useAuth } from '@/providers/AuthProvider';
import { useGymTrack } from '@/providers/GymTrackProvider';

export function useEquipmentInventory() {
  const db = useSQLiteContext();
  const { user } = useAuth();
  const { refresh: refreshGymTrack } = useGymTrack();
  const userId = user?.id ?? null;
  const [locations, setLocations] = useState<TrainingLocation[]>([]);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [equipment, setEquipment] = useState<EquipmentCatalogItem[]>([]);
  const [customEquipment, setCustomEquipment] = useState<CustomEquipment[]>([]);
  const [exerciseCatalog, setExerciseCatalog] = useState<EquipmentExerciseSummary[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const inventoryRequestId = useRef(0);

  const requireUser = useCallback(() => {
    if (!userId) throw new Error('La sesión ya no está disponible.');
    return userId;
  }, [userId]);

  const loadLocations = useCallback(async (preferredLocationId?: string) => {
    const ownerId = requireUser();
    const nextLocations = await listTrainingLocations(db, ownerId);
    setLocations(nextLocations);
    const preferred = nextLocations.find((item) => item.id === preferredLocationId);
    const current = nextLocations.find((item) => item.id === locationId);
    const next = preferred ?? current ?? nextLocations.find((item) => item.isActive) ?? nextLocations[0] ?? null;
    setLocationId(next?.id ?? null);
    return next?.id ?? null;
  }, [db, locationId, requireUser]);

  const loadInventory = useCallback(async (targetLocationId: string) => {
    const requestId = ++inventoryRequestId.current;
    const ownerId = requireUser();
    const [nextEquipment, nextCustom] = await Promise.all([
      listEquipmentCatalog(db, ownerId, targetLocationId, { query }),
      listCustomEquipment(db, ownerId, targetLocationId),
    ]);
    if (requestId === inventoryRequestId.current) {
      setEquipment(nextEquipment);
      setCustomEquipment(nextCustom);
    }
  }, [db, query, requireUser]);

  const refresh = useCallback(async (preferredLocationId?: string) => {
    setLoading(true);
    try {
      const target = await loadLocations(preferredLocationId);
      const exercises = await listExerciseSummaries(db);
      setExerciseCatalog(exercises);
      if (target) await loadInventory(target);
      else {
        setEquipment([]);
        setCustomEquipment([]);
      }
    } finally {
      setLoading(false);
    }
  }, [db, loadInventory, loadLocations]);

  useEffect(() => {
    const timer = setTimeout(() => { void refresh(); }, 0);
    return () => clearTimeout(timer);
  }, [refresh]);

  useEffect(() => {
    if (!locationId || !userId) return;
    const timer = setTimeout(() => { void loadInventory(locationId); }, 120);
    return () => clearTimeout(timer);
  }, [loadInventory, locationId, query, userId]);

  const run = useCallback(async (key: string, action: () => Promise<void>, preferredLocationId?: string) => {
    setWorkingId(key);
    try {
      await action();
      await refresh(preferredLocationId ?? locationId ?? undefined);
      await refreshGymTrack();
    } finally {
      setWorkingId(null);
    }
  }, [locationId, refresh, refreshGymTrack]);

  const activeLocation = useMemo(
    () => locations.find((item) => item.id === locationId) ?? locations.find((item) => item.isActive) ?? null,
    [locationId, locations],
  );
  return {
    locations,
    activeLocation,
    equipment,
    availableEquipment: equipment.filter((item) => item.enabled),
    unavailableEquipment: equipment.filter((item) => !item.enabled),
    customEquipment,
    exerciseCatalog,
    query,
    setQuery,
    loading,
    workingId,
    refresh,
    selectLocation: async (nextLocationId: string) => run('location-active', () => setActiveTrainingLocation(db, requireUser(), nextLocationId), nextLocationId),
    createLocation: async (input: { name: string; locationType: TrainingLocationType }) => {
      let createdId = '';
      await run('location-create', async () => { createdId = await createTrainingLocation(db, requireUser(), input); }, createdId || undefined);
      if (createdId) await run('location-active', () => setActiveTrainingLocation(db, requireUser(), createdId), createdId);
    },
    updateLocation: (id: string, input: { name: string; locationType: TrainingLocationType }) => run(`location-${id}`, () => updateTrainingLocation(db, requireUser(), id, input), id),
    makeDefault: (id: string) => run(`location-${id}`, () => setDefaultTrainingLocation(db, requireUser(), id), id),
    removeLocation: (id: string) => run(`location-${id}`, () => deleteTrainingLocation(db, requireUser(), id)),
    toggleEquipment: (item: EquipmentCatalogItem) => {
      if (!activeLocation) return Promise.reject(new Error('No hay una ubicación activa.'));
      return run(item.id, () => setEquipmentEnabled(db, requireUser(), activeLocation.id, item.id, !item.enabled), activeLocation.id);
    },
    addCustomEquipment: (input: { name: string; category?: string; notes?: string }) => {
      if (!activeLocation) return Promise.reject(new Error('No hay una ubicación activa.'));
      return run('custom-create', () => createCustomEquipment(db, requireUser(), activeLocation.id, input).then(() => undefined), activeLocation.id);
    },
    editCustomEquipment: (id: string, input: { name: string; category?: string; notes?: string }) => run(id, () => updateCustomEquipment(db, requireUser(), id, input)),
    removeCustomEquipment: (id: string) => run(id, () => deleteCustomEquipment(db, requireUser(), id)),
    toggleCustomExercise: (custom: CustomEquipment, exerciseId: string) => run(
      custom.id,
      () => custom.linkedExerciseIds.includes(exerciseId)
        ? unlinkCustomEquipmentExercise(db, requireUser(), custom.id, exerciseId)
        : linkCustomEquipmentExercise(db, requireUser(), custom.id, exerciseId),
    ),
  };
}
