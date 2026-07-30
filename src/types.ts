export interface PlayerAttributes {
  rhythm: number;    // RIT (Ritmo)
  passing: number;   // PAS (Pase)
  vision: number;    // VIS (Visión)
  physical: number;  // FIS (Físico)
  recovery: number;  // REC (Recuperación)
  shooting: number;  // DIS (Disparo)
}

/**
 * WeeklyTrend — used to contextualize any metric with week-over-week data.
 * Implements V12 directive: "No numbers in isolation — every datum answers a question."
 */
export interface WeeklyTrend {
  current: number;
  previousWeek: number;
  monthlyAvg: number;
  unit: string;           // e.g. 'min', 'km', '/10', '%'
  label: string;          // Short readable label, e.g. "Volumen semanal"
  goalValue?: number;     // Optional weekly/monthly goal
}

/** Computed readiness context derived from HRV + sleep + RPE history */
export interface ReadinessContext {
  score: number;          // 0–100
  label: string;          // e.g. 'Óptimo', 'Moderado', 'Necesitas Descanso'
  color: 'green' | 'yellow' | 'red';
  recommendation: string; // Science-backed single-line action
  evidenceLevel: 'Alta' | 'Moderada' | 'Limitada';
}

export type ThemeColor = 'flash' | 'avengers' | 'widow' | 'hulk' | 'hawkeye';
export type ThemeMode = 'dark' | 'light';

export interface SmartwatchData {
  connected: boolean;
  deviceName: string;
  batteryLevel: number;
  heartRateBpm: number;
  hrvMs: number;
  stepsToday: number;
  caloriesBurned: number;
  distanceKm: number;
  avgPaceMinKm: string;
  stressScore: number;
  sleepRecoveryScore: number;
  heartRateZone: 'Reposo' | 'Quema Grasa' | 'Aeróbico' | 'Anaeróbico' | 'Pico VO2 Max';
  lastSyncTime: string;
}

export type AiTone = 'gemini' | 'demanding' | 'scientific' | 'tactical';

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  messages: ChatMessage[];
}

export interface PlayerProfile {
  name: string;
  email?: string;
  position: string;
  level: number;
  OVR: number;
  xp: number;
  xpToNextLevel: number;
  attributes: PlayerAttributes;
  streakDays: number;
  monthlyMinutes: number;
  avgRating: number;
  preferredFoot: string;
  jerseyNumber: string;
  country: string;
  avatarUrl: string;
  playerCardPhotoUrl: string;
  themeColor: ThemeColor;
  themeMode?: ThemeMode;
  aiTone?: AiTone;
  mentorId?: string;
  club?: string;
  // V12: Weekly performance trends for contextual data display
  weeklyTrends?: {
    minutes: WeeklyTrend;
    rating: WeeklyTrend;
    distance: WeeklyTrend;
    recoveries: WeeklyTrend;
  };
}

export interface FemaleMentor {
  id: string;
  name: string;
  country: string;
  flag: string;
  club: string;
  position: string;
  OVR: number;
  photoUrl: string;
  quote: string;
  specialty: string;
  highlights: string[];
  height?: string;      // Altura, e.g. "1.70 m"
  weight?: string;      // Peso, e.g. "62 kg"
  preferredFoot?: string; // Pierna hábil
  isCustom?: boolean;
}

export type ActivityType = 'gimnasio' | 'entrenamiento' | 'descanso' | 'partido' | 'recuperacion';
export type TrainingLocation = 'gym' | 'casa' | 'campo' | 'pista' | 'otro';
export type TrainingFocus = 'fuerza' | 'tecnica' | 'sprints' | 'recuperacion' | 'tactica' | 'resistencia' | 'partido';

export interface WorkoutSetDetail {
  setNumber: number;
  targetReps: number;
  weightKg?: number;
  completed: boolean;
  restSeconds?: number;
}

export interface ExerciseDetail {
  id: string;
  name: string;
  targetSets: number;
  defaultReps: number;
  defaultWeightKg?: number;
  restSeconds: number;
  targetMuscles: string[];
  injuryPreventionTag?: string;
  techniqueTip?: string;
  sets?: WorkoutSetDetail[];
  /** V12 Master Sports Science Audit fields */
  evidenceLevel?: 'Alta' | 'Moderada' | 'Limitada';
  citation?: string;
  pitchTransfer?: string;
}

export interface ScheduleDay {
  id: string;
  dayShort: string; // LUN, MAR, MIE, JUE, VIE, SAB, DOM
  dayFull: string;  // Lunes, Martes...
  activityType: ActivityType;
  title: string;
  durationMin: number;
  status: 'completed' | 'pending' | 'today';
  intensity: 'baja' | 'moderada' | 'alta';
  icon: string;
  scheduledTime?: string; // e.g. "08:00", "17:30", "19:00"
  location?: TrainingLocation;
  focusArea?: TrainingFocus;
  notes?: string;
  exercises?: string[];   // Lista de ejercicios específicos
  exerciseDetails?: ExerciseDetail[];
  totalTonnageKg?: number;
  isImported?: boolean;
}

export interface TrainingPlanPreset {
  id: string;
  name: string;
  description: string;
  location: TrainingLocation;
  focusArea: TrainingFocus;
  categoryTag: string; // e.g. "Gimnasio & Fuerza", "Técnica en Casa", "Sprints de Reacción"
  icon: string;
  days: {
    dayShort: string; // LUN, MAR, etc.
    title: string;
    durationMin: number;
    intensity: 'baja' | 'moderada' | 'alta';
    scheduledTime: string;
    location: TrainingLocation;
    focusArea: TrainingFocus;
    exercises: string[];
    notes?: string;
  }[];
}

export interface MatchLog {
  id: string;
  date: string;
  opponent: string;
  type: 'PARTIDO' | 'ENTRENAMIENTO';
  result: string;
  goals: number;
  assists: number;
  keyPasses: number;
  recoveries: number;
  minutesPlayed: number;
  rpe: number; // 1 to 10
  rating: number; // 1.0 to 10.0
  tacticalNotes: string;
  verified: boolean;
}

export interface VideoAnalysis {
  id: string;
  title: string;
  date: string;
  videoUrl?: string;
  status?: 'processing' | 'completed';
  tacticalScore: number;
  matchTime?: string;
  tacticalVerdict?: string;
  strengths: string[];
  areasToImprove: string[];
  recommendedDrills: string[];
  aiFeedback: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  isRecalculatedPlan?: boolean;
  videoUrl?: string;
  videoName?: string;
  videoAnalysis?: VideoAnalysis;
  proposedSchedule?: ScheduleDay[];
  /** V12: AI confidence metadata — only on AI messages */
  confidence?: AIConfidenceEngine;
}

export type ChallengeTimeframe = 'diario' | 'semanal' | 'mensual' | 'anual';
export type ChallengeDifficulty = 'facil' | 'medio' | 'dificil' | 'elite';
export type ChallengeFocus = 'tactica' | 'fisico' | 'tecnico' | 'mental';

export interface Challenge {
  id: string;
  title: string;
  description: string;
  rewardXp: number;
  progress: number;
  maxProgress: number;
  completed: boolean;
  claimed: boolean;
  timeframe: ChallengeTimeframe;
  difficulty: ChallengeDifficulty;
  focusArea: ChallengeFocus;
  badgeId?: string;
  icon: string;
}

export interface Badge {
  id: string;
  title: string;
  icon: string;
  color: 'flash' | 'avengers' | 'widow' | 'hulk' | 'hawkeye';
  description: string;
  unlocked: boolean;
}

export interface PersonalRecord {
  id: string;
  exerciseName: string;
  weightKg: number;
  reps: number;
  date: string;
}

export interface RpeCalculatorResult {
  rpeScore: number; // 1 - 10
  label: string;
  description: string;
  recommendedRestMin: string;
  trainingLoad: number; // RPE * minutes
}

export type ActiveTab = 'dashboard' | 'gym' | 'coach' | 'tracker' | 'card' | 'gamification' | 'mentors' | 'settings';

/**
 * AIConfidenceEngine — V12 AI Audit
 * Every AI recommendation must expose its reasoning, data basis and confidence.
 * This is the key differentiator: transparent AI, never a black box.
 */
export interface AIConfidenceEngine {
  /** 0–100 confidence score based on available data points */
  confidence: number;
  /** Human-readable explanation of what data was used */
  dataUsed: string;
  /** Scientific evidence level */
  evidenceLevel: 'Alta' | 'Moderada' | 'Limitada' | 'Sin datos suficientes';
  /** When confidence is low, explain why */
  limitationNote?: string;
}

/**
 * ProactiveAlert — V12 AI Audit
 * The AI coach doesn't wait to be asked. It detects patterns and surfaces insights.
 */
export interface ProactiveAlert {
  id: string;
  type: 'overload' | 'recovery' | 'improvement' | 'stagnation' | 'streak' | 'injury_risk' | 'positive';
  title: string;
  message: string;
  action?: string;   // CTA label
  actionQuery?: string;  // What to send to AI when user taps action
  priority: 'high' | 'medium' | 'low';
  icon: string;
}


