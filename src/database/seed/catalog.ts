export type EquipmentSeed = { id: string; name: string; category: string };
export type ExerciseSeed = {
  id: string;
  name: string;
  primary: string;
  secondary?: string[];
  equipment: string[];
  family: string;
  pattern: string;
  type: 'compound' | 'isolation' | 'cardio';
  difficulty?: 'Principiante' | 'Intermedio' | 'Avanzado';
  unilateral?: boolean;
  minutes?: number;
  tags?: string[];
};

export const muscleSeeds = [
  ['pecho', 'Pecho', null], ['espalda', 'Espalda', null], ['hombro', 'Hombro', null],
  ['cuadriceps', 'Cuádriceps', null], ['femoral', 'Femoral', null], ['gluteo', 'Glúteo', null],
  ['pantorrilla', 'Pantorrilla', null], ['biceps', 'Bíceps', null], ['triceps', 'Tríceps', null],
  ['antebrazo', 'Antebrazo', null], ['abdomen', 'Abdomen', null], ['cardio', 'Cardio', null],
  ['aductores', 'Aductores', null], ['abductores', 'Abductores', null], ['lumbar', 'Lumbar', null],
  ['trapecio', 'Trapecio', null], ['core', 'Core', null],
  ['deltoide-anterior', 'Deltoide anterior', 'hombro'], ['deltoide-lateral', 'Deltoide lateral', 'hombro'],
  ['deltoide-posterior', 'Deltoide posterior', 'hombro'],
] as const;

export const equipmentSeeds: EquipmentSeed[] = [
  { id: 'equipment-001', name: 'Barra recta', category: 'General' },
  { id: 'equipment-002', name: 'Barra W', category: 'General' },
  { id: 'equipment-003', name: 'Mancuernas', category: 'General' },
  { id: 'equipment-004', name: 'Smith', category: 'General' },
  { id: 'equipment-005', name: 'Poleas', category: 'General' },
  { id: 'equipment-006', name: 'Banco plano', category: 'General' },
  { id: 'equipment-007', name: 'Banco inclinado', category: 'General' },
  { id: 'equipment-008', name: 'Banco declinado', category: 'General' },
  { id: 'equipment-009', name: 'Máquina press pecho', category: 'Pecho' },
  { id: 'equipment-010', name: 'Pec deck', category: 'Pecho' },
  { id: 'equipment-011', name: 'Paralelas', category: 'Pecho' },
  { id: 'equipment-012', name: 'Barra dominadas', category: 'Espalda' },
  { id: 'equipment-013', name: 'Máquina dominadas asistidas', category: 'Espalda' },
  { id: 'equipment-014', name: 'Polea alta', category: 'Espalda' },
  { id: 'equipment-015', name: 'Máquina remo', category: 'Espalda' },
  { id: 'equipment-016', name: 'Polea baja', category: 'Espalda' },
  { id: 'equipment-017', name: 'Máquina press hombro', category: 'Hombro' },
  { id: 'equipment-018', name: 'Máquina elevaciones laterales', category: 'Hombro' },
  { id: 'equipment-019', name: 'Jaula sentadilla', category: 'Pierna' },
  { id: 'equipment-020', name: 'Hack squat', category: 'Pierna' },
  { id: 'equipment-021', name: 'Sentadilla perfecta guiada', category: 'Pierna' },
  { id: 'equipment-022', name: 'Prensa lineal', category: 'Pierna' },
  { id: 'equipment-023', name: 'Prensa 45 grados', category: 'Pierna' },
  { id: 'equipment-024', name: 'Extensión cuádriceps', category: 'Pierna' },
  { id: 'equipment-025', name: 'Curl femoral acostado', category: 'Pierna' },
  { id: 'equipment-026', name: 'Curl femoral de pie', category: 'Pierna' },
  { id: 'equipment-027', name: 'Pantorrilla de pie', category: 'Pierna' },
  { id: 'equipment-028', name: 'Pantorrilla sentado', category: 'Pierna' },
  { id: 'equipment-029', name: 'Máquina patada glúteo', category: 'Pierna' },
  { id: 'equipment-030', name: 'Máquina abducción/aducción', category: 'Pierna' },
  { id: 'equipment-031', name: 'Banco predicador', category: 'Brazos' },
  { id: 'equipment-032', name: 'Máquina bíceps sentado', category: 'Brazos' },
  { id: 'equipment-033', name: 'Máquina patada tríceps', category: 'Brazos' },
  { id: 'equipment-034', name: 'Banco abdomen/declinado', category: 'Abdomen' },
  { id: 'equipment-035', name: 'Silla elevación rodillas', category: 'Abdomen' },
  { id: 'equipment-036', name: 'Rueda abdominal', category: 'Abdomen' },
  { id: 'equipment-037', name: 'Disco', category: 'Abdomen' },
  { id: 'equipment-038', name: 'Elíptica', category: 'Cardio' },
];

const compound = (id: string, name: string, primary: string, equipment: string[], family: string, pattern: string, secondary: string[] = [], unilateral = false): ExerciseSeed => ({ id, name, primary, secondary, equipment, family, pattern, type: 'compound', difficulty: 'Intermedio', unilateral, minutes: 8, tags: [primary, family, pattern] });
const isolation = (id: string, name: string, primary: string, equipment: string[], family: string, pattern: string, secondary: string[] = [], unilateral = false): ExerciseSeed => ({ id, name, primary, secondary, equipment, family, pattern, type: 'isolation', difficulty: 'Principiante', unilateral, minutes: 6, tags: [primary, family, pattern] });

export const exerciseSeeds: ExerciseSeed[] = [
  compound('exercise-001', 'Press banca plano con barra', 'Pecho', ['Barra recta', 'Banco plano'], 'Press de pecho', 'Empuje horizontal', ['Tríceps', 'Deltoide anterior']),
  compound('exercise-002', 'Press banca plano con mancuernas', 'Pecho', ['Mancuernas', 'Banco plano'], 'Press de pecho', 'Empuje horizontal', ['Tríceps', 'Deltoide anterior']),
  compound('exercise-003', 'Press inclinado con barra', 'Pecho', ['Barra recta', 'Banco inclinado'], 'Press de pecho', 'Empuje inclinado', ['Tríceps', 'Deltoide anterior']),
  compound('exercise-004', 'Press inclinado con mancuernas', 'Pecho', ['Mancuernas', 'Banco inclinado'], 'Press de pecho', 'Empuje inclinado', ['Tríceps', 'Deltoide anterior']),
  compound('exercise-005', 'Press declinado con barra', 'Pecho', ['Barra recta', 'Banco declinado'], 'Press de pecho', 'Empuje declinado', ['Tríceps']),
  compound('exercise-006', 'Press declinado con mancuernas', 'Pecho', ['Mancuernas', 'Banco declinado'], 'Press de pecho', 'Empuje declinado', ['Tríceps']),
  compound('exercise-007', 'Press plano Smith', 'Pecho', ['Smith', 'Banco plano'], 'Press de pecho', 'Empuje horizontal', ['Tríceps', 'Deltoide anterior']),
  compound('exercise-008', 'Press pecho máquina agarre abierto', 'Pecho', ['Máquina press pecho'], 'Press de pecho', 'Empuje horizontal', ['Tríceps']),
  compound('exercise-009', 'Press pecho máquina agarre cerrado', 'Pecho', ['Máquina press pecho'], 'Press de pecho', 'Empuje horizontal', ['Tríceps']),
  isolation('exercise-010', 'Pec deck', 'Pecho', ['Pec deck'], 'Apertura de pecho', 'Aducción horizontal'),
  isolation('exercise-011', 'Cruce polea alto a bajo', 'Pecho', ['Poleas'], 'Cruce en polea', 'Aducción descendente'),
  isolation('exercise-012', 'Cruce polea bajo a alto', 'Pecho', ['Poleas'], 'Cruce en polea', 'Aducción ascendente'),
  compound('exercise-013', 'Fondos en paralelas con énfasis en pecho', 'Pecho', ['Paralelas'], 'Fondos', 'Empuje vertical', ['Tríceps', 'Deltoide anterior']),

  compound('exercise-014', 'Dominadas', 'Espalda', ['Barra dominadas'], 'Dominada', 'Jalón vertical', ['Bíceps', 'Antebrazo']),
  compound('exercise-015', 'Dominadas asistidas agarre abierto', 'Espalda', ['Máquina dominadas asistidas'], 'Dominada asistida', 'Jalón vertical', ['Bíceps']),
  compound('exercise-016', 'Dominadas asistidas agarre cerrado', 'Espalda', ['Máquina dominadas asistidas'], 'Dominada asistida', 'Jalón vertical', ['Bíceps']),
  compound('exercise-017', 'Jalón al pecho agarre abierto', 'Espalda', ['Polea alta'], 'Jalón al pecho', 'Jalón vertical', ['Bíceps', 'Antebrazo']),
  compound('exercise-018', 'Jalón al pecho agarre cerrado', 'Espalda', ['Polea alta'], 'Jalón al pecho', 'Jalón vertical', ['Bíceps', 'Antebrazo']),
  compound('exercise-019', 'Remo máquina agarre abierto', 'Espalda', ['Máquina remo'], 'Remo', 'Jalón horizontal', ['Bíceps', 'Deltoide posterior']),
  compound('exercise-020', 'Remo máquina agarre cerrado', 'Espalda', ['Máquina remo'], 'Remo', 'Jalón horizontal', ['Bíceps', 'Deltoide posterior']),
  compound('exercise-021', 'Remo sentado polea baja', 'Espalda', ['Polea baja'], 'Remo', 'Jalón horizontal', ['Bíceps', 'Deltoide posterior']),
  compound('exercise-022', 'Remo con barra', 'Espalda', ['Barra recta'], 'Remo', 'Jalón horizontal', ['Bíceps', 'Lumbar']),
  compound('exercise-023', 'Remo con mancuerna', 'Espalda', ['Mancuernas', 'Banco plano'], 'Remo', 'Jalón horizontal', ['Bíceps'], true),
  compound('exercise-024', 'Peso muerto con barra', 'Espalda', ['Barra recta'], 'Peso muerto', 'Bisagra de cadera', ['Femoral', 'Glúteo', 'Lumbar', 'Trapecio']),

  compound('exercise-025', 'Press militar de pie con barra', 'Deltoide anterior', ['Barra recta'], 'Press de hombro', 'Empuje vertical', ['Tríceps', 'Core']),
  compound('exercise-026', 'Press militar sentado con barra', 'Deltoide anterior', ['Barra recta', 'Banco plano'], 'Press de hombro', 'Empuje vertical', ['Tríceps']),
  compound('exercise-027', 'Press hombro Smith', 'Deltoide anterior', ['Smith', 'Banco plano'], 'Press de hombro', 'Empuje vertical', ['Tríceps']),
  compound('exercise-028', 'Press hombro máquina agarre abierto', 'Deltoide anterior', ['Máquina press hombro'], 'Press de hombro', 'Empuje vertical', ['Tríceps', 'Deltoide lateral']),
  compound('exercise-029', 'Press hombro máquina agarre cerrado', 'Deltoide anterior', ['Máquina press hombro'], 'Press de hombro', 'Empuje vertical', ['Tríceps']),
  compound('exercise-030', 'Press mancuernas', 'Deltoide anterior', ['Mancuernas', 'Banco plano'], 'Press de hombro', 'Empuje vertical', ['Tríceps', 'Deltoide lateral']),
  compound('exercise-031', 'Arnold press', 'Deltoide anterior', ['Mancuernas', 'Banco plano'], 'Press de hombro', 'Empuje vertical', ['Tríceps', 'Deltoide lateral']),
  isolation('exercise-032', 'Elevación lateral máquina', 'Deltoide lateral', ['Máquina elevaciones laterales'], 'Elevación lateral', 'Abducción de hombro'),
  isolation('exercise-033', 'Elevación lateral polea', 'Deltoide lateral', ['Poleas'], 'Elevación lateral', 'Abducción de hombro', [], true),
  isolation('exercise-034', 'Elevación lateral mancuernas', 'Deltoide lateral', ['Mancuernas'], 'Elevación lateral', 'Abducción de hombro'),
  isolation('exercise-035', 'Face pull', 'Deltoide posterior', ['Poleas'], 'Face pull', 'Jalón horizontal', ['Trapecio']),
  isolation('exercise-036', 'Pájaros mancuernas', 'Deltoide posterior', ['Mancuernas'], 'Apertura posterior', 'Abducción horizontal', ['Trapecio']),
  isolation('exercise-037', 'Pájaros banco inclinado', 'Deltoide posterior', ['Mancuernas', 'Banco inclinado'], 'Apertura posterior', 'Abducción horizontal', ['Trapecio']),

  compound('exercise-038', 'Sentadilla con barra', 'Cuádriceps', ['Barra recta', 'Jaula sentadilla'], 'Sentadilla', 'Dominante de rodilla', ['Glúteo', 'Femoral', 'Core']),
  compound('exercise-039', 'Sentadilla Smith', 'Cuádriceps', ['Smith'], 'Sentadilla', 'Dominante de rodilla', ['Glúteo']),
  compound('exercise-040', 'Hack squat', 'Cuádriceps', ['Hack squat'], 'Sentadilla guiada', 'Dominante de rodilla', ['Glúteo']),
  compound('exercise-041', 'Sentadilla perfecta guiada', 'Cuádriceps', ['Sentadilla perfecta guiada'], 'Sentadilla guiada', 'Dominante de rodilla', ['Glúteo']),
  compound('exercise-042', 'Prensa lineal', 'Cuádriceps', ['Prensa lineal'], 'Prensa', 'Dominante de rodilla', ['Glúteo']),
  compound('exercise-043', 'Prensa 45 grados', 'Cuádriceps', ['Prensa 45 grados'], 'Prensa', 'Dominante de rodilla', ['Glúteo']),
  isolation('exercise-044', 'Extensión cuádriceps', 'Cuádriceps', ['Extensión cuádriceps'], 'Extensión de rodilla', 'Extensión de rodilla'),
  compound('exercise-045', 'Goblet squat', 'Cuádriceps', ['Mancuernas'], 'Sentadilla', 'Dominante de rodilla', ['Glúteo', 'Core']),
  compound('exercise-046', 'Sentadilla búlgara', 'Cuádriceps', ['Mancuernas', 'Banco plano'], 'Sentadilla unilateral', 'Dominante de rodilla', ['Glúteo'], true),

  compound('exercise-047', 'Peso muerto rumano barra', 'Femoral', ['Barra recta'], 'Peso muerto rumano', 'Bisagra de cadera', ['Glúteo', 'Lumbar']),
  compound('exercise-048', 'Peso muerto rumano mancuernas', 'Femoral', ['Mancuernas'], 'Peso muerto rumano', 'Bisagra de cadera', ['Glúteo', 'Lumbar']),
  compound('exercise-049', 'Buenos días', 'Femoral', ['Barra recta', 'Jaula sentadilla'], 'Buenos días', 'Bisagra de cadera', ['Glúteo', 'Lumbar']),
  isolation('exercise-050', 'Curl femoral acostado', 'Femoral', ['Curl femoral acostado'], 'Curl femoral', 'Flexión de rodilla'),
  isolation('exercise-051', 'Curl femoral de pie', 'Femoral', ['Curl femoral de pie'], 'Curl femoral', 'Flexión de rodilla', [], true),
  isolation('exercise-052', 'Pantorrilla de pie', 'Pantorrilla', ['Pantorrilla de pie'], 'Elevación de talón', 'Flexión plantar'),
  isolation('exercise-053', 'Pantorrilla sentado', 'Pantorrilla', ['Pantorrilla sentado'], 'Elevación de talón', 'Flexión plantar'),

  compound('exercise-054', 'Hip thrust', 'Glúteo', ['Barra recta', 'Banco plano'], 'Hip thrust', 'Extensión de cadera', ['Femoral']),
  isolation('exercise-055', 'Patada glúteo máquina', 'Glúteo', ['Máquina patada glúteo'], 'Patada de glúteo', 'Extensión de cadera', [], true),
  isolation('exercise-056', 'Patada glúteo polea', 'Glúteo', ['Poleas'], 'Patada de glúteo', 'Extensión de cadera', [], true),
  isolation('exercise-057', 'Abducción de cadera', 'Abductores', ['Máquina abducción/aducción'], 'Abducción de cadera', 'Abducción de cadera', ['Glúteo']),
  compound('exercise-058', 'Peso muerto una pierna', 'Glúteo', ['Mancuernas'], 'Peso muerto unilateral', 'Bisagra de cadera', ['Femoral', 'Core'], true),
  isolation('exercise-059', 'Aducción de cadera', 'Aductores', ['Máquina abducción/aducción'], 'Aducción de cadera', 'Aducción de cadera'),

  isolation('exercise-060', 'Curl barra recta', 'Bíceps', ['Barra recta'], 'Curl de bíceps', 'Flexión de codo', ['Antebrazo']),
  isolation('exercise-061', 'Curl barra W', 'Bíceps', ['Barra W'], 'Curl de bíceps', 'Flexión de codo', ['Antebrazo']),
  isolation('exercise-062', 'Curl mancuernas', 'Bíceps', ['Mancuernas'], 'Curl de bíceps', 'Flexión de codo', ['Antebrazo']),
  isolation('exercise-063', 'Curl predicador', 'Bíceps', ['Barra W', 'Banco predicador'], 'Curl predicador', 'Flexión de codo'),
  isolation('exercise-064', 'Curl máquina sentado', 'Bíceps', ['Máquina bíceps sentado'], 'Curl de bíceps', 'Flexión de codo'),
  isolation('exercise-065', 'Curl polea barra', 'Bíceps', ['Poleas', 'Barra recta'], 'Curl en polea', 'Flexión de codo'),
  isolation('exercise-066', 'Curl polea cuerda', 'Bíceps', ['Poleas'], 'Curl en polea', 'Flexión de codo', ['Antebrazo']),

  isolation('exercise-067', 'Press francés barra W', 'Tríceps', ['Barra W', 'Banco plano'], 'Extensión de tríceps', 'Extensión de codo'),
  compound('exercise-068', 'Press cerrado en banco', 'Tríceps', ['Barra recta', 'Banco plano'], 'Press cerrado', 'Empuje horizontal', ['Pecho', 'Deltoide anterior']),
  isolation('exercise-069', 'Extensión polea barra recta', 'Tríceps', ['Poleas', 'Barra recta'], 'Extensión de tríceps', 'Extensión de codo'),
  isolation('exercise-070', 'Extensión polea cuerda', 'Tríceps', ['Poleas'], 'Extensión de tríceps', 'Extensión de codo'),
  isolation('exercise-071', 'Patada tríceps máquina', 'Tríceps', ['Máquina patada tríceps'], 'Patada de tríceps', 'Extensión de codo'),
  isolation('exercise-072', 'Patada tríceps mancuerna', 'Tríceps', ['Mancuernas'], 'Patada de tríceps', 'Extensión de codo', [], true),
  compound('exercise-073', 'Fondos en banco', 'Tríceps', ['Banco plano'], 'Fondos', 'Empuje vertical', ['Pecho', 'Deltoide anterior']),

  isolation('exercise-074', 'Curl muñeca barra', 'Antebrazo', ['Barra recta'], 'Curl de muñeca', 'Flexión de muñeca'),
  isolation('exercise-075', 'Curl muñeca inverso barra', 'Antebrazo', ['Barra recta'], 'Curl de muñeca', 'Extensión de muñeca'),
  isolation('exercise-076', 'Curl antebrazo mancuernas', 'Antebrazo', ['Mancuernas'], 'Curl de muñeca', 'Flexión de muñeca'),
  compound('exercise-077', 'Paseo del granjero', 'Antebrazo', ['Mancuernas'], 'Carga transportada', 'Acarreo', ['Trapecio', 'Core']),
  isolation('exercise-078', 'Curl muñeca polea', 'Antebrazo', ['Poleas'], 'Curl de muñeca', 'Flexión de muñeca'),
  compound('exercise-079', 'Dead hang', 'Antebrazo', ['Barra dominadas'], 'Suspensión', 'Agarre isométrico', ['Espalda']),

  isolation('exercise-080', 'Crunch banco', 'Abdomen', ['Banco abdomen/declinado'], 'Crunch', 'Flexión de tronco'),
  isolation('exercise-081', 'Crunch banco declinado', 'Abdomen', ['Banco declinado'], 'Crunch', 'Flexión de tronco'),
  compound('exercise-082', 'Elevación rodillas en silla', 'Abdomen', ['Silla elevación rodillas'], 'Elevación de rodillas', 'Flexión de cadera', ['Core']),
  isolation('exercise-083', 'Crunch polea cuerda', 'Abdomen', ['Poleas'], 'Crunch', 'Flexión de tronco'),
  compound('exercise-084', 'Rueda abdominal', 'Core', ['Rueda abdominal'], 'Rueda abdominal', 'Anti-extensión', ['Abdomen']),
  compound('exercise-085', 'Russian twist con disco', 'Abdomen', ['Disco'], 'Rotación de tronco', 'Rotación', ['Core']),
  { id: 'exercise-086', name: 'Elíptica', primary: 'Cardio', equipment: ['Elíptica'], family: 'Cardio elíptico', pattern: 'Cardio', type: 'cardio', difficulty: 'Principiante', unilateral: false, minutes: 10, tags: ['Cardio', 'Bajo impacto'] },
];
