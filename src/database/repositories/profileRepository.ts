import type { SQLiteDatabase } from 'expo-sqlite';

import type { ExperienceLevel, Goal, UserProfile } from '@/domain/models';

type ProfileRow = {
  id: string;
  display_name: string;
  height_cm: number;
  weight_kg: number;
  goal: Goal;
  experience_level: ExperienceLevel;
  default_workout_minutes: number;
  created_at: string;
  updated_at: string;
};

function mapProfile(row: ProfileRow): UserProfile {
  return {
    id: row.id,
    displayName: row.display_name,
    heightCm: row.height_cm,
    weightKg: row.weight_kg,
    goal: row.goal,
    experienceLevel: row.experience_level,
    defaultWorkoutMinutes: row.default_workout_minutes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getProfile(db: SQLiteDatabase, userId: string) {
  const row = await db.getFirstAsync<ProfileRow>('SELECT * FROM user_profile WHERE id = ?', userId);
  if (!row) throw new Error('No se encontró el perfil local.');
  return mapProfile(row);
}

export async function ensureProfile(db: SQLiteDatabase, userId: string, displayName: string) {
  const now = new Date().toISOString();
  await db.runAsync(
    `INSERT OR IGNORE INTO user_profile
      (id, display_name, height_cm, weight_kg, goal, experience_level, default_workout_minutes, created_at, updated_at)
     VALUES (?, ?, 170, 70, 'Ganar músculo', 'Principiante', 60, ?, ?)`,
    userId,
    displayName.trim() || 'Atleta',
    now,
    now,
  );
  return getProfile(db, userId);
}

export async function saveProfile(db: SQLiteDatabase, profile: UserProfile) {
  const updatedAt = new Date().toISOString();
  await db.runAsync(
    `UPDATE user_profile SET display_name = ?, height_cm = ?, weight_kg = ?, goal = ?,
      experience_level = ?, default_workout_minutes = ?, updated_at = ? WHERE id = ?`,
    profile.displayName.trim(),
    profile.heightCm,
    profile.weightKg,
    profile.goal,
    profile.experienceLevel,
    profile.defaultWorkoutMinutes,
    updatedAt,
    profile.id,
  );
  return getProfile(db, profile.id);
}
