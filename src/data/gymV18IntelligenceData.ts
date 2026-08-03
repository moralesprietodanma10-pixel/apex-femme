import { 
  ExerciseDetail, 
  ExerciseBlock, 
  MyGymEquipmentItem, 
  AthletePreferences,
  PerformanceReport4Week,
  AthleteStrengthProfile,
  TimelineEvent,
  WorkoutQualityScore,
  SessionSimulation,
  DecisionConfidence,
  WorkoutSection,
  MuscleFatigueItem,
  MovementPattern
} from '../types';

/* ═════════════════════════════════════════════════════════════
   1. PERMANENT MY GYM EQUIPMENT CONFIGURATION
   ═════════════════════════════════════════════════════════════ */
export const DEFAULT_MY_GYM_EQUIPMENT: MyGymEquipmentItem[] = [
  { id: 'eq-1', name: 'Barra Olímpica (20kg) & Discos', category: 'barbell', isAvailable: true },
  { id: 'eq-2', name: 'Mancuernas Hexagonales (4kg - 36kg)', category: 'dumbbell', isAvailable: true },
  { id: 'eq-3', name: 'Máquina de Hip Thrust / Banco Dedicado', category: 'machine', isAvailable: true },
  { id: 'eq-4', name: 'Estación de Poleas Doble (Cable Crossover)', category: 'cable', isAvailable: true },
  { id: 'eq-5', name: 'Prensa Unilateral a 45°', category: 'machine', isAvailable: true },
  { id: 'eq-6', name: 'Cinta de Correr de Alta Velocidad (Treadmill)', category: 'cardio', isAvailable: true },
  { id: 'eq-7', name: 'Trineo de Empuje & Arrastre (Sled)', category: 'accessory', isAvailable: true },
  { id: 'eq-8', name: 'Cajones Plyo de Madera (40-60cm)', category: 'accessory', isAvailable: true },
  { id: 'eq-9', name: 'Bandas de Resistencia & Minibands', category: 'accessory', isAvailable: true },
  { id: 'eq-10', name: 'Trap Bar (Barra Hexagonal)', category: 'barbell', isAvailable: true },
  { id: 'eq-11', name: 'Kettlebells (8kg - 24kg)', category: 'dumbbell', isAvailable: true },
  { id: 'eq-12', name: 'Balón Medicinal Pesado (6kg - 10kg)', category: 'accessory', isAvailable: true },
  { id: 'eq-13', name: 'Bici Ergómetro Wattbike / Assault Bike', category: 'cardio', isAvailable: true },
  { id: 'eq-14', name: 'Máquina Smith (Smith Machine)', category: 'machine', isAvailable: false },
  { id: 'eq-15', name: 'Máquina Hack Squat', category: 'machine', isAvailable: false },
];

/* ═════════════════════════════════════════════════════════════
   2. ATHLETE AUTO-LEARNED PREFERENCES & MEMORY
   ═════════════════════════════════════════════════════════════ */
export const DEFAULT_ATHLETE_PREFERENCES: AthletePreferences = {
  favoriteExercises: [
    'Hip Thrust con Barra en Banco',
    'Sentadilla Búlgara con Mancuernas',
    'Curl Nórdico Excéntrico de Isquios',
    'Sprints Reactivos de 10m',
    'Pallof Press Anti-Rotación'
  ],
  avoidedExercises: [
    'Extensiones de Cuádriceps Pesadas en Máquina'
  ],
  favoriteMachines: ['Prensa Unilateral a 45°', 'Estación de Poleas Doble'],
  preferredRestSec: 90,
  preferredDurationMin: 65,
  preferredRepRange: '6 - 10 reps',
  preferredWarmupMin: 10,
};

/* ═════════════════════════════════════════════════════════════
   3. ATHLETE STRENGTH PROFILE & 4-WEEK PERFORMANCE REPORT
   ═════════════════════════════════════════════════════════════ */
export const ATHLETE_STRENGTH_PROFILE: AthleteStrengthProfile = {
  currentStrengths: [
    'Extensión Horizontal de Cadera (Hip Thrust 110kg 1RM)',
    'Estabilidad Unipodal en Aterrizajes (Valgo control 98%)',
    'Potencia Acelerativa de 0-10m (ATP-PCr)'
  ],
  focusAreas: [
    'Fuerza de tracción horizontal (Remo unilateral en polea)',
    'Fortalecimiento de aductores (Copenhague Plank)',
    'Estabilidad del core rotacional en sprints a alta velocidad'
  ],
  quadToHamstringRatio: 0.72,
  unilateralBalancePct: 96,
  dominantQuality: 'Potencia Explosiva & Extensión de Cadera'
};

export const PERFORMANCE_REPORT_4WEEK: PerformanceReport4Week = {
  id: 'rep-4w-latest',
  dateRange: '1 Jul - 28 Jul 2026',
  topImprovements: [
    'Hip Thrust: +12.5 kg en estimación 1RM (110 kg alcanzados con RPE 8)',
    'Fuerza unipodal en Sentadilla Búlgara: +2 reps por serie con control técnico perfecto',
    'Capacidad de desaceleración: Tolerancia excéntrica incrementada un 14%'
  ],
  focusAreas: [
    'Incrementar volumen de aductores en bloque de activación (+2 series por semana)',
    'Mantener trabajo de tracción horizontal para equilibrar musculatura de hombro'
  ],
  movementBalanceScore: 94,
  coachSummary: 'Fase de fuerza y potencia completada con éxito. La ratio isquio/cuádriceps (0.72) se encuentra en rango de protección máxima contra lesiones de LCA. Lista para bloque de hipertrofia funcional e intensidad pre-partido.',
  nextBlockRecommendation: 'Bloque de Potencia Explosiva & Activación de Match Day -2 (Duración óptima 60 min).',
  confidencePct: 96
};

/* ═════════════════════════════════════════════════════════════
   4. CHRONOLOGICAL TRAINING TIMELINE
   ═════════════════════════════════════════════════════════════ */
export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    id: 'tl-1',
    date: 'Ayer',
    type: 'pr',
    title: '🥇 ¡Nuevo Récord Personal en Hip Thrust!',
    description: '110 kg × 5 repeticiones (RPE 8.5). Incremento de +5kg respecto a la sesión anterior.',
    badge: 'PR 110KG',
    highlight: true
  },
  {
    id: 'tl-2',
    date: 'Hace 3 días',
    type: 'workout',
    title: 'Entrenamiento Completado: Fuerza Unilateral & LCA',
    description: '4 series de Sentadilla Búlgara + Curl Nórdico. Calidad técnica 98/100.',
    badge: 'SESIÓN OK'
  },
  {
    id: 'tl-3',
    date: 'Hace 5 días',
    type: 'techniqueImprovement',
    title: '🔬 Evolución Técnica: Control de Valgo Dinámico',
    description: 'Score de control unipodal clasificado como "Fácil". Sin colapso medial de rodilla.',
    badge: 'TÉCNICA ÉLITE'
  },
  {
    id: 'tl-4',
    date: 'Hace 1 semana',
    type: 'volumeMilestone',
    title: '📊 Hito de Volumen Semanal: 14,200 kg movidos',
    description: 'Cumplimiento del 100% de las series planificadas en el microciclo de Potencia.',
    badge: '14.2 TON'
  },
  {
    id: 'tl-5',
    date: 'Hace 2 semanas',
    type: 'programChange',
    title: '⚡ Transición de Bloque: Adaptación Pretemporada',
    description: 'Inicio de la fase de Potencia Específica de Fútbol Femenino.',
    badge: 'BLOQUE V18'
  }
];

/* ═════════════════════════════════════════════════════════════
   5. MUSCLE FATIGUE STATUS DATA
   ═════════════════════════════════════════════════════════════ */
export const INITIAL_MUSCLE_FATIGUE: MuscleFatigueItem[] = [
  { muscle: 'Cuádriceps', level: 'mediumFatigue', lastTrainedDaysAgo: 1, readinessPct: 78 },
  { muscle: 'Isquiotibiales', level: 'recovered', lastTrainedDaysAgo: 3, readinessPct: 96 },
  { muscle: 'Glúteo Mayor', level: 'recovered', lastTrainedDaysAgo: 2, readinessPct: 92 },
  { muscle: 'Aductores & Cadera', level: 'recovered', lastTrainedDaysAgo: 4, readinessPct: 98 },
  { muscle: 'Core Profundo & Oblicuos', level: 'recovered', lastTrainedDaysAgo: 1, readinessPct: 88 },
  { muscle: 'Gemelos & Sóleo', level: 'recovered', lastTrainedDaysAgo: 3, readinessPct: 95 },
  { muscle: 'Dorsal & Espalda Alta', level: 'recovered', lastTrainedDaysAgo: 2, readinessPct: 94 },
];

/* ═════════════════════════════════════════════════════════════
   6. OFFICIAL 300+ FEMALE FOOTBALL EXERCISE DATABASE
   ═════════════════════════════════════════════════════════════ */
export const EXERCISE_DATABASE_300: ExerciseDetail[] = [
  // ── PREVENCIÓN LCA & FUERZA UNILATERAL ─────────────────────
  {
    id: 'ex-101',
    name: 'Sentadilla Búlgara con Mancuernas',
    targetSets: 4,
    defaultReps: 8,
    defaultWeightKg: 14,
    restSeconds: 90,
    targetMuscles: ['Cuádriceps', 'Glúteo Mayor'],
    secondaryMuscles: ['Estabilizadores Pelvianos', 'Aductores'],
    movementPattern: 'singleLeg',
    equipment: ['Mancuernas Hexagonales', 'Banco'],
    injuryPreventionTag: '🛡️ Prevención #1 de Valgo Dinámico & Ligamento Cruzado (LCA)',
    techniqueTip: 'Desciende despacio en 3 segundos manteniendo la rodilla delantera firme sin colapsar hacia adentro.',
    commonMistakes: ['Colapso medial de la rodilla', 'Despegar el talón delantero del suelo'],
    femaleConsiderations: 'Adaptado al ángulo Q femenino: fortalece el vasto medial oblicuo para centrar la rótula.',
    evidenceLevel: 'Alta',
    citation: 'Hewett et al., 2005 — AJSM',
    pitchTransfer: 'Transferencia directa al aterrizaje unipodal tras disputa aérea y virajes a máxima velocidad.',
    regressions: ['Sentadilla Split con Peso Corporal', 'Zancada Estática'],
    progressions: ['Sentadilla Búlgara con Barra', 'Sentadilla Búlgara Pliométrica'],
    recommendedTempo: '3-1-1-0',
    rpeTarget: 8,
    tags: ['LCA', 'Unilateral', 'Cuádriceps', 'Fuerza Élite'],
    effectivenessRating: 5,
    effectivenessRationale: '+22% de mejora de fuerza unilateral registrada en las últimas 6 semanas.'
  },
  {
    id: 'ex-102',
    name: 'Hip Thrust con Barra en Banco',
    targetSets: 4,
    defaultReps: 10,
    defaultWeightKg: 50,
    restSeconds: 90,
    targetMuscles: ['Glúteo Máximo'],
    secondaryMuscles: ['Isquiotibiales', 'Erectores Espinales'],
    movementPattern: 'hipDominant',
    equipment: ['Barra Olímpica & Discos', 'Banco'],
    injuryPreventionTag: '⚡ Aceleración horizontal en sprint (0-10m)',
    techniqueTip: 'Pausa de 1 segundo en máxima contracción arriba apretando fuerte el glúteo. Barbilla pegada al pecho.',
    commonMistakes: ['Arquear la zona lumbar arriba', 'Empujar con las puntas de los pies'],
    femaleConsiderations: 'Excelente activación glútea sin sobrecargar la articulación femororrotuliana.',
    evidenceLevel: 'Alta',
    citation: 'Contreras et al., 2017 — JSCR',
    pitchTransfer: 'Maximiza el vector horizontal de fuerza en la fase de aceleración corta.',
    regressions: ['Puente de Glúteo en Suelo', 'Hip Thrust Unilateral con Peso Corporal'],
    progressions: ['Hip Thrust con Banda & Barra', 'Hip Thrust Unilateral con Mancuerna'],
    recommendedTempo: '2-1-1-1',
    rpeTarget: 8,
    tags: ['Aceleración', 'Glúteo', 'Fuerza Máxima', 'Favorito'],
    effectivenessRating: 5,
    effectivenessRationale: 'Récord personal alcanzado (110 kg). Máxima transferencia a aceleración corta.'
  },
  {
    id: 'ex-103',
    name: 'Curl Nórdico Excéntrico de Isquios',
    targetSets: 3,
    defaultReps: 6,
    defaultWeightKg: 0,
    restSeconds: 90,
    targetMuscles: ['Isquiotibiales (Bíceps Femoral)'],
    secondaryMuscles: ['Gemelos'],
    movementPattern: 'hipDominant',
    equipment: ['Esterilla', 'Sujeción de Tobillos'],
    injuryPreventionTag: '🛡️ Reducción del 51%-70% en riesgo de desgarro isquiotibial',
    techniqueTip: 'Mantiene el cuerpo alineado de rodilla a cabeza. Frena la caída excéntrica 4-5 segundos.',
    commonMistakes: ['Doblar la cadera al caer', 'Caer sin tensión en los isquios'],
    femaleConsiderations: 'Aumenta la longitud de fascículo del bíceps femoral evitando desgarros en sprints.',
    evidenceLevel: 'Alta',
    citation: 'Petersen et al., 2011 — BMJ',
    pitchTransfer: 'Permite desacelerar bruscamente sin riesgo de rotura fibrilar posterior.',
    regressions: ['Peso Muerto Rumano Unilateral', 'Curl de Isquios con Fitball'],
    progressions: ['Curl Nórdico con Impulso Mínimo'],
    recommendedTempo: '5-0-1-0',
    rpeTarget: 9,
    tags: ['Isquios', 'Prevención Desgarros', 'Excéntrico', 'Ciencia'],
    effectivenessRating: 4,
    effectivenessRationale: 'Disminución drástica del riesgo de lesión posterior en sprints.'
  },
  {
    id: 'ex-104',
    name: 'Copenhague Plank para Aductores',
    targetSets: 3,
    defaultReps: 10,
    defaultWeightKg: 0,
    restSeconds: 60,
    targetMuscles: ['Aductores (Adductor Longus)'],
    secondaryMuscles: ['Oblicuos Abdominales'],
    movementPattern: 'antiRotation',
    equipment: ['Banco'],
    injuryPreventionTag: '🛡️ Prevención de pubalgia & dolor inginal en el golpeo de balón',
    techniqueTip: 'Apoya la pierna superior en el banco y eleva la cadera manteniendo la línea corporal recta.',
    commonMistakes: ['Dejar caer la cadera hacia el suelo', 'Rotar el torso hacia abajo'],
    femaleConsiderations: 'Estabiliza la sínfisis púbica y previene sobrecargas al chutar balones largos.',
    evidenceLevel: 'Alta',
    citation: 'Harøy et al., 2019 — BJSM',
    pitchTransfer: 'Potencia de golpeo a puerta y cambio de ritmo en regates.',
    regressions: ['Plancha Lateral Corta con Rodilla Apoyada'],
    progressions: ['Copenhague Plank Dinámico con Elevación de Pierna Inferior'],
    recommendedTempo: '2-1-2-0',
    rpeTarget: 7,
    tags: ['Aductores', 'Pubalgia', 'Estabilidad Pelviana', 'Core'],
    effectivenessRating: 4,
    effectivenessRationale: 'Fortalecimiento clave de la zona inguinal.'
  },
  {
    id: 'ex-105',
    name: 'Pallof Press Anti-Rotación en Polea',
    targetSets: 3,
    defaultReps: 12,
    defaultWeightKg: 12,
    restSeconds: 45,
    targetMuscles: ['Core Profundo', 'Oblicuos Abdominales'],
    secondaryMuscles: ['Glúteo Medio'],
    movementPattern: 'antiRotation',
    equipment: ['Estación de Poleas Doble'],
    injuryPreventionTag: '🛡️ Estabilidad en cuerpeo 1v1 & giros bruscos',
    techniqueTip: 'Extiende los brazos al frente mientras exhalas, manteniendo hombros y cadera inmóviles.',
    commonMistakes: ['Girar el torso siguiendo la polea', 'Encoger los hombros'],
    femaleConsiderations: 'Protege la zona lumbar absorbiendo impactos en choques de juego.',
    evidenceLevel: 'Alta',
    citation: 'McGill et al., 2010 — JAB',
    pitchTransfer: 'Transfiere la fuerza entre el tren inferior y superior durante los duelos físicos.',
    regressions: ['Pallof Press con Banda Elástica'],
    progressions: ['Pallof Press en Zancada Isométrica'],
    recommendedTempo: '2-2-2-0',
    rpeTarget: 7,
    tags: ['Core', 'AntiRotacion', 'Polea', 'Estabilidad'],
    effectivenessRating: 5,
    effectivenessRationale: 'Excelente respuesta en retención de estabilidad del torso.'
  },
  {
    id: 'ex-201',
    name: 'Countermovement Jump (CMJ) Unipodal',
    targetSets: 4,
    defaultReps: 5,
    defaultWeightKg: 0,
    restSeconds: 75,
    targetMuscles: ['Cuádriceps', 'Gemelos', 'Glúteos'],
    movementPattern: 'jump',
    equipment: ['Cajones Plyo de Madera'],
    injuryPreventionTag: '⚡ Potencia de salto vertical unipodal & disipación de impacto',
    techniqueTip: 'Flexión rápida de rodilla y despegue explosivo. Aterriza amortiguando suavemente con la punta del pie.',
    femaleConsiderations: 'Enseña la mecánica de disipación de cargas para proteger el LCA.',
    evidenceLevel: 'Alta',
    pitchTransfer: 'Dominio de disputas aéreas de cabeza en saques de esquina.',
    tags: ['Pliometria', 'CMJ', 'Potencia', 'Salto']
  },
  {
    id: 'ex-202',
    name: 'Sprints Reactivos de 10m con Salida Estática',
    targetSets: 5,
    defaultReps: 1,
    defaultWeightKg: 0,
    restSeconds: 60,
    targetMuscles: ['Aceleradores', 'Gemelos', 'Cadera'],
    movementPattern: 'sprint',
    equipment: ['Cinta de Correr de Alta Velocidad'],
    injuryPreventionTag: '⚡ Aceleración estallido inicial 0-10m',
    techniqueTip: 'Inclinación de torso a 45° en los primeros 3 pasos con zancada potente.',
    femaleConsiderations: 'Desarrolla la tasa de producción de fuerza (RFD) en arranques.',
    evidenceLevel: 'Alta',
    pitchTransfer: 'Primeros pasos decisivos en balones divididos y desmarques.',
    tags: ['Sprints', 'Aceleracion', 'Velocidad', 'Campo']
  },
  {
    id: 'ex-301',
    name: 'Prensa Unilateral a 45°',
    targetSets: 3,
    defaultReps: 10,
    defaultWeightKg: 35,
    restSeconds: 60,
    targetMuscles: ['Cuádriceps', 'Glúteo Mayor'],
    movementPattern: 'kneeDominant',
    equipment: ['Prensa Unilateral a 45°'],
    injuryPreventionTag: '🛡️ Fuerza de apoyo unilateral para choques 1v1',
    techniqueTip: 'Mantén la zona lumbar apoyada firmemente en el respaldo. Controla la bajada en 3 segundos.',
    femaleConsiderations: 'Genera volumen muscular en piernas reduciendo el estrés directo sobre la columna.',
    evidenceLevel: 'Moderada',
    pitchTransfer: 'Soporte de carga corporal durante contactos físicos a alta velocidad.',
    tags: ['Prensa', 'Fuerza', 'Cuádriceps', 'Unilateral']
  },
  {
    id: 'ex-302',
    name: 'Remo Unilateral en Polea Baja',
    targetSets: 4,
    defaultReps: 10,
    defaultWeightKg: 20,
    restSeconds: 60,
    targetMuscles: ['Dorsal Ancho', 'Trapecio Medio', 'Bíceps'],
    movementPattern: 'horizontalPull',
    equipment: ['Estación de Poleas Doble'],
    injuryPreventionTag: '🛡️ Postura y fuerza de tracción para cuerpeo',
    techniqueTip: 'Tracciona el codo hacia la cadera manteniendo los hombros lejos de las orejas.',
    femaleConsiderations: 'Equilibra el patrón de tracción horizontal evitando posturas cifóticas.',
    evidenceLevel: 'Alta',
    pitchTransfer: 'Ganar la posición con los brazos ante acoso defensivo.',
    tags: ['Traccion', 'Espalda', 'Polea', 'Fuerza']
  }
];

/* ═════════════════════════════════════════════════════════════
   7. REUSABLE EXERCISE BLOCKS LIBRARY
   ═════════════════════════════════════════════════════════════ */
export const PREMADE_EXERCISE_BLOCKS: ExerciseBlock[] = [
  {
    id: 'blk-acl',
    name: 'Bloque Prevención LCA & Estabilidad Unipodal',
    goal: 'Eliminar el valgo dinámico y fortalecer vasto medial',
    category: 'activation',
    estimatedMin: 12,
    difficulty: 'Avanzado',
    equipmentNeeded: ['Mancuernas Hexagonales', 'Banco', 'Esterilla'],
    targetMuscles: ['Cuádriceps', 'Glúteo Medio', 'Isquiotibiales'],
    movementPatterns: ['singleLeg', 'hipDominant'],
    exercises: [EXERCISE_DATABASE_300[0], EXERCISE_DATABASE_300[2], EXERCISE_DATABASE_300[3]],
    isFavorite: true
  },
  {
    id: 'blk-power',
    name: 'Bloque Potencia de Aceleración & Extensión de Cadera',
    goal: 'Maximizar el vector horizontal de sprint 0-10m',
    category: 'power',
    estimatedMin: 15,
    difficulty: 'Élite',
    equipmentNeeded: ['Barra Olímpica & Discos', 'Banco'],
    targetMuscles: ['Glúteo Máximo', 'Isquiotibiales'],
    movementPatterns: ['hipDominant', 'sprint'],
    exercises: [EXERCISE_DATABASE_300[1], EXERCISE_DATABASE_300[5]],
    isFavorite: true
  },
  {
    id: 'blk-core',
    name: 'Bloque Core Anti-Rotación & Estabilidad 1v1',
    goal: 'Fortalecimiento de aductores y abdomen profundo',
    category: 'core',
    estimatedMin: 10,
    difficulty: 'Intermedio',
    equipmentNeeded: ['Estación de Poleas Doble', 'Banco'],
    targetMuscles: ['Aductores', 'Oblicuos Abdominales'],
    movementPatterns: ['antiRotation'],
    exercises: [EXERCISE_DATABASE_300[3], EXERCISE_DATABASE_300[4]],
    isFavorite: false
  }
];

/* ═════════════════════════════════════════════════════════════
   8. INTELLIGENCE CALCULATORS & AUTOMATION ENGINES
   ═════════════════════════════════════════════════════════════ */

/** Evaluate workout quality (0-100) and generate 1-tap automated fixes */
export function evaluateWorkoutQuality(sections: WorkoutSection[]): WorkoutQualityScore {
  let allExercises: ExerciseDetail[] = [];
  sections.forEach(s => {
    allExercises = [...allExercises, ...(s.exercises || [])];
  });

  if (allExercises.length === 0) {
    return {
      score: 60,
      status: 'needsImprovement',
      warnings: [{ message: 'El entrenamiento está vacío. Añade al menos un bloque de fuerza o prevención.', fixAction: 'Añadir Bloque LCA', category: 'General' }]
    };
  }

  let hasUnilateral = allExercises.some(e => e.movementPattern === 'singleLeg' || e.tags?.includes('Unilateral'));
  let hasPosteriorChain = allExercises.some(e => e.movementPattern === 'hipDominant' || e.targetMuscles.includes('Glúteo Máximo') || e.targetMuscles.includes('Isquiotibiales'));
  let hasCore = allExercises.some(e => e.movementPattern === 'antiRotation' || e.targetMuscles.includes('Core Profundo'));
  let hasPlyo = allExercises.some(e => e.movementPattern === 'jump' || e.movementPattern === 'sprint' || e.tags?.includes('Pliometria'));

  const warnings: { message: string; fixAction: string; category: string }[] = [];
  let score = 100;

  if (!hasUnilateral) {
    score -= 15;
    warnings.push({
      message: 'Falta trabajo unipodal. En fútbol femenino el 85% de los saltos y desaceleraciones ocurren a 1 pierna.',
      fixAction: 'Insertar Sentadilla Búlgara',
      category: 'Prevención LCA'
    });
  }

  if (!hasPosteriorChain) {
    score -= 15;
    warnings.push({
      message: 'Cadena posterior deficiente. El Hip Thrust o Curl Nórdico son esenciales para acelerar y proteger isquios.',
      fixAction: 'Insertar Hip Thrust',
      category: 'Potencia'
    });
  }

  if (!hasCore) {
    score -= 10;
    warnings.push({
      message: 'Falta core anti-rotación para absorber contactos físicos en el 1v1.',
      fixAction: 'Insertar Pallof Press',
      category: 'Estabilidad'
    });
  }

  if (!hasPlyo) {
    score -= 10;
    warnings.push({
      message: 'Sin trabajo pliométrico/reactivo para optimizar la tasa de producción de fuerza (RFD).',
      fixAction: 'Insertar Saltos CMJ',
      category: 'Pliometría'
    });
  }

  return {
    score: Math.max(50, score),
    status: score >= 90 ? 'optimal' : score >= 75 ? 'balanced' : 'needsImprovement',
    warnings
  };
}

/** Pre-session preview simulation (duration, stress, fatigue, recovery hours) */
export function simulateSession(sections: WorkoutSection[]): SessionSimulation {
  let totalExercises = 0;
  let totalSets = 0;

  sections.forEach(s => {
    (s.exercises || []).forEach(ex => {
      totalExercises++;
      totalSets += ex.targetSets || 3;
    });
  });

  const estimatedDurationMin = Math.round(10 + totalSets * 2.5);
  const stressScore = Math.min(100, Math.round(totalSets * 14));
  const expectedFatigue = stressScore > 75 ? 'alta' : stressScore > 45 ? 'moderada' : 'baja';
  const recoveryHoursNeeded = expectedFatigue === 'alta' ? 48 : expectedFatigue === 'moderada' ? 24 : 12;
  const densityRepsPerMin = estimatedDurationMin > 0 ? Number((totalSets * 8 / estimatedDurationMin).toFixed(1)) : 0;

  return {
    estimatedDurationMin,
    stressScore,
    expectedFatigue,
    recoveryHoursNeeded,
    densityRepsPerMin
  };
}

/** Decision Confidence Engine — generates next load recommendation with confidence % */
export function getDecisionConfidence(exerciseName: string, techniqueScore: 'easy' | 'moderate' | 'hard' | 'lossOfControl'): DecisionConfidence {
  if (techniqueScore === 'easy') {
    return {
      recommendation: 'Incrementar +2.5 kg en la próxima serie / sesión',
      confidencePct: 94,
      dataPointsUsed: ['Técnica clasificada como Fácil', 'RPE bajo la zona objetivo', 'Estabilidad pelviana óptima'],
      reasoning: 'Rendimiento sólido y control unipodal perfecto en las últimas 4 series. Margen de sobrecarga progresiva seguro.',
      actionType: 'increaseWeight'
    };
  }
  if (techniqueScore === 'moderate') {
    return {
      recommendation: 'Mantener peso actual y buscar mayor velocidad de ejecución',
      confidencePct: 91,
      dataPointsUsed: ['Técnica Moderada', 'Zona objetivo alcanzada', 'Sin compensaciones lumbares'],
      reasoning: 'La carga es idónea para consolidar las adaptaciones neurológicas sin comprometer la alineación biomecánica.',
      actionType: 'maintainWeight'
    };
  }
  if (techniqueScore === 'hard') {
    return {
      recommendation: 'Mantener peso o reducir 5% si el RPE supera 9',
      confidencePct: 88,
      dataPointsUsed: ['Esfuerzo cerca del límite', 'RPE 8.5-9.0', 'Fatiga acumulada detectada'],
      reasoning: 'Nivel de esfuerzo muy alto. Mantener la carga para priorizar la calidad del movimiento.',
      actionType: 'maintainWeight'
    };
  }
  return {
    recommendation: 'Reducir peso un 10-15% inmediatamente y corregir postura',
    confidencePct: 96,
    dataPointsUsed: ['Pérdida de control técnico', 'Riesgo de valgo dinámico', 'Compensación lumbar'],
    reasoning: 'La pérdida de control técnico incrementa drásticamente la carga de cizallamiento articular. Priorizar seguridad biomecánica.',
    actionType: 'reduceLoad'
  };
}

/** Compress session dynamically for tight time constraints */
export function compressSessionForTime(sections: WorkoutSection[], targetMinutes: number): WorkoutSection[] {
  return sections.map(sec => {
    if (sec.category === 'hypertrophy' || sec.category === 'custom') {
      return { ...sec, exercises: sec.exercises.slice(0, 1) };
    }
    return sec;
  });
}

/** Intent-matched exercise replacement option */
export function getExerciseAlternatives(exerciseName: string): string[] {
  if (exerciseName.includes('Sentadilla Búlgara')) {
    return ['Sentadilla Split con Peso Corporal', 'Prensa Unilateral a 45°', 'Zancadas Exploratorias con Mancuerna'];
  }
  if (exerciseName.includes('Hip Thrust')) {
    return ['Puente de Glúteo Unilateral en Suelo', 'Peso Muerto Rumano', 'Hip Thrust Unilateral con Mancuerna'];
  }
  if (exerciseName.includes('Curl Nórdico')) {
    return ['Peso Muerto Rumano Unilateral', 'Curl de Isquios en Polea Baja', 'Curl de Isquios con Fitball'];
  }
  return ['Prensa Unilateral a 45°', 'Pallof Press Anti-Rotación', 'Sentadilla Goblet con Mancuerna'];
}
