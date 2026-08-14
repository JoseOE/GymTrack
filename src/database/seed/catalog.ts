type EquipmentSeed = { name: string; category: string };
type ExerciseSeed = {
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
  ...['Barra recta', 'Barra W', 'Mancuernas', 'Smith', 'Poleas', 'Banco plano', 'Banco inclinado', 'Banco declinado'].map((name) => ({ name, category: 'General' })),
  ...['Máquina press pecho', 'Pec deck', 'Paralelas'].map((name) => ({ name, category: 'Pecho' })),
  ...['Barra dominadas', 'Máquina dominadas asistidas', 'Polea alta', 'Máquina remo', 'Polea baja'].map((name) => ({ name, category: 'Espalda' })),
  ...['Máquina press hombro', 'Máquina elevaciones laterales'].map((name) => ({ name, category: 'Hombro' })),
  ...['Jaula sentadilla', 'Hack squat', 'Sentadilla perfecta guiada', 'Prensa lineal', 'Prensa 45 grados', 'Extensión cuádriceps', 'Curl femoral acostado', 'Curl femoral de pie', 'Pantorrilla de pie', 'Pantorrilla sentado', 'Máquina patada glúteo', 'Máquina abducción/aducción'].map((name) => ({ name, category: 'Pierna' })),
  ...['Banco predicador', 'Máquina bíceps sentado', 'Máquina patada tríceps'].map((name) => ({ name, category: 'Brazos' })),
  ...['Banco abdomen/declinado', 'Silla elevación rodillas', 'Rueda abdominal', 'Disco'].map((name) => ({ name, category: 'Abdomen' })),
  { name: 'Elíptica', category: 'Cardio' },
];

const compound = (name: string, primary: string, equipment: string[], family: string, pattern: string, secondary: string[] = [], unilateral = false): ExerciseSeed => ({ name, primary, secondary, equipment, family, pattern, type: 'compound', difficulty: 'Intermedio', unilateral, minutes: 8, tags: [primary, family, pattern] });
const isolation = (name: string, primary: string, equipment: string[], family: string, pattern: string, secondary: string[] = [], unilateral = false): ExerciseSeed => ({ name, primary, secondary, equipment, family, pattern, type: 'isolation', difficulty: 'Principiante', unilateral, minutes: 6, tags: [primary, family, pattern] });

export const exerciseSeeds: ExerciseSeed[] = [
  compound('Press banca plano con barra', 'Pecho', ['Barra recta', 'Banco plano'], 'Press de pecho', 'Empuje horizontal', ['Tríceps', 'Deltoide anterior']),
  compound('Press banca plano con mancuernas', 'Pecho', ['Mancuernas', 'Banco plano'], 'Press de pecho', 'Empuje horizontal', ['Tríceps', 'Deltoide anterior']),
  compound('Press inclinado con barra', 'Pecho', ['Barra recta', 'Banco inclinado'], 'Press de pecho', 'Empuje inclinado', ['Tríceps', 'Deltoide anterior']),
  compound('Press inclinado con mancuernas', 'Pecho', ['Mancuernas', 'Banco inclinado'], 'Press de pecho', 'Empuje inclinado', ['Tríceps', 'Deltoide anterior']),
  compound('Press declinado con barra', 'Pecho', ['Barra recta', 'Banco declinado'], 'Press de pecho', 'Empuje declinado', ['Tríceps']),
  compound('Press declinado con mancuernas', 'Pecho', ['Mancuernas', 'Banco declinado'], 'Press de pecho', 'Empuje declinado', ['Tríceps']),
  compound('Press plano Smith', 'Pecho', ['Smith', 'Banco plano'], 'Press de pecho', 'Empuje horizontal', ['Tríceps', 'Deltoide anterior']),
  compound('Press pecho máquina agarre abierto', 'Pecho', ['Máquina press pecho'], 'Press de pecho', 'Empuje horizontal', ['Tríceps']),
  compound('Press pecho máquina agarre cerrado', 'Pecho', ['Máquina press pecho'], 'Press de pecho', 'Empuje horizontal', ['Tríceps']),
  isolation('Pec deck', 'Pecho', ['Pec deck'], 'Apertura de pecho', 'Aducción horizontal'),
  isolation('Cruce polea alto a bajo', 'Pecho', ['Poleas'], 'Cruce en polea', 'Aducción descendente'),
  isolation('Cruce polea bajo a alto', 'Pecho', ['Poleas'], 'Cruce en polea', 'Aducción ascendente'),
  compound('Fondos en paralelas con énfasis en pecho', 'Pecho', ['Paralelas'], 'Fondos', 'Empuje vertical', ['Tríceps', 'Deltoide anterior']),

  compound('Dominadas', 'Espalda', ['Barra dominadas'], 'Dominada', 'Jalón vertical', ['Bíceps', 'Antebrazo']),
  compound('Dominadas asistidas agarre abierto', 'Espalda', ['Máquina dominadas asistidas'], 'Dominada asistida', 'Jalón vertical', ['Bíceps']),
  compound('Dominadas asistidas agarre cerrado', 'Espalda', ['Máquina dominadas asistidas'], 'Dominada asistida', 'Jalón vertical', ['Bíceps']),
  compound('Jalón al pecho agarre abierto', 'Espalda', ['Polea alta'], 'Jalón al pecho', 'Jalón vertical', ['Bíceps', 'Antebrazo']),
  compound('Jalón al pecho agarre cerrado', 'Espalda', ['Polea alta'], 'Jalón al pecho', 'Jalón vertical', ['Bíceps', 'Antebrazo']),
  compound('Remo máquina agarre abierto', 'Espalda', ['Máquina remo'], 'Remo', 'Jalón horizontal', ['Bíceps', 'Deltoide posterior']),
  compound('Remo máquina agarre cerrado', 'Espalda', ['Máquina remo'], 'Remo', 'Jalón horizontal', ['Bíceps', 'Deltoide posterior']),
  compound('Remo sentado polea baja', 'Espalda', ['Polea baja'], 'Remo', 'Jalón horizontal', ['Bíceps', 'Deltoide posterior']),
  compound('Remo con barra', 'Espalda', ['Barra recta'], 'Remo', 'Jalón horizontal', ['Bíceps', 'Lumbar']),
  compound('Remo con mancuerna', 'Espalda', ['Mancuernas', 'Banco plano'], 'Remo', 'Jalón horizontal', ['Bíceps'], true),
  compound('Peso muerto con barra', 'Espalda', ['Barra recta'], 'Peso muerto', 'Bisagra de cadera', ['Femoral', 'Glúteo', 'Lumbar', 'Trapecio']),

  compound('Press militar de pie con barra', 'Deltoide anterior', ['Barra recta'], 'Press de hombro', 'Empuje vertical', ['Tríceps', 'Core']),
  compound('Press militar sentado con barra', 'Deltoide anterior', ['Barra recta', 'Banco plano'], 'Press de hombro', 'Empuje vertical', ['Tríceps']),
  compound('Press hombro Smith', 'Deltoide anterior', ['Smith', 'Banco plano'], 'Press de hombro', 'Empuje vertical', ['Tríceps']),
  compound('Press hombro máquina agarre abierto', 'Deltoide anterior', ['Máquina press hombro'], 'Press de hombro', 'Empuje vertical', ['Tríceps', 'Deltoide lateral']),
  compound('Press hombro máquina agarre cerrado', 'Deltoide anterior', ['Máquina press hombro'], 'Press de hombro', 'Empuje vertical', ['Tríceps']),
  compound('Press mancuernas', 'Deltoide anterior', ['Mancuernas', 'Banco plano'], 'Press de hombro', 'Empuje vertical', ['Tríceps', 'Deltoide lateral']),
  compound('Arnold press', 'Deltoide anterior', ['Mancuernas', 'Banco plano'], 'Press de hombro', 'Empuje vertical', ['Tríceps', 'Deltoide lateral']),
  isolation('Elevación lateral máquina', 'Deltoide lateral', ['Máquina elevaciones laterales'], 'Elevación lateral', 'Abducción de hombro'),
  isolation('Elevación lateral polea', 'Deltoide lateral', ['Poleas'], 'Elevación lateral', 'Abducción de hombro', [], true),
  isolation('Elevación lateral mancuernas', 'Deltoide lateral', ['Mancuernas'], 'Elevación lateral', 'Abducción de hombro'),
  isolation('Face pull', 'Deltoide posterior', ['Poleas'], 'Face pull', 'Jalón horizontal', ['Trapecio']),
  isolation('Pájaros mancuernas', 'Deltoide posterior', ['Mancuernas'], 'Apertura posterior', 'Abducción horizontal', ['Trapecio']),
  isolation('Pájaros banco inclinado', 'Deltoide posterior', ['Mancuernas', 'Banco inclinado'], 'Apertura posterior', 'Abducción horizontal', ['Trapecio']),

  compound('Sentadilla con barra', 'Cuádriceps', ['Barra recta', 'Jaula sentadilla'], 'Sentadilla', 'Dominante de rodilla', ['Glúteo', 'Femoral', 'Core']),
  compound('Sentadilla Smith', 'Cuádriceps', ['Smith'], 'Sentadilla', 'Dominante de rodilla', ['Glúteo']),
  compound('Hack squat', 'Cuádriceps', ['Hack squat'], 'Sentadilla guiada', 'Dominante de rodilla', ['Glúteo']),
  compound('Sentadilla perfecta guiada', 'Cuádriceps', ['Sentadilla perfecta guiada'], 'Sentadilla guiada', 'Dominante de rodilla', ['Glúteo']),
  compound('Prensa lineal', 'Cuádriceps', ['Prensa lineal'], 'Prensa', 'Dominante de rodilla', ['Glúteo']),
  compound('Prensa 45 grados', 'Cuádriceps', ['Prensa 45 grados'], 'Prensa', 'Dominante de rodilla', ['Glúteo']),
  isolation('Extensión cuádriceps', 'Cuádriceps', ['Extensión cuádriceps'], 'Extensión de rodilla', 'Extensión de rodilla'),
  compound('Goblet squat', 'Cuádriceps', ['Mancuernas'], 'Sentadilla', 'Dominante de rodilla', ['Glúteo', 'Core']),
  compound('Sentadilla búlgara', 'Cuádriceps', ['Mancuernas', 'Banco plano'], 'Sentadilla unilateral', 'Dominante de rodilla', ['Glúteo'], true),

  compound('Peso muerto rumano barra', 'Femoral', ['Barra recta'], 'Peso muerto rumano', 'Bisagra de cadera', ['Glúteo', 'Lumbar']),
  compound('Peso muerto rumano mancuernas', 'Femoral', ['Mancuernas'], 'Peso muerto rumano', 'Bisagra de cadera', ['Glúteo', 'Lumbar']),
  compound('Buenos días', 'Femoral', ['Barra recta', 'Jaula sentadilla'], 'Buenos días', 'Bisagra de cadera', ['Glúteo', 'Lumbar']),
  isolation('Curl femoral acostado', 'Femoral', ['Curl femoral acostado'], 'Curl femoral', 'Flexión de rodilla'),
  isolation('Curl femoral de pie', 'Femoral', ['Curl femoral de pie'], 'Curl femoral', 'Flexión de rodilla', [], true),
  isolation('Pantorrilla de pie', 'Pantorrilla', ['Pantorrilla de pie'], 'Elevación de talón', 'Flexión plantar'),
  isolation('Pantorrilla sentado', 'Pantorrilla', ['Pantorrilla sentado'], 'Elevación de talón', 'Flexión plantar'),

  compound('Hip thrust', 'Glúteo', ['Barra recta', 'Banco plano'], 'Hip thrust', 'Extensión de cadera', ['Femoral']),
  isolation('Patada glúteo máquina', 'Glúteo', ['Máquina patada glúteo'], 'Patada de glúteo', 'Extensión de cadera', [], true),
  isolation('Patada glúteo polea', 'Glúteo', ['Poleas'], 'Patada de glúteo', 'Extensión de cadera', [], true),
  isolation('Abducción de cadera', 'Abductores', ['Máquina abducción/aducción'], 'Abducción de cadera', 'Abducción de cadera', ['Glúteo']),
  compound('Peso muerto una pierna', 'Glúteo', ['Mancuernas'], 'Peso muerto unilateral', 'Bisagra de cadera', ['Femoral', 'Core'], true),
  isolation('Aducción de cadera', 'Aductores', ['Máquina abducción/aducción'], 'Aducción de cadera', 'Aducción de cadera'),

  isolation('Curl barra recta', 'Bíceps', ['Barra recta'], 'Curl de bíceps', 'Flexión de codo', ['Antebrazo']),
  isolation('Curl barra W', 'Bíceps', ['Barra W'], 'Curl de bíceps', 'Flexión de codo', ['Antebrazo']),
  isolation('Curl mancuernas', 'Bíceps', ['Mancuernas'], 'Curl de bíceps', 'Flexión de codo', ['Antebrazo']),
  isolation('Curl predicador', 'Bíceps', ['Barra W', 'Banco predicador'], 'Curl predicador', 'Flexión de codo'),
  isolation('Curl máquina sentado', 'Bíceps', ['Máquina bíceps sentado'], 'Curl de bíceps', 'Flexión de codo'),
  isolation('Curl polea barra', 'Bíceps', ['Poleas', 'Barra recta'], 'Curl en polea', 'Flexión de codo'),
  isolation('Curl polea cuerda', 'Bíceps', ['Poleas'], 'Curl en polea', 'Flexión de codo', ['Antebrazo']),

  isolation('Press francés barra W', 'Tríceps', ['Barra W', 'Banco plano'], 'Extensión de tríceps', 'Extensión de codo'),
  compound('Press cerrado en banco', 'Tríceps', ['Barra recta', 'Banco plano'], 'Press cerrado', 'Empuje horizontal', ['Pecho', 'Deltoide anterior']),
  isolation('Extensión polea barra recta', 'Tríceps', ['Poleas', 'Barra recta'], 'Extensión de tríceps', 'Extensión de codo'),
  isolation('Extensión polea cuerda', 'Tríceps', ['Poleas'], 'Extensión de tríceps', 'Extensión de codo'),
  isolation('Patada tríceps máquina', 'Tríceps', ['Máquina patada tríceps'], 'Patada de tríceps', 'Extensión de codo'),
  isolation('Patada tríceps mancuerna', 'Tríceps', ['Mancuernas'], 'Patada de tríceps', 'Extensión de codo', [], true),
  compound('Fondos en banco', 'Tríceps', ['Banco plano'], 'Fondos', 'Empuje vertical', ['Pecho', 'Deltoide anterior']),

  isolation('Curl muñeca barra', 'Antebrazo', ['Barra recta'], 'Curl de muñeca', 'Flexión de muñeca'),
  isolation('Curl muñeca inverso barra', 'Antebrazo', ['Barra recta'], 'Curl de muñeca', 'Extensión de muñeca'),
  isolation('Curl antebrazo mancuernas', 'Antebrazo', ['Mancuernas'], 'Curl de muñeca', 'Flexión de muñeca'),
  compound('Paseo del granjero', 'Antebrazo', ['Mancuernas'], 'Carga transportada', 'Acarreo', ['Trapecio', 'Core']),
  isolation('Curl muñeca polea', 'Antebrazo', ['Poleas'], 'Curl de muñeca', 'Flexión de muñeca'),
  compound('Dead hang', 'Antebrazo', ['Barra dominadas'], 'Suspensión', 'Agarre isométrico', ['Espalda']),

  isolation('Crunch banco', 'Abdomen', ['Banco abdomen/declinado'], 'Crunch', 'Flexión de tronco'),
  isolation('Crunch banco declinado', 'Abdomen', ['Banco declinado'], 'Crunch', 'Flexión de tronco'),
  compound('Elevación rodillas en silla', 'Abdomen', ['Silla elevación rodillas'], 'Elevación de rodillas', 'Flexión de cadera', ['Core']),
  isolation('Crunch polea cuerda', 'Abdomen', ['Poleas'], 'Crunch', 'Flexión de tronco'),
  compound('Rueda abdominal', 'Core', ['Rueda abdominal'], 'Rueda abdominal', 'Anti-extensión', ['Abdomen']),
  compound('Russian twist con disco', 'Abdomen', ['Disco'], 'Rotación de tronco', 'Rotación', ['Core']),
  { name: 'Elíptica', primary: 'Cardio', equipment: ['Elíptica'], family: 'Cardio elíptico', pattern: 'Cardio', type: 'cardio', difficulty: 'Principiante', unilateral: false, minutes: 10, tags: ['Cardio', 'Bajo impacto'] },
];
