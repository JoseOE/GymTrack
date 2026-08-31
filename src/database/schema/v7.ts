// Personal records use v7; the future cloud-sync migration moves to SQLite v8.
export const schemaV7 = `
CREATE TABLE personal_record (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  exercise_key TEXT NOT NULL CHECK (exercise_key IN ('bench_press', 'squat', 'deadlift')),
  weight_kg REAL NOT NULL CHECK (weight_kg >= 0),
  source TEXT NOT NULL CHECK (source IN ('manual', 'workout', 'test')),
  updated_at TEXT NOT NULL,
  UNIQUE (owner_user_id, exercise_key)
);

CREATE INDEX idx_personal_record_owner
ON personal_record(owner_user_id, updated_at DESC);
`;
