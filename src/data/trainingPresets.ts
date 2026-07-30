import { ScheduleDay, ExerciseDetail } from '../types';

export interface TrainingPreset {
  id: string;
  title: string;
  description: string;
  category: 'gym' | 'casa' | 'sprints' | 'hibrido';
  badgeColor: string;
  icon: string;
  schedule: ScheduleDay[];
}

export const DRILLS_GYM_POWER: ExerciseDetail[] = [
  {
    id: 'dr-g1',
    name: 'Sentadillas Búlgaras con Mancuernas',
    targetSets: 4,
    defaultReps: 8,
    defaultWeightKg: 14,
    restSeconds: 90,
    targetMuscles: ['Cuádriceps', 'Glúteo Mayor', 'Estabilizadores Pelvianos'],
    injuryPreventionTag: '🛡️ Prevención de valgo dinámico & ligamento cruzado (LCA)',
    techniqueTip: 'Desciende despacio en 3 segundos manteniendo la rodilla delantera firme sin colapsar hacia adentro (valgo).',
    evidenceLevel: 'Alta',
    citation: 'Hewett et al., 2005 — American Journal of Sports Medicine',
    pitchTransfer: 'Transferencia directa al aterrizaje unipodal tras disputa aérea y estabilización en giros a máxima velocidad.'
  },
  {
    id: 'dr-g2',
    name: 'Hip Thrust con Barra en Banco',
    targetSets: 4,
    defaultReps: 10,
    defaultWeightKg: 50,
    restSeconds: 90,
    targetMuscles: ['Glúteo Máximo', 'Isquiotibiales'],
    injuryPreventionTag: '⚡ Extensión horizontal de cadera para sprint de alta velocidad',
    techniqueTip: 'Pausa de 1 segundo en máxima contracción arriba. Mantén la barbilla orientada hacia el pecho para evitar retroversión lumbar.',
    evidenceLevel: 'Alta',
    citation: 'Contreras et al., 2017 — Journal of Strength and Conditioning Research',
    pitchTransfer: 'Maximiza la aceleración horizontal en los primeros 0–10 metros de sprint.'
  },
  {
    id: 'dr-g3',
    name: 'Prensa Unilateral a 45°',
    targetSets: 3,
    defaultReps: 10,
    defaultWeightKg: 35,
    restSeconds: 60,
    targetMuscles: ['Cuádriceps', 'Aductores'],
    injuryPreventionTag: '🛡️ Fuerza unilateral simétrica para duelos físicos 1vs1',
    techniqueTip: 'Apoya el pie completo en la plataforma y baja sin despegar la zona sacra.',
    evidenceLevel: 'Moderada',
    citation: 'Pedersen et al., 2022 — International Journal of Sports Physiology',
    pitchTransfer: 'Protege las articulaciones coxofemorales durante contactos en carrera.'
  },
  {
    id: 'dr-g4',
    name: 'Curl Nórdico Excéntrico de Isquios',
    targetSets: 3,
    defaultReps: 6,
    defaultWeightKg: 0,
    restSeconds: 90,
    targetMuscles: ['Isquiotibiales (Bíceps Femoral)', 'Gemelos'],
    injuryPreventionTag: '🛡️ Reducción del 51%-70% de riesgo de rotura isquiotibial',
    techniqueTip: 'Cuerpo completamente alineado desde la rodilla hasta los hombros. Controla la caída excéntrica durante 4-5 segundos.',
    evidenceLevel: 'Alta',
    citation: 'Petersen et al., 2011 — British Medical Journal (BMJ)',
    pitchTransfer: 'Aumenta la longitud de fascículo del bíceps femoral permitiendo desaceleraciones bruscas sin desgarro.'
  },
  {
    id: 'dr-g5',
    name: 'Pallof Press Anti-Rotación (Polea / Banda)',
    targetSets: 3,
    defaultReps: 12,
    defaultWeightKg: 12,
    restSeconds: 45,
    targetMuscles: ['Abdomen Oblicuo', 'Transverso Abdominal'],
    injuryPreventionTag: '🛡️ Estabilidad del core en torsiones y cambio de dirección',
    techniqueTip: 'Extiende los brazos al frente resoplando y mantén los hombros perfectamente alineados con las caderas.',
    evidenceLevel: 'Alta',
    citation: 'McGill et al., 2010 — Journal of Applied Biomechanics',
    pitchTransfer: 'Transfiere la fuerza entre el tren inferior y superior en el cuerpeo 1v1.'
  }
];

export const DRILLS_SPRINTS_EXPLOSIVE: ExerciseDetail[] = [
  {
    id: 'dr-s1',
    name: 'Sprints Reactivos de 10m con Salida Estática',
    targetSets: 5,
    defaultReps: 1,
    defaultWeightKg: 0,
    restSeconds: 60,
    targetMuscles: ['Cadena Posterior', 'Gemelos', 'Cadera'],
    injuryPreventionTag: '⚡ Potencia de arranque inicial ATP-PCr (0-10m)',
    techniqueTip: 'Inclinación del tronco a 45° en la salida y zancada potente de máxima tracción.',
    evidenceLevel: 'Alta',
    citation: 'Buchheit & Laursen, 2013 — Sports Medicine',
    pitchTransfer: 'Gana la posición inicial en balones divididos y desmarques al espacio.'
  },
  {
    id: 'dr-s2',
    name: 'Sprints de 20m con Frenado Progresivo',
    targetSets: 4,
    defaultReps: 1,
    defaultWeightKg: 0,
    restSeconds: 75,
    targetMuscles: ['Cuádriceps Excéntrico', 'Aductores'],
    injuryPreventionTag: '🛡️ Tolerancia excéntrica al frenado repentino (Prevención LCA)',
    techniqueTip: 'Tras pasar los 20m, decelera en 3 pasos cortos bajando el centro de gravedad.',
    evidenceLevel: 'Alta',
    citation: 'Kovacs et al., 2008 — Journal of Sports Science and Medicine',
    pitchTransfer: 'Permite frenar antes de la línea de fondo o realizar fintas de recibo.'
  },
  {
    id: 'dr-s3',
    name: 'Circuito Z: Cambios de Dirección 45°',
    targetSets: 4,
    defaultReps: 2,
    defaultWeightKg: 0,
    restSeconds: 90,
    targetMuscles: ['Tobillos', 'Aductores', 'Core'],
    injuryPreventionTag: '🛡️ Agilidad táctica & amortiguación de valgo',
    techniqueTip: 'Apoyo del pie externo fuerte para hincar en el césped y salir catapultada al siguiente cono.',
    evidenceLevel: 'Alta',
    citation: 'Spiteri et al., 2014 — European Journal of Sport Science',
    pitchTransfer: 'Optimiza los virajes rápidos en basculaciones defensivas y regates en banda.'
  }
];

export const DRILLS_HOME_TECHNIQUE: ExerciseDetail[] = [
  {
    id: 'dr-h1',
    name: '100 Pases a Pared Alternando Piernas',
    targetSets: 4,
    defaultReps: 25,
    defaultWeightKg: 0,
    restSeconds: 45,
    targetMuscles: ['Interior del Pie', 'Coordinación Fina'],
    injuryPreventionTag: '⚽ Automatización de precisión de pase a 1 toque',
    techniqueTip: 'Tensión constante en el tobillo. Cambia de pie sin detener la pelota.',
    evidenceLevel: 'Moderada',
    citation: 'Ali et al., 2007 — Journal of Sports Sciences',
    pitchTransfer: 'Mantiene la fluidez de pase bajo alta velocidad de juego.'
  },
  {
    id: 'dr-h2',
    name: 'Control Orientado en 2 Toques en Espacio Reducido',
    targetSets: 4,
    defaultReps: 15,
    defaultWeightKg: 0,
    restSeconds: 45,
    targetMuscles: ['Control Periférico', 'Giro de Cadera'],
    injuryPreventionTag: '⚽ Salida de presión bajo marca pegada',
    techniqueTip: 'Primer contacto hacia el espacio libre y segundo contacto para entregar el pase.',
    evidenceLevel: 'Moderada',
    citation: 'Savelsbergh et al., 2002 — Journal of Human Movement Studies',
    pitchTransfer: 'Reduce el tiempo de decisión antes del acoso del rival.'
  },
  {
    id: 'dr-h3',
    name: 'Conos en Ochos a Máxima Velocidad de Pie',
    targetSets: 4,
    defaultReps: 4,
    defaultWeightKg: 0,
    restSeconds: 60,
    targetMuscles: ['Borde Interno/Externo', 'Sensibilidad'],
    injuryPreventionTag: '⚽ Conducción de balón pegado al empeine',
    techniqueTip: 'Usa toques cortos y rápidos manteniendo la mirada al frente.',
    evidenceLevel: 'Moderada',
    citation: 'Reilly et al., 2000 — Journal of Sports Sciences',
    pitchTransfer: 'Mejora el dominio espacial en situaciones congestionadas de medio campo.'
  }
];

export const TRAINING_PRESETS: TrainingPreset[] = [
  {
    id: 'preset-gym',
    title: 'Plan Gym Fuerza & Potencia Fútbol',
    description: 'Respaldado científicamente. Fuerza útil unilateral, prevención de LCA e incremento de potencia de sprint.',
    category: 'gym',
    badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    icon: '🏋️‍♂️',
    schedule: [
      {
        id: 'gym-lun',
        dayShort: 'LUN',
        dayFull: 'Lunes',
        activityType: 'gimnasio',
        title: 'Gym: Sentadilla, Peso Muerto & Pliometría',
        durationMin: 60,
        status: 'pending',
        intensity: 'alta',
        icon: 'Dumbbell',
        scheduledTime: '08:30',
        location: 'gym',
        focusArea: 'fuerza',
        notes: 'Sentadilla búlgara 4x8, Hip thrust 4x10, Prensa unilateral 3x10, Curl nórdico 3x6.',
        exercises: ['Sentadilla Búlgara 4x8', 'Hip Thrust 4x10', 'Prensa Unilateral 3x10', 'Curl Nórdico 3x6', 'Pallof Press 3x12'],
        exerciseDetails: DRILLS_GYM_POWER
      },
      {
        id: 'gym-mar',
        dayShort: 'MAR',
        dayFull: 'Martes',
        activityType: 'entrenamiento',
        title: 'Campo: Sprints Cortos & Táctica',
        durationMin: 75,
        status: 'pending',
        intensity: 'alta',
        icon: 'Activity',
        scheduledTime: '17:00',
        location: 'campo',
        focusArea: 'sprints',
        notes: 'Sprints de 10m y 20m con cambios de dirección.',
        exercises: ['Sprints Reactivos 10m x5', 'Sprints 20m con Freno x4', 'Circuito Z 45° x4'],
        exerciseDetails: DRILLS_SPRINTS_EXPLOSIVE
      },
      {
        id: 'gym-mie',
        dayShort: 'MIE',
        dayFull: 'Miércoles',
        activityType: 'gimnasio',
        title: 'Gym: Tren Superior, Core & Estabilidad',
        durationMin: 60,
        status: 'pending',
        intensity: 'moderada',
        icon: 'Dumbbell',
        scheduledTime: '09:00',
        location: 'gym',
        focusArea: 'fuerza',
        notes: 'Press militar, dominadas asistidas, remo y planchas abdominales.',
        exercises: ['Press Militar 4x10', 'Remo con Mancuerna 4x10', 'Planchas Abdominales 3x60s'],
        exerciseDetails: DRILLS_GYM_POWER
      },
      {
        id: 'gym-jue',
        dayShort: 'JUE',
        dayFull: 'Jueves',
        activityType: 'recuperacion',
        title: 'Casa: Movilidad 90/90 & Foam Roller',
        durationMin: 35,
        status: 'pending',
        intensity: 'baja',
        icon: 'HeartPulse',
        scheduledTime: '18:30',
        location: 'casa',
        focusArea: 'recuperacion',
        notes: 'Liberación miofascial y estiramientos de cadera.',
        exercises: ['Movilidad Hip Opener 90/90 10m', 'Foam Roller Isquios y Cuádriceps 15m', 'Respiración Diafragmática 10m']
      },
      {
        id: 'gym-vie',
        dayShort: 'VIE',
        dayFull: 'Viernes',
        activityType: 'gimnasio',
        title: 'Gym: Potencia Explosiva & Saltos Unilaterales',
        durationMin: 45,
        status: 'pending',
        intensity: 'moderada',
        icon: 'Dumbbell',
        scheduledTime: '10:00',
        location: 'gym',
        focusArea: 'fuerza',
        notes: 'Zancadas con mancuerna y saltos horizontales a una pierna.',
        exercises: ['Zancadas Exploratorias 3x10', 'Saltos Horizontales 3x6', 'Core Anti-Rotación 3x12'],
        exerciseDetails: DRILLS_GYM_POWER
      },
      {
        id: 'gym-sab',
        dayShort: 'SAB',
        dayFull: 'Sábado',
        activityType: 'partido',
        title: '⚽ DÍA DE PARTIDO LIGA F',
        durationMin: 90,
        status: 'pending',
        intensity: 'alta',
        icon: 'Trophy',
        scheduledTime: '16:00',
        location: 'campo',
        focusArea: 'partido',
        notes: 'Titular de inicio. Hidratación constante pre y post partido.'
      },
      {
        id: 'gym-dom',
        dayShort: 'DOM',
        dayFull: 'Domingo',
        activityType: 'descanso',
        title: 'Descanso Total & Crioterapia',
        durationMin: 0,
        status: 'pending',
        intensity: 'baja',
        icon: 'Bed',
        scheduledTime: '00:00',
        location: 'casa',
        focusArea: 'recuperacion',
        notes: 'Caminar 20 minutos suave. Baño de contraste o hielo.'
      }
    ]
  },
  {
    id: 'preset-casa',
    title: 'Técnica & Control Orientado en Casa',
    description: 'Basado en principios de aprendizaje motor. Espacio reducido: pared, balón y conos.',
    category: 'casa',
    badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
    icon: '⚽',
    schedule: [
      {
        id: 'casa-lun',
        dayShort: 'LUN',
        dayFull: 'Lunes',
        activityType: 'entrenamiento',
        title: 'Casa: Pases a Pared & Control Orientado',
        durationMin: 45,
        status: 'pending',
        intensity: 'moderada',
        icon: 'Activity',
        scheduledTime: '17:30',
        location: 'casa',
        focusArea: 'tecnica',
        notes: '100 pases alternando pierna dominante e izquierda.',
        exercises: ['100 Pases Pared 4x25', 'Control Orientado 2 Toques 4x15', 'Conos en 8 x4'],
        exerciseDetails: DRILLS_HOME_TECHNIQUE
      },
      {
        id: 'casa-mie',
        dayShort: 'MIE',
        dayFull: 'Miércoles',
        activityType: 'entrenamiento',
        title: 'Casa: Malabarismo de Precisión & Reacción',
        durationMin: 45,
        status: 'pending',
        intensity: 'moderada',
        icon: 'Activity',
        scheduledTime: '17:30',
        location: 'casa',
        focusArea: 'tecnica',
        notes: 'Dominio de balón con empeine, muslo y cabeza.',
        exercises: ['Malabarismos 10 min', 'Pases Cortos a 1 Toque 4x30', 'Conducción en Ochox4'],
        exerciseDetails: DRILLS_HOME_TECHNIQUE
      },
      {
        id: 'casa-vie',
        dayShort: 'VIE',
        dayFull: 'Viernes',
        activityType: 'entrenamiento',
        title: 'Casa: Core de Fútbol & Prevención',
        durationMin: 40,
        status: 'pending',
        intensity: 'baja',
        icon: 'HeartPulse',
        scheduledTime: '18:00',
        location: 'casa',
        focusArea: 'recuperacion',
        notes: 'Planchas y fortalecimiento de tobillos con banda elástica.',
        exercises: ['Planchas Isométricas 3x60s', 'Fortalecimiento Tobillos Banda 3x15', 'Extensión Lumbar 3x12']
      }
    ]
  }
];
