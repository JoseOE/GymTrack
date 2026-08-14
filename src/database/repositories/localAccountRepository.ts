import type { SQLiteDatabase } from 'expo-sqlite';

import { ensureProfile, getProfile, saveProfile } from '@/database/repositories/profileRepository';
import { ensureActiveWeeklyPlan } from '@/database/repositories/weeklyPlanRepository';
import type { OnboardingProfileInput } from '@/domain/models';

export type LegacyDataStatus = 'none' | 'available' | 'linked' | 'archived';

export async function getLegacyDataStatus(db: SQLiteDatabase, userId: string) {
  const existingProfile = await db.getFirstAsync<{ id: string }>('SELECT id FROM user_profile WHERE id = ?', userId);
  if (existingProfile) return { status: 'none' as const, requiresDecision: false };
  const row = await db.getFirstAsync<{ status: LegacyDataStatus }>('SELECT status FROM local_data_migration WHERE id = 1');
  const status = row?.status ?? 'none';
  return { status, requiresDecision: status === 'available' };
}

export async function ensureUserWorkspace(db: SQLiteDatabase, userId: string, displayName: string) {
  const profile = await ensureProfile(db, userId, displayName);
  await ensureActiveWeeklyPlan(db, userId);
  return profile;
}

export async function linkLegacyData(db: SQLiteDatabase, userId: string, fallbackDisplayName: string) {
  await db.withExclusiveTransactionAsync(async (transaction) => {
    const state = await transaction.getFirstAsync<{ status: LegacyDataStatus }>('SELECT status FROM local_data_migration WHERE id = 1');
    if (state?.status !== 'available') throw new Error('Los datos locales ya fueron resueltos.');
    const legacy = await transaction.getFirstAsync<{ id: string }>('SELECT id FROM user_profile WHERE id = ?', 'local-user');
    if (!legacy) throw new Error('No se encontraron datos locales para vincular.');
    await transaction.runAsync(
      `INSERT INTO user_profile
        (id, display_name, height_cm, weight_kg, goal, experience_level, default_workout_minutes, created_at, updated_at)
       SELECT ?, display_name, height_cm, weight_kg, goal, experience_level, default_workout_minutes, created_at, ?
       FROM user_profile WHERE id = ?`,
      userId,
      new Date().toISOString(),
      'local-user',
    );
    await transaction.runAsync('UPDATE weekly_plan SET user_profile_id = ? WHERE user_profile_id = ?', userId, 'local-user');
    await transaction.runAsync('UPDATE routine SET owner_user_id = ? WHERE owner_user_id = ?', userId, 'local-user');
    await transaction.runAsync('UPDATE workout_session SET owner_user_id = ? WHERE owner_user_id = ?', userId, 'local-user');
    await transaction.runAsync(
      `UPDATE local_data_migration SET status = 'linked', resolved_user_id = ?, resolved_at = ? WHERE id = 1`,
      userId,
      new Date().toISOString(),
    );
  });
  const profile = await getProfile(db, userId).catch(() => ensureProfile(db, userId, fallbackDisplayName));
  await ensureActiveWeeklyPlan(db, userId);
  return profile;
}

export async function archiveLegacyAndStartFresh(db: SQLiteDatabase, userId: string, displayName: string) {
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      `UPDATE local_data_migration SET status = 'archived', resolved_user_id = ?, resolved_at = ?
       WHERE id = 1 AND status = 'available'`,
      userId,
      new Date().toISOString(),
    );
  });
  return ensureUserWorkspace(db, userId, displayName);
}

export async function saveOnboardingProfile(db: SQLiteDatabase, userId: string, input: OnboardingProfileInput) {
  const current = await ensureProfile(db, userId, input.displayName);
  return saveProfile(db, {
    ...current,
    displayName: input.displayName,
    heightCm: input.heightCm,
    weightKg: input.weightKg,
    goal: input.goal,
    experienceLevel: input.experienceLevel,
    defaultWorkoutMinutes: input.defaultWorkoutMinutes,
  });
}
