export const schemaV3 = `
CREATE TABLE weekly_plan (
  id TEXT PRIMARY KEY NOT NULL,
  user_profile_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('default', 'manual', 'ai')),
  is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE UNIQUE INDEX idx_weekly_plan_single_active
ON weekly_plan(user_profile_id)
WHERE is_active = 1;

CREATE TABLE weekly_plan_day (
  id TEXT PRIMARY KEY NOT NULL,
  weekly_plan_id TEXT NOT NULL REFERENCES weekly_plan(id) ON DELETE CASCADE,
  day_index INTEGER NOT NULL CHECK (day_index BETWEEN 0 AND 6),
  session_type TEXT NOT NULL CHECK (session_type IN ('strength', 'cardio', 'rest')),
  display_name TEXT NOT NULL,
  estimated_minutes INTEGER CHECK (estimated_minutes IS NULL OR estimated_minutes > 0),
  is_optional INTEGER NOT NULL DEFAULT 0 CHECK (is_optional IN (0, 1)),
  counts_toward_goal INTEGER NOT NULL DEFAULT 0 CHECK (counts_toward_goal IN (0, 1)),
  target_exercise_count INTEGER CHECK (target_exercise_count IS NULL OR target_exercise_count > 0),
  UNIQUE (weekly_plan_id, day_index)
);

CREATE TABLE weekly_plan_day_muscle (
  weekly_plan_day_id TEXT NOT NULL REFERENCES weekly_plan_day(id) ON DELETE CASCADE,
  muscle_id TEXT NOT NULL REFERENCES muscle_group(id),
  order_index INTEGER NOT NULL CHECK (order_index >= 0),
  PRIMARY KEY (weekly_plan_day_id, muscle_id),
  UNIQUE (weekly_plan_day_id, order_index)
);

CREATE INDEX idx_weekly_plan_day_plan ON weekly_plan_day(weekly_plan_id, day_index);
CREATE INDEX idx_weekly_plan_day_muscle_day ON weekly_plan_day_muscle(weekly_plan_day_id, order_index);

ALTER TABLE workout_session ADD COLUMN scheduled_day_index INTEGER CHECK (scheduled_day_index IS NULL OR scheduled_day_index BETWEEN 0 AND 6);
ALTER TABLE workout_session ADD COLUMN counts_toward_goal INTEGER NOT NULL DEFAULT 0 CHECK (counts_toward_goal IN (0, 1));

UPDATE workout_session
SET scheduled_day_index = CAST(strftime('%w', started_at, 'localtime') AS INTEGER);

UPDATE workout_session
SET counts_toward_goal = 1
WHERE CAST(strftime('%w', started_at, 'localtime') AS INTEGER) BETWEEN 1 AND 5
  AND COALESCE(display_name, '') NOT LIKE '%Adicional%';
`;
