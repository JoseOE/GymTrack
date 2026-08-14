import type { SQLiteDatabase } from 'expo-sqlite';

import { defaultWeeklyPlanTemplate } from '@/constants/workoutSchedule';
import type { WeeklyPlan, WeeklyPlanDay, WeeklyPlanDraft, WeeklyPlanSource } from '@/domain/models';
import { validateWeeklyPlan } from '@/services/weeklyPlanService';
import { createId } from '@/utils/id';

type PlanHeaderRow = {
  id: string;
  user_profile_id: string;
  name: string;
  source: WeeklyPlanSource;
  is_active: number;
  created_at: string;
  updated_at: string;
};

type PlanDayRow = {
  day_id: string;
  day_index: number;
  session_type: WeeklyPlanDay['sessionType'];
  display_name: string;
  estimated_minutes: number | null;
  is_optional: number;
  counts_toward_goal: number;
  target_exercise_count: number | null;
  muscle_id: string | null;
  muscle_name: string | null;
  muscle_order_index: number | null;
};

async function mapPlan(db: SQLiteDatabase, header: PlanHeaderRow): Promise<WeeklyPlan> {
  const rows = await db.getAllAsync<PlanDayRow>(
    `SELECT day.id AS day_id, day.day_index, day.session_type, day.display_name,
      day.estimated_minutes, day.is_optional, day.counts_toward_goal, day.target_exercise_count,
      muscle.id AS muscle_id, muscle.name AS muscle_name, relation.order_index AS muscle_order_index
     FROM weekly_plan_day day
     LEFT JOIN weekly_plan_day_muscle relation ON relation.weekly_plan_day_id = day.id
     LEFT JOIN muscle_group muscle ON muscle.id = relation.muscle_id
     WHERE day.weekly_plan_id = ?
     ORDER BY day.day_index, relation.order_index`,
    header.id,
  );
  const dayMap = new Map<string, WeeklyPlanDay>();
  for (const row of rows) {
    let day = dayMap.get(row.day_id);
    if (!day) {
      day = {
        id: row.day_id,
        dayIndex: row.day_index,
        sessionType: row.session_type,
        displayName: row.display_name,
        estimatedMinutes: row.estimated_minutes,
        isOptional: row.is_optional === 1,
        countsTowardGoal: row.counts_toward_goal === 1,
        targetExerciseCount: row.target_exercise_count,
        muscles: [],
      };
      dayMap.set(row.day_id, day);
    }
    if (row.muscle_id && row.muscle_name && row.muscle_order_index !== null) {
      day.muscles.push({ id: row.muscle_id, name: row.muscle_name, orderIndex: row.muscle_order_index });
    }
  }
  return {
    id: header.id,
    userProfileId: header.user_profile_id,
    name: header.name,
    source: header.source,
    isActive: header.is_active === 1,
    createdAt: header.created_at,
    updatedAt: header.updated_at,
    days: [...dayMap.values()].sort((left, right) => left.dayIndex - right.dayIndex),
  };
}

export async function getActiveWeeklyPlan(db: SQLiteDatabase, profileId: string): Promise<WeeklyPlan | null> {
  const header = await db.getFirstAsync<PlanHeaderRow>(
    `SELECT * FROM weekly_plan WHERE user_profile_id = ? AND is_active = 1
     ORDER BY updated_at DESC LIMIT 1`,
    profileId,
  );
  return header ? mapPlan(db, header) : null;
}

async function insertPlan(transaction: SQLiteDatabase, profileId: string, draft: WeeklyPlanDraft) {
  const planId = createId('weekly-plan');
  const now = new Date().toISOString();
  await transaction.runAsync(
    `INSERT INTO weekly_plan (id, user_profile_id, name, source, is_active, created_at, updated_at)
     VALUES (?, ?, ?, ?, 1, ?, ?)`,
    planId,
    profileId,
    draft.name.trim(),
    draft.source,
    now,
    now,
  );
  for (const day of draft.days) {
    const dayId = createId('weekly-plan-day');
    await transaction.runAsync(
      `INSERT INTO weekly_plan_day
        (id, weekly_plan_id, day_index, session_type, display_name, estimated_minutes,
         is_optional, counts_toward_goal, target_exercise_count)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      dayId,
      planId,
      day.dayIndex,
      day.sessionType,
      day.displayName,
      day.estimatedMinutes,
      day.isOptional ? 1 : 0,
      day.countsTowardGoal ? 1 : 0,
      day.targetExerciseCount,
    );
    for (const [orderIndex, muscle] of day.muscles.entries()) {
      await transaction.runAsync(
        `INSERT INTO weekly_plan_day_muscle (weekly_plan_day_id, muscle_id, order_index)
         VALUES (?, ?, ?)`,
        dayId,
        muscle.id,
        orderIndex,
      );
    }
  }
  return planId;
}

export async function replaceWeeklyPlan(db: SQLiteDatabase, profileId: string, draft: WeeklyPlanDraft) {
  validateWeeklyPlan(draft);
  await db.withExclusiveTransactionAsync(async (transaction) => {
    await transaction.runAsync(
      'UPDATE weekly_plan SET is_active = 0, updated_at = ? WHERE user_profile_id = ? AND is_active = 1',
      new Date().toISOString(),
      profileId,
    );
    await insertPlan(transaction, profileId, draft);
  });
  const plan = await getActiveWeeklyPlan(db, profileId);
  if (!plan) throw new Error('No se pudo recuperar el plan semanal guardado.');
  return plan;
}

export async function saveWeeklyPlan(db: SQLiteDatabase, profileId: string, draft: WeeklyPlanDraft) {
  return replaceWeeklyPlan(db, profileId, draft);
}

export async function resetWeeklyPlanToDefault(db: SQLiteDatabase, profileId: string) {
  return replaceWeeklyPlan(db, profileId, defaultWeeklyPlanTemplate);
}

export async function ensureActiveWeeklyPlan(db: SQLiteDatabase, profileId: string) {
  const existing = await getActiveWeeklyPlan(db, profileId);
  return existing ?? replaceWeeklyPlan(db, profileId, defaultWeeklyPlanTemplate);
}
