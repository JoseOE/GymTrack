export const schemaV5 = `
ALTER TABLE equipment ADD COLUMN description TEXT NOT NULL DEFAULT '';
ALTER TABLE equipment ADD COLUMN equipment_type TEXT NOT NULL DEFAULT 'other'
  CHECK (equipment_type IN ('free_weight', 'machine', 'cable', 'bench', 'rack', 'bodyweight', 'cardio', 'accessory', 'other'));
ALTER TABLE equipment ADD COLUMN search_terms TEXT NOT NULL DEFAULT '';
ALTER TABLE equipment ADD COLUMN catalog_version INTEGER NOT NULL DEFAULT 1 CHECK (catalog_version >= 1);

CREATE TABLE equipment_alias (
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  alias TEXT NOT NULL,
  normalized_alias TEXT NOT NULL,
  PRIMARY KEY (equipment_id, normalized_alias)
);

CREATE INDEX idx_equipment_alias_normalized ON equipment_alias(normalized_alias);
CREATE INDEX idx_equipment_catalog_search ON equipment(category, active, catalog_version);

CREATE TABLE training_location (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL REFERENCES user_profile(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location_type TEXT NOT NULL CHECK (location_type IN ('gym', 'home', 'other')),
  is_active INTEGER NOT NULL DEFAULT 0 CHECK (is_active IN (0, 1)),
  is_default INTEGER NOT NULL DEFAULT 0 CHECK (is_default IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, owner_user_id)
);

CREATE UNIQUE INDEX idx_training_location_single_active
ON training_location(owner_user_id)
WHERE is_active = 1;

CREATE UNIQUE INDEX idx_training_location_single_default
ON training_location(owner_user_id)
WHERE is_default = 1;

CREATE INDEX idx_training_location_owner ON training_location(owner_user_id, updated_at DESC);

CREATE TABLE training_location_equipment (
  training_location_id TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  equipment_id TEXT NOT NULL REFERENCES equipment(id) ON DELETE CASCADE,
  enabled INTEGER NOT NULL DEFAULT 1 CHECK (enabled IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (training_location_id, equipment_id),
  FOREIGN KEY (training_location_id, owner_user_id)
    REFERENCES training_location(id, owner_user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_location_equipment_owner
ON training_location_equipment(owner_user_id, training_location_id, enabled);

CREATE TABLE custom_equipment (
  id TEXT PRIMARY KEY NOT NULL,
  owner_user_id TEXT NOT NULL,
  training_location_id TEXT NOT NULL,
  name TEXT NOT NULL,
  normalized_name TEXT NOT NULL,
  category TEXT,
  notes TEXT,
  source TEXT NOT NULL CHECK (source IN ('manual', 'ai')),
  catalog_match_id TEXT REFERENCES equipment(id) ON DELETE SET NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1)),
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE (id, owner_user_id),
  FOREIGN KEY (training_location_id, owner_user_id)
    REFERENCES training_location(id, owner_user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_custom_equipment_location
ON custom_equipment(owner_user_id, training_location_id, active, normalized_name);

CREATE TABLE custom_equipment_exercise (
  custom_equipment_id TEXT NOT NULL,
  owner_user_id TEXT NOT NULL,
  exercise_id TEXT NOT NULL REFERENCES exercise(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  PRIMARY KEY (custom_equipment_id, exercise_id),
  FOREIGN KEY (custom_equipment_id, owner_user_id)
    REFERENCES custom_equipment(id, owner_user_id) ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE INDEX idx_custom_equipment_exercise_owner
ON custom_equipment_exercise(owner_user_id, exercise_id);

INSERT OR IGNORE INTO training_location
  (id, owner_user_id, name, location_type, is_active, is_default, created_at, updated_at)
SELECT 'training-location-default-' || id, id, 'Mi gimnasio', 'gym', 1, 1,
       strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM user_profile;

INSERT OR IGNORE INTO training_location_equipment
  (training_location_id, owner_user_id, equipment_id, enabled, created_at, updated_at)
SELECT location.id, location.owner_user_id, equipment.id, 1,
       strftime('%Y-%m-%dT%H:%M:%fZ', 'now'), strftime('%Y-%m-%dT%H:%M:%fZ', 'now')
FROM training_location location
JOIN equipment ON equipment.id BETWEEN 'equipment-001' AND 'equipment-038'
WHERE location.id = 'training-location-default-' || location.owner_user_id;
`;
