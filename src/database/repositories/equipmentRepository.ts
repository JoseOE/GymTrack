import type { SQLiteDatabase } from 'expo-sqlite';

import type {
  CustomEquipment, EquipmentCatalogItem, EquipmentDetails, EquipmentExerciseSummary, EquipmentType,
  TrainingLocation, TrainingLocationType,
} from '@/domain/models';
import { createId } from '@/utils/id';
import { normalizeSearchText } from '@/utils/search';

const ORIGINAL_EQUIPMENT_COUNT = 38;

type LocationRow = {
  id: string;
  owner_user_id: string;
  name: string;
  location_type: TrainingLocationType;
  is_active: number;
  is_default: number;
  equipment_count: number;
  created_at: string;
  updated_at: string;
};

type EquipmentRow = {
  id: string;
  name: string;
  category: string;
  description: string;
  equipment_type: EquipmentType;
  catalog_version: number;
  enabled: number;
};

type CustomEquipmentRow = {
  id: string;
  owner_user_id: string;
  training_location_id: string;
  name: string;
  category: string | null;
  notes: string | null;
  source: CustomEquipment['source'];
  catalog_match_id: string | null;
  active: number;
  created_at: string;
  updated_at: string;
};

function mapLocation(row: LocationRow): TrainingLocation {
  return {
    id: row.id,
    ownerUserId: row.owner_user_id,
    name: row.name,
    locationType: row.location_type,
    isActive: row.is_active === 1,
    isDefault: row.is_default === 1,
    equipmentCount: row.equipment_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function mapEquipment(row: EquipmentRow): EquipmentCatalogItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    equipmentType: row.equipment_type,
    catalogVersion: row.catalog_version,
    enabled: row.enabled === 1,
  };
}

async function assertLocationOwnership(db: SQLiteDatabase, userId: string, locationId: string) {
  const row = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM training_location WHERE id = ? AND owner_user_id = ?',
    locationId,
    userId,
  );
  if (!row) throw new Error('La ubicación no pertenece al usuario activo.');
}

async function assertCustomEquipmentOwnership(db: SQLiteDatabase, userId: string, customEquipmentId: string) {
  const row = await db.getFirstAsync<{ id: string }>(
    'SELECT id FROM custom_equipment WHERE id = ? AND owner_user_id = ?',
    customEquipmentId,
    userId,
  );
  if (!row) throw new Error('El equipo personalizado no pertenece al usuario activo.');
}

export async function ensureDefaultTrainingLocation(db: SQLiteDatabase, userId: string) {
  await db.withExclusiveTransactionAsync(async (transaction) => {
    const locations = await transaction.getAllAsync<{ id: string; is_active: number; is_default: number }>(
      'SELECT id, is_active, is_default FROM training_location WHERE owner_user_id = ? ORDER BY created_at, id',
      userId,
    );
    if (locations.length === 0) {
      const locationId = `training-location-default-${userId}`;
      const now = new Date().toISOString();
      await transaction.runAsync(
        `INSERT INTO training_location
          (id, owner_user_id, name, location_type, is_active, is_default, created_at, updated_at)
         VALUES (?, ?, 'Mi gimnasio', 'gym', 1, 1, ?, ?)`,
        locationId,
        userId,
        now,
        now,
      );
      await transaction.runAsync(
        `INSERT INTO training_location_equipment
          (training_location_id, owner_user_id, equipment_id, enabled, created_at, updated_at)
         SELECT ?, ?, id, 1, ?, ? FROM equipment
         WHERE catalog_version = 1 AND id BETWEEN 'equipment-001' AND 'equipment-038'`,
        locationId,
        userId,
        now,
        now,
      );
      const count = await transaction.getFirstAsync<{ count: number }>(
        'SELECT COUNT(*) AS count FROM training_location_equipment WHERE training_location_id = ? AND owner_user_id = ? AND enabled = 1',
        locationId,
        userId,
      );
      if (count?.count !== ORIGINAL_EQUIPMENT_COUNT) throw new Error('El inventario inicial no pudo prepararse correctamente.');
      return;
    }
    const first = locations[0];
    if (!locations.some((location) => location.is_active === 1)) {
      await transaction.runAsync('UPDATE training_location SET is_active = 1, updated_at = ? WHERE id = ? AND owner_user_id = ?', new Date().toISOString(), first.id, userId);
    }
    if (!locations.some((location) => location.is_default === 1)) {
      await transaction.runAsync('UPDATE training_location SET is_default = 1, updated_at = ? WHERE id = ? AND owner_user_id = ?', new Date().toISOString(), first.id, userId);
    }
  });
  const active = await getActiveTrainingLocation(db, userId);
  if (!active) throw new Error('No se pudo preparar la ubicación de entrenamiento.');
  return active;
}

export async function listTrainingLocations(db: SQLiteDatabase, userId: string): Promise<TrainingLocation[]> {
  const rows = await db.getAllAsync<LocationRow>(
    `SELECT location.id, location.owner_user_id, location.name, location.location_type,
      location.is_active, location.is_default, location.created_at, location.updated_at,
      (SELECT COUNT(*) FROM training_location_equipment inventory
       WHERE inventory.training_location_id = location.id AND inventory.owner_user_id = location.owner_user_id AND inventory.enabled = 1)
      + (SELECT COUNT(*) FROM custom_equipment custom
         WHERE custom.training_location_id = location.id AND custom.owner_user_id = location.owner_user_id AND custom.active = 1)
      AS equipment_count
     FROM training_location location
     WHERE location.owner_user_id = ?
     ORDER BY location.is_active DESC, location.is_default DESC, location.name`,
    userId,
  );
  return rows.map(mapLocation);
}

export async function getActiveTrainingLocation(db: SQLiteDatabase, userId: string) {
  const locations = await listTrainingLocations(db, userId);
  return locations.find((location) => location.isActive) ?? null;
}

export async function createTrainingLocation(
  db: SQLiteDatabase,
  userId: string,
  input: { name: string; locationType: TrainingLocationType },
) {
  const name = input.name.trim();
  if (!name) throw new Error('Escribe un nombre para la ubicación.');
  const id = createId('training-location');
  const now = new Date().toISOString();
  const count = await db.getFirstAsync<{ count: number }>('SELECT COUNT(*) AS count FROM training_location WHERE owner_user_id = ?', userId);
  const first = (count?.count ?? 0) === 0;
  await db.runAsync(
    `INSERT INTO training_location
      (id, owner_user_id, name, location_type, is_active, is_default, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    id,
    userId,
    name,
    input.locationType,
    first ? 1 : 0,
    first ? 1 : 0,
    now,
    now,
  );
  return id;
}

export async function updateTrainingLocation(
  db: SQLiteDatabase,
  userId: string,
  locationId: string,
  input: { name: string; locationType: TrainingLocationType },
) {
  await assertLocationOwnership(db, userId, locationId);
  const name = input.name.trim();
  if (!name) throw new Error('Escribe un nombre para la ubicación.');
  await db.runAsync(
    'UPDATE training_location SET name = ?, location_type = ?, updated_at = ? WHERE id = ? AND owner_user_id = ?',
    name,
    input.locationType,
    new Date().toISOString(),
    locationId,
    userId,
  );
}

async function setExclusiveLocationFlag(
  db: SQLiteDatabase,
  userId: string,
  locationId: string,
  column: 'is_active' | 'is_default',
) {
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await assertLocationOwnership(transaction, userId, locationId);
    const now = new Date().toISOString();
    await transaction.runAsync(`UPDATE training_location SET ${column} = 0, updated_at = ? WHERE owner_user_id = ? AND ${column} = 1`, now, userId);
    await transaction.runAsync(`UPDATE training_location SET ${column} = 1, updated_at = ? WHERE id = ? AND owner_user_id = ?`, now, locationId, userId);
  });
}

export function setActiveTrainingLocation(db: SQLiteDatabase, userId: string, locationId: string) {
  return setExclusiveLocationFlag(db, userId, locationId, 'is_active');
}

export function setDefaultTrainingLocation(db: SQLiteDatabase, userId: string, locationId: string) {
  return setExclusiveLocationFlag(db, userId, locationId, 'is_default');
}

export async function deleteTrainingLocation(db: SQLiteDatabase, userId: string, locationId: string) {
  await db.withExclusiveTransactionAsync(async (transaction) => {
    const locations = await transaction.getAllAsync<{ id: string; is_active: number; is_default: number }>(
      'SELECT id, is_active, is_default FROM training_location WHERE owner_user_id = ? ORDER BY created_at, id',
      userId,
    );
    const target = locations.find((location) => location.id === locationId);
    if (!target) throw new Error('La ubicación no pertenece al usuario activo.');
    if (locations.length === 1) throw new Error('No puedes eliminar tu única ubicación.');
    const replacement = locations.find((location) => location.id !== locationId);
    await transaction.runAsync('DELETE FROM training_location WHERE id = ? AND owner_user_id = ?', locationId, userId);
    const now = new Date().toISOString();
    if (target.is_active === 1) await transaction.runAsync('UPDATE training_location SET is_active = 1, updated_at = ? WHERE id = ? AND owner_user_id = ?', now, replacement?.id ?? '', userId);
    if (target.is_default === 1) await transaction.runAsync('UPDATE training_location SET is_default = 1, updated_at = ? WHERE id = ? AND owner_user_id = ?', now, replacement?.id ?? '', userId);
  });
}

export async function listEquipmentCatalog(
  db: SQLiteDatabase,
  userId: string,
  locationId: string,
  options: { query?: string; category?: string } = {},
): Promise<EquipmentCatalogItem[]> {
  await assertLocationOwnership(db, userId, locationId);
  const normalizedQuery = normalizeSearchText(options.query ?? '');
  const escapedQuery = normalizedQuery.replace(/[\\%_]/g, '\\$&');
  const category = options.category && options.category !== 'Todos' ? options.category : null;
  const rows = await db.getAllAsync<EquipmentRow>(
    `SELECT equipment.id, equipment.name, equipment.category, equipment.description,
      equipment.equipment_type, equipment.catalog_version, COALESCE(inventory.enabled, 0) AS enabled
     FROM equipment
     LEFT JOIN training_location_equipment inventory
       ON inventory.equipment_id = equipment.id
      AND inventory.training_location_id = ?
      AND inventory.owner_user_id = ?
     WHERE equipment.active = 1
       AND (? IS NULL OR equipment.category = ?)
       AND (? = '' OR equipment.search_terms LIKE '%' || ? || '%' ESCAPE '\\'
         OR EXISTS (
           SELECT 1 FROM equipment_alias alias
           WHERE alias.equipment_id = equipment.id
             AND alias.normalized_alias LIKE '%' || ? || '%' ESCAPE '\\'
         ))
     ORDER BY enabled DESC, equipment.category, equipment.name`,
    locationId,
    userId,
    category,
    category,
    escapedQuery,
    escapedQuery,
    escapedQuery,
  );
  return rows.map(mapEquipment);
}

export function searchEquipmentCatalog(
  db: SQLiteDatabase,
  userId: string,
  locationId: string,
  query: string,
) {
  return listEquipmentCatalog(db, userId, locationId, { query });
}

export async function listAvailableEquipment(db: SQLiteDatabase, userId: string, locationId: string) {
  return (await listEquipmentCatalog(db, userId, locationId)).filter((equipment) => equipment.enabled);
}

export async function listUnavailableEquipment(db: SQLiteDatabase, userId: string, locationId: string) {
  return (await listEquipmentCatalog(db, userId, locationId)).filter((equipment) => !equipment.enabled);
}

export async function setEquipmentEnabled(
  db: SQLiteDatabase,
  userId: string,
  locationId: string,
  equipmentId: string,
  enabled: boolean,
) {
  await assertLocationOwnership(db, userId, locationId);
  const equipment = await db.getFirstAsync<{ id: string }>('SELECT id FROM equipment WHERE id = ? AND active = 1', equipmentId);
  if (!equipment) throw new Error('El equipo ya no está disponible en el catálogo.');
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO training_location_equipment
      (training_location_id, owner_user_id, equipment_id, enabled, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(training_location_id, equipment_id)
     DO UPDATE SET enabled = excluded.enabled, owner_user_id = excluded.owner_user_id, updated_at = excluded.updated_at`,
    locationId,
    userId,
    equipmentId,
    enabled ? 1 : 0,
    now,
    now,
  );
}

export async function listExercisesForEquipment(db: SQLiteDatabase, equipmentId: string): Promise<EquipmentExerciseSummary[]> {
  return db.getAllAsync<EquipmentExerciseSummary>(
    `SELECT exercise.id, exercise.name, muscle.name AS muscle
     FROM exercise_equipment relation
     JOIN exercise ON exercise.id = relation.exercise_id
     JOIN muscle_group muscle ON muscle.id = exercise.primary_muscle_id
     WHERE relation.equipment_id = ? AND exercise.active = 1
     ORDER BY muscle.name, exercise.name`,
    equipmentId,
  );
}

export async function getEquipmentDetails(
  db: SQLiteDatabase,
  userId: string,
  locationId: string,
  equipmentId: string,
): Promise<EquipmentDetails | null> {
  await assertLocationOwnership(db, userId, locationId);
  const row = await db.getFirstAsync<EquipmentRow>(
    `SELECT equipment.id, equipment.name, equipment.category, equipment.description,
      equipment.equipment_type, equipment.catalog_version, COALESCE(inventory.enabled, 0) AS enabled
     FROM equipment
     LEFT JOIN training_location_equipment inventory
       ON inventory.equipment_id = equipment.id
      AND inventory.training_location_id = ? AND inventory.owner_user_id = ?
     WHERE equipment.id = ? AND equipment.active = 1`,
    locationId,
    userId,
    equipmentId,
  );
  if (!row) return null;
  const [aliases, exercises] = await Promise.all([
    db.getAllAsync<{ alias: string }>('SELECT alias FROM equipment_alias WHERE equipment_id = ? ORDER BY alias', equipmentId),
    listExercisesForEquipment(db, equipmentId),
  ]);
  return { ...mapEquipment(row), aliases: aliases.map((item) => item.alias), exercises };
}

export async function createCustomEquipment(
  db: SQLiteDatabase,
  userId: string,
  locationId: string,
  input: { name: string; category?: string; notes?: string },
) {
  await assertLocationOwnership(db, userId, locationId);
  const name = input.name.trim();
  if (!name) throw new Error('Escribe un nombre para la máquina.');
  const id = createId('custom-equipment');
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT INTO custom_equipment
      (id, owner_user_id, training_location_id, name, normalized_name, category, notes, source, catalog_match_id, active, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'manual', NULL, 1, ?, ?)`,
    id,
    userId,
    locationId,
    name,
    normalizeSearchText(name),
    input.category?.trim() || null,
    input.notes?.trim() || null,
    now,
    now,
  );
  return id;
}

export async function updateCustomEquipment(
  db: SQLiteDatabase,
  userId: string,
  customEquipmentId: string,
  input: { name: string; category?: string; notes?: string; active?: boolean },
) {
  await assertCustomEquipmentOwnership(db, userId, customEquipmentId);
  const name = input.name.trim();
  if (!name) throw new Error('Escribe un nombre para la máquina.');
  await db.runAsync(
    `UPDATE custom_equipment
     SET name = ?, normalized_name = ?, category = ?, notes = ?, active = COALESCE(?, active), updated_at = ?
     WHERE id = ? AND owner_user_id = ?`,
    name,
    normalizeSearchText(name),
    input.category?.trim() || null,
    input.notes?.trim() || null,
    input.active === undefined ? null : input.active ? 1 : 0,
    new Date().toISOString(),
    customEquipmentId,
    userId,
  );
}

export async function deleteCustomEquipment(db: SQLiteDatabase, userId: string, customEquipmentId: string) {
  await assertCustomEquipmentOwnership(db, userId, customEquipmentId);
  await db.runAsync('DELETE FROM custom_equipment WHERE id = ? AND owner_user_id = ?', customEquipmentId, userId);
}

export async function listCustomEquipment(db: SQLiteDatabase, userId: string, locationId: string): Promise<CustomEquipment[]> {
  await assertLocationOwnership(db, userId, locationId);
  const rows = await db.getAllAsync<CustomEquipmentRow>(
    `SELECT id, owner_user_id, training_location_id, name, category, notes, source,
      catalog_match_id, active, created_at, updated_at
     FROM custom_equipment
     WHERE owner_user_id = ? AND training_location_id = ? AND active = 1
     ORDER BY normalized_name`,
    userId,
    locationId,
  );
  const result: CustomEquipment[] = [];
  for (const row of rows) {
    const exercises = await listExercisesForCustomEquipment(db, userId, row.id);
    result.push({
      id: row.id,
      ownerUserId: row.owner_user_id,
      trainingLocationId: row.training_location_id,
      name: row.name,
      category: row.category,
      notes: row.notes,
      source: row.source,
      catalogMatchId: row.catalog_match_id,
      active: row.active === 1,
      linkedExerciseIds: exercises.map((exercise) => exercise.id),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    });
  }
  return result;
}

export async function linkCustomEquipmentExercise(
  db: SQLiteDatabase,
  userId: string,
  customEquipmentId: string,
  exerciseId: string,
) {
  await assertCustomEquipmentOwnership(db, userId, customEquipmentId);
  const exercise = await db.getFirstAsync<{ id: string }>('SELECT id FROM exercise WHERE id = ? AND active = 1', exerciseId);
  if (!exercise) throw new Error('El ejercicio ya no está disponible en el catálogo.');
  await db.runAsync(
    `INSERT OR IGNORE INTO custom_equipment_exercise
      (custom_equipment_id, owner_user_id, exercise_id, created_at) VALUES (?, ?, ?, ?)`,
    customEquipmentId,
    userId,
    exerciseId,
    new Date().toISOString(),
  );
}

export async function unlinkCustomEquipmentExercise(
  db: SQLiteDatabase,
  userId: string,
  customEquipmentId: string,
  exerciseId: string,
) {
  await assertCustomEquipmentOwnership(db, userId, customEquipmentId);
  await db.runAsync(
    'DELETE FROM custom_equipment_exercise WHERE custom_equipment_id = ? AND owner_user_id = ? AND exercise_id = ?',
    customEquipmentId,
    userId,
    exerciseId,
  );
}

export async function listExercisesForCustomEquipment(
  db: SQLiteDatabase,
  userId: string,
  customEquipmentId: string,
): Promise<EquipmentExerciseSummary[]> {
  await assertCustomEquipmentOwnership(db, userId, customEquipmentId);
  return db.getAllAsync<EquipmentExerciseSummary>(
    `SELECT exercise.id, exercise.name, muscle.name AS muscle
     FROM custom_equipment_exercise relation
     JOIN exercise ON exercise.id = relation.exercise_id
     JOIN muscle_group muscle ON muscle.id = exercise.primary_muscle_id
     WHERE relation.custom_equipment_id = ? AND relation.owner_user_id = ?
     ORDER BY muscle.name, exercise.name`,
    customEquipmentId,
    userId,
  );
}

export async function listAvailableExerciseIds(
  db: SQLiteDatabase,
  userId: string,
  locationId: string,
) {
  await assertLocationOwnership(db, userId, locationId);
  const rows = await db.getAllAsync<{ id: string }>(
    `SELECT exercise.id
     FROM exercise
     WHERE exercise.active = 1
       AND (
         NOT EXISTS (
           SELECT 1 FROM exercise_equipment required
           WHERE required.exercise_id = exercise.id
             AND NOT EXISTS (
               SELECT 1 FROM training_location_equipment inventory
               WHERE inventory.training_location_id = ?
                 AND inventory.owner_user_id = ?
                 AND inventory.equipment_id = required.equipment_id
                 AND inventory.enabled = 1
             )
         )
         OR EXISTS (
           SELECT 1 FROM custom_equipment_exercise custom_relation
           JOIN custom_equipment custom ON custom.id = custom_relation.custom_equipment_id
             AND custom.owner_user_id = custom_relation.owner_user_id
           WHERE custom_relation.exercise_id = exercise.id
             AND custom_relation.owner_user_id = ?
             AND custom.training_location_id = ?
             AND custom.active = 1
         )
       )`,
    locationId,
    userId,
    userId,
    locationId,
  );
  return new Set(rows.map((row) => row.id));
}

export async function isExerciseAvailable(
  db: SQLiteDatabase,
  userId: string,
  locationId: string,
  exerciseId: string,
) {
  return (await listAvailableExerciseIds(db, userId, locationId)).has(exerciseId);
}
