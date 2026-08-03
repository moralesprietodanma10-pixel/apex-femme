import React, { useState, useEffect } from 'react';
import { PlayerProfile, ScheduleDay, ExerciseDetail, WorkoutSection, SessionObjective, PersonalRecord } from '../types';
import {
  Dumbbell, Play, Plus, Trash2, Check, ChevronDown, ChevronUp,
  ShieldCheck, Trophy, Activity, Zap, Flame, Clock, Sparkles,
  BarChart3, RefreshCw, Layers, CheckCircle2, ChevronRight,
  Info, AlertTriangle, ArrowRight, Filter, Search, SlidersHorizontal,
  Bookmark, Target, History, Settings, Cpu, Compass, HeartPulse,
  Edit3, Calendar, Save, X, RotateCcw, Star, Repeat, ArrowUpRight,
  Minus, CheckCircle
} from 'lucide-react';
import { InteractiveWorkoutModal } from './InteractiveWorkoutModal';
import { sounds } from '../services/soundEffects';
import {
  DEFAULT_MY_GYM_EQUIPMENT,
  DEFAULT_ATHLETE_PREFERENCES,
  ATHLETE_STRENGTH_PROFILE,
  PERFORMANCE_REPORT_4WEEK,
  TIMELINE_EVENTS,
  EXERCISE_DATABASE_300,
  evaluateWorkoutQuality,
  simulateSession,
  compressSessionForTime,
  getExerciseAlternatives
} from '../data/gymV18IntelligenceData';

interface GymHubViewProps {
  playerProfile: PlayerProfile;
  onUpdateProfile: (data: Partial<PlayerProfile>) => void;
}

const getRealTodayShort = () => {
  const DAY_MAP_ES = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
  return DAY_MAP_ES[new Date().getDay()];
};

// Compact Category Configuration
const CATEGORY_GRID = [
  { id: 'Fuerza', label: 'Fuerza', icon: '💪', color: 'border-amber-400/60 text-amber-400 bg-amber-500/10' },
  { id: 'Potencia', label: 'Potencia', icon: '⚡', color: 'border-orange-400/60 text-orange-400 bg-orange-500/10' },
  { id: 'Pliometría', label: 'Pliometría', icon: '🦘', color: 'border-yellow-400/60 text-yellow-400 bg-yellow-500/10' },
  { id: 'Caminadora / Sprints', label: 'Carreras', icon: '🏃', color: 'border-cyan-400/60 text-cyan-400 bg-cyan-500/10' },
  { id: 'Intervalos HIIT', label: 'Conditioning', icon: '🔥', color: 'border-red-400/60 text-red-400 bg-red-500/10' },
  { id: 'Core Anti-Rotación', label: 'Core', icon: '🧠', color: 'border-purple-400/60 text-purple-400 bg-purple-500/10' },
  { id: 'Prevención LCA', label: 'Prevención LCA', icon: '🦵', color: 'border-emerald-400/60 text-emerald-400 bg-emerald-500/10' },
  { id: 'Movilidad', label: 'Movilidad', icon: '🧘', color: 'border-blue-400/60 text-blue-400 bg-blue-500/10' },
  { id: 'Recuperación', label: 'Recuperación', icon: '❤️', color: 'border-teal-400/60 text-teal-400 bg-teal-500/10' },
];

// One-tap training presets
const QUICK_TRAINING_PRESETS = [
  { label: '5×5 Fuerza', sets: 5, reps: 5, w: 85, r: 120 },
  { label: '4×4 Potencia', sets: 4, reps: 4, w: 75, r: 120 },
  { label: '3×10 Hipertrofia', sets: 3, reps: 10, w: 70, r: 90 },
  { label: '4×3 Explosivo', sets: 4, reps: 3, w: 60, r: 120 },
  { label: '2×20 Resistencia', sets: 2, reps: 20, w: 30, r: 45 },
  { label: '2×15 Recuperación', sets: 2, reps: 15, w: 0, r: 30 },
  { label: '2×12 Movilidad', sets: 2, reps: 12, w: 0, r: 30 },
];

// Football transfers
const FOOTBALL_TRANSFERS = [
  'Aceleración 0-10m', 'Sprint Máximo', 'Salto Pliométrico',
  'Prevención LCA', 'Equilibrio Unipodal', 'Primer Paso Explosivo', 'Cambio de Dirección'
];

export const GymHubView: React.FC<GymHubViewProps> = ({ playerProfile, onUpdateProfile }) => {
  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'history' | 'gym' | 'library'>('today');

  // Real-time synced day
  const [realTodayShort, setRealTodayShort] = useState<string>(() => getRealTodayShort());

  // Active Selected Day in Weekly Planner
  const [selectedDayShort, setSelectedDayShort] = useState<string>(() => getRealTodayShort());

  useEffect(() => {
    const updateDaySync = () => {
      const todayShort = getRealTodayShort();
      setRealTodayShort(todayShort);
    };
    updateDaySync();
    const interval = setInterval(updateDaySync, 30000);
    return () => clearInterval(interval);
  }, []);

  // Active Interactive Workout Modal state
  const [workoutDay, setWorkoutDay] = useState<ScheduleDay | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  // Transparent AI "Why?" Drawer State
  const [whyDrawer, setWhyDrawer] = useState<{ title: string; reasoning: string; dataPoints: string[] } | null>(null);

  // My Gym Equipment State
  const [equipmentList, setEquipmentList] = useState(DEFAULT_MY_GYM_EQUIPMENT);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('todos');

  // Quick Session Compression (<35 min)
  const [isCompressed, setIsCompressed] = useState(false);

  // ═════════════════════════════════════════════════════════════
  // EXERCISE CREATION MODAL V3 STATE
  // ═════════════════════════════════════════════════════════════
  const [showCustomExModal, setShowCustomExModal] = useState(false);
  const [targetSectionIdForCustomEx, setTargetSectionIdForCustomEx] = useState<string | null>(null);
  
  const [customExName, setCustomExName] = useState('');
  const [customExCategory, setCustomExCategory] = useState<string>('Fuerza');
  const [customExSets, setCustomExSets] = useState<number>(3);
  const [customExReps, setCustomExReps] = useState<number>(10);
  const [customExWeight, setCustomExWeight] = useState<number>(80);
  const [customExRest, setCustomExRest] = useState<number>(90);
  const [customExTip, setCustomExTip] = useState('');
  
  // Advanced & Interactive states
  const [isFavoriteEx, setIsFavoriteEx] = useState(false);
  const [customExTempo, setCustomExTempo] = useState('');
  const [customExTransfer, setCustomExTransfer] = useState('Aceleración 0-10m');
  const [customExDifficulty, setCustomExDifficulty] = useState<'Principiante' | 'Intermedio' | 'Avanzado'>('Intermedio');
  const [customExRpe, setCustomExRpe] = useState<number>(8);
  const [customExRir, setCustomExRir] = useState<number>(2);
  const [showAdvancedDrawer, setShowAdvancedDrawer] = useState(false);
  const [activePrescriptionFocus, setActivePrescriptionFocus] = useState<'sets' | 'reps' | 'weight' | 'rest'>('sets');

  // Save Feedback Toast
  const [saveSuccessToast, setSaveSuccessToast] = useState(false);

  // ═════════════════════════════════════════════════════════════
  // WEEKLY ROUTINE PLANNER STATE (LUN - DOM)
  // ═════════════════════════════════════════════════════════════
  const [weeklyScheduleState, setWeeklyScheduleState] = useState<Record<string, { title: string; sections: WorkoutSection[] }>>(() => {
    try {
      const saved = localStorage.getItem('apex_femme_v18_weekly_routine');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      'LUN': {
        title: 'Fuerza Unilateral & Potencia de Sprint',
        sections: [
          { id: 'sec-lun-1', title: '1. Movilidad & Preparación Articular', category: 'mobility', exercises: [EXERCISE_DATABASE_300[3]] },
          { id: 'sec-lun-2', title: '2. Pliometría & Reactividad', category: 'plyometrics', exercises: [EXERCISE_DATABASE_300[5]] },
          { id: 'sec-lun-3', title: '3. Fuerza Principal Unilateral', category: 'strength', exercises: [EXERCISE_DATABASE_300[0], EXERCISE_DATABASE_300[1]] },
          { id: 'sec-lun-4', title: '4. Complementarios & Core Anti-Rotación', category: 'core', exercises: [EXERCISE_DATABASE_300[4]] }
        ]
      },
      'MAR': {
        title: 'Sprints Reactivos & Cambios de Dirección',
        sections: [
          { id: 'sec-mar-1', title: '1. Movilidad de Cadera & Tobillos', category: 'mobility', exercises: [EXERCISE_DATABASE_300[3]] },
          { id: 'sec-mar-2', title: '2. Aceleración & Sprints de 10m', category: 'running', exercises: [EXERCISE_DATABASE_300[6]] }
        ]
      },
      'MIE': {
        title: 'Tren Superior & Estabilidad Core',
        sections: [
          { id: 'sec-mie-1', title: '1. Movilidad Torácica & Hombros', category: 'mobility', exercises: [EXERCISE_DATABASE_300[3]] },
          { id: 'sec-mie-2', title: '2. Tracción Horizontal & Triceps', category: 'strength', exercises: [EXERCISE_DATABASE_300[8]] }
        ]
      },
      'JUE': {
        title: 'Fuerza Explosiva & Pliometría Unipodal',
        sections: [
          { id: 'sec-jue-1', title: '1. Movilidad & Calentamiento', category: 'mobility', exercises: [EXERCISE_DATABASE_300[3]] },
          { id: 'sec-jue-2', title: '2. Fuerza & Potencia', category: 'strength', exercises: [EXERCISE_DATABASE_300[1]] }
        ]
      },
      'VIE': {
        title: 'Activación Pre-Partido (Match Day -1)',
        sections: [
          { id: 'sec-vie-1', title: '1. Movilidad & Activación Glútea', category: 'activation', exercises: [EXERCISE_DATABASE_300[1]] },
          { id: 'sec-vie-2', title: '2. Saltos Pliométricos de Baja Carga', category: 'plyometrics', exercises: [EXERCISE_DATABASE_300[5]] }
        ]
      },
      'SAB': { title: '⚽ Día de Partido', sections: [] },
      'DOM': { title: 'Descanso Total & Recuperación', sections: [] }
    };
  });

  const saveWeeklyRoutine = (updated: Record<string, { title: string; sections: WorkoutSection[] }>) => {
    setWeeklyScheduleState(updated);
    try {
      localStorage.setItem('apex_femme_v18_weekly_routine', JSON.stringify(updated));
    } catch (e) {}
  };

  // History & Records State
  const [historyEvents, setHistoryEvents] = useState(TIMELINE_EVENTS);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [newLogExercise, setNewLogExercise] = useState('Hip Thrust con Barra');
  const [newLogWeight, setNewLogWeight] = useState('110');
  const [newLogReps, setNewLogReps] = useState('5');
  const [newLogDate, setNewLogDate] = useState('Hoy');

  const handleDeleteHistoryLog = (id: string) => {
    sounds.playClick();
    setHistoryEvents(prev => prev.filter(item => item.id !== id));
  };

  const handleAddManualLog = () => {
    if (!newLogWeight) return;
    sounds.playLevelUp();
    const newEntry = {
      id: `tl-custom-${Date.now()}`,
      date: newLogDate || 'Hoy',
      type: 'pr' as const,
      title: `🥇 Récord en ${newLogExercise}`,
      description: `${newLogWeight} kg × ${newLogReps} repeticiones. Registrado manualmente.`,
      badge: `PR ${newLogWeight}KG`,
      highlight: true
    };
    setHistoryEvents(prev => [newEntry, ...prev]);
    setShowAddLogModal(false);
    setNewLogWeight('');
  };

  const currentDayData = weeklyScheduleState[selectedDayShort] || { title: 'Día de Entrenamiento', sections: [] };
  const currentSimulation = simulateSession(currentDayData.sections);

  const handleAddSectionToDay = (category: 'mobility' | 'plyometrics' | 'strength' | 'core' | 'warmup' | 'recovery' | 'custom') => {
    sounds.playClick();
    const categoryLabels: Record<string, string> = {
      mobility: 'Movilidad Articular',
      plyometrics: 'Pliometría & Reactividad',
      strength: 'Fuerza Principal',
      core: 'Core Anti-Rotación',
      warmup: 'Calentamiento Dinámico',
      recovery: 'Recuperación & Estiramientos',
      custom: 'Complementarios & Accesorios'
    };

    const newSection: WorkoutSection = {
      id: `sec-${Date.now()}`,
      title: `${currentDayData.sections.length + 1}. Bloque de ${categoryLabels[category]}`,
      category,
      exercises: []
    };

    saveWeeklyRoutine({
      ...weeklyScheduleState,
      [selectedDayShort]: { ...currentDayData, sections: [...currentDayData.sections, newSection] }
    });
  };

  const handleRemoveSection = (secId: string) => {
    sounds.playClick();
    saveWeeklyRoutine({
      ...weeklyScheduleState,
      [selectedDayShort]: { ...currentDayData, sections: currentDayData.sections.filter(s => s.id !== secId) }
    });
  };

  const handleAddExerciseToSection = (secId: string, exercise: ExerciseDetail) => {
    sounds.playClick();
    const updatedSections = currentDayData.sections.map(s => {
      if (s.id !== secId) return s;
      return { ...s, exercises: [...s.exercises, exercise] };
    });
    saveWeeklyRoutine({
      ...weeklyScheduleState,
      [selectedDayShort]: { ...currentDayData, sections: updatedSections }
    });
  };

  // Open V3 Exercise Modal
  const handleOpenCustomExModal = (secId: string) => {
    sounds.playClick();
    setTargetSectionIdForCustomEx(secId);
    setCustomExName('');
    setCustomExCategory('Fuerza');
    setCustomExSets(3);
    setCustomExReps(10);
    setCustomExWeight(80);
    setCustomExRest(90);
    setCustomExTip('');
    setIsFavoriteEx(false);
    setCustomExTempo('');
    setCustomExTransfer('Aceleración 0-10m');
    setCustomExDifficulty('Intermedio');
    setCustomExRpe(8);
    setCustomExRir(2);
    setShowAdvancedDrawer(false);
    setShowCustomExModal(true);
  };

  // Save Exercise Action with micro-feedback
  const handleSaveCustomExercise = (keepOpen: boolean = false) => {
    if (!customExName.trim() || !targetSectionIdForCustomEx) return;
    sounds.playLevelUp();
    setSaveSuccessToast(true);

    const createdEx: ExerciseDetail = {
      id: `custom-ex-${Date.now()}`,
      name: customExName.trim(),
      targetSets: customExSets,
      defaultReps: customExReps,
      defaultWeightKg: customExWeight > 0 ? customExWeight : undefined,
      restSeconds: customExRest,
      targetMuscles: [customExCategory],
      pitchTransfer: customExTransfer || undefined,
      techniqueTip: customExTip || `Ejercicio personalizado (${customExCategory})`,
      recommendedTempo: customExTempo || undefined,
      rpeTarget: customExRpe,
      isCustom: true,
      tags: [customExCategory.toLowerCase(), customExDifficulty.toLowerCase()]
    };

    const updatedSections = currentDayData.sections.map(s => {
      if (s.id !== targetSectionIdForCustomEx) return s;
      return { ...s, exercises: [...s.exercises, createdEx] };
    });

    saveWeeklyRoutine({
      ...weeklyScheduleState,
      [selectedDayShort]: { ...currentDayData, sections: updatedSections }
    });

    setTimeout(() => setSaveSuccessToast(false), 1500);

    if (keepOpen) {
      setCustomExName('');
      setCustomExTip('');
      setCustomExWeight(0);
    } else {
      setTimeout(() => setShowCustomExModal(false), 300);
    }
  };

  const handleQuickFillExercise = (name: string, category: string, sets: number, reps: number, weight: number, rest: number) => {
    sounds.playClick();
    setCustomExName(name);
    setCustomExCategory(category);
    setCustomExSets(sets);
    setCustomExReps(reps);
    setCustomExWeight(weight);
    setCustomExRest(rest);
  };

  const handleRemoveExerciseFromSection = (secId: string, exId: string) => {
    sounds.playClick();
    const updatedSections = currentDayData.sections.map(s => {
      if (s.id !== secId) return s;
      return { ...s, exercises: s.exercises.filter(ex => ex.id !== exId) };
    });
    saveWeeklyRoutine({
      ...weeklyScheduleState,
      [selectedDayShort]: { ...currentDayData, sections: updatedSections }
    });
  };

  const handleStartSessionForDay = (dayShort: string) => {
    sounds.playClick();
    const data = weeklyScheduleState[dayShort] || { title: 'Sesión de Gimnasio', sections: [] };
    const todaySchedule: ScheduleDay = {
      id: `session-${Date.now()}`,
      dayShort: dayShort,
      dayFull: `Día ${dayShort}`,
      activityType: 'gimnasio',
      title: data.title,
      durationMin: isCompressed ? 35 : currentSimulation.estimatedDurationMin,
      status: 'today',
      intensity: 'alta',
      icon: 'Dumbbell',
      sections: isCompressed ? compressSessionForTime(data.sections, 35) : data.sections,
      exerciseDetails: data.sections.flatMap(s => s.exercises)
    };
    setWorkoutDay(todaySchedule);
    setShowWorkoutModal(true);
  };

  const handleToggleEquipment = (id: string) => {
    sounds.playClick();
    setEquipmentList(prev => prev.map(eq => eq.id === id ? { ...eq, isAvailable: !eq.isAvailable } : eq));
  };

  const filteredExercises = EXERCISE_DATABASE_300.filter(ex => {
    const matchesSearch = ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          ex.targetMuscles.some(m => m.toLowerCase().includes(searchQuery.toLowerCase())) ||
                          (ex.tags && ex.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    const matchesTag = selectedTag === 'todos' || (ex.tags && ex.tags.includes(selectedTag));
    return matchesSearch && matchesTag;
  });

  const estimatedExDurationMin = Math.max(1, Math.round(((customExSets * customExReps * 4) + (customExSets * customExRest)) / 60));

  return (
    <div className="space-y-6 pb-32 max-w-5xl mx-auto animate-fade-in">

      {/* ══════════════════════════════════════════════════════
          TOP NAVIGATION SUB-TABS (APPLE/WHOOP/LINEAR DESIGN)
      ══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none border-b border-[var(--border-subtle)]">
        {[
          { id: 'today', label: 'Hoy', icon: Sparkles },
          { id: 'weekly', label: 'Mi Rutina Semanal', icon: Calendar },
          { id: 'history', label: 'Historial & Récords', icon: History },
          { id: 'gym', label: 'Mi Gimnasio', icon: Settings },
          { id: 'library', label: 'Biblioteca 2.0', icon: Search },
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { sounds.playClick(); setActiveTab(tab.id as any); }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all border ${
                isActive
                  ? 'theme-accent-bg text-black border-transparent theme-accent-glow'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════
          TAB 1: "HOY" — TODAY DASHBOARD
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'today' && (
        <div className="space-y-6">

          {/* HERO CARD */}
          <section className="relative overflow-hidden rounded-3xl glass-card p-6 sm:p-8 border-2 border-[var(--accent-color)] shadow-2xl space-y-6">
            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/15 via-transparent to-transparent pointer-events-none" />
            
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-black font-mono theme-accent-bg px-3 py-1 rounded-full text-black uppercase tracking-widest flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    HOY REAL ({realTodayShort})
                  </span>
                  <span className="text-xs font-mono font-bold text-emerald-400">
                    ⏱️ {isCompressed ? '35 min (Comprimida)' : `${currentSimulation.estimatedDurationMin} min`}
                  </span>
                </div>
                <h2 className="font-black text-2xl md:text-3xl text-[var(--text-main)] tracking-tight">
                  {currentDayData.title}
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl leading-relaxed">
                  {currentDayData.sections.length} bloques estructurados: {currentDayData.sections.map(s => s.title).join(', ')}.
                </p>
              </div>

              {/* READINESS BADGE */}
              <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center gap-3 shrink-0">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center font-black text-xl text-emerald-400">
                  92%
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">ESTADO DE RECUPERACIÓN</span>
                  <span className="font-black text-sm text-emerald-400">🟢 Listo para Entrenar</span>
                  <p className="text-[9px] text-[var(--text-muted)]">HRV y descanso en zona óptima</p>
                </div>
              </div>
            </div>

            {/* QUICK COMPRESSOR */}
            <div className="relative z-10 flex items-center justify-between p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                <Clock className="w-4 h-4 text-[var(--accent-color)]" />
                <span>¿Poco tiempo hoy?</span>
              </div>
              <button
                onClick={() => { sounds.playClick(); setIsCompressed(!isCompressed); }}
                className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all border ${
                  isCompressed
                    ? 'bg-amber-500 text-black border-amber-400 font-extrabold'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-white'
                }`}
              >
                {isCompressed ? '⚡ Modo 35 Min Activado' : 'Solo tengo 35 min'}
              </button>
            </div>

            {/* START SESSION */}
            <button
              onClick={() => handleStartSessionForDay(realTodayShort)}
              className="w-full theme-accent-bg py-5 rounded-2xl font-black text-base uppercase tracking-widest text-black theme-accent-glow active:scale-98 transition-all flex items-center justify-center gap-3 shadow-2xl"
            >
              <Play className="w-6 h-6 fill-black" />
              INICIAR ENTRENAMIENTO DE HOY ({realTodayShort})
            </button>
          </section>

          {/* AI INSIGHTS */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
              <Cpu className="w-4 h-4 theme-accent-text" /> Coach IA Proactivo (Transparente)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="glass-card rounded-2xl p-4 border border-[var(--accent-color)]/30 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">📈 Rendimiento Hip Thrust</span>
                  <p className="text-xs font-bold text-[var(--text-main)] leading-snug">
                    Tu extensión de cadera ha mejorado un 18% en las últimas 4 semanas.
                  </p>
                </div>
                <button
                  onClick={() => setWhyDrawer({
                    title: 'Rendimiento Hip Thrust (+18%)',
                    reasoning: 'Análisis de tonelaje acumulado y RPE en las últimas 6 sesiones.',
                    dataPoints: ['1RM estimado: 110kg', 'RPE promedio: 8.0', 'Ratio Isquios/Cuádriceps: 0.72']
                  })}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[10px] font-black text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 shrink-0"
                >
                  ¿Por qué?
                </button>
              </div>

              <div className="glass-card rounded-2xl p-4 border border-[var(--accent-color)]/30 flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">⚠️ Volumen de Aductores</span>
                  <p className="text-xs font-bold text-[var(--text-main)] leading-snug">
                    Tus aductores han recibido bajo volumen esta semana. Se sugiere incluir Copenhague Plank.
                  </p>
                </div>
                <button
                  onClick={() => setWhyDrawer({
                    title: 'Volumen de Aductores Recomendado',
                    reasoning: 'El historial de carga indica 0 series directas de aductores en los últimos 5 días.',
                    dataPoints: ['Series esta semana: 0', 'Frecuencia recomendada: 2x/semana', 'Ejercicio sugerido: Copenhague Plank']
                  })}
                  className="px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[10px] font-black text-[var(--accent-color)] hover:bg-[var(--accent-color)]/10 shrink-0"
                >
                  ¿Por qué?
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 2: "MI RUTINA SEMANAL"
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">

          {/* DAY SELECTOR BAR */}
          <div className="glass-card rounded-3xl p-4 border border-[var(--accent-color)]/40 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                📅 Selecciona un Día para Construir o Editar tu Rutina:
              </span>
              <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 uppercase font-mono">
                Día Actual: {realTodayShort}
              </span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map(dayShort => {
                const dayData = weeklyScheduleState[dayShort];
                const isSelected = selectedDayShort === dayShort;
                const isRealToday = realTodayShort === dayShort;
                const hasSections = dayData && dayData.sections.length > 0;
                return (
                  <button
                    key={dayShort}
                    onClick={() => { sounds.playClick(); setSelectedDayShort(dayShort); }}
                    className={`py-3 rounded-2xl flex flex-col items-center gap-1 border transition-all relative ${
                      isSelected
                        ? 'theme-accent-bg text-black border-transparent font-black shadow-lg scale-105'
                        : hasSections
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-60'
                    }`}
                  >
                    {isRealToday && (
                      <span className="absolute -top-1.5 px-1.5 py-0.2 text-[7px] font-black bg-emerald-500 text-black rounded-full uppercase">
                        Hoy
                      </span>
                    )}
                    <span className="text-xs font-black">{dayShort}</span>
                    <span className="text-[9px] font-mono font-bold">
                      {hasSections ? `${dayData.sections.length} bloq` : 'Descanso'}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* WORKSPACE */}
          <div className="glass-card rounded-3xl p-6 border border-[var(--border-card)] space-y-5">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[var(--border-subtle)] pb-4">
              <div className="flex items-center gap-3 flex-wrap">
                <span className="text-[10px] font-black font-mono theme-accent-bg px-3 py-1.5 rounded-xl text-black uppercase tracking-wider shrink-0 shadow-sm">
                  EDITANDO {selectedDayShort}
                </span>
                <input
                  type="text"
                  value={currentDayData.title}
                  onChange={e => {
                    saveWeeklyRoutine({
                      ...weeklyScheduleState,
                      [selectedDayShort]: { ...currentDayData, title: e.target.value }
                    });
                  }}
                  className="font-black text-xl md:text-2xl text-[var(--text-main)] bg-transparent border-b-2 border-dashed border-[var(--accent-color)]/40 focus:border-[var(--accent-color)] outline-none py-0.5 px-2 min-w-[220px]"
                  placeholder="Nombre de la rutina..."
                />
              </div>

              <button
                onClick={() => handleStartSessionForDay(selectedDayShort)}
                disabled={currentDayData.sections.length === 0}
                className="theme-accent-bg px-5 py-3 rounded-2xl text-xs font-black uppercase text-black theme-accent-glow flex items-center justify-center gap-2 disabled:opacity-40 shrink-0 shadow-lg"
              >
                <Play className="w-4 h-4 fill-black" /> Iniciar Sesión de {selectedDayShort}
              </button>
            </div>

            {/* ADD SECTION BUTTONS */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                ➕ Añadir Bloque / Sección a la Rutina de {selectedDayShort}:
              </span>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'mobility', label: '+ Movilidad', icon: '🧘' },
                  { id: 'plyometrics', label: '+ Pliometría', icon: '⚡' },
                  { id: 'strength', label: '+ Fuerza Principal', icon: '🏋️' },
                  { id: 'core', label: '+ Core Anti-Rotación', icon: '🛡️' },
                  { id: 'warmup', label: '+ Calentamiento', icon: '🔥' },
                  { id: 'recovery', label: '+ Estiramientos', icon: '🌿' },
                  { id: 'custom', label: '+ Complementarios', icon: '➕' },
                ].map(secType => (
                  <button
                    key={secType.id}
                    onClick={() => handleAddSectionToDay(secType.id as any)}
                    className="px-3.5 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-main)] hover:border-[var(--accent-color)] transition-colors flex items-center gap-1.5"
                  >
                    <span>{secType.icon}</span>
                    <span>{secType.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* SECTIONS */}
            {currentDayData.sections.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-[var(--border-subtle)] rounded-3xl space-y-2">
                <p className="text-sm font-bold text-[var(--text-muted)]">Sin secciones creadas para {selectedDayShort}</p>
                <p className="text-xs text-[var(--text-muted)]">Haz clic en los botones de arriba para estructurar el día.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {currentDayData.sections.map((sec) => (
                  <div key={sec.id} className="bg-[var(--bg-input)] rounded-2xl p-4 border border-[var(--border-subtle)] space-y-3">
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)]/50 pb-2">
                      <span className="font-extrabold text-sm text-[var(--text-main)]">{sec.title}</span>
                      <button
                        onClick={() => handleRemoveSection(sec.id)}
                        className="p-1 rounded-lg text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      {sec.exercises.map(ex => (
                        <div key={ex.id} className="bg-[var(--bg-card)] rounded-xl p-3 border border-[var(--border-subtle)] flex items-center justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-xl theme-accent-bg flex items-center justify-center font-mono font-black text-xs text-black shrink-0 shadow-sm">
                              {ex.isCustom ? '✍️' : '🏋️'}
                            </div>
                            <div>
                              <p className="text-xs font-black text-[var(--text-main)] flex items-center gap-1.5">
                                {ex.name}
                                {ex.isCustom && (
                                  <span className="text-[8px] font-mono px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-400 uppercase">
                                    Personalizado
                                  </span>
                                )}
                              </p>
                              <p className="text-[10px] text-[var(--text-muted)] font-mono">
                                {ex.targetSets} series × {ex.defaultReps} reps • {ex.defaultWeightKg ? `${ex.defaultWeightKg} kg` : 'Sin peso'} • {ex.restSeconds}s descanso
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleRemoveExerciseFromSection(sec.id, ex.id)}
                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      <select
                        onChange={(e) => {
                          const targetEx = EXERCISE_DATABASE_300.find(ex => ex.id === e.target.value);
                          if (targetEx) {
                            handleAddExerciseToSection(sec.id, targetEx);
                            e.target.value = '';
                          }
                        }}
                        className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs font-bold text-[var(--text-muted)] outline-none"
                      >
                        <option value="">➕ Elegir de la Biblioteca (300+)...</option>
                        {EXERCISE_DATABASE_300.map(ex => (
                          <option key={ex.id} value={ex.id}>{ex.name} ({ex.targetMuscles.join(', ')})</option>
                        ))}
                      </select>

                      <button
                        onClick={() => handleOpenCustomExModal(sec.id)}
                        className="w-full bg-[var(--bg-card)] border border-dashed border-[var(--accent-color)]/50 hover:border-[var(--accent-color)] rounded-xl px-3 py-2.5 text-xs font-black text-[var(--accent-color)] flex items-center justify-center gap-1.5 transition-colors"
                      >
                        ✍️ Crear mi Ejercicio Personalizado
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          APEX FEMME — EXERCISE CREATION MODAL V3 (APPLE & LINEAR REFINEMENT)
      ═════════════════════════════════════════════════════════════════════ */}
      {showCustomExModal && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-xl flex items-center justify-center p-3 sm:p-5 animate-fade-in overflow-hidden">
          
          <div className="glass-card rounded-[2.5rem] border-2 border-[var(--accent-color)]/60 max-w-4xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col my-auto transition-all relative">

            {/* SUCCESS TOAST NOTIFICATION */}
            {saveSuccessToast && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-4 py-2 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-2xl animate-bounce">
                <CheckCircle className="w-4 h-4 fill-black" /> ¡Ejercicio Guardado con Éxito!
              </div>
            )}

            {/* ── MODAL HEADER ── */}
            <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-card)]/90 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl theme-accent-bg flex items-center justify-center font-black text-sm text-black shadow-lg">
                  ✍️
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-[var(--text-main)] tracking-tight">
                      Crear Ejercicio Personalizado V3
                    </h3>
                    <button
                      type="button"
                      onClick={() => { sounds.playClick(); setIsFavoriteEx(!isFavoriteEx); }}
                      className={`p-1 rounded-lg transition-all ${
                        isFavoriteEx ? 'text-amber-400 bg-amber-500/10' : 'text-[var(--text-muted)] hover:text-white'
                      }`}
                      title="Marcar como Favorito"
                    >
                      <Star className={`w-4 h-4 ${isFavoriteEx ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                  
                  <span className="text-[9px] text-[var(--text-muted)] block mt-0.5">
                    Diseño ultra eficiente en dos columnas (Apple & Linear UX)
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowCustomExModal(false)}
                  className="text-xs font-bold text-[var(--text-muted)] hover:text-white px-2 py-1"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => setShowCustomExModal(false)}
                  className="p-2 rounded-2xl bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* ── MODAL BODY (TWO COLUMN RESPONSIVE GRID - 90% NO SCROLL) ── */}
            <div className="p-5 sm:p-6 overflow-y-auto scrollbar-none flex-1">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* ══════════════════════════════════════════════════════
                    LEFT COLUMN: NAME, CATEGORIES, CONTEXT & INFO
                ══════════════════════════════════════════════════════ */}
                <div className="space-y-4">
                  
                  {/* 1. EXERCISE NAME & SEARCH INPUT */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest block">
                      1. NOMBRE DEL EJERCICIO
                    </label>

                    <div className="relative">
                      <input
                        type="text"
                        value={customExName}
                        onChange={e => setCustomExName(e.target.value)}
                        className="w-full bg-[var(--bg-input)] border-2 border-[var(--border-subtle)] focus:border-[var(--accent-color)] rounded-2xl pl-4 pr-10 py-3 text-sm font-black text-[var(--text-main)] outline-none shadow-inner"
                        placeholder="ej. Sentadilla Búlgara / Hip Thrust / Sprints 10m"
                        autoFocus
                      />
                      <Sparkles className="w-4 h-4 absolute right-3.5 top-3.5 text-[var(--accent-color)] pointer-events-none" />
                    </div>

                    {/* SUGGESTIONS & PREVIOUS CONFIG QUICK TAP */}
                    <div className="flex flex-wrap gap-1">
                      {[
                        { name: 'Hip Thrust con Barra', cat: 'Fuerza', sets: 3, reps: 10, w: 80, r: 90 },
                        { name: 'Sentadilla Búlgara', cat: 'Fuerza', sets: 3, reps: 8, w: 20, r: 60 },
                        { name: 'Sprints 10m', cat: 'Caminadora / Sprints', sets: 5, reps: 1, w: 0, r: 120 },
                        { name: 'Copenhague Plank', cat: 'Prevención LCA', sets: 3, reps: 12, w: 0, r: 45 },
                      ].map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleQuickFillExercise(item.name, item.cat, item.sets, item.reps, item.w, item.r)}
                          className="px-2 py-0.5 rounded-lg bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[9px] font-bold text-[var(--text-muted)] hover:text-white hover:border-[var(--accent-color)]"
                        >
                          ⚡ {item.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 2. COMPACT CATEGORY GRID */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest block">
                      2. CATEGORÍA (SELECCIÓN COMPACTA)
                    </label>

                    <div className="grid grid-cols-3 gap-1.5">
                      {CATEGORY_GRID.map(cat => {
                        const isSelected = customExCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => { sounds.playClick(); setCustomExCategory(cat.id); }}
                            className={`p-2 rounded-xl border text-left transition-all flex items-center gap-1.5 ${
                              isSelected
                                ? `${cat.color} font-black shadow-md ring-1 ring-[var(--accent-color)] scale-[1.02]`
                                : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-white'
                            }`}
                          >
                            <span className="text-sm">{cat.icon}</span>
                            <span className="text-[10px] font-black truncate">{cat.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 3. PERSONAL TRAINING CONTEXT & SMART AI RECOMMENDATION */}
                  <div className="space-y-2">
                    <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-extrabold uppercase text-[var(--text-muted)] flex items-center gap-1">
                          <History className="w-3 h-3 text-cyan-400" /> Última Sesión Registrada
                        </span>
                        <button
                          type="button"
                          onClick={() => handleQuickFillExercise(customExName || 'Hip Thrust', customExCategory, 3, 10, 82.5, 90)}
                          className="text-[9px] font-bold text-[var(--accent-color)] hover:underline font-mono"
                        >
                          [Usar Anterior]
                        </button>
                      </div>
                      <div className="flex items-center justify-between text-xs font-mono font-bold text-[var(--text-main)] bg-[var(--bg-card)] p-2 rounded-xl border border-[var(--border-subtle)]">
                        <span>82.5 kg × 3×10</span>
                        <span className="text-amber-400">RPE 8</span>
                        <span className="text-[10px] text-[var(--text-muted)]">Hace 5 días</span>
                      </div>
                    </div>

                    {/* CONTEXTUAL AI CARD */}
                    <div className="bg-emerald-500/10 p-3 rounded-2xl border border-emerald-500/30 flex items-start gap-2.5 text-[10px]">
                      <Cpu className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-emerald-400 uppercase">RECOMENDACIÓN IA</span>
                          <span className="font-mono font-bold text-emerald-300">Carga Sugerida: 85kg (94% Confianza)</span>
                        </div>
                        <p className="text-[9px] text-[var(--text-muted)] mt-0.5">
                          Últimas 4 sesiones completadas con comodidad sin fatiga lumbar.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 4. COMPACT EXERCISE INFO SUMMARY */}
                  <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between text-[10px] font-mono">
                    <div>
                      <span className="text-[var(--text-muted)] block">Transferencia:</span>
                      <span className="font-bold theme-accent-text">{customExTransfer}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block">Dificultad:</span>
                      <span className="font-bold text-cyan-400">{customExDifficulty}</span>
                    </div>
                    <div>
                      <span className="text-[var(--text-muted)] block">Material:</span>
                      <span className="font-bold text-emerald-400">Gimnasio</span>
                    </div>
                  </div>

                </div>

                {/* ══════════════════════════════════════════════════════
                    RIGHT COLUMN: INTERACTIVE PRESCRIPTION, PRESETS & SAVE
                ══════════════════════════════════════════════════════ */}
                <div className="space-y-4">
                  
                  {/* INTERACTIVE PRESCRIPTION CARD */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest block">
                        3. PRESCRIPCIÓN DE CARGA INTERACTIVA
                      </label>

                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        ⏱️ Est. ≈ {estimatedExDurationMin} min
                      </span>
                    </div>

                    {/* INTERACTIVE SUMMARY CARD */}
                    <div className="bg-[var(--bg-input)] p-4 rounded-3xl border border-[var(--border-subtle)] space-y-3">
                      
                      {/* INTERACTIVE FORMULA DISPLAY */}
                      <div className="flex items-center justify-center gap-1.5 sm:gap-2 bg-[var(--bg-card)] p-3 rounded-2xl border border-[var(--accent-color)]/30 font-mono font-black text-sm sm:text-base">
                        <button
                          type="button"
                          onClick={() => setActivePrescriptionFocus('sets')}
                          className={`px-2 py-1 rounded-xl transition-all ${
                            activePrescriptionFocus === 'sets'
                              ? 'theme-accent-bg text-black shadow-md ring-2 ring-[var(--accent-color)]'
                              : 'theme-accent-text hover:bg-[var(--accent-color)]/10'
                          }`}
                        >
                          {customExSets} Series
                        </button>
                        <span className="text-[var(--text-muted)]">×</span>
                        <button
                          type="button"
                          onClick={() => setActivePrescriptionFocus('reps')}
                          className={`px-2 py-1 rounded-xl transition-all ${
                            activePrescriptionFocus === 'reps'
                              ? 'bg-cyan-500 text-black shadow-md ring-2 ring-cyan-400'
                              : 'text-cyan-400 hover:bg-cyan-500/10'
                          }`}
                        >
                          {customExReps} Reps
                        </button>
                        <span className="text-[var(--text-muted)]">@</span>
                        <button
                          type="button"
                          onClick={() => setActivePrescriptionFocus('weight')}
                          className={`px-2 py-1 rounded-xl transition-all ${
                            activePrescriptionFocus === 'weight'
                              ? 'bg-amber-500 text-black shadow-md ring-2 ring-amber-400'
                              : 'text-amber-400 hover:bg-amber-500/10'
                          }`}
                        >
                          {customExWeight > 0 ? `${customExWeight}kg` : 'Sin Peso'}
                        </button>
                        <span className="text-[var(--text-muted)]">↓</span>
                        <button
                          type="button"
                          onClick={() => setActivePrescriptionFocus('rest')}
                          className={`px-2 py-1 rounded-xl transition-all ${
                            activePrescriptionFocus === 'rest'
                              ? 'bg-purple-500 text-black shadow-md ring-2 ring-purple-400'
                              : 'text-purple-400 hover:bg-purple-500/10'
                          }`}
                        >
                          {customExRest}s Rest
                        </button>
                      </div>

                      {/* STEPPERS & ADJUSTMENT CONTROLS */}
                      <div className="grid grid-cols-2 gap-2">
                        
                        {/* SERIES STEPPER */}
                        <div className="bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-subtle)] space-y-1">
                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block">Series</span>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setCustomExSets(Math.max(1, customExSets - 1))}
                              className="w-7 h-7 rounded-lg bg-[var(--bg-input)] font-black text-xs hover:text-white"
                            >
                              -
                            </button>
                            <span className="font-mono font-black text-sm">{customExSets}</span>
                            <button
                              type="button"
                              onClick={() => setCustomExSets(customExSets + 1)}
                              className="w-7 h-7 rounded-lg bg-[var(--bg-input)] font-black text-xs hover:text-white"
                            >
                              +
                            </button>
                          </div>
                        </div>

                        {/* REPETICIONES STEPPER */}
                        <div className="bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-subtle)] space-y-1">
                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block">Repeticiones</span>
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => setCustomExReps(Math.max(1, customExReps - 1))}
                              className="w-7 h-7 rounded-lg bg-[var(--bg-input)] font-black text-xs hover:text-white"
                            >
                              -
                            </button>
                            <span className="font-mono font-black text-sm">{customExReps}</span>
                            <button
                              type="button"
                              onClick={() => setCustomExReps(customExReps + 1)}
                              className="w-7 h-7 rounded-lg bg-[var(--bg-input)] font-black text-xs hover:text-white"
                            >
                              +
                            </button>
                          </div>
                        </div>

                      </div>

                      {/* PESO STEPPERS & REST SELECTOR */}
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-subtle)] space-y-1">
                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block">Peso (kg)</span>
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setCustomExWeight(Math.max(0, customExWeight - 5))}
                              className="px-2 py-1 rounded bg-[var(--bg-input)] font-mono text-[10px] font-bold"
                            >
                              -5
                            </button>
                            <input
                              type="number"
                              value={customExWeight}
                              onChange={e => setCustomExWeight(Number(e.target.value))}
                              className="w-full bg-transparent text-center font-mono font-black text-xs text-amber-400 outline-none"
                            />
                            <button
                              type="button"
                              onClick={() => setCustomExWeight(customExWeight + 5)}
                              className="px-2 py-1 rounded bg-[var(--bg-input)] font-mono text-[10px] font-bold"
                            >
                              +5
                            </button>
                          </div>
                        </div>

                        <div className="bg-[var(--bg-card)] p-2 rounded-2xl border border-[var(--border-subtle)] space-y-1">
                          <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block">Descanso</span>
                          <select
                            value={customExRest}
                            onChange={e => setCustomExRest(Number(e.target.value))}
                            className="w-full bg-transparent font-mono text-xs font-bold text-purple-400 outline-none py-1"
                          >
                            <option value={30}>30 Seg</option>
                            <option value={45}>45 Seg</option>
                            <option value={60}>60 Seg (1m)</option>
                            <option value={90}>90 Seg (1.5m)</option>
                            <option value={120}>120 Seg (2m)</option>
                            <option value={180}>180 Seg (3m)</option>
                          </select>
                        </div>
                      </div>

                    </div>
                  </div>

                  {/* ONE-TAP TRAINING PRESETS */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-[var(--text-muted)] uppercase tracking-widest block">
                      PRESETS RÁPIDOS DE ENTRENAMIENTO
                    </label>

                    <div className="flex flex-wrap gap-1">
                      {QUICK_TRAINING_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            sounds.playClick();
                            setCustomExSets(preset.sets);
                            setCustomExReps(preset.reps);
                            if (preset.w > 0) setCustomExWeight(preset.w);
                            setCustomExRest(preset.r);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[10px] font-bold text-[var(--text-muted)] hover:text-white hover:border-[var(--accent-color)] transition-colors"
                        >
                          ⚡ {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* ADVANCED SETTINGS COLLAPSIBLE DRAWER */}
                  <div className="border-t border-[var(--border-subtle)] pt-3">
                    <button
                      type="button"
                      onClick={() => setShowAdvancedDrawer(!showAdvancedDrawer)}
                      className="w-full flex items-center justify-between text-[10px] font-black uppercase text-[var(--text-muted)] hover:text-white py-1"
                    >
                      <span className="flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 theme-accent-text" />
                        Configuración Avanzada (Tempo, RPE, Cues, Transferencia)
                      </span>
                      {showAdvancedDrawer ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {showAdvancedDrawer && (
                      <div className="bg-[var(--bg-input)] rounded-2xl p-3 border border-[var(--border-subtle)] space-y-3 mt-2 animate-fade-in text-[10px]">
                        
                        {/* FOOTBALL TRANSFER CHIPS */}
                        <div>
                          <span className="font-bold text-[var(--text-muted)] block mb-1">Transferencia al Fútbol</span>
                          <div className="flex flex-wrap gap-1">
                            {FOOTBALL_TRANSFERS.map(item => (
                              <button
                                key={item}
                                type="button"
                                onClick={() => setCustomExTransfer(customExTransfer === item ? '' : item)}
                                className={`px-2.5 py-1 rounded-lg font-bold border transition-all ${
                                  customExTransfer === item
                                    ? 'bg-cyan-500 text-black border-cyan-400 font-black'
                                    : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                                }`}
                              >
                                {item}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* TEMPO & RPE TARGET */}
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <span className="font-bold text-[var(--text-muted)] block mb-1">Tempo (ej. 3-0-1-0)</span>
                            <input
                              type="text"
                              value={customExTempo}
                              onChange={e => setCustomExTempo(e.target.value)}
                              className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs font-mono font-medium text-[var(--text-main)] outline-none"
                              placeholder="3-0-1-0"
                            />
                          </div>

                          <div>
                            <span className="font-bold text-[var(--text-muted)] block mb-1">Objetivo RPE / RIR</span>
                            <div className="flex items-center gap-1 font-mono">
                              <select
                                value={customExRpe}
                                onChange={e => setCustomExRpe(Number(e.target.value))}
                                className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs font-bold text-amber-400 outline-none"
                              >
                                {[6, 7, 8, 9, 10].map(rpe => (
                                  <option key={rpe} value={rpe}>RPE {rpe}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </div>

                        {/* TECHNICAL CUES */}
                        <div>
                          <span className="font-bold text-[var(--text-muted)] block mb-1">Cues & Notas Técnicas</span>
                          <input
                            type="text"
                            value={customExTip}
                            onChange={e => setCustomExTip(e.target.value)}
                            className="w-full bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-lg px-2 py-1 text-xs font-medium text-[var(--text-main)] outline-none"
                            placeholder="ej. Pausa 2s abajo sin bloquear lumbar"
                          />
                        </div>

                      </div>
                    )}
                  </div>

                </div>

              </div>

            </div>

            {/* ── MODAL FOOTER DUAL ACTION BUTTONS ── */}
            <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-card)]/90 backdrop-blur-md shrink-0 flex flex-col sm:flex-row items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveCustomExercise(false)}
                disabled={!customExName.trim()}
                className="w-full sm:flex-1 theme-accent-bg py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider text-black theme-accent-glow flex items-center justify-center gap-2 disabled:opacity-40 transition-all shadow-xl"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                Guardar Ejercicio
              </button>

              <button
                type="button"
                onClick={() => handleSaveCustomExercise(true)}
                disabled={!customExName.trim()}
                className="w-full sm:w-auto px-5 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)] flex items-center justify-center gap-2 disabled:opacity-40 transition-all"
              >
                <Plus className="w-4 h-4" />
                Guardar y Crear Otro
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 3: "HISTORIAL & RÉCORDS"
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-extrabold text-sm uppercase tracking-wider theme-accent-text flex items-center gap-2">
              <History className="w-4 h-4" /> Historial & Récords (Gestión)
            </h3>

            <button
              onClick={() => setShowAddLogModal(true)}
              className="theme-accent-bg px-4 py-2.5 rounded-2xl text-xs font-black uppercase text-black flex items-center gap-1.5 shadow-lg"
            >
              <Plus className="w-4 h-4" /> Agregar Récord Manual
            </button>
          </div>

          <div className="space-y-3">
            {historyEvents.map(event => (
              <div key={event.id} className="glass-card rounded-2xl p-4 border border-[var(--border-card)] flex items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <span className="text-xl mt-0.5">🥇</span>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono">{event.date}</span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded theme-accent-bg text-black uppercase">
                        {event.badge}
                      </span>
                    </div>
                    <h4 className="font-black text-sm text-[var(--text-main)] mt-0.5">{event.title}</h4>
                    <p className="text-xs text-[var(--text-muted)] leading-relaxed">{event.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteHistoryLog(event.id)}
                  title="Eliminar este registro del historial"
                  className="p-2.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          {showAddLogModal && (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
              <div className="glass-card rounded-3xl p-6 border border-[var(--accent-color)] max-w-md w-full space-y-4">
                <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
                  <h3 className="font-black text-base theme-accent-text flex items-center gap-2">
                    <Trophy className="w-5 h-5" /> Agregar Récord Personal Manual
                  </h3>
                  <button onClick={() => setShowAddLogModal(false)} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-white">✕</button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Ejercicio</label>
                    <input
                      type="text"
                      value={newLogExercise}
                      onChange={e => setNewLogExercise(e.target.value)}
                      className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs font-bold text-[var(--text-main)] outline-none"
                      placeholder="ej. Hip Thrust con Barra"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Peso Levantado (kg)</label>
                      <input
                        type="number"
                        value={newLogWeight}
                        onChange={e => setNewLogWeight(e.target.value)}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm font-black font-mono text-[var(--text-main)] outline-none text-center"
                        placeholder="110"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Repeticiones</label>
                      <input
                        type="number"
                        value={newLogReps}
                        onChange={e => setNewLogReps(e.target.value)}
                        className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-sm font-black font-mono text-[var(--text-main)] outline-none text-center"
                        placeholder="5"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleAddManualLog}
                  className="w-full theme-accent-bg py-3.5 rounded-2xl font-black text-xs uppercase text-black theme-accent-glow"
                >
                  Guardar en Historial
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 4: MI GIMNASIO & EQUIPAMIENTO
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'gym' && (
        <div className="space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-[var(--accent-color)]/40 space-y-4">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6 theme-accent-text" />
              <div>
                <h3 className="font-black text-lg text-[var(--text-main)]">Mi Gimnasio & Equipamiento Disponible</h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Configura el material de tu gimnasio. El Coach IA **nunca** recomendará ejercicios con equipamiento no disponible.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {equipmentList.map(eq => (
                <button
                  key={eq.id}
                  onClick={() => handleToggleEquipment(eq.id)}
                  className={`p-3.5 rounded-2xl border transition-all text-left flex items-center justify-between ${
                    eq.isAvailable
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-300'
                      : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-muted)] opacity-50'
                  }`}
                >
                  <span className="text-xs font-bold truncate pr-2">{eq.name}</span>
                  {eq.isAvailable ? <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" /> : <span className="text-[10px]">No disponible</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          TAB 5: BIBLIOTECA 2.0
      ══════════════════════════════════════════════════════ */}
      {activeTab === 'library' && (
        <div className="space-y-5">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-[var(--text-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Buscar por ejercicio, músculo o tag (LCA, Hip Thrust...)"
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent-color)] rounded-2xl pl-11 pr-4 py-3 text-xs font-bold text-[var(--text-main)] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredExercises.map(ex => (
              <div key={ex.id} className="glass-card rounded-2xl p-4 border border-[var(--border-card)] space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-black text-sm text-[var(--text-main)]">{ex.name}</h4>
                    <span className="text-[9px] font-mono font-bold theme-accent-text">
                      {ex.targetMuscles.join(' • ')}
                    </span>
                  </div>
                  {ex.effectivenessRating && (
                    <span className="text-xs font-bold text-amber-400 font-mono">
                      {'★'.repeat(ex.effectivenessRating)}
                    </span>
                  )}
                </div>

                {ex.injuryPreventionTag && (
                  <p className="text-[10px] text-amber-300 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 shrink-0" /> {ex.injuryPreventionTag}
                  </p>
                )}

                {ex.pitchTransfer && (
                  <p className="text-[10px] text-[var(--text-muted)] italic leading-relaxed">
                    ⚡ {ex.pitchTransfer}
                  </p>
                )}

                {ex.effectivenessRationale && (
                  <p className="text-[9px] text-emerald-400 font-mono bg-emerald-500/10 p-2 rounded-xl border border-emerald-500/20">
                    🔬 {ex.effectivenessRationale}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TRANSPARENT AI "WHY?" DRAWER OVERLAY */}
      {whyDrawer && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="glass-card rounded-3xl p-6 border border-[var(--accent-color)] max-w-md w-full space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-black text-base theme-accent-text flex items-center gap-2">
                <Cpu className="w-5 h-5" /> ¿Por qué esta recomendación?
              </h3>
              <button onClick={() => setWhyDrawer(null)} className="p-1 rounded-lg text-[var(--text-muted)] hover:text-white">✕</button>
            </div>
            <h4 className="font-extrabold text-sm text-[var(--text-main)]">{whyDrawer.title}</h4>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">{whyDrawer.reasoning}</p>

            <button
              onClick={() => setWhyDrawer(null)}
              className="w-full theme-accent-bg py-3 rounded-2xl text-xs font-black uppercase text-black"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

      {/* LIVE INTERACTIVE WORKOUT MODAL */}
      {workoutDay && (
        <InteractiveWorkoutModal
          isOpen={showWorkoutModal}
          onClose={() => setShowWorkoutModal(false)}
          dayActivity={workoutDay}
          onCompleteWorkout={(tonnageKg, xp) => {
            setShowWorkoutModal(false);
          }}
        />
      )}

    </div>
  );
};
