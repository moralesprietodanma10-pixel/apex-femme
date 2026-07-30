import { PlayerProfile, ScheduleDay, MatchLog, ChatMessage, Challenge, Badge, FemaleMentor } from '../types';

export const POSITIONS_LIST = [
  "Volante de Contención / MC",
  "Volante Mixta / Mediocentro",
  "Mediocentro Ofensivo / MCO",
  "Extrema Izquierda / LW",
  "Extrema Derecha / RW",
  "Delantera Centro / ST",
  "Segunda Punta / SS",
  "Carrilera Izquierda / LWB",
  "Carrilera Derecha / RWB",
  "Lateral Izquierda / LB",
  "Lateral Derecha / RB",
  "Defensa Central / CB",
  "Líbero / SW",
  "Portera / GK"
];

export const COUNTRIES_LIST = [
  { code: "ESP", name: "España", flag: "🇪🇸" },
  { code: "COL", name: "Colombia", flag: "🇨🇴" },
  { code: "MEX", name: "México", flag: "🇲🇽" },
  { code: "ARG", name: "Argentina", flag: "🇦🇷" },
  { code: "BRA", name: "Brasil", flag: "🇧🇷" },
  { code: "USA", name: "Estados Unidos", flag: "🇺🇸" },
  { code: "FRA", name: "Francia", flag: "🇫🇷" },
  { code: "GER", name: "Alemania", flag: "🇩🇪" },
  { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿" },
  { code: "AUS", name: "Australia", flag: "🇦🇺" },
  { code: "CHI", name: "Chile", flag: "🇨🇱" },
  { code: "URU", name: "Uruguay", flag: "🇺🇾" }
];

export const FEMALE_MENTORS: FemaleMentor[] = [
  // Mediocampo
  {
    id: "mentor-1",
    name: "Aitana Bonmatí",
    country: "España",
    flag: "🇪🇸",
    club: "FC Barcelona",
    position: "Mediocentro / MC",
    OVR: 91,
    photoUrl: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=800",
    quote: "El talento sin trabajo y lecturas tácticas continuas no se sostiene. Anticipa el pase antes de recibir.",
    specialty: "Control de Ritmo, Visión de Juego y Pases Filtrados",
    highlights: ["Balón de Oro 2023 & 2024", "Campeona del Mundo", "MVP Champions League"],
    height: "1.62 m",
    weight: "51 kg",
    preferredFoot: "Derecha"
  },
  {
    id: "mentor-2",
    name: "Alexia Putellas",
    country: "España",
    flag: "🇪🇸",
    club: "FC Barcelona",
    position: "Mediocentro Ofensivo / MCO",
    OVR: 91,
    photoUrl: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&q=80&w=800",
    quote: "Un verdadero líder no se define en la victoria, sino en la resiliencia y el compromiso diario en cada entrenamiento.",
    specialty: "Liderazgo, Llegada a Gol y Control bajo Presión",
    highlights: ["2x Balón de Oro", "Capitana de Élite", "Visión Táctica"],
    height: "1.73 m",
    weight: "67 kg",
    preferredFoot: "Izquierda"
  },
  {
    id: "mentor-4",
    name: "Keira Walsh",
    country: "Inglaterra",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    club: "Chelsea FC / Lionesses",
    position: "Volante de Contención / MC",
    OVR: 88,
    photoUrl: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&q=80&w=800",
    quote: "La contención no es solo correr; es posicionamiento inteligente para hacer que parezca fácil.",
    specialty: "Intercepción Táctica, Cobertura y Salida Limpia",
    highlights: ["Campeona de Eurocopa", "Especialista en Salida de Balón"],
    height: "1.67 m",
    weight: "62 kg",
    preferredFoot: "Derecha"
  },

  // Defensas
  {
    id: "mentor-renard",
    name: "Wendie Renard",
    country: "Francia",
    flag: "🇫🇷",
    club: "Olympique Lyonnais",
    position: "Defensa Central / CB",
    OVR: 90,
    photoUrl: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&q=80&w=800",
    quote: "Domina el área por arriba y transmite solidez indestructible a tu zaga. Tu anticipación define el partido.",
    specialty: "Juego Aéreo Implacable, Coberturas y Liderazgo Defensivo",
    highlights: ["8x Champions League Femenina", "Capitana de Francia", "Leyenda Mundial CB"],
    height: "1.87 m",
    weight: "70 kg",
    preferredFoot: "Derecha"
  },
  {
    id: "mentor-mapi",
    name: "Mapi León",
    country: "España",
    flag: "🇪🇸",
    club: "FC Barcelona",
    position: "Defensa Central / CB",
    OVR: 89,
    photoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
    quote: "Una defensa moderna inicia el ataque con pases diagonales quirúrgicos y contundencia en el 1vs1.",
    specialty: "Salida con Zurdaza, Despejes Tácticos y Desmarques",
    highlights: ["3x UEFA Women's Champions League", "Mejor Central zurda de Europa"],
    height: "1.69 m",
    weight: "61 kg",
    preferredFoot: "Izquierda"
  },
  {
    id: "mentor-bronze",
    name: "Lucy Bronze",
    country: "Inglaterra",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    club: "Chelsea FC",
    position: "Lateral Derecha / RB",
    OVR: 88,
    photoUrl: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80&w=800",
    quote: "Ida y vuelta constante sin perder aire. Ataca el carril lateral con potencia y defiende con garra.",
    specialty: "Despliegue Físico, Centros al Área y Duelos 1vs1",
    highlights: ["Jugadora del Año UEFA", "4x Champions League", "Campeona Eurocopa"],
    height: "1.72 m",
    weight: "65 kg",
    preferredFoot: "Derecha"
  },

  // Porteras
  {
    id: "mentor-endler",
    name: "Christiane Endler",
    country: "Chile",
    flag: "🇨🇱",
    club: "Olympique Lyonnais",
    position: "Portera / GK",
    OVR: 89,
    photoUrl: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&q=80&w=800",
    quote: "La portería exige serenidad absoluta. Organiza tu defensa a gritos claros y transmite seguridad en cada balón aéreo.",
    specialty: "Reflejos Felinos, Salidas en Córners y Liderazgo de Área",
    highlights: ["The Best FIFA Goalkeeper", "Campeona de Champions League", "Capitana de Chile"],
    height: "1.82 m",
    weight: "73 kg",
    preferredFoot: "Derecha"
  },
  {
    id: "mentor-earps",
    name: "Mary Earps",
    country: "Inglaterra",
    flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    club: "Paris Saint-Germain",
    position: "Portera / GK",
    OVR: 88,
    photoUrl: "https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=800",
    quote: "En los penaltis y manos a manos, aguantar un segundo más que la delantera marca la diferencia entre el gol y la parada.",
    specialty: "Paradas de Penaltis, Agilidad Bajo Palos y Saque Largo",
    highlights: ["2x FIFA The Best Goalkeeper", "Guante de Oro Mundial 2023"],
    height: "1.73 m",
    weight: "68 kg",
    preferredFoot: "Derecha"
  },

  // Delanteras
  {
    id: "mentor-3",
    name: "Linda Caicedo",
    country: "Colombia",
    flag: "🇨🇴",
    club: "Real Madrid Femenino",
    position: "Extrema Izquierda / LW",
    OVR: 87,
    photoUrl: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&q=80&w=800",
    quote: "Encara sin miedo. Confía en tu aceleración y en tu habilidad para cambiar el rumbo del partido en un segundo.",
    specialty: "Regate Explosivo, Cambio de Ritmo y Definición",
    highlights: ["Mejor Gol del Mundial 2023", "Golden Girl", "Referente Sudamericana"],
    height: "1.61 m",
    weight: "53 kg",
    preferredFoot: "Derecha"
  },
  {
    id: "mentor-5",
    name: "Sam Kerr",
    country: "Australia",
    flag: "🇦🇺",
    club: "Chelsea FC",
    position: "Delantera Centro / ST",
    OVR: 90,
    photoUrl: "https://images.unsplash.com/photo-1526232761682-d26e03ac148e?auto=format&fit=crop&q=80&w=800",
    quote: "Ataca el área con convicción. Un desmarque a tiempo vale más que diez metros de carrera.",
    specialty: "Remate de Cabeza, Desmarque y Potencia",
    highlights: ["Bota de Oro en 3 Continentes", "Capitana de Australia"],
    height: "1.67 m",
    weight: "63 kg",
    preferredFoot: "Derecha"
  },
  {
    id: "mentor-6",
    name: "Marta Vieira da Silva",
    country: "Brasil",
    flag: "🇧🇷",
    club: "Orlando Pride / Brasil",
    position: "Segunda Punta / SS",
    OVR: 89,
    photoUrl: "https://images.unsplash.com/photo-1518604666860-9ed391f76460?auto=format&fit=crop&q=80&w=800",
    quote: "Juega con alegría pero mantén la disciplina. El fútbol femenino es pasión y superación constante.",
    specialty: "Magia en Regate, Creatividad y Tiro Lejano",
    highlights: ["6x FIFA World Player", "Máxima Goleadora de Mundiales"],
    height: "1.62 m",
    weight: "56 kg",
    preferredFoot: "Izquierda"
  }
];

export const INITIAL_PLAYER_PROFILE: PlayerProfile = {
  name: "Sara",
  email: "moralesprietodanna7@gmail.com",
  position: "Volante de Contención / MC",
  level: 14,
  OVR: 84,
  xp: 3450,
  xpToNextLevel: 4300,
  attributes: {
    rhythm: 82,    // RIT
    passing: 88,   // PAS
    vision: 86,    // VIS
    physical: 79,  // FIS
    recovery: 84,  // REC
    shooting: 75   // DIS
  },
  streakDays: 4,
  monthlyMinutes: 280,
  avgRating: 8.5,
  preferredFoot: "Derecha",
  jerseyNumber: "#10",
  country: "ESP",
  avatarUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAtvIXAjtIpDpVRI_SwpRqxx5CYJDOZjhdCBPslyTNnL8CFhcc64H0HeYuW3zLR6tlzZiXu-MmfPVfpVbyqtWDhqq4-lWF3RY-EpwHls2Dni1BAL26iiLnwempWaF7jVEMaPtOeAk3EXeRFTjoFHLciqpHH7ube6ZYD6Q37-pPRN45-PW8DVqi7fxdB-7HoGJCCnmTWxjQc_a1h1vMT0JPb-FD__C3i91dQB5K_umSRVxsWclK3Ns0rGQ",
  playerCardPhotoUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpUdoJ5pbwgzwCP2CzNtc2n4PZ3Be1w_E_iPlfdlmg-keoe4F2MHnr7fU2CVpdr908cxi6i2VhpVWioVceqWuG1eR6ui3ZIRaUmHJgxpqTeeMzjuKnCBQGzs2ktpV35ExCTnHEWn6HVWQ2GXO7K4xaZ8Ris0kGJIBoYdd71va7_JvZaBXRyayov1lEPzxXHHU7YCI8QclTw6u-Kzif3U06mgM7-fOV1ZBCtsSqjcCMX8GfY_X1PdMyRg",
  themeColor: 'flash',
  themeMode: 'dark',
  mentorId: 'mentor-1',
  // V12 — Weekly trends for contextual data display in Dashboard
  weeklyTrends: {
    minutes: {
      current: 280,
      previousWeek: 245,
      monthlyAvg: 260,
      unit: 'min',
      label: 'Volumen Mensual',
      goalValue: 320
    },
    rating: {
      current: 8.5,
      previousWeek: 7.8,
      monthlyAvg: 8.1,
      unit: '/10',
      label: 'Rating Promedio'
    },
    distance: {
      current: 7.8,
      previousWeek: 6.9,
      monthlyAvg: 7.2,
      unit: 'km',
      label: 'Distancia por Partido',
      goalValue: 8.5
    },
    recoveries: {
      current: 28,
      previousWeek: 22,
      monthlyAvg: 24,
      unit: 'recuperaciones',
      label: 'Recuperaciones/Mes'
    }
  }
};

export const INITIAL_WEEKLY_SCHEDULE: ScheduleDay[] = [
  {
    id: "lun-1",
    dayShort: "LUN",
    dayFull: "Lunes",
    activityType: "gimnasio",
    title: "Fuerza Tren Inferior & Potencia",
    durationMin: 60,
    status: "completed",
    intensity: "alta",
    icon: "Dumbbell",
    scheduledTime: "08:30",
    location: "gym",
    focusArea: "fuerza",
    notes: "Sentadillas profundas, saltos pliométricos y prensa."
  },
  {
    id: "mar-2",
    dayShort: "MAR",
    dayFull: "Martes",
    activityType: "entrenamiento",
    title: "Táctica, Sprints & Agilidad",
    durationMin: 90,
    status: "completed",
    intensity: "alta",
    icon: "Activity",
    scheduledTime: "17:00",
    location: "campo",
    focusArea: "sprints",
    notes: "Sprints repetidos de 10m-30m y aceleración."
  },
  {
    id: "mie-3",
    dayShort: "MIE",
    dayFull: "Miércoles",
    activityType: "entrenamiento",
    title: "Técnica Individual & Control de Balón",
    durationMin: 75,
    status: "today",
    intensity: "moderada",
    icon: "Footprints",
    scheduledTime: "18:00",
    location: "casa",
    focusArea: "tecnica",
    notes: "Toques a la pared, control orientado y perfilamiento."
  },
  {
    id: "jue-4",
    dayShort: "JUE",
    dayFull: "Jueves",
    activityType: "recuperacion",
    title: "Recuperación Activa & Movilidad",
    durationMin: 30,
    status: "pending",
    intensity: "baja",
    icon: "HeartPulse",
    scheduledTime: "19:30",
    location: "casa",
    focusArea: "recuperacion",
    notes: "Foam roller, estiramientos de cadera y movilidad 90/90."
  },
  {
    id: "vie-5",
    dayShort: "VIE",
    dayFull: "Viernes",
    activityType: "descanso",
    title: "Descanso Táctico / Estrategia",
    durationMin: 0,
    status: "pending",
    intensity: "baja",
    icon: "Moon",
    scheduledTime: "12:00",
    location: "casa",
    focusArea: "tactica",
    notes: "Visualización de jugadas del equipo rival."
  },
  {
    id: "sab-6",
    dayShort: "SAB",
    dayFull: "Sábado",
    activityType: "partido",
    title: "PARTIDO OFICIAL vs Valencia FF",
    durationMin: 90,
    status: "pending",
    intensity: "alta",
    icon: "Trophy",
    scheduledTime: "16:00",
    location: "campo",
    focusArea: "partido",
    notes: "Concentración 2 horas antes en vestuario."
  },
  {
    id: "dom-7",
    dayShort: "DOM",
    dayFull: "Domingo",
    activityType: "descanso",
    title: "Descanso Total e Hidratación",
    durationMin: 0,
    status: "pending",
    intensity: "baja",
    icon: "Bed",
    scheduledTime: "10:00",
    location: "casa",
    focusArea: "recuperacion",
    notes: "Reposo y preparación para el siguiente microciclo."
  }
];

export const INITIAL_MATCH_LOGS: MatchLog[] = [
  {
    id: "match-1",
    date: "2026-07-20",
    opponent: "Valencia FF",
    type: "PARTIDO",
    result: "Victoria 3-1",
    goals: 1,
    assists: 2,
    keyPasses: 5,
    recoveries: 8,
    minutesPlayed: 89,
    rpe: 8,
    rating: 9.0,
    tacticalNotes: "Excelente control del mediocampo. 2 asistencias entre líneas y recuperación constante.",
    verified: true
  },
  {
    id: "match-2",
    date: "2026-07-13",
    opponent: "Sevilla FC",
    type: "PARTIDO",
    result: "Empate 0-0",
    goals: 0,
    assists: 0,
    keyPasses: 3,
    recoveries: 11,
    minutesPlayed: 90,
    rpe: 7,
    rating: 7.8,
    tacticalNotes: "Bloque bajo efectivo. 4 intercepciones clave en el último tercio.",
    verified: true
  },
  {
    id: "match-3",
    date: "2026-07-06",
    opponent: "Real Madrid Femenino",
    type: "PARTIDO",
    result: "Victoria 2-1",
    goals: 0,
    assists: 1,
    keyPasses: 4,
    recoveries: 9,
    minutesPlayed: 85,
    rpe: 9,
    rating: 8.7,
    tacticalNotes: "Gran despliegue físico contra mediocampo de alta presión.",
    verified: true
  }
];

export const INITIAL_CHAT_HISTORY: ChatMessage[] = [
  {
    id: "msg-1",
    sender: "ai",
    text: "¡Hola Sara! Analizando tu último partido y tus 4 entrenamientos de esta semana. Tu nivel de fatiga es **moderado (RPE 6/10)**. Como Volante de Contención, mantienes un índice de recuperación del 84%. ¿En qué te puedo ayudar hoy?",
    timestamp: "09:00 AM"
  }
];

export const INITIAL_CHALLENGES: Challenge[] = [
  // DIARIOS (Easy -> Hard)
  {
    id: "chal-daily-1",
    title: "Activación Matutina",
    description: "Completa una rutina de movilidad o estiramientos de 15 min",
    rewardXp: 80,
    progress: 1,
    maxProgress: 1,
    completed: true,
    claimed: false,
    timeframe: "diario",
    difficulty: "facil",
    focusArea: "fisico",
    badgeId: "badge-4",
    icon: "Dumbbell"
  },
  {
    id: "chal-daily-2",
    title: "Lectura Táctica Diaria",
    description: "Consulta 1 consejo o análisis táctico con la IA o tu Referente",
    rewardXp: 100,
    progress: 1,
    maxProgress: 1,
    completed: true,
    claimed: false,
    timeframe: "diario",
    difficulty: "facil",
    focusArea: "tactica",
    badgeId: "badge-2",
    icon: "Eye"
  },
  {
    id: "chal-daily-3",
    title: "Enfoque de 100 Pases",
    description: "Realiza 100 toques a la pared o pases de precisión en tu entrenamiento diario",
    rewardXp: 150,
    progress: 60,
    maxProgress: 100,
    completed: false,
    claimed: false,
    timeframe: "diario",
    difficulty: "medio",
    focusArea: "tecnico",
    icon: "Footprints"
  },

  // SEMANALES
  {
    id: "chal-1",
    title: "Constancia de Hierro",
    description: "Completa 4 sesiones de entrenamiento semanales registradas",
    rewardXp: 300,
    progress: 4,
    maxProgress: 4,
    completed: true,
    claimed: false,
    timeframe: "semanal",
    difficulty: "medio",
    focusArea: "fisico",
    badgeId: "badge-1",
    icon: "Dumbbell"
  },
  {
    id: "chal-2",
    title: "Análisis de Video & Táctica",
    description: "Sube o analiza 2 clips de jugadas con el Chatbot IA",
    rewardXp: 250,
    progress: 1,
    maxProgress: 2,
    completed: false,
    claimed: false,
    timeframe: "semanal",
    difficulty: "dificil",
    focusArea: "tactica",
    badgeId: "badge-2",
    icon: "Eye"
  },
  {
    id: "chal-3",
    title: "Planificación Perfecta",
    description: "Sigue y confirma tu calendario por 7 días seguidos",
    rewardXp: 350,
    progress: 5,
    maxProgress: 7,
    completed: false,
    claimed: false,
    timeframe: "semanal",
    difficulty: "medio",
    focusArea: "mental",
    badgeId: "badge-3",
    icon: "CalendarCheck"
  },

  // MENSUALES
  {
    id: "chal-monthly-1",
    title: "Motor del Mediocampo",
    description: "Acumula más de 300 minutos jugados en partidos oficiales del mes",
    rewardXp: 600,
    progress: 280,
    maxProgress: 300,
    completed: false,
    claimed: false,
    timeframe: "mensual",
    difficulty: "dificil",
    focusArea: "fisico",
    badgeId: "badge-3",
    icon: "Shield"
  },
  {
    id: "chal-4",
    title: "Especialista en Recobro",
    description: "Supera 25 recuperaciones totales de balón en los partidos del mes",
    rewardXp: 500,
    progress: 28,
    maxProgress: 25,
    completed: true,
    claimed: false,
    timeframe: "mensual",
    difficulty: "medio",
    focusArea: "tactica",
    badgeId: "badge-4",
    icon: "Shield"
  },

  // ANUALES (Élite / Leyenda)
  {
    id: "chal-annual-1",
    title: "Temporada Dorado MVP",
    description: "Alcanza una calificación promedio superior a 8.0 en al menos 20 partidos",
    rewardXp: 2000,
    progress: 3,
    maxProgress: 20,
    completed: false,
    claimed: false,
    timeframe: "anual",
    difficulty: "elite",
    focusArea: "mental",
    badgeId: "badge-5",
    icon: "Award"
  },
  {
    id: "chal-annual-2",
    title: "Ascenso a Carta de Élite (OVR 85+)",
    description: "Lleva tu nivel a Nivel 20 y tu OVR a más de 85 mediante constancia",
    rewardXp: 2500,
    progress: 84,
    maxProgress: 85,
    completed: false,
    claimed: false,
    timeframe: "anual",
    difficulty: "elite",
    focusArea: "tecnico",
    badgeId: "badge-6",
    icon: "Zap"
  }
];

export const INITIAL_BADGES: Badge[] = [
  {
    id: "badge-1",
    title: "Motor del Equipo",
    icon: "Users",
    color: "hulk",
    description: "Concedido por mantener ritmo constante y liderazgo en el mediocampo.",
    unlocked: true
  },
  {
    id: "badge-2",
    title: "Especialista Pases",
    icon: "GitCommit",
    color: "hawkeye",
    description: "Precisión de pase superior al 88% durante 3 partidos consecutivos.",
    unlocked: true
  },
  {
    id: "badge-3",
    title: "Recuperación de Oro",
    icon: "ShieldCheck",
    color: "flash",
    description: "Más de 25 recuperaciones de balón en un solo mes.",
    unlocked: true
  },
  {
    id: "badge-4",
    title: "Maestra de la Presión",
    icon: "Zap",
    color: "avengers",
    description: "Desbloqueado tras completar 5 entrenamientos de alta intensidad.",
    unlocked: false
  },
  {
    id: "badge-5",
    title: "Visión Playmaker",
    icon: "Sparkles",
    color: "flash",
    description: "Alcanza nivel 15 y acumula más de 10 asistencias de gol.",
    unlocked: false
  },
  {
    id: "badge-6",
    title: "Invicta en Duetos",
    icon: "Award",
    color: "widow",
    description: "Logra 5 victorias consecutivas como titular.",
    unlocked: false
  }
];
