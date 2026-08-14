import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureActiveWeeklyPlan } from '@/database/repositories/weeklyPlanRepository';
import { equipmentSeeds, exerciseSeeds, muscleSeeds } from '@/database/seed/catalog';

const SEED_KEY = 'catalog-v1';

export async function seedDatabase(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _seed_state (
      key TEXT PRIMARY KEY NOT NULL,
      applied_at TEXT NOT NULL
    );
  `);
  const existing = await db.getFirstAsync<{ key: string }>('SELECT key FROM _seed_state WHERE key = ?', SEED_KEY);
  if (!existing) await db.withExclusiveTransactionAsync(async (transaction) => {
    for (const [id, name, parentId] of muscleSeeds) {
      await transaction.runAsync(
        'INSERT OR IGNORE INTO muscle_group (id, name, parent_id) VALUES (?, ?, ?)',
        id,
        name,
        parentId,
      );
    }

    const equipmentIds = new Map<string, string>();
    for (const [index, equipment] of equipmentSeeds.entries()) {
      const id = `equipment-${String(index + 1).padStart(3, '0')}`;
      equipmentIds.set(equipment.name, id);
      await transaction.runAsync(
        'INSERT OR IGNORE INTO equipment (id, name, category, active) VALUES (?, ?, ?, 1)',
        id,
        equipment.name,
        equipment.category,
      );
    }

    const muscleIds = new Map<string, string>(muscleSeeds.map(([id, name]) => [name, id]));
    for (const [index, exercise] of exerciseSeeds.entries()) {
      const exerciseId = `exercise-${String(index + 1).padStart(3, '0')}`;
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

    const now = new Date().toISOString();
    await transaction.runAsync(
      `INSERT OR IGNORE INTO user_profile
        (id, display_name, height_cm, weight_kg, goal, experience_level, default_workout_minutes, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      'local-user',
      'Atleta',
      170,
      70,
      'Ganar músculo',
      'Intermedio',
      60,
      now,
      now,
    );
    await transaction.runAsync('INSERT INTO _seed_state (key, applied_at) VALUES (?, ?)', SEED_KEY, now);
  });
  await ensureActiveWeeklyPlan(db, 'local-user');
}
