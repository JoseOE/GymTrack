export const schemaV1 = `
CREATE TABLE IF NOT EXISTS user_profile (
  id TEXT PRIMARY KEY NOT NULL,
  display_name TEXT NOT NULL,
  height_cm REAL NOT NULL CHECK (height_cm > 0),
  weight_kg REAL NOT NULL CHECK (weight_kg > 0),
  goal TEXT NOT NULL,
  experience_level TEXT NOT NULL,
  default_workout_minutes INTEGER NOT NULL CHECK (default_workout_minutes > 0),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS muscle_group (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  parent_id TEXT REFERENCES muscle_group(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS equipment (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS exercise (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL UNIQUE,
  primary_muscle_id TEXT NOT NULL REFERENCES muscle_group(id),
  exercise_family TEXT NOT NULL,
  movement_pattern TEXT NOT NULL,
  exercise_type TEXT NOT NULL CHECK (exercise_type IN ('compound', 'isolation', 'cardio')),
  difficulty TEXT NOT NULL,
  unilateral INTEGER NOT NULL DEFAULT 0 CHECK (unilateral IN (0, 1)),
  estimated_minutes INTEGER NOT NULL CHECK (estimated_minutes > 0),
  tags TEXT NOT NULL DEFAULT '[]',
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
);

CREATE TABLE IF NOT EXISTS exercise_secondary_muscle (
  exercise_id TEXT NOT NULL REFERENCES exercise(id) ON DELETE CASCADE,
  muscle_id TEXT NOT NULL REFERENCES muscle_group(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, muscle_id)
);

CREATE TABLE IF NOT EXISTS exercise_equipment (
  exercise_id TEXT NOT NULL REFERENCES exercise(id) ON DELETE CASCADE,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  PRIMARY KEY (exercise_id, equipment_id)
);

CREATE TABLE IF NOT EXISTS routine (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  estimated_minutes INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS routine_exercise (
  id TEXT PRIMARY KEY NOT NULL,
  routine_id TEXT NOT NULL REFERENCES routine(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercise(id),
  order_index INTEGER NOT NULL,
  target_sets INTEGER NOT NULL DEFAULT 3,
  min_reps INTEGER NOT NULL DEFAULT 8,
  max_reps INTEGER NOT NULL DEFAULT 12,
  rest_seconds INTEGER NOT NULL DEFAULT 90,
  UNIQUE (routine_id, order_index)
);

CREATE TABLE IF NOT EXISTS workout_session (
  id TEXT PRIMARY KEY NOT NULL,
  routine_id TEXT REFERENCES routine(id) ON DELETE SET NULL,
  started_at TEXT NOT NULL,
  completed_at TEXT,
  status TEXT NOT NULL CHECK (status IN ('active', 'completed', 'cancelled')),
  notes TEXT
);

CREATE TABLE IF NOT EXISTS workout_exercise (
  id TEXT PRIMARY KEY NOT NULL,
  workout_session_id TEXT NOT NULL REFERENCES workout_session(id) ON DELETE CASCADE,
  exercise_id TEXT NOT NULL REFERENCES exercise(id),
  order_index INTEGER NOT NULL,
  UNIQUE (workout_session_id, order_index)
);

CREATE TABLE IF NOT EXISTS workout_set (
  id TEXT PRIMARY KEY NOT NULL,
  workout_exercise_id TEXT NOT NULL REFERENCES workout_exercise(id) ON DELETE CASCADE,
  set_number INTEGER NOT NULL,
  weight_kg REAL NOT NULL DEFAULT 0 CHECK (weight_kg >= 0),
  repetitions INTEGER NOT NULL DEFAULT 0 CHECK (repetitions >= 0),
  completed INTEGER NOT NULL DEFAULT 0 CHECK (completed IN (0, 1)),
  created_at TEXT NOT NULL,
  UNIQUE (workout_exercise_id, set_number)
);

CREATE INDEX IF NOT EXISTS idx_exercise_primary_muscle ON exercise(primary_muscle_id);
CREATE INDEX IF NOT EXISTS idx_routine_exercise_routine ON routine_exercise(routine_id, order_index);
CREATE INDEX IF NOT EXISTS idx_workout_session_status ON workout_session(status, started_at DESC);
CREATE INDEX IF NOT EXISTS idx_workout_exercise_session ON workout_exercise(workout_session_id, order_index);
CREATE INDEX IF NOT EXISTS idx_workout_set_exercise ON workout_set(workout_exercise_id, set_number);
`;
