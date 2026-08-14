export const schemaV4 = `
ALTER TABLE routine ADD COLUMN owner_user_id TEXT REFERENCES user_profile(id) ON DELETE CASCADE;
ALTER TABLE workout_session ADD COLUMN owner_user_id TEXT REFERENCES user_profile(id) ON DELETE CASCADE;

UPDATE routine SET owner_user_id = 'local-user' WHERE owner_user_id IS NULL;
UPDATE workout_session SET owner_user_id = 'local-user' WHERE owner_user_id IS NULL;

DROP INDEX IF EXISTS idx_workout_session_single_active;
CREATE UNIQUE INDEX idx_workout_session_single_active_per_owner
ON workout_session(owner_user_id, status)
WHERE status = 'active';
CREATE INDEX idx_routine_owner ON routine(owner_user_id, updated_at DESC);
CREATE INDEX idx_workout_session_owner_status ON workout_session(owner_user_id, status, started_at DESC);

CREATE TRIGGER routine_owner_required
BEFORE INSERT ON routine
WHEN NEW.owner_user_id IS NULL
BEGIN
  SELECT RAISE(ABORT, 'routine owner is required');
END;

CREATE TRIGGER workout_session_owner_required
BEFORE INSERT ON workout_session
WHEN NEW.owner_user_id IS NULL
BEGIN
  SELECT RAISE(ABORT, 'workout session owner is required');
END;

CREATE TABLE local_data_migration (
  id INTEGER PRIMARY KEY NOT NULL CHECK (id = 1),
  status TEXT NOT NULL CHECK (status IN ('none', 'available', 'linked', 'archived')),
  resolved_user_id TEXT,
  resolved_at TEXT
);

INSERT INTO local_data_migration (id, status)
VALUES (
  1,
  CASE WHEN EXISTS (
    SELECT 1 FROM user_profile profile
    WHERE profile.id = 'local-user'
      AND (
        profile.display_name <> 'Atleta'
        OR profile.height_cm <> 170
        OR profile.weight_kg <> 70
        OR profile.goal <> 'Ganar músculo'
        OR profile.experience_level <> 'Intermedio'
        OR profile.default_workout_minutes <> 60
        OR EXISTS (SELECT 1 FROM routine WHERE owner_user_id = 'local-user')
        OR EXISTS (SELECT 1 FROM workout_session WHERE owner_user_id = 'local-user')
        OR EXISTS (SELECT 1 FROM weekly_plan WHERE user_profile_id = 'local-user' AND source <> 'default')
      )
  ) THEN 'available' ELSE 'none' END
);
`;
