// SQLite v7 is reserved for the future cloud-sync phase.
export const schemaV6 = `
ALTER TABLE routine_exercise ADD COLUMN exercise_mode TEXT NOT NULL DEFAULT 'strength'
  CHECK (exercise_mode IN ('strength', 'cardio'));
ALTER TABLE routine_exercise ADD COLUMN target_duration_minutes INTEGER
  CHECK (target_duration_minutes IS NULL OR target_duration_minutes > 0);

UPDATE routine_exercise
SET exercise_mode = 'cardio',
    target_duration_minutes = (
      SELECT exercise.estimated_minutes FROM exercise WHERE exercise.id = routine_exercise.exercise_id
    ),
    target_sets = 0,
    min_reps = 0,
    max_reps = 0,
    rest_seconds = 0
WHERE EXISTS (
  SELECT 1 FROM exercise
  WHERE exercise.id = routine_exercise.exercise_id AND exercise.exercise_type = 'cardio'
);

ALTER TABLE workout_exercise ADD COLUMN exercise_mode TEXT NOT NULL DEFAULT 'strength'
  CHECK (exercise_mode IN ('strength', 'cardio'));
ALTER TABLE workout_exercise ADD COLUMN target_duration_minutes INTEGER
  CHECK (target_duration_minutes IS NULL OR target_duration_minutes > 0);
ALTER TABLE workout_exercise ADD COLUMN cardio_timer_state TEXT NOT NULL DEFAULT 'idle'
  CHECK (cardio_timer_state IN ('idle', 'running', 'paused', 'completed'));
ALTER TABLE workout_exercise ADD COLUMN cardio_elapsed_seconds INTEGER NOT NULL DEFAULT 0
  CHECK (cardio_elapsed_seconds >= 0);
ALTER TABLE workout_exercise ADD COLUMN cardio_last_started_at TEXT;
ALTER TABLE workout_exercise ADD COLUMN cardio_completed INTEGER NOT NULL DEFAULT 0
  CHECK (cardio_completed IN (0, 1));

UPDATE workout_exercise
SET exercise_mode = 'cardio',
    target_duration_minutes = (
      SELECT exercise.estimated_minutes FROM exercise WHERE exercise.id = workout_exercise.exercise_id
    ),
    cardio_timer_state = CASE
      WHEN EXISTS (
        SELECT 1 FROM workout_session
        WHERE workout_session.id = workout_exercise.workout_session_id
          AND workout_session.status = 'completed'
      ) THEN 'completed' ELSE 'idle' END,
    cardio_elapsed_seconds = CASE
      WHEN EXISTS (
        SELECT 1 FROM workout_session
        WHERE workout_session.id = workout_exercise.workout_session_id
          AND workout_session.status = 'completed'
      ) THEN (
        SELECT exercise.estimated_minutes * 60 FROM exercise WHERE exercise.id = workout_exercise.exercise_id
      ) ELSE 0 END,
    cardio_completed = CASE
      WHEN EXISTS (
        SELECT 1 FROM workout_session
        WHERE workout_session.id = workout_exercise.workout_session_id
          AND workout_session.status = 'completed'
      ) THEN 1 ELSE 0 END
WHERE EXISTS (
  SELECT 1 FROM exercise
  WHERE exercise.id = workout_exercise.exercise_id AND exercise.exercise_type = 'cardio'
);

CREATE INDEX idx_workout_exercise_cardio_timer
ON workout_exercise(workout_session_id, exercise_mode, cardio_timer_state);
`;
