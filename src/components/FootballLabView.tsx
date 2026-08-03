import React, { useState, useMemo, useEffect } from 'react';
import { PlayerProfile, ScheduleDay } from '../types';
import {
  Play, Plus, Trash2, ArrowRight, Search,
  Brain, Clock, Zap, Target, Sparkles, Filter,
  CheckCircle2, Layers, ShieldCheck, HeartPulse, Save, RotateCcw, Activity, Edit3, ArrowUp, ArrowDown, Tag, AlertCircle, Eye, Scale, Bot, Wand2, Trophy, BarChart3, Check, RefreshCw, Flame, Layers2, Compass as CompassIcon
} from 'lucide-react';
import {
  FOOTBALL_DRILL_DATABASE,
  DrillFamily,
  ContactSurface,
  SetupType,
  FootballDrill,
  getTotalDrills
} from '../data/footballDrillDatabase';
import {
  generateSmartFootballSession,
  compressSession,
  filterDrillDatabase,
  FootballSessionPlan
} from '../services/footballIntelligenceEngine';
import { sounds } from '../services/soundEffects';

interface FootballLabViewProps {
  playerProfile: PlayerProfile;
  onUpdateProfile: (data: Partial<PlayerProfile>) => void;
  onStartInteractiveWorkout?: (day: ScheduleDay) => void;
}

export interface CustomFootballPlan {
  id: string;
  name: string;
  targetGoal: string;
  createdAt: string;
  origin?: 'manual' | 'ai' | 'template';
  drills: (FootballDrill & { personalNote?: string; colorTag?: string })[];
}

export type CategoryFilterKey =
  | 'all'
  | 'tecnica'
  | 'pase'
  | 'pase_filtrado'
  | 'pase_1_toque'
  | 'pase_2_toques'
  | 'control'
  | 'tiro'
  | 'escaneo'
  | 'game_iq';

export const FootballLabView: React.FC<FootballLabViewProps> = ({
  playerProfile,
  onUpdateProfile,
  onStartInteractiveWorkout
}) => {
  // Navigation Tabs: 'dashboard' (Rutina Fútbol) | 'library' (Biblioteca +500) | 'evolution' (Registro Progresión)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'library' | 'evolution'>('dashboard');

  // Pre-Workout Mood / Readiness State (UI Simulator for Readiness)
  const [userMoodState, setUserMoodState] = useState<'great' | 'good' | 'neutral' | 'tired' | 'exhausted'>('good');
  const [readinessPhysical, setReadinessPhysical] = useState<number>(88);
  const [readinessMental, setReadinessMental] = useState<number>(92);

  // Active Session & Duration State
  const [selectedDuration, setSelectedDuration] = useState<number>(45);

  // Saved Custom Plans Persistence (stored in localStorage)
  const [savedCustomPlans, setSavedCustomPlans] = useState<CustomFootballPlan[]>(() => {
    try {
      const stored = localStorage.getItem('apex_femme_custom_football_plans');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  // ACTIVE FOOTBALL ROUTINE BUILDER STATE
  const [customPlanName, setCustomPlanName] = useState('Mi Rutina Táctica de Fútbol');
  const [customPlanGoal, setCustomPlanGoal] = useState('Desarrollo de primer toque, escaneo y precisión de pase');
  const [isEditingHeader, setIsEditingHeader] = useState(false);
  const [selectedDrillsForPlan, setSelectedDrillsForPlan] = useState<(FootballDrill & { personalNote?: string; colorTag?: string })[]>([]);
  
  // Add Drill Panel Modal inside Dashboard
  const [showAddDrillPanel, setShowAddDrillPanel] = useState(false);
  const [addDrillSearch, setAddDrillSearch] = useState('');

  // KNOWLEDGE HUB (BIBLIOTECA) FILTERING STATE
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<CategoryFilterKey>('all');
  const [searchFilter, setSearchFilter] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [weakFootOnlyFilter, setWeakFootOnlyFilter] = useState<boolean>(false);
  const [selectedDrillEntity, setSelectedDrillEntity] = useState<FootballDrill | null>(null);

  // Comparator State
  const [compareDrillIds, setCompareDrillIds] = useState<string[]>([]);
  const [showComparatorModal, setShowComparatorModal] = useState<boolean>(false);

  // UEFA Pro Coach Quote
  const uefaCoachQuotes = [
    "La precisión técnica supera siempre a la velocidad sin control.",
    "El primer toque no es detener el balón, es colocarlo donde vas a jugar.",
    "El escaneo visual antes de recibir te da 1 segundo de ventaja estratégica.",
    "La pierna no dominante duplica tus opciones de pase en cancha."
  ];
  const [currentCoachQuote] = useState(() => uefaCoachQuotes[Math.floor(Math.random() * uefaCoachQuotes.length)]);

  // Real Completed Workouts History Persistence
  const [completedWorkoutsHistory, setCompletedWorkoutsHistory] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('apex_femme_completed_football_workouts');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      const stored = localStorage.getItem('apex_femme_completed_football_workouts');
      if (stored) {
        setCompletedWorkoutsHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error syncing completed workouts:', e);
    }
  }, []);

  // Compute Real Career Metrics from LocalStorage
  const realCareerMetrics = useMemo(() => {
    const count = completedWorkoutsHistory.length;
    const totalMinutes = completedWorkoutsHistory.reduce((acc, w) => acc + (w.durationMin || 30), 0);
    const totalHours = (totalMinutes / 60).toFixed(1);
    const totalTouches = completedWorkoutsHistory.reduce((acc, w) => acc + (w.totalTouches || ((w.durationMin || 30) * 20)), 0);

    const weakFootWorkouts = completedWorkoutsHistory.filter(w => w.weakFoot || w.focusFamily === 'weak_foot').length;
    const weakFootPct = count > 0 ? Math.round((weakFootWorkouts / count) * 100) : 0;

    return {
      count,
      totalMinutes,
      totalHours,
      totalTouches,
      weakFootPct
    };
  }, [completedWorkoutsHistory]);

  // Compute Active Plan Metrics (Time, Foot distribution, Surfaces, Touches, Carga)
  const activePlanMetrics = useMemo(() => {
    const totalMin = selectedDrillsForPlan.reduce((acc, d) => acc + (d.durationMin || 8), 0);
    const count = selectedDrillsForPlan.length;

    const weakFootCount = selectedDrillsForPlan.filter(d => d.weakFoot || d.bothFeet).length;
    const dominantFootCount = selectedDrillsForPlan.filter(d => d.dominantFoot || d.bothFeet).length;
    const bothFeetCount = selectedDrillsForPlan.filter(d => d.bothFeet).length;

    const weakFootPct = count > 0 ? Math.round((weakFootCount / count) * 100) : 0;

    // Contact Surfaces extracted from drills
    const surfacesSet = new Set<string>();
    selectedDrillsForPlan.forEach(d => {
      if (d.tags) {
        d.tags.forEach(t => {
          if (['interior', 'empeine', 'exterior', 'planta', 'pecho', 'cabeza', 'talon'].includes(t)) {
            surfacesSet.add(t);
          }
        });
      }
      if (d.name.toLowerCase().includes('interior')) surfacesSet.add('interior');
      if (d.name.toLowerCase().includes('empeine')) surfacesSet.add('empeine');
      if (d.name.toLowerCase().includes('exterior')) surfacesSet.add('exterior');
      if (d.name.toLowerCase().includes('planta')) surfacesSet.add('planta');
      if (d.name.toLowerCase().includes('cabeza')) surfacesSet.add('cabeza');
    });

    if (surfacesSet.size === 0 && count > 0) {
      surfacesSet.add('interior');
      surfacesSet.add('empeine');
    }

    const contactSurfacesList = Array.from(surfacesSet);

    const estimatedTotalTouches = selectedDrillsForPlan.reduce((acc, d) => {
      return acc + ((d.estimatedTouchesPerMin || 30) * (d.durationMin || 8));
    }, 0);

    const cognitiveScore = Math.min(100, selectedDrillsForPlan.reduce((acc, d) => {
      const val = d.cognitiveDemand === 'Muy Alta' ? 30 : d.cognitiveDemand === 'Alta' ? 20 : 10;
      return acc + val;
    }, 10));

    const technicalPct = Math.min(100, Math.round(count * 22));
    const physicalPct = Math.min(100, Math.round(totalMin * 1.8));

    return {
      totalMin,
      count,
      weakFootCount,
      dominantFootCount,
      bothFeetCount,
      weakFootPct,
      contactSurfacesList,
      estimatedTotalTouches,
      cognitiveScore,
      technicalPct,
      physicalPct
    };
  }, [selectedDrillsForPlan]);

  // Handler to select readiness/mood
  const handleMoodSelect = (mood: 'great' | 'good' | 'neutral' | 'tired' | 'exhausted') => {
    sounds.playClick();
    setUserMoodState(mood);
    let targetMins = 45;
    let phys = 88;
    let ment = 92;

    if (mood === 'great') { targetMins = 60; phys = 95; ment = 98; }
    if (mood === 'good') { targetMins = 45; phys = 88; ment = 92; }
    if (mood === 'neutral') { targetMins = 35; phys = 75; ment = 80; }
    if (mood === 'tired') { targetMins = 25; phys = 60; ment = 70; }
    if (mood === 'exhausted') { targetMins = 15; phys = 45; ment = 50; }

    setSelectedDuration(targetMins);
    setReadinessPhysical(phys);
    setReadinessMental(ment);
  };

  // Reorder Drills in active plan
  const handleMoveDrill = (index: number, direction: 'up' | 'down') => {
    sounds.playClick();
    const updated = [...selectedDrillsForPlan];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;
    setSelectedDrillsForPlan(updated);
  };

  // Remove Drill from active plan
  const handleRemoveDrill = (index: number) => {
    sounds.playClick();
    setSelectedDrillsForPlan(prev => prev.filter((_, i) => i !== index));
  };

  // Save Custom Football Plan to LocalStorage
  const handleSaveCustomPlan = () => {
    if (selectedDrillsForPlan.length === 0) return;
    sounds.playSuccess();
    const newPlan: CustomFootballPlan = {
      id: `plan-${Date.now()}`,
      name: customPlanName || 'Mi Rutina Personalizada de Fútbol',
      targetGoal: customPlanGoal || 'Desarrollo técnico general',
      createdAt: new Date().toLocaleDateString('es-ES'),
      origin: 'manual',
      drills: [...selectedDrillsForPlan]
    };
    const updated = [newPlan, ...savedCustomPlans];
    setSavedCustomPlans(updated);
    localStorage.setItem('apex_femme_custom_football_plans', JSON.stringify(updated));
  };

  // Delete Saved Plan
  const handleRemoveSavedPlan = (id: string) => {
    sounds.playClick();
    const updated = savedCustomPlans.filter(p => p.id !== id);
    setSavedCustomPlans(updated);
    localStorage.setItem('apex_femme_custom_football_plans', JSON.stringify(updated));
  };

  // Filtered Library according to 9 requested categories
  const filteredLibrary = useMemo(() => {
    let list = FOOTBALL_DRILL_DATABASE;

    // Apply category filter
    if (selectedCategoryFilter === 'tecnica') {
      list = list.filter(d => d.family === 'ball_mastery' || d.family === 'dribbling');
    } else if (selectedCategoryFilter === 'pase') {
      list = list.filter(d => d.family === 'passing');
    } else if (selectedCategoryFilter === 'pase_filtrado') {
      list = list.filter(d => 
        d.name.toLowerCase().includes('filtrado') || 
        d.technicalObjective.toLowerCase().includes('filtrado') || 
        d.tacticalObjective.toLowerCase().includes('desmarque') ||
        d.family === 'passing'
      );
    } else if (selectedCategoryFilter === 'pase_1_toque') {
      list = list.filter(d => 
        d.name.toLowerCase().includes('1 toque') || 
        d.name.toLowerCase().includes('un toque') || 
        d.name.toLowerCase().includes('primera') ||
        d.technicalObjective.toLowerCase().includes('1 toque') ||
        d.tags.includes('1 toque')
      );
    } else if (selectedCategoryFilter === 'pase_2_toques') {
      list = list.filter(d => 
        d.name.toLowerCase().includes('2 toques') || 
        d.name.toLowerCase().includes('dos toques') ||
        d.technicalObjective.toLowerCase().includes('dos toques') ||
        d.technicalObjective.toLowerCase().includes('2 toques')
      );
    } else if (selectedCategoryFilter === 'control') {
      list = list.filter(d => d.family === 'first_touch' || d.family === 'turning');
    } else if (selectedCategoryFilter === 'tiro') {
      list = list.filter(d => d.family === 'finishing' || d.family === 'crossing');
    } else if (selectedCategoryFilter === 'escaneo') {
      list = list.filter(d => d.family === 'scanning');
    } else if (selectedCategoryFilter === 'game_iq') {
      list = list.filter(d => d.family === 'decision_making' || d.family === 'cognitive_dual' || d.family === 'position_specific');
    }

    // Apply search filter
    if (searchFilter.trim().length > 0) {
      const q = searchFilter.toLowerCase();
      list = list.filter(d => 
        d.name.toLowerCase().includes(q) || 
        d.technicalObjective.toLowerCase().includes(q) ||
        d.tacticalObjective.toLowerCase().includes(q) ||
        d.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Apply difficulty filter
    if (selectedDifficulty !== 'all') {
      list = list.filter(d => d.difficulty === selectedDifficulty);
    }

    // Apply weak foot filter
    if (weakFootOnlyFilter) {
      list = list.filter(d => d.weakFoot);
    }

    return list;
  }, [selectedCategoryFilter, searchFilter, selectedDifficulty, weakFootOnlyFilter]);

  // Comparator Toggle Handler
  const handleToggleCompare = (drillId: string) => {
    sounds.playClick();
    setCompareDrillIds(prev => {
      if (prev.includes(drillId)) return prev.filter(id => id !== drillId);
      if (prev.length >= 2) return [prev[1], drillId];
      return [...prev, drillId];
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-44 animate-fade-in relative">
      {/* Background Textures */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 rounded-full bg-[var(--accent-color)]/5 blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-0 -z-10 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />

      {/* HEADER COMPACTO CON PERFIL DE FUTBOLISTA */}
      <div className="glass-panel p-3.5 rounded-2xl border border-[var(--border-subtle)] flex flex-wrap items-center justify-between gap-3 bg-[var(--bg-card)]/80 backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-color)] to-amber-600 flex items-center justify-center text-black font-black text-sm shadow-md">
            <Activity className="w-5 h-5 text-black" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm text-[var(--text-main)] tracking-tight leading-none">
                {playerProfile.name || 'Jugadora'}
              </span>
              <span className="px-2 py-0.5 rounded-md bg-black/40 text-cyan-400 font-mono text-[9px] font-bold border border-cyan-500/20">
                {playerProfile.position || 'MC'} · OVR {playerProfile.OVR || 78}
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              FOOTBALL LAB OS · ENTRENAMIENTO INDIVIDUAL EXCLUSIVO
            </span>
          </div>
        </div>

        {/* 3 MAIN NAVIGATION TABS */}
        <div className="flex bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-subtle)] overflow-x-auto">
          {[
            { id: 'dashboard', label: 'DASHBOARD DE RUTINA' },
            { id: 'library', label: `BIBLIOTECA (${getTotalDrills()})` },
            { id: 'evolution', label: 'REGISTRO DE PROGRESIÓN' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { sounds.playClick(); setActiveTab(tab.id as any); }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'theme-accent-bg text-black shadow-md'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* DIRECTIVA UEFA PRO COACH */}
      <div className="glass-panel p-3.5 rounded-2xl border-l-4 border-l-[var(--accent-color)] border-[var(--border-subtle)] bg-gradient-to-r from-amber-500/10 via-black/60 to-black/40 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Trophy className="w-5 h-5 text-amber-400 shrink-0" />
          <div>
            <span className="text-[9px] font-mono font-black uppercase text-amber-400 tracking-widest block">DIRECTIVA TÁCTICA UEFA PRO</span>
            <p className="font-extrabold text-xs sm:text-sm text-white tracking-tight">"{currentCoachQuote}"</p>
          </div>
        </div>
        <span className="text-[10px] font-mono font-bold text-cyan-400 bg-black/50 px-2.5 py-1 rounded-lg border border-cyan-500/20 hidden sm:inline">
          Fútbol Individual Activo
        </span>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          TAB 1: DASHBOARD & RUTINA DE FÚTBOL (NO GYM)
          ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6 animate-fade-in">
          {/* READINESS & SIMULADOR DE ENERGÍA */}
          <div className="glass-card rounded-3xl p-5 border border-cyan-500/30 bg-black/60 space-y-3 shadow-xl">
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-cyan-400 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-400" /> ESTADO DE RECUPERACIÓN Y DISPONIBILIDAD
              </span>
              <span className="px-3 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-400 font-mono text-xs font-black border border-emerald-500/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                ÓPTIMO PARA ENTRENAR ({readinessPhysical}%)
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2">
              {[
                { id: 'great', icon: <Zap className="w-4 h-4 text-amber-400" />, label: '100% (60m)' },
                { id: 'good', icon: <Activity className="w-4 h-4 text-emerald-400" />, label: 'Bien (45m)' },
                { id: 'neutral', icon: <Clock className="w-4 h-4 text-cyan-400" />, label: 'Normal (35m)' },
                { id: 'tired', icon: <ShieldCheck className="w-4 h-4 text-purple-400" />, label: 'Cansada (25m)' },
                { id: 'exhausted', icon: <AlertCircle className="w-4 h-4 text-red-400" />, label: 'Fatigada (15m)' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => handleMoodSelect(m.id as any)}
                  className={`p-2.5 rounded-2xl border text-center transition-all flex flex-col items-center gap-1.5 cursor-pointer ${
                    userMoodState === m.id
                      ? 'bg-cyan-500/20 text-white border-cyan-400 font-extrabold shadow-lg scale-102'
                      : 'bg-black/40 text-[var(--text-muted)] border-white/10 hover:text-white'
                  }`}
                >
                  {m.icon}
                  <span className="text-[9px] font-mono block leading-tight">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* MAIN FOOTBALL ROUTINE CARD & COMPLETE DASHBOARD SUMMARY */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-[var(--accent-color)]/60 space-y-6 relative overflow-hidden bg-gradient-to-b from-[var(--bg-card-solid)] via-[var(--bg-card)] to-[var(--bg-app)] shadow-2xl">
            {/* Header / Name & Goal */}
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1 flex-1">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-cyan-400 block">
                  RUTINA DE FÚTBOL ACTIVA DEL DÍA
                </span>
                {isEditingHeader ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={customPlanName}
                      onChange={e => setCustomPlanName(e.target.value)}
                      className="w-full bg-[var(--bg-input)] p-2 rounded-xl border border-cyan-400 text-base font-extrabold text-white outline-none"
                    />
                    <input
                      type="text"
                      value={customPlanGoal}
                      onChange={e => setCustomPlanGoal(e.target.value)}
                      className="w-full bg-[var(--bg-input)] p-2 rounded-xl border border-white/20 text-xs text-white outline-none"
                    />
                    <button onClick={() => setIsEditingHeader(false)} className="px-3 py-1 bg-emerald-500 text-black text-xs font-black rounded-lg">
                      Guardar Cambios
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-black text-xl sm:text-3xl text-white tracking-tight leading-tight">
                        {customPlanName}
                      </h2>
                      <button onClick={() => setIsEditingHeader(true)} className="text-[var(--text-muted)] hover:text-white p-1">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-xs sm:text-sm text-[var(--text-muted)] font-sans">{customPlanGoal}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-black/60 px-4 py-2 rounded-2xl border border-cyan-500/30 text-center">
                  <span className="text-[8px] font-mono text-[var(--text-muted)] font-bold block uppercase">DURACIÓN TOTAL</span>
                  <span className="font-mono text-lg font-black text-cyan-400">{activePlanMetrics.totalMin} min</span>
                </div>
                <div className="bg-black/60 px-4 py-2 rounded-2xl border border-purple-500/30 text-center">
                  <span className="text-[8px] font-mono text-[var(--text-muted)] font-bold block uppercase">EJERCICIOS</span>
                  <span className="font-mono text-lg font-black text-purple-300">{activePlanMetrics.count} bloques</span>
                </div>
              </div>
            </div>

            {/* DASHBOARD METRICS: PIERNA, SUPERFICIES, TOQUES, CARGA */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Card 1: Distribución por Pierna */}
              <div className="bg-black/60 p-4 rounded-2xl border border-cyan-500/30 space-y-2">
                <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-wider block">
                  PIERNA DE TRABAJO
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-xl font-black text-white">{activePlanMetrics.weakFootPct}% Pierna No Hábil</span>
                  <span className="text-xs font-mono text-[var(--text-muted)]">{activePlanMetrics.weakFootCount} de {activePlanMetrics.count} drills</span>
                </div>
                <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-white/10">
                  <div className="bg-gradient-to-r from-purple-500 to-cyan-400 h-full" style={{ width: `${activePlanMetrics.weakFootPct}%` }} />
                </div>
                {activePlanMetrics.count > 0 && activePlanMetrics.weakFootPct < 30 && (
                  <p className="text-[10px] text-amber-400 font-mono flex items-center gap-1">
                    Se recomienda mínimo 30% de pierna no hábil
                  </p>
                )}
              </div>

              {/* Card 2: Zonas & Superficies de Contacto */}
              <div className="bg-black/60 p-4 rounded-2xl border border-purple-500/30 space-y-2">
                <span className="text-[9px] font-mono font-bold text-purple-300 uppercase tracking-wider block">
                  SUPERFICIES DE CONTACTO
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {activePlanMetrics.contactSurfacesList.length > 0 ? (
                    activePlanMetrics.contactSurfacesList.map((surf, i) => (
                      <span key={i} className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold border border-purple-500/30 uppercase">
                        {surf}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[var(--text-muted)] font-mono">Agrega ejercicios para mapear zonas</span>
                  )}
                </div>
              </div>

              {/* Card 3: Toques Estimados & Cargas */}
              <div className="bg-black/60 p-4 rounded-2xl border border-emerald-500/30 space-y-2">
                <span className="text-[9px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  RENDIMIENTO ESTIMADO
                </span>
                <div className="text-xl font-black text-white font-mono">
                  ~{activePlanMetrics.estimatedTotalTouches} toques de balón
                </div>
                <div className="flex justify-between text-[10px] font-mono text-[var(--text-muted)]">
                  <span>Técnica: {activePlanMetrics.technicalPct}%</span>
                  <span>Cognitiva: {activePlanMetrics.cognitiveScore}%</span>
                </div>
              </div>
            </div>

            {/* INTERACTIVE DRILL LIST / STUDIO BUILDER */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-white">
                  BLOQUES DE LA RUTINA ({selectedDrillsForPlan.length})
                </span>

                <button
                  onClick={() => { sounds.playClick(); setShowAddDrillPanel(prev => !prev); }}
                  className="py-1.5 px-3 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500 hover:text-black transition-all rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer border border-cyan-500/30"
                >
                  <Plus className="w-4 h-4" /> Añadir Bloque de Fútbol
                </button>
              </div>

              {selectedDrillsForPlan.length === 0 ? (
                <div className="p-8 rounded-2xl border-2 border-dashed border-[var(--accent-color)]/40 text-center space-y-3 bg-black/30">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--accent-color)]/20 flex items-center justify-center mx-auto">
                    <Layers className="w-6 h-6 text-[var(--accent-color)]" />
                  </div>
                  <p className="text-sm font-bold text-white">Tu rutina está vacía.</p>
                  <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                    Añade ejercicios de la biblioteca o selecciona plantillas preparadas para armar tu rutina de fútbol.
                  </p>
                  <button
                    onClick={() => setShowAddDrillPanel(true)}
                    className="py-2.5 px-5 theme-accent-bg text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer mx-auto"
                  >
                    <Plus className="w-4 h-4" /> Añadir Primer Ejercicio
                  </button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDrillsForPlan.map((drill, index) => (
                    <div key={drill.id || index} className="glass-card rounded-2xl p-3.5 border border-[var(--border-subtle)] bg-black/50 hover:border-cyan-500/40 transition-all flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-xl theme-accent-bg text-black font-mono font-black text-xs flex items-center justify-center flex-shrink-0">
                          #{index + 1}
                        </span>
                        <div>
                          <h4 className="font-extrabold text-sm text-white leading-tight">{drill.name}</h4>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">
                            {drill.technicalObjective} · {drill.durationMin || 8} min · {drill.difficulty}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button onClick={() => handleMoveDrill(index, 'up')} className="p-1 text-[var(--text-muted)] hover:text-white">
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleMoveDrill(index, 'down')} className="p-1 text-[var(--text-muted)] hover:text-white">
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleRemoveDrill(index)} className="text-red-400 p-1.5 hover:bg-red-500/10 rounded-lg">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* SEARCH MODAL TO ADD DRILLS INSIDE DASHBOARD */}
              {showAddDrillPanel && (
                <div className="glass-card rounded-2xl p-4 border border-[var(--accent-color)]/50 bg-black/80 space-y-3 animate-fade-in shadow-2xl">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[var(--accent-color)] uppercase">🔍 Buscar Ejercicio para Añadir</span>
                    <button onClick={() => setShowAddDrillPanel(false)} className="text-[var(--text-muted)] hover:text-white text-xs">✕ Cerrar</button>
                  </div>
                  <input
                    type="text"
                    value={addDrillSearch}
                    onChange={e => setAddDrillSearch(e.target.value)}
                    placeholder="Buscar por nombre (ej. 'primer toque', 'escaneo', 'pie débil', 'filtrado')..."
                    className="w-full bg-[var(--bg-input)] px-4 py-2.5 rounded-xl border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-main)] outline-none focus:border-[var(--accent-color)]"
                  />
                  <div className="max-h-60 overflow-y-auto space-y-1.5 pr-1">
                    {FOOTBALL_DRILL_DATABASE
                      .filter(d => !selectedDrillsForPlan.some(s => s.id === d.id))
                      .filter(d => addDrillSearch.length < 2 || d.name.toLowerCase().includes(addDrillSearch.toLowerCase()) || d.technicalObjective.toLowerCase().includes(addDrillSearch.toLowerCase()))
                      .slice(0, 25)
                      .map(drill => (
                        <button
                          key={drill.id}
                          onClick={() => {
                            sounds.playClick();
                            setSelectedDrillsForPlan(prev => [...prev, drill]);
                            setAddDrillSearch('');
                          }}
                          className="w-full text-left p-3 rounded-xl bg-[var(--bg-input)] hover:bg-[var(--accent-color)]/20 border border-[var(--border-subtle)] transition-all flex items-start gap-3 cursor-pointer"
                        >
                          <span className="w-6 h-6 rounded-lg theme-accent-bg text-black font-mono font-black text-[9px] flex items-center justify-center flex-shrink-0 mt-0.5">+</span>
                          <div>
                            <p className="text-xs font-bold text-white leading-tight">{drill.name}</p>
                            <p className="text-[10px] text-[var(--text-muted)] font-mono">{drill.difficulty} · ⏱️ {drill.durationMin || 8} min · 🎯 {drill.technicalObjective}</p>
                          </div>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTONS: GUARDAR & EJECUTAR */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10">
              <button
                onClick={handleSaveCustomPlan}
                disabled={selectedDrillsForPlan.length === 0}
                className="py-3 px-5 bg-emerald-500 text-black font-black text-xs uppercase rounded-xl flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
              >
                <Save className="w-4 h-4" /> Guardar Rutina en Mis Planes
              </button>

              <button
                disabled={selectedDrillsForPlan.length === 0}
                onClick={() => {
                  if (onStartInteractiveWorkout && selectedDrillsForPlan.length > 0) {
                    onStartInteractiveWorkout({
                      id: `custom-${Date.now()}`,
                      dayShort: 'HOY',
                      dayFull: 'Hoy',
                      activityType: 'entrenamiento',
                      title: customPlanName,
                      durationMin: activePlanMetrics.totalMin,
                      status: 'today',
                      intensity: 'alta',
                      icon: 'Activity',
                      exerciseDetails: selectedDrillsForPlan as any
                    });
                  }
                }}
                className="w-full sm:w-auto py-3 px-8 theme-accent-bg text-black font-black text-sm uppercase rounded-xl theme-accent-glow flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shadow-xl"
              >
                <Play className="w-5 h-5 fill-current" /> ▶ INICIAR ENTRENAMIENTO DE FÚTBOL
              </button>
            </div>
          </div>

          {/* MIS RUTINAS GUARDADAS */}
          {savedCustomPlans.length > 0 && (
            <div className="space-y-3 pt-2">
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase block">
                💾 MIS RUTINAS GUARDADAS ({savedCustomPlans.length})
              </span>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {savedCustomPlans.map(plan => (
                  <div key={plan.id} className="glass-card rounded-2xl p-4 border border-[var(--border-subtle)] space-y-3 bg-black/40">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-extrabold text-sm text-[var(--text-main)]">{plan.name}</h4>
                        <p className="text-xs text-[var(--text-muted)]">🎯 {plan.targetGoal}</p>
                      </div>
                      <button onClick={() => handleRemoveSavedPlan(plan.id)} className="text-red-400 p-1 hover:bg-red-500/10 rounded-lg">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSelectedDrillsForPlan(plan.drills);
                        setCustomPlanName(plan.name);
                        setCustomPlanGoal(plan.targetGoal);
                      }}
                      className="w-full py-2 bg-cyan-500/20 text-cyan-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-cyan-500 hover:text-black transition-all"
                    >
                      <Check className="w-3.5 h-3.5" /> Cargar esta Rutina al Dashboard
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          TAB 2: BIBLIOTECA FÚTBOL (+500 DRILLS CATEGORIZADOS)
          ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'library' && (
        <div className="space-y-6 animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <h2 className="font-extrabold text-xl text-white flex items-center gap-2">
                <Brain className="w-6 h-6 text-cyan-400" /> Biblioteca de Fútbol ({getTotalDrills()} Ejercicios Reales)
              </h2>
              <p className="text-xs text-[var(--text-muted)]">
                Base de datos completa clasificada por fundamentos tácticos y técnicos.
              </p>
            </div>

            {compareDrillIds.length > 0 && (
              <button
                onClick={() => setShowComparatorModal(true)}
                className="py-2 px-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-black font-black text-xs uppercase rounded-xl flex items-center gap-2 shadow-lg animate-pulse"
              >
                <Scale className="w-4 h-4" /> Comparar ({compareDrillIds.length}/2)
              </button>
            )}
          </div>

          {/* 9 EXACT USER CATEGORY FILTERS */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[var(--text-muted)] block">
              FILTRAR POR CATEGORÍA ESPECÍFICA DE FÚTBOL
            </span>
            <div className="flex flex-wrap gap-2">
              {[
                { key: 'all', label: `Todos (${getTotalDrills()})` },
                { key: 'tecnica', label: 'Técnica & Ball Mastery' },
                { key: 'pase', label: 'Pase General' },
                { key: 'pase_filtrado', label: 'Pase Filtrado' },
                { key: 'pase_1_toque', label: 'Pase a 1 Intención' },
                { key: 'pase_2_toques', label: '2 Toques' },
                { key: 'control', label: 'Control & Primer Toque' },
                { key: 'tiro', label: 'Tiro & Finalización' },
                { key: 'escaneo', label: 'Escaneo (Método Jordet)' },
                { key: 'game_iq', label: 'Entendimiento del Juego (Game IQ)' },
              ].map(cat => (
                <button
                  key={cat.key}
                  onClick={() => { sounds.playClick(); setSelectedCategoryFilter(cat.key as CategoryFilterKey); }}
                  className={`px-3 py-2 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer border ${
                    selectedCategoryFilter === cat.key
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-md font-extrabold'
                      : 'bg-black/40 text-[var(--text-muted)] border-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH BAR & FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-4 top-3.5 text-cyan-400 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={e => setSearchFilter(e.target.value)}
                placeholder="Buscar por nombre o palabra clave (ej. 'conos', 'pared', 'pierna débil')..."
                className="w-full bg-[var(--bg-input)] pl-11 pr-4 py-3 rounded-2xl border border-[var(--border-subtle)] text-xs font-mono text-[var(--text-main)] outline-none focus:border-cyan-400"
              />
            </div>

            <button
              onClick={() => setWeakFootOnlyFilter(prev => !prev)}
              className={`px-4 py-3 rounded-2xl font-mono text-xs font-bold border transition-all cursor-pointer ${
                weakFootOnlyFilter ? 'bg-purple-500/20 text-purple-300 border-purple-400' : 'bg-black/40 text-[var(--text-muted)] border-white/10'
              }`}
            >
              Solo Pierna Débil
            </button>
          </div>

          <p className="text-[10px] font-mono text-[var(--text-muted)] font-bold">
            Mostrando {filteredLibrary.length} ejercicios reales de fútbol
          </p>

          {/* DRILLS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredLibrary.slice(0, 60).map((drill, index) => {
              const isSelectedForCompare = compareDrillIds.includes(drill.id);

              return (
                <div key={drill.id} className="glass-card hero-card-notion p-4 rounded-2xl border border-[var(--border-subtle)] space-y-3 bg-black/40 hover:border-cyan-500/50 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono text-[8px] font-black uppercase">
                        {drill.difficulty} · {drill.durationMin || 8} min
                      </span>

                      <button
                        onClick={() => handleToggleCompare(drill.id)}
                        className={`text-[9px] font-mono px-2 py-0.5 rounded border transition-all cursor-pointer ${
                          isSelectedForCompare ? 'bg-cyan-500 text-black font-black border-cyan-400' : 'text-[var(--text-muted)] border-white/10'
                        }`}
                      >
                        {isSelectedForCompare ? '✓ Comparando' : '+ Comparar'}
                      </button>
                    </div>

                    <h4 className="font-bold text-sm text-white">{drill.name}</h4>
                    <p className="text-xs text-[var(--text-muted)] line-clamp-2">{drill.technicalObjective}</p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => {
                        sounds.playClick();
                        setSelectedDrillsForPlan(prev => [...prev, drill]);
                        setActiveTab('dashboard');
                      }}
                      className="w-full py-2 bg-emerald-500/20 text-emerald-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1 hover:bg-emerald-500 hover:text-black transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Añadir a mi Rutina
                    </button>

                    <button
                      onClick={() => setSelectedDrillEntity(drill)}
                      className="w-full py-1.5 bg-black/60 text-[var(--text-muted)] hover:text-white font-mono text-[10px] rounded-xl flex items-center justify-center gap-1 border border-white/10 transition-all cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Ficha Detallada
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* DRILL ENTITY DEEP DIVE MODAL */}
          {selectedDrillEntity && (
            <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
              <div className="glass-card w-full max-w-2xl rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/50 bg-[var(--bg-card-solid)] space-y-5 my-8 relative shadow-2xl">
                <button
                  onClick={() => setSelectedDrillEntity(null)}
                  className="absolute top-6 right-6 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center font-mono font-bold hover:bg-red-500 transition-all border border-white/20 cursor-pointer"
                >
                  ✕
                </button>

                <div className="space-y-1">
                  <span className="text-[9px] font-mono font-bold text-cyan-400 uppercase tracking-widest block">
                    ENTIDAD DE EJERCICIO TÁCTICO · APEX FEMME
                  </span>
                  <h2 className="font-black text-2xl text-white">{selectedDrillEntity.name}</h2>
                  <p className="text-xs text-[var(--text-muted)] font-mono">Dificultad: {selectedDrillEntity.difficulty} · Duración sugerida: {selectedDrillEntity.durationMin || 8} min</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-black/60 p-4 rounded-2xl border border-cyan-500/30 space-y-1">
                    <span className="text-[9px] text-cyan-400 font-bold uppercase block">🎯 OBJETIVO TÉCNICO</span>
                    <p className="text-white text-[11px]">{selectedDrillEntity.technicalObjective}</p>
                  </div>
                  <div className="bg-black/60 p-4 rounded-2xl border border-purple-500/30 space-y-1">
                    <span className="text-[9px] text-purple-300 font-bold uppercase block">🧠 OBJETIVO TÁCTICO</span>
                    <p className="text-white text-[11px]">{selectedDrillEntity.tacticalObjective}</p>
                  </div>
                </div>

                <div className="bg-black/60 p-4 rounded-2xl border border-amber-500/30 text-xs font-mono space-y-2">
                  <span className="text-[9px] text-amber-400 font-bold uppercase block">COACHING CUES & INSTRUCCIONES</span>
                  <ul className="list-disc list-inside space-y-1 text-white text-[11px]">
                    {selectedDrillEntity.coachingCues.map((cue, i) => (
                      <li key={i}>{cue}</li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => {
                    sounds.playSuccess();
                    setSelectedDrillsForPlan(prev => [...prev, selectedDrillEntity]);
                    setSelectedDrillEntity(null);
                    setActiveTab('dashboard');
                  }}
                  className="w-full py-3 theme-accent-bg text-black font-black text-xs uppercase rounded-xl theme-accent-glow cursor-pointer"
                >
                  ➕ Añadir este Ejercicio a mi Rutina
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          TAB 3: REGISTRO DE PROGRESIÓN FUTBOLÍSTICA REAL
          ═════════════════════════════════════════════════════════════ */}
      {activeTab === 'evolution' && (
        <div className="space-y-6 animate-fade-in">
          <div className="border-b border-[var(--border-subtle)] pb-3">
            <h2 className="font-extrabold text-xl text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" /> Registro de Progresión Futbolística
            </h2>
            <p className="text-xs text-[var(--text-muted)]">
              Estadísticas reales acumuladas exclusivamente a partir de tus entrenamientos completados.
            </p>
          </div>

          {/* REAL STATS HERO GRID */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="glass-card rounded-2xl p-4 border border-cyan-500/30 bg-black/60 text-center space-y-1">
              <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase block font-bold">SESIONES COMPLETADAS</span>
              <span className="font-mono text-2xl font-black text-cyan-400">{realCareerMetrics.count}</span>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-purple-500/30 bg-black/60 text-center space-y-1">
              <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase block font-bold">HORAS EN CANCHA</span>
              <span className="font-mono text-2xl font-black text-purple-300">{realCareerMetrics.totalHours} h</span>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-emerald-500/30 bg-black/60 text-center space-y-1">
              <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase block font-bold">TOQUES ESTIMADOS</span>
              <span className="font-mono text-2xl font-black text-emerald-400">~{realCareerMetrics.totalTouches}</span>
            </div>
            <div className="glass-card rounded-2xl p-4 border border-amber-500/30 bg-black/60 text-center space-y-1">
              <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase block font-bold">% PIERNA DÉBIL</span>
              <span className="font-mono text-2xl font-black text-amber-400">{realCareerMetrics.weakFootPct}%</span>
            </div>
          </div>

          {/* WORKOUTS LOG HISTORY */}
          <div className="glass-card rounded-3xl p-6 border border-cyan-500/30 bg-black/50 space-y-4">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-cyan-400 block">
              HISTORIAL DE ENTRENAMIENTOS REALIZADOS
            </span>

            {completedWorkoutsHistory.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <CompassIcon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-white">Aún no has registrado ningún entrenamiento completado.</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                  Ejecuta tu primera rutina desde el Dashboard para comenzar a construir tu historial de progresión futbolística.
                </p>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className="py-2.5 px-5 theme-accent-bg text-black font-black text-xs uppercase rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" /> Ir al Dashboard de Rutina
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {completedWorkoutsHistory.map((item, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-black/60 border border-white/10 flex justify-between items-center">
                    <div>
                      <h4 className="font-bold text-sm text-white">{item.title || 'Entrenamiento de Fútbol'}</h4>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">⏱️ {item.durationMin || 30} min · Completed</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">✓ Completado</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
