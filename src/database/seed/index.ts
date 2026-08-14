import type { SQLiteDatabase } from 'expo-sqlite';

import { equipmentSeeds, exerciseSeeds, muscleSeeds } from '@/database/seed/catalog';
import {
  catalogV2Equipment, catalogV2Exercises, equipmentAliases, getCatalogV1EquipmentType,
} from '@/database/seed/catalogV2';
import { normalizeSearchText } from '@/utils/search';

const CATALOG_V1_KEY = 'catalog-v1';
const CATALOG_V2_KEY = 'catalog-v2';

export async function seedDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _seed_state (
      key TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
  const catalogV1 = await db.getFirstAsync<{ key: string }>('SELECT key FROM _seed_state WHERE key = ?', CATALOG_V1_KEY);
  if (!catalogV1) await db.withExclusiveTransactionAsync(async (transaction) => {
    for (const [id, name, parentId] of muscleSeeds) {
      await transaction.runAsync(
        'INSERT OR IGNORE INTO muscle_group (id, name, parent_id) VALUES (?, ?, ?)',
        id,
        name,
        parentId,
      );
    }

    const equipmentIds = new Map<string, string>();
    for (const equipment of equipmentSeeds) {
      equipmentIds.set(equipment.name, equipment.id);
      await transaction.runAsync(
        'INSERT OR IGNORE INTO equipment (id, name, category, active) VALUES (?, ?, ?, 1)',
        equipment.id,
        equipment.name,
        equipment.category,
      );
    }

    const muscleIds = new Map<string, string>(muscleSeeds.map(([id, name]) => [name, id]));
    for (const exercise of exerciseSeeds) {
      const exerciseId = exercise.id;
      const primaryMuscleId = muscleIds.get(exercise.primary);
      if (!primaryMuscleId) throw new Error(`Músculo principal no encontrado: ${exercise.primary}`);
      await transaction.runAsync(
        `INSERT OR IGNORE INTO exercise
          (id, name, primary_muscle_id, exercise_family, movement_pattern, exercise_type, difficulty, unilateral, estimated_minutes, tags, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        exerciseId,
        exercise.name,
        primaryMuscleId,
        exercise.family,
        exercise.pattern,
        exercise.type,
        exercise.difficulty ?? 'Principiante',
        exercise.unilateral ? 1 : 0,
        exercise.minutes ?? 6,
        JSON.stringify(exercise.tags ?? []),
      );

      for (const secondary of exercise.secondary ?? []) {
        const muscleId = muscleIds.get(secondary);
        if (!muscleId) throw new Error(`Músculo secundario no encontrado: ${secondary}`);
        await transaction.runAsync(
          'INSERT OR IGNORE INTO exercise_secondary_muscle (exercise_id, muscle_id) VALUES (?, ?)',
          exerciseId,
          muscleId,
        );
      }
      for (const equipmentName of exercise.equipment) {
        const equipmentId = equipmentIds.get(equipmentName);
        if (!equipmentId) throw new Error(`Equipo no encontrado: ${equipmentName}`);
        await transaction.runAsync(
          'INSERT OR IGNORE INTO exercise_equipment (exercise_id, equipment_id) VALUES (?, ?)',
          exerciseId,
          equipmentId,
        );
      }
    }

    await transaction.runAsync('INSERT INTO _seed_state (key, applied_at) VALUES (?, ?)', CATALOG_V1_KEY, new Date().toISOString());
  });

  const catalogV2 = await db.getFirstAsync<{ key: string }>('SELECT key FROM _seed_state WHERE key = ?', CATALOG_V2_KEY);
  if (!catalogV2) await db.withExclusiveTransactionAsync(async (transaction) => {
    const aliasesByEquipment = new Map<string, string[]>();
    for (const item of equipmentAliases) {
      const aliases = aliasesByEquipment.get(item.equipmentId) ?? [];
      aliases.push(item.alias);
      aliasesByEquipment.set(item.equipmentId, aliases);
    }

    for (const equipment of equipmentSeeds) {
      const terms = normalizeSearchText([
        equipment.name,
        equipment.category,
        ...(aliasesByEquipment.get(equipment.id) ?? []),
      ].join(' '));
      await transaction.runAsync(
        `UPDATE equipment
         SET description = ?, equipment_type = ?, search_terms = ?, catalog_version = 1
         WHERE id = ?`,
        `Equipo del catálogo base de GymTrack para la categoría ${equipment.category}.`,
        getCatalogV1EquipmentType(equipment.id),
        terms,
        equipment.id,
      );
    }

    for (const equipment of catalogV2Equipment) {
      const terms = normalizeSearchText([
        equipment.name,
        equipment.category,
        ...(equipment.searchTerms ?? []),
        ...(aliasesByEquipment.get(equipment.id) ?? []),
      ].join(' '));
      await transaction.runAsync(
        `INSERT OR IGNORE INTO equipment
          (id, name, category, active, description, equipment_type, search_terms, catalog_version)
         VALUES (?, ?, ?, 1, ?, ?, ?, 2)`,
        equipment.id,
        equipment.name,
        equipment.category,
        equipment.description,
        equipment.equipmentType,
        terms,
      );
    }

    for (const exercise of catalogV2Exercises) {
      await transaction.runAsync(
        `INSERT OR IGNORE INTO exercise
          (id, name, primary_muscle_id, exercise_family, movement_pattern, exercise_type, difficulty, unilateral, estimated_minutes, tags, active)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        exercise.id,
        exercise.name,
        exercise.primaryMuscleId,
        exercise.family,
        exercise.pattern,
        exercise.type,
        exercise.difficulty ?? 'Principiante',
        exercise.unilateral ? 1 : 0,
        exercise.minutes ?? 6,
        JSON.stringify(exercise.tags ?? []),
      );
      for (const muscleId of exercise.secondaryMuscleIds) {
        await transaction.runAsync(
          'INSERT OR IGNORE INTO exercise_secondary_muscle (exercise_id, muscle_id) VALUES (?, ?)',
          exercise.id,
          muscleId,
        );
      }
      for (const equipmentId of exercise.equipmentIds) {
        await transaction.runAsync(
          'INSERT OR IGNORE INTO exercise_equipment (exercise_id, equipment_id) VALUES (?, ?)',
          exercise.id,
          equipmentId,
        );
      }
    }

    for (const item of equipmentAliases) {
      await transaction.runAsync(
        'INSERT OR IGNORE INTO equipment_alias (equipment_id, alias, normalized_alias) VALUES (?, ?, ?)',
        item.equipmentId,
        item.alias,
        normalizeSearchText(item.alias),
      );
    }

    await transaction.runAsync('INSERT INTO _seed_state (key, applied_at) VALUES (?, ?)', CATALOG_V2_KEY, new Date().toISOString());
  });
}
