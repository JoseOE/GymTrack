export const schemaV2 = `
ALTER TABLE workout_session ADD COLUMN display_name TEXT;

UPDATE workout_session
SET status = 'cancelled'
WHERE status = 'active'
  AND id NOT IN (
    SELECT id FROM workout_session
    WHERE status = 'active'
    ORDER BY started_at DESC, id DESC
    LIMIT 1
  );

CREATE UNIQUE INDEX IF NOT EXISTS idx_workout_session_single_active
ON workout_session(status)
WHERE status = 'active';
`;
