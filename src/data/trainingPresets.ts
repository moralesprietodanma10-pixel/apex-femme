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
    techniqueTip: 'Desciende despacio en 3 segundos manteniendo la rodilla delantera firme sin sobrepasar en exceso la punta del pie.'
  },
  {
    id: 'dr-g2',
    name: 'Hip Thrust con Barra en Banco',
    targetSets: 4,
    defaultReps: 10,
    defaultWeightKg: 50,
    restSeconds: 90,
    targetMuscles: ['Glúteo Máximo', 'Isquiotibiales'],
    injuryPreventionTag: '⚡ Extensión de cadera para sprint de alta velocidad',
    techniqueTip: 'Pausa de 1 segundo en máxima contracción arriba. Mantén la barbilla orientada hacia el pecho.'
  },
  {
    id: 'dr-g3',
    name: 'Prensa Unilateral a 45°',
    targetSets: 3,
    defaultReps: 10,
    defaultWeightKg: 35,
    restSeconds: 60,
    targetMuscles: ['Cuádriceps', 'Aductores'],
    injuryPreventionTag: '🛡️ Fuerza unilateral para duelos físicos 1vs1',
    techniqueTip: 'Apoya el pie completo en la plataforma y baja sin despegar la zona sacra.'
  },
  {
    id: 'dr-g4',
    name: 'Curl Nórdico Excéntrico de Isquios',
    targetSets: 3,
    defaultReps: 6,
    defaultWeightKg: 0,
    restSeconds: 90,
    targetMuscles: ['Isquiotibiales', 'Gemelos'],
    injuryPreventionTag: '🛡️ Reducción del 70% de riesgo de rotura muscular',
    techniqueTip: 'Cuerpo completamente alineado desde la rodilla hasta los hombros. Controla la caída.'
  },
  {
    id: 'dr-g5',
    name: 'Pallof Press Anti-Rotación (Polea / Banda)',
    targetSets: 3,
    defaultReps: 12,
    defaultWeightKg: 12,
    restSeconds: 45,
    targetMuscles: ['Abdomen Oblicuo', 'Transverso'],
    injuryPreventionTag: '🛡️ Estabilidad del core en giros bruscos',
    techniqueTip: 'Extiende los brazos al frente resoplando y mantén los hombros alineados con las caderas.'
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
    injuryPreventionTag: '⚡ Potencia de arranque inicial (0-10m)',
    techniqueTip: 'Inclinación del tronco a 45° en la salida y zancada potente de máxima tracción.'
  },
  {
    id: 'dr-s2',
    name: 'Sprints de 20m con Frenado Progresivo',
    targetSets: 4,
    defaultReps: 1,
    defaultWeightKg: 0,
    restSeconds: 75,
    targetMuscles: ['Cuádriceps Excéntrico', 'Aductores'],
    injuryPreventionTag: '🛡️ Tolerancia excéntrica al frenado repentino',
    techniqueTip: 'Tras pasar los 20m, decelera en 3 pasos cortos bajando el centro de gravedad.'
  },
  {
    id: 'dr-s3',
    name: 'Circuito Z: Cambios de Dirección 45°',
    targetSets: 4,
    defaultReps: 2,
    defaultWeightKg: 0,
    restSeconds: 90,
    targetMuscles: ['Tobillos', 'Aductores', 'Core'],
    injuryPreventionTag: '🛡️ Agilidad táctica & reacción en banda',
    techniqueTip: 'Apoyo del pie externo fuerte para hincar en el césped y salir catapultada al siguiente cono.'
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
    injuryPreventionTag: '⚽ Automatización de precisión de pase',
    techniqueTip: 'Tensión constante en el tobillo. Cambia de pie sin detener la pelota.'
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
    techniqueTip: 'Primer contacto hacia el espacio libre y segundo contacto para entregar el pase.'
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
    techniqueTip: 'Usa toques cortos y rápidos manteniendo la mirada al frente.'
  }
];

export const TRAINING_PRESETS: TrainingPreset[] = [
  {
    id: 'preset-gym',
    title: 'Plan Gym Fuerza & Potencia Fútbol',
    description: 'Enfocado en masa muscular funcional, sentadillas, saltos pliométricos y prevención de lesiones de rodilla.',
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
    description: 'Sin necesidad de pesas. Diseñado para espacios reducidos: pared, balón y conos.',
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
