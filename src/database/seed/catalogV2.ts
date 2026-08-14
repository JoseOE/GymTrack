import type { EquipmentSeed, ExerciseSeed } from '@/database/seed/catalog';

export type EquipmentType = 'free_weight' | 'machine' | 'cable' | 'bench' | 'rack' | 'bodyweight' | 'cardio' | 'accessory' | 'other';

export type CatalogEquipmentSeed = EquipmentSeed & {
  description: string;
  equipmentType: EquipmentType;
  searchTerms?: string[];
};

export type CatalogExerciseSeed = Omit<ExerciseSeed, 'primary' | 'secondary' | 'equipment'> & {
  primaryMuscleId: string;
  secondaryMuscleIds: string[];
  equipmentIds: string[];
};

export type EquipmentAliasSeed = { equipmentId: string; alias: string };

const freeWeights = new Set(['equipment-001', 'equipment-002', 'equipment-003', 'equipment-037']);
const cables = new Set(['equipment-005', 'equipment-014', 'equipment-016']);
const benches = new Set(['equipment-006', 'equipment-007', 'equipment-008', 'equipment-031', 'equipment-034']);
const racks = new Set(['equipment-019']);
const bodyweightStations = new Set(['equipment-011', 'equipment-012', 'equipment-035']);
const accessories = new Set(['equipment-036']);

export function getCatalogV1EquipmentType(id: string): EquipmentType {
  if (freeWeights.has(id)) return 'free_weight';
  if (cables.has(id)) return 'cable';
  if (benches.has(id)) return 'bench';
  if (racks.has(id)) return 'rack';
  if (bodyweightStations.has(id)) return 'bodyweight';
  if (accessories.has(id)) return 'accessory';
  if (id === 'equipment-038') return 'cardio';
  return 'machine';
}

export const catalogV2Equipment: CatalogEquipmentSeed[] = [
  { id: 'equipment-039', name: 'Press de pecho convergente', category: 'Pecho', description: 'Máquina de press horizontal con brazos que convergen durante el empuje.', equipmentType: 'machine', searchTerms: ['plate loaded', 'press convergente'] },
  { id: 'equipment-040', name: 'Press inclinado en máquina', category: 'Pecho', description: 'Máquina guiada para realizar press de pecho en un ángulo inclinado.', equipmentType: 'machine', searchTerms: ['incline chest press', 'press superior'] },
  { id: 'equipment-041', name: 'Press declinado en máquina', category: 'Pecho', description: 'Máquina guiada para realizar press de pecho en un ángulo declinado.', equipmentType: 'machine', searchTerms: ['decline chest press'] },
  { id: 'equipment-042', name: 'Remo pecho apoyado', category: 'Espalda', description: 'Máquina o estación de remo horizontal con soporte para el torso.', equipmentType: 'machine', searchTerms: ['chest supported row'] },
  { id: 'equipment-043', name: 'Remo iso-lateral', category: 'Espalda', description: 'Máquina de remo con brazos independientes para trabajo bilateral o unilateral.', equipmentType: 'machine', searchTerms: ['iso lateral row', 'plate loaded row'] },
  { id: 'equipment-044', name: 'Pullover en máquina', category: 'Espalda', description: 'Máquina guiada para realizar extensión de hombro con trayectoria de pullover.', equipmentType: 'machine', searchTerms: ['machine pullover'] },
  { id: 'equipment-045', name: 'Jalón convergente', category: 'Espalda', description: 'Máquina de jalón vertical con brazos independientes y carga guiada o por discos.', equipmentType: 'machine', searchTerms: ['plate loaded pulldown', 'lat pulldown convergente'] },
  { id: 'equipment-046', name: 'Reverse pec deck', category: 'Hombro', description: 'Máquina de apertura posterior con apoyo del torso para el deltoide posterior.', equipmentType: 'machine', searchTerms: ['reverse fly', 'apertura posterior'] },
  { id: 'equipment-047', name: 'Press hombro plate-loaded', category: 'Hombro', description: 'Máquina de press vertical para hombro con carga mediante discos.', equipmentType: 'machine', searchTerms: ['shoulder press machine'] },
  { id: 'equipment-048', name: 'Pendulum squat', category: 'Pierna', description: 'Máquina de sentadilla guiada con trayectoria pendular.', equipmentType: 'machine', searchTerms: ['sentadilla pendular'] },
  { id: 'equipment-049', name: 'Belt squat', category: 'Pierna', description: 'Estación de sentadilla que transmite la carga mediante un cinturón de cadera.', equipmentType: 'machine', searchTerms: ['sentadilla con cinturón'] },
  { id: 'equipment-050', name: 'Curl femoral sentado', category: 'Pierna', description: 'Máquina guiada para flexión de rodilla en posición sentada.', equipmentType: 'machine', searchTerms: ['seated leg curl'] },
  { id: 'equipment-051', name: 'Prensa horizontal', category: 'Pierna', description: 'Máquina de prensa de piernas con desplazamiento principalmente horizontal.', equipmentType: 'machine', searchTerms: ['horizontal leg press'] },
  { id: 'equipment-052', name: 'Prensa de pantorrilla', category: 'Pierna', description: 'Máquina o estación guiada para realizar flexión plantar contra resistencia.', equipmentType: 'machine', searchTerms: ['calf press'] },
  { id: 'equipment-053', name: 'Máquina hip thrust', category: 'Pierna', description: 'Máquina guiada para realizar extensión de cadera mediante hip thrust.', equipmentType: 'machine', searchTerms: ['glute drive', 'hip thrust machine'] },
  { id: 'equipment-054', name: 'Máquina de fondos', category: 'Brazos', description: 'Máquina guiada para realizar fondos sentados con resistencia.', equipmentType: 'machine', searchTerms: ['dip machine', 'seated dip'] },
  { id: 'equipment-055', name: 'Máquina curl predicador', category: 'Brazos', description: 'Máquina de curl de bíceps con apoyo de brazos tipo predicador.', equipmentType: 'machine', searchTerms: ['preacher curl machine'] },
  { id: 'equipment-056', name: 'Banco romano', category: 'Core', description: 'Banco inclinado para realizar extensiones controladas del tronco y la cadera.', equipmentType: 'bench', searchTerms: ['back extension', 'hiperextension'] },
  { id: 'equipment-057', name: 'Máquina crunch abdominal', category: 'Core', description: 'Máquina guiada para realizar flexión de tronco contra resistencia.', equipmentType: 'machine', searchTerms: ['abdominal crunch machine'] },
  { id: 'equipment-058', name: 'Caminadora', category: 'Cardio', description: 'Equipo cardiovascular con banda móvil para caminar o correr.', equipmentType: 'cardio', searchTerms: ['treadmill', 'cinta de correr'] },
  { id: 'equipment-059', name: 'Bicicleta estática', category: 'Cardio', description: 'Equipo cardiovascular de pedaleo estacionario.', equipmentType: 'cardio', searchTerms: ['stationary bike', 'exercise bike'] },
  { id: 'equipment-060', name: 'Escaladora', category: 'Cardio', description: 'Equipo cardiovascular que simula el ascenso continuo de escalones.', equipmentType: 'cardio', searchTerms: ['stair climber', 'stairmaster'] },
  { id: 'equipment-061', name: 'Remo ergómetro', category: 'Cardio', description: 'Equipo cardiovascular que simula el gesto de remo con resistencia regulable.', equipmentType: 'cardio', searchTerms: ['rowing machine', 'remo cardio'] },
];

const compound = (id: string, name: string, primaryMuscleId: string, equipmentIds: string[], family: string, pattern: string, secondaryMuscleIds: string[] = [], unilateral = false): CatalogExerciseSeed => ({ id, name, primaryMuscleId, secondaryMuscleIds, equipmentIds, family, pattern, type: 'compound', difficulty: 'Intermedio', unilateral, minutes: 8, tags: [primaryMuscleId, family, pattern, 'catalog-v2'] });
const isolation = (id: string, name: string, primaryMuscleId: string, equipmentIds: string[], family: string, pattern: string, secondaryMuscleIds: string[] = [], unilateral = false): CatalogExerciseSeed => ({ id, name, primaryMuscleId, secondaryMuscleIds, equipmentIds, family, pattern, type: 'isolation', difficulty: 'Principiante', unilateral, minutes: 6, tags: [primaryMuscleId, family, pattern, 'catalog-v2'] });
const cardio = (id: string, name: string, equipmentId: string): CatalogExerciseSeed => ({ id, name, primaryMuscleId: 'cardio', secondaryMuscleIds: [], equipmentIds: [equipmentId], family: 'Cardio', pattern: 'Cardio', type: 'cardio', difficulty: 'Principiante', unilateral: false, minutes: 10, tags: ['cardio', 'catalog-v2'] });

export const catalogV2Exercises: CatalogExerciseSeed[] = [
  compound('exercise-087', 'Press pecho convergente', 'pecho', ['equipment-039'], 'Press de pecho', 'Empuje horizontal', ['triceps', 'deltoide-anterior']),
  compound('exercise-088', 'Press inclinado en máquina', 'pecho', ['equipment-040'], 'Press de pecho', 'Empuje inclinado', ['triceps', 'deltoide-anterior']),
  compound('exercise-089', 'Press declinado en máquina', 'pecho', ['equipment-041'], 'Press de pecho', 'Empuje declinado', ['triceps']),
  compound('exercise-090', 'Remo pecho apoyado', 'espalda', ['equipment-042'], 'Remo', 'Jalón horizontal', ['biceps', 'deltoide-posterior']),
  compound('exercise-091', 'Remo iso-lateral', 'espalda', ['equipment-043'], 'Remo', 'Jalón horizontal', ['biceps', 'deltoide-posterior']),
  isolation('exercise-092', 'Pullover en máquina', 'espalda', ['equipment-044'], 'Pullover', 'Extensión de hombro'),
  compound('exercise-093', 'Jalón convergente', 'espalda', ['equipment-045'], 'Jalón al pecho', 'Jalón vertical', ['biceps']),
  isolation('exercise-094', 'Apertura posterior reverse pec deck', 'deltoide-posterior', ['equipment-046'], 'Apertura posterior', 'Abducción horizontal', ['trapecio']),
  compound('exercise-095', 'Press hombro plate-loaded', 'deltoide-anterior', ['equipment-047'], 'Press de hombro', 'Empuje vertical', ['triceps', 'deltoide-lateral']),
  compound('exercise-096', 'Sentadilla pendular', 'cuadriceps', ['equipment-048'], 'Sentadilla guiada', 'Dominante de rodilla', ['gluteo']),
  compound('exercise-097', 'Belt squat', 'cuadriceps', ['equipment-049'], 'Sentadilla guiada', 'Dominante de rodilla', ['gluteo']),
  isolation('exercise-098', 'Curl femoral sentado', 'femoral', ['equipment-050'], 'Curl femoral', 'Flexión de rodilla'),
  compound('exercise-099', 'Prensa horizontal', 'cuadriceps', ['equipment-051'], 'Prensa', 'Dominante de rodilla', ['gluteo']),
  isolation('exercise-100', 'Pantorrilla en prensa', 'pantorrilla', ['equipment-052'], 'Elevación de talón', 'Flexión plantar'),
  compound('exercise-101', 'Hip thrust en máquina', 'gluteo', ['equipment-053'], 'Hip thrust', 'Extensión de cadera', ['femoral']),
  compound('exercise-102', 'Fondos en máquina', 'triceps', ['equipment-054'], 'Fondos', 'Empuje vertical', ['pecho', 'deltoide-anterior']),
  isolation('exercise-103', 'Curl predicador en máquina', 'biceps', ['equipment-055'], 'Curl predicador', 'Flexión de codo', ['antebrazo']),
  isolation('exercise-104', 'Extensión lumbar en banco romano', 'lumbar', ['equipment-056'], 'Extensión lumbar', 'Extensión de tronco', ['gluteo', 'femoral']),
  isolation('exercise-105', 'Crunch en máquina', 'abdomen', ['equipment-057'], 'Crunch', 'Flexión de tronco', ['core']),
  cardio('exercise-106', 'Caminadora', 'equipment-058'),
  cardio('exercise-107', 'Bicicleta estática', 'equipment-059'),
  cardio('exercise-108', 'Escaladora', 'equipment-060'),
  cardio('exercise-109', 'Remo ergómetro', 'equipment-061'),
];

export const equipmentAliases: EquipmentAliasSeed[] = [
  { equipmentId: 'equipment-004', alias: 'Smith machine' },
  { equipmentId: 'equipment-004', alias: 'Máquina Smith' },
  { equipmentId: 'equipment-005', alias: 'Cable machine' },
  { equipmentId: 'equipment-005', alias: 'Crossover' },
  { equipmentId: 'equipment-005', alias: 'Polea' },
  { equipmentId: 'equipment-009', alias: 'Chest press' },
  { equipmentId: 'equipment-009', alias: 'Press de pecho' },
  { equipmentId: 'equipment-010', alias: 'Chest fly' },
  { equipmentId: 'equipment-010', alias: 'Aperturas' },
  { equipmentId: 'equipment-014', alias: 'Lat pulldown' },
  { equipmentId: 'equipment-014', alias: 'Jalón al pecho' },
  { equipmentId: 'equipment-020', alias: 'Hack' },
  { equipmentId: 'equipment-020', alias: 'Sentadilla hack' },
  { equipmentId: 'equipment-024', alias: 'Leg extension' },
  { equipmentId: 'equipment-024', alias: 'Extensión de cuádriceps' },
  { equipmentId: 'equipment-025', alias: 'Lying leg curl' },
  { equipmentId: 'equipment-025', alias: 'Leg curl' },
  { equipmentId: 'equipment-026', alias: 'Standing leg curl' },
  { equipmentId: 'equipment-030', alias: 'Hip abductor' },
  { equipmentId: 'equipment-030', alias: 'Hip adductor' },
  { equipmentId: 'equipment-039', alias: 'Converging chest press' },
  { equipmentId: 'equipment-039', alias: 'Plate-loaded chest press' },
  { equipmentId: 'equipment-042', alias: 'Chest supported row' },
  { equipmentId: 'equipment-043', alias: 'Iso-lateral row' },
  { equipmentId: 'equipment-044', alias: 'Machine pullover' },
  { equipmentId: 'equipment-045', alias: 'Plate-loaded pulldown' },
  { equipmentId: 'equipment-046', alias: 'Rear delt fly' },
  { equipmentId: 'equipment-046', alias: 'Pájaros en máquina' },
  { equipmentId: 'equipment-048', alias: 'Sentadilla pendular' },
  { equipmentId: 'equipment-049', alias: 'Sentadilla con cinturón' },
  { equipmentId: 'equipment-050', alias: 'Seated leg curl' },
  { equipmentId: 'equipment-051', alias: 'Horizontal leg press' },
  { equipmentId: 'equipment-052', alias: 'Calf press' },
  { equipmentId: 'equipment-053', alias: 'Glute drive' },
  { equipmentId: 'equipment-053', alias: 'Hip thrust machine' },
  { equipmentId: 'equipment-054', alias: 'Dip machine' },
  { equipmentId: 'equipment-055', alias: 'Preacher curl machine' },
  { equipmentId: 'equipment-056', alias: 'Back extension' },
  { equipmentId: 'equipment-056', alias: 'Hiperextensiones' },
  { equipmentId: 'equipment-057', alias: 'Ab crunch machine' },
  { equipmentId: 'equipment-058', alias: 'Treadmill' },
  { equipmentId: 'equipment-058', alias: 'Cinta de correr' },
  { equipmentId: 'equipment-059', alias: 'Stationary bike' },
  { equipmentId: 'equipment-060', alias: 'Stair climber' },
  { equipmentId: 'equipment-061', alias: 'Rowing machine' },
];
