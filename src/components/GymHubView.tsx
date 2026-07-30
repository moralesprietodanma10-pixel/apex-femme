import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, PersonalRecord, ScheduleDay } from '../types';
import {
  Dumbbell, Plus, Trash2, Check, ChevronDown, ChevronUp,
  ShieldCheck, Trophy, Calculator, Zap, BarChart3, Flame,
  Clock, Play, Pause, RotateCcw, ChevronRight, Star,
  TrendingUp, Target, ArrowUp, AlertTriangle, Info,
  BookOpen, Activity, CheckCircle2, Edit3, Save, X
} from 'lucide-react';
import { InteractiveWorkoutModal } from './InteractiveWorkoutModal';
import { TRAINING_PRESETS, DRILLS_GYM_POWER } from '../data/trainingPresets';
import { sounds } from '../services/soundEffects';

interface GymHubViewProps {
  playerProfile: PlayerProfile;
  onUpdateProfile: (data: Partial<PlayerProfile>) => void;
}

/* ── RPE Scale data ──────────────────────────────────────────── */
const RPE_SCALE = [
  { score: 1,  label: 'Muy Fácil',       color: '#22C55E', description: 'Descanso activo. Sin esfuerzo.', rest: '0 min', emoji: '😴' },
  { score: 2,  label: 'Fácil',           color: '#4ADE80', description: 'Movilidad suave. Podrías hablar perfectamente.', rest: '0 min', emoji: '😊' },
  { score: 3,  label: 'Moderado',        color: '#86EFAC', description: 'Calentamiento. Conversación cómoda.', rest: '1 min', emoji: '🙂' },
  { score: 4,  label: 'Algo Duro',       color: '#FDE68A', description: 'Ritmo de entrenamiento base.', rest: '1 min', emoji: '😐' },
  { score: 5,  label: 'Duro',            color: '#FCD34D', description: 'Esfuerzo claro. Hablas con dificultad.', rest: '2 min', emoji: '😅' },
  { score: 6,  label: 'Muy Duro',        color: '#FBBF24', description: 'Resistencia de alta intensidad.', rest: '2-3 min', emoji: '😤' },
  { score: 7,  label: 'Muy Duro+',       color: '#F97316', description: 'Cerca del límite. Pocas reps posibles.', rest: '3 min', emoji: '🥵' },
  { score: 8,  label: 'Extremadamente Duro', color: '#EF4444', description: 'Solo 2-3 reps más posibles (RIR 2).', rest: '3-5 min', emoji: '😰' },
  { score: 9,  label: 'Máximo Casi',     color: '#DC2626', description: '1 rep más posible. Al límite total.', rest: '5 min', emoji: '🤯' },
  { score: 10, label: 'Esfuerzo Máximo', color: '#991B1B', description: 'Fallo muscular absoluto.', rest: '5-7 min', emoji: '💀' },
];

/* ── 1RM percentage targets ──────────────────────────────────── */
const ONE_RM_PERCENTAGES = [
  { pct: 100, label: '1RM Máximo',    reps: 1,   zone: 'Fuerza Máxima' },
  { pct: 95,  label: '95% 1RM',       reps: 2,   zone: 'Fuerza Máxima' },
  { pct: 90,  label: '90% 1RM',       reps: 3,   zone: 'Fuerza Máxima' },
  { pct: 85,  label: '85% 1RM',       reps: 5,   zone: 'Fuerza Pesada' },
  { pct: 80,  label: '80% 1RM',       reps: 6,   zone: 'Hipertrofia Élite' },
  { pct: 75,  label: '75% 1RM',       reps: 8,   zone: 'Hipertrofia' },
  { pct: 70,  label: '70% 1RM',       reps: 10,  zone: 'Hipertrofia/Resistencia' },
  { pct: 65,  label: '65% 1RM',       reps: 12,  zone: 'Resistencia Muscular' },
  { pct: 60,  label: '60% 1RM',       reps: 15,  zone: 'Resistencia' },
];

/* ── PR exercises list ───────────────────────────────────────── */
const PR_EXERCISES = [
  'Sentadilla Búlgara', 'Hip Thrust', 'Prensa 45°', 'Peso Muerto Rumano',
  'Curl Nórdico Excéntrico', 'Sentadilla con Barra', 'Zancada con Mancuerna',
  'Pallof Press', 'Estocadas', 'Peso Muerto Convencional'
];

/* ── Custom Routine Exercise ─────────────────────────────────── */
interface CustomExercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  weightKg: number;
  rest: number;
  note?: string;
}

export const GymHubView: React.FC<GymHubViewProps> = ({ playerProfile, onUpdateProfile }) => {
  const [activeSection, setActiveSection] = useState<'routine' | '1rm' | 'rpe' | 'pr' | 'custom'>('routine');

  // ── Interactive Workout Modal ──────────────────────────────
  const [workoutDay, setWorkoutDay] = useState<ScheduleDay | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);

  // ── 1RM Calculator ────────────────────────────────────────
  const [rmWeight, setRmWeight] = useState<string>('60');
  const [rmReps, setRmReps]     = useState<string>('8');
  const oneRM = rmWeight && rmReps
    ? Math.round(parseFloat(rmWeight) * (1 + parseFloat(rmReps) / 30))
    : 0;

  // ── RPE Calculator ────────────────────────────────────────
  const [rpeScore, setRpeScore]       = useState<number>(7);
  const [rpeDuration, setRpeDuration] = useState<string>('60');
  const rpeData = RPE_SCALE.find(r => r.score === rpeScore)!;
  const trainingLoad = rpeScore * (parseFloat(rpeDuration) || 0);

  // ── Personal Records ──────────────────────────────────────
  const [prs, setPrs] = useState<PersonalRecord[]>(() => {
    try {
      const saved = localStorage.getItem('apex_femme_prs');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [prExercise, setPrExercise] = useState(PR_EXERCISES[0]);
  const [prWeight, setPrWeight]     = useState<string>('');
  const [prReps, setPrReps]         = useState<string>('1');

  const savePrs = (newPrs: PersonalRecord[]) => {
    setPrs(newPrs);
    localStorage.setItem('apex_femme_prs', JSON.stringify(newPrs));
  };

  const addPr = () => {
    if (!prWeight || parseFloat(prWeight) <= 0) return;
    sounds.playClick();
    const newPr: PersonalRecord = {
      id: `pr-${Date.now()}`,
      exerciseName: prExercise,
      weightKg: parseFloat(prWeight),
      reps: parseInt(prReps) || 1,
      date: new Date().toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' })
    };
    savePrs([newPr, ...prs]);
    setPrWeight('');
  };

  const deletePr = (id: string) => {
    sounds.playClick();
    savePrs(prs.filter(p => p.id !== id));
  };

  // ── Custom Routine Builder ────────────────────────────────
  const [customExercises, setCustomExercises] = useState<CustomExercise[]>([]);
  const [newEx, setNewEx] = useState<Partial<CustomExercise>>({
    name: '', sets: 3, reps: 10, weightKg: 20, rest: 60
  });
  const [savedRoutines, setSavedRoutines] = useState<{ name: string; exercises: CustomExercise[] }[]>(() => {
    try {
      const saved = localStorage.getItem('apex_femme_custom_routines');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [routineName, setRoutineName] = useState('Mi Rutina Personalizada');
  const [showSaveForm, setShowSaveForm] = useState(false);

  const addCustomExercise = () => {
    if (!newEx.name) return;
    sounds.playClick();
    setCustomExercises(prev => [...prev, {
      id: `cex-${Date.now()}`,
      name: newEx.name!,
      sets: newEx.sets || 3,
      reps: newEx.reps || 10,
      weightKg: newEx.weightKg || 0,
      rest: newEx.rest || 60,
    }]);
    setNewEx({ name: '', sets: 3, reps: 10, weightKg: 20, rest: 60 });
  };

  const removeCustomExercise = (id: string) => {
    setCustomExercises(prev => prev.filter(e => e.id !== id));
  };

  const saveCustomRoutine = () => {
    if (!routineName || customExercises.length === 0) return;
    sounds.playLevelUp();
    const updated = [{ name: routineName, exercises: customExercises }, ...savedRoutines];
    setSavedRoutines(updated);
    localStorage.setItem('apex_femme_custom_routines', JSON.stringify(updated));
    setShowSaveForm(false);
    setCustomExercises([]);
  };

  const startCustomRoutine = (exercises: CustomExercise[], name: string) => {
    const day: ScheduleDay = {
      id: `custom-${Date.now()}`,
      dayShort: 'HOY',
      dayFull: 'Hoy',
      activityType: 'gimnasio',
      title: name,
      durationMin: exercises.length * 15,
      status: 'today',
      intensity: 'alta',
      icon: 'Dumbbell',
      exerciseDetails: exercises.map((ex, i) => ({
        id: `ex-${i}`,
        name: ex.name,
        targetSets: ex.sets,
        defaultReps: ex.reps,
        defaultWeightKg: ex.weightKg,
        restSeconds: ex.rest,
        targetMuscles: [],
      }))
    };
    setWorkoutDay(day);
    setShowWorkoutModal(true);
  };

  const startPresetRoutine = (presetId: string) => {
    const preset = TRAINING_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    const gymDays = preset.schedule.filter(d => d.activityType === 'gimnasio' || d.activityType === 'entrenamiento');
    if (gymDays.length === 0) return;
    const day = { ...gymDays[0], status: 'today' as const };
    setWorkoutDay(day);
    setShowWorkoutModal(true);
  };

  /* ── SECTIONS: nav tabs ───────────────────────────────────── */
  const sections = [
    { id: 'routine', label: 'Mi Rutina',    icon: Dumbbell },
    { id: '1rm',     label: 'Calc. 1RM',   icon: Calculator },
    { id: 'rpe',     label: 'RPE / Borg',  icon: Activity },
    { id: 'pr',      label: 'PRs',          icon: Trophy },
    { id: 'custom',  label: 'Crear',        icon: Plus },
  ] as const;

  return (
    <div className="space-y-5 pb-32 max-w-4xl mx-auto animate-fade-in">

      {/* ── Page Header ────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl glass-card p-6 border border-[var(--accent-color)]/40 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent-color)]/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="theme-accent-bg p-2 rounded-xl text-black">
                <Dumbbell className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-black font-mono theme-accent-bg px-2.5 py-0.5 rounded-lg uppercase tracking-wider text-black">
                HUB DE ENTRENAMIENTO
              </span>
            </div>
            <h2 className="font-black text-2xl md:text-3xl text-[var(--text-main)] tracking-tight">
              ¿Qué debo entrenar hoy?
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              Selecciona tu rutina periodizada según tu posición ({playerProfile.position}) y fase del ciclo menstrual.
            </p>
          </div>
          <div className="text-right bg-[var(--bg-input)] px-4 py-2 rounded-2xl border border-[var(--border-subtle)] self-end sm:self-auto">
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Atributo Físico</p>
            <p className="font-mono text-2xl font-black theme-accent-text">{playerProfile.attributes?.physical ?? 79}</p>
            <p className="text-[9px] font-bold text-emerald-400">OVR Fuerza & Potencia</p>
          </div>
        </div>
      </section>

      {/* ── Sub-nav ────────────────────────────────────────── */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {sections.map(s => {
          const Icon = s.icon;
          const isActive = activeSection === s.id;
          return (
            <button
              key={s.id}
              onClick={() => { sounds.playClick(); setActiveSection(s.id); }}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap border transition-all ${
                isActive
                  ? 'theme-accent-bg border-transparent neon-breathe'
                  : 'bg-[var(--bg-card)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:opacity-100'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════
          SECTION 1: MI RUTINA (Presets)
      ══════════════════════════════════════════════════════ */}
      {activeSection === 'routine' && (
        <div className="space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider theme-accent-text flex items-center gap-2">
            <BookOpen className="w-4 h-4" /> Planes de Entrenamiento Disponibles
          </h3>

          {TRAINING_PRESETS.map(preset => (
            <div key={preset.id} className="glass-card rounded-2xl p-5 border border-[var(--border-card)] space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{preset.icon}</span>
                  <div>
                    <h4 className="font-black text-base text-[var(--text-main)]">{preset.title}</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5 max-w-sm">{preset.description}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${preset.badgeColor}`}>
                  {preset.category.toUpperCase()}
                </span>
              </div>

              {/* Weekly Schedule */}
              <div className="grid grid-cols-7 gap-1">
                {preset.schedule.map(day => (
                  <div key={day.id} className="flex flex-col items-center gap-1">
                    <span className="text-[9px] font-bold text-[var(--text-muted)]">{day.dayShort}</span>
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm border ${
                        day.activityType === 'descanso'
                          ? 'bg-[var(--bg-input)] border-[var(--border-subtle)] opacity-40'
                          : day.activityType === 'partido'
                          ? 'bg-emerald-500/20 border-emerald-500/40'
                          : day.activityType === 'recuperacion'
                          ? 'bg-cyan-500/20 border-cyan-500/40'
                          : 'bg-[var(--accent-color)]/20 border-[var(--accent-color)]/40'
                      }`}
                    >
                      {day.activityType === 'descanso' ? '💤' :
                       day.activityType === 'partido'   ? '⚽' :
                       day.activityType === 'recuperacion' ? '🧘' : '🏋️'}
                    </div>
                    <span className="text-[8px] text-[var(--text-muted)] text-center leading-tight hidden sm:block">
                      {day.durationMin > 0 ? `${day.durationMin}m` : '--'}
                    </span>
                  </div>
                ))}
              </div>

              {/* Exercises list */}
              {preset.schedule.filter(d => d.exerciseDetails && d.exerciseDetails.length > 0).slice(0, 1).map(day => (
                <div key={day.id} className="space-y-2">
                  <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
                    📋 Ejercicios del Día de Gym (ejemplo {day.dayFull}):
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {day.exerciseDetails!.map(ex => (
                      <div key={ex.id} className="bg-[var(--bg-input)] rounded-xl p-3 border border-[var(--border-subtle)] flex items-start gap-2">
                        <div className="w-7 h-7 rounded-lg bg-[var(--accent-color)]/20 flex items-center justify-center shrink-0 mt-0.5">
                          <Dumbbell className="w-3.5 h-3.5 theme-accent-text" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-bold text-[var(--text-main)] truncate">{ex.name}</p>
                            {ex.evidenceLevel && (
                              <span className="text-[8px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400">
                                🔬 {ex.evidenceLevel}
                              </span>
                            )}
                          </div>
                          <p className="text-[9px] text-[var(--text-muted)] font-mono">
                            {ex.targetSets} series × {ex.defaultReps} reps
                            {ex.defaultWeightKg ? ` • ${ex.defaultWeightKg} kg` : ''}
                            {' • '}{ex.restSeconds}s descanso
                          </p>
                          {ex.injuryPreventionTag && (
                            <p className="text-[8px] text-amber-400 mt-0.5 flex items-center gap-1">
                              <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                              {ex.injuryPreventionTag}
                            </p>
                          )}
                          {ex.citation && (
                            <p className="text-[8px] text-emerald-400/90 font-mono mt-0.5 truncate">
                              📚 {ex.citation}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              <button
                onClick={() => startPresetRoutine(preset.id)}
                className="w-full theme-accent-bg py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider theme-accent-glow active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4" />
                🚀 Iniciar Sesión Interactiva en Vivo
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 2: CALCULADORA 1RM
      ══════════════════════════════════════════════════════ */}
      {activeSection === '1rm' && (
        <div className="space-y-5">
          <h3 className="font-extrabold text-sm uppercase tracking-wider theme-accent-text flex items-center gap-2">
            <Calculator className="w-4 h-4" /> Calculadora de Repetición Máxima (1RM)
          </h3>

          <div className="glass-card rounded-2xl p-5 border border-[var(--accent-color)]/30 space-y-4">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              Introduce el peso que levantaste y las repeticiones que lograste. Se usará la{' '}
              <span className="font-bold text-[var(--text-main)]">Fórmula Epley</span>{' '}
              para estimar tu máximo teórico de 1 repetición.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1.5">
                  Peso Levantado (kg)
                </label>
                <input
                  type="number"
                  min="1"
                  value={rmWeight}
                  onChange={e => setRmWeight(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border-2 border-[var(--accent-color)]/40 focus:border-[var(--accent-color)] rounded-xl px-4 py-3 text-xl font-black font-mono text-[var(--text-main)] outline-none text-center transition-colors"
                  placeholder="60"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1.5">
                  Repeticiones Logradas
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={rmReps}
                  onChange={e => setRmReps(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border-2 border-[var(--accent-color)]/40 focus:border-[var(--accent-color)] rounded-xl px-4 py-3 text-xl font-black font-mono text-[var(--text-main)] outline-none text-center transition-colors"
                  placeholder="8"
                />
              </div>
            </div>

            {/* 1RM Result */}
            {oneRM > 0 && (
              <div className="bg-[var(--accent-color)]/10 border-2 border-[var(--accent-color)] rounded-2xl p-5 text-center neon-breathe">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Tu 1RM Estimado</p>
                <p className="font-black text-5xl theme-accent-text font-mono">{oneRM}<span className="text-xl ml-1">kg</span></p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">Fórmula Epley: Peso × (1 + Reps ÷ 30)</p>
              </div>
            )}

            {/* Percentage Table */}
            {oneRM > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">📊 Zonas de Entrenamiento Recomendadas:</p>
                <div className="space-y-1.5">
                  {ONE_RM_PERCENTAGES.map(row => {
                    const kg = Math.round(oneRM * row.pct / 100);
                    const isMain = row.pct === 80 || row.pct === 75;
                    return (
                      <div
                        key={row.pct}
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                          isMain
                            ? 'bg-[var(--accent-color)]/10 border-[var(--accent-color)]/40 font-black'
                            : 'bg-[var(--bg-card-solid)] border-[var(--border-subtle)]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-10 text-xs font-mono font-black ${isMain ? 'theme-accent-text' : 'text-[var(--text-muted)]'}`}>
                            {row.pct}%
                          </span>
                          <div>
                            <p className={`text-xs font-bold ${isMain ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'}`}>
                              {row.zone}
                            </p>
                            <p className="text-[9px] text-[var(--text-muted)]">{row.reps} reps por serie</p>
                          </div>
                        </div>
                        <span className={`font-mono font-black text-sm ${isMain ? 'theme-accent-text' : 'text-[var(--text-main)]'}`}>
                          {kg} kg
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 3: RPE / BORG SCALE
      ══════════════════════════════════════════════════════ */}
      {activeSection === 'rpe' && (
        <div className="space-y-5">
          <h3 className="font-extrabold text-sm uppercase tracking-wider theme-accent-text flex items-center gap-2">
            <Activity className="w-4 h-4" /> Calculadora RPE & Escala de Borg
          </h3>

          <div className="glass-card rounded-2xl p-5 border border-[var(--accent-color)]/30 space-y-5">
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              El <span className="font-bold text-[var(--text-main)]">RPE (Rating of Perceived Exertion)</span> mide cuánto te costó el entrenamiento del 1 al 10. Multiplicado por los minutos entrenados da la{' '}
              <span className="font-bold text-[var(--text-main)]">Carga de Entrenamiento</span> del día.
            </p>

            {/* RPE Slider */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase">Selecciona tu RPE de hoy</label>
                <span
                  className="font-mono text-2xl font-black px-3 py-1 rounded-xl"
                  style={{ color: rpeData.color, background: `${rpeData.color}20`, border: `1.5px solid ${rpeData.color}50` }}
                >
                  {rpeScore}
                </span>
              </div>

              {/* RPE Buttons */}
              <div className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
                {RPE_SCALE.map(r => (
                  <button
                    key={r.score}
                    onClick={() => setRpeScore(r.score)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl border transition-all text-center ${
                      rpeScore === r.score
                        ? 'scale-105 font-black border-2 shadow-lg'
                        : 'opacity-60 hover:opacity-100 bg-[var(--bg-card-solid)] border-[var(--border-subtle)]'
                    }`}
                    style={rpeScore === r.score ? {
                      background: `${r.color}20`,
                      borderColor: r.color,
                      boxShadow: `0 0 12px ${r.color}55`
                    } : {}}
                  >
                    <span className="text-base">{r.emoji}</span>
                    <span className="font-mono text-xs font-black" style={{ color: r.color }}>{r.score}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* RPE Result Card */}
            <div
              className="rounded-2xl p-4 border-2 space-y-2"
              style={{ background: `${rpeData.color}10`, borderColor: `${rpeData.color}60` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-[var(--text-muted)] uppercase">Nivel de Esfuerzo</p>
                  <p className="font-black text-xl" style={{ color: rpeData.color }}>
                    {rpeData.emoji} {rpeData.label}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Descanso Post-Sesión</p>
                  <p className="font-mono font-black text-sm" style={{ color: rpeData.color }}>{rpeData.rest}</p>
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] italic leading-relaxed">{rpeData.description}</p>
            </div>

            {/* Duration + Training Load */}
            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1.5">
                Duración de la sesión (minutos)
              </label>
              <input
                type="number"
                min="1"
                value={rpeDuration}
                onChange={e => setRpeDuration(e.target.value)}
                className="w-full bg-[var(--bg-input)] border-2 border-[var(--accent-color)]/40 focus:border-[var(--accent-color)] rounded-xl px-4 py-3 text-xl font-black font-mono text-[var(--text-main)] outline-none text-center"
                placeholder="60"
              />
            </div>

            {trainingLoad > 0 && (
              <div className="bg-[var(--accent-color)]/10 border-2 border-[var(--accent-color)] rounded-2xl p-5 text-center neon-breathe">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Carga de Entrenamiento del Día</p>
                <p className="font-black text-4xl theme-accent-text font-mono">{trainingLoad}</p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">RPE ({rpeScore}) × Duración ({rpeDuration} min)</p>
                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  {[
                    { label: 'Bajo', range: '<150', color: '#22C55E' },
                    { label: 'Óptimo', range: '150–400', color: '#EAB308' },
                    { label: 'Alto', range: '>400', color: '#EF4444' },
                  ].map(z => (
                    <div key={z.label} className="text-xs p-1.5 rounded-lg" style={{ background: `${z.color}15`, color: z.color }}>
                      <span className="font-black block">{z.label}</span>
                      <span className="text-[9px]">{z.range}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[9px] text-[var(--text-muted)] mt-2 font-bold">
                  {trainingLoad < 150 ? '🟢 Sesión de recuperación / baja carga' :
                   trainingLoad <= 400 ? '🟡 Zona óptima de entrenamiento' :
                   '🔴 Alta carga – prioriza recuperación mañana'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 4: RÉCORDS PERSONALES (PRs)
      ══════════════════════════════════════════════════════ */}
      {activeSection === 'pr' && (
        <div className="space-y-5">
          <h3 className="font-extrabold text-sm uppercase tracking-wider theme-accent-text flex items-center gap-2">
            <Trophy className="w-4 h-4" /> Mis Récords Personales (PRs)
          </h3>

          {/* Add PR Form */}
          <div className="glass-card rounded-2xl p-5 border border-[var(--accent-color)]/30 space-y-4">
            <p className="text-xs font-bold theme-accent-text uppercase tracking-wider">📌 Registrar nuevo récord</p>

            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1.5">Ejercicio</label>
              <select
                value={prExercise}
                onChange={e => setPrExercise(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--accent-color)]/40 rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--text-main)] outline-none"
              >
                {PR_EXERCISES.map(ex => (
                  <option key={ex} value={ex} className="bg-[var(--bg-card-solid)]">{ex}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1.5">Peso (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={prWeight}
                  onChange={e => setPrWeight(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--accent-color)]/40 focus:border-[var(--accent-color)] rounded-xl px-3 py-2.5 text-lg font-black font-mono text-[var(--text-main)] outline-none text-center"
                  placeholder="80"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1.5">Reps</label>
                <input
                  type="number"
                  min="1"
                  value={prReps}
                  onChange={e => setPrReps(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--accent-color)]/40 focus:border-[var(--accent-color)] rounded-xl px-3 py-2.5 text-lg font-black font-mono text-[var(--text-main)] outline-none text-center"
                  placeholder="1"
                />
              </div>
            </div>

            <button
              onClick={addPr}
              disabled={!prWeight}
              className="w-full theme-accent-bg py-3 rounded-2xl font-black text-xs uppercase tracking-wider theme-accent-glow active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Guardar Récord Personal
            </button>
          </div>

          {/* PRs List */}
          {prs.length === 0 ? (
            <div className="glass-card rounded-2xl p-8 text-center border border-[var(--border-card)]">
              <Trophy className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
              <p className="text-sm font-bold text-[var(--text-muted)]">No tienes récords personales aún</p>
              <p className="text-xs text-[var(--text-muted)] mt-1">Registra tu primer PR arriba ⬆️</p>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase px-1">🏆 {prs.length} récords registrados</p>
              {prs.map((pr, idx) => (
                <div
                  key={pr.id}
                  className={`glass-card rounded-2xl p-4 border flex items-center justify-between gap-3 transition-all ${
                    idx === 0 ? 'border-[var(--accent-color)]/50 bg-[var(--accent-color)]/5' : 'border-[var(--border-card)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {idx === 0 && (
                      <div className="w-8 h-8 rounded-full theme-accent-bg flex items-center justify-center shrink-0 font-black text-base">
                        🥇
                      </div>
                    )}
                    {idx === 1 && (
                      <div className="w-8 h-8 rounded-full bg-slate-400/20 border border-slate-400/40 flex items-center justify-center shrink-0 font-black text-base">
                        🥈
                      </div>
                    )}
                    {idx > 1 && (
                      <div className="w-8 h-8 rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] flex items-center justify-center shrink-0 font-mono font-black text-xs text-[var(--text-muted)]">
                        #{idx + 1}
                      </div>
                    )}
                    <div>
                      <p className={`text-sm font-black ${idx === 0 ? 'theme-accent-text' : 'text-[var(--text-main)]'}`}>
                        {pr.exerciseName}
                      </p>
                      <p className="text-[10px] text-[var(--text-muted)] font-mono">
                        {pr.reps} rep{pr.reps > 1 ? 's' : ''} • {pr.date}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`font-mono font-black text-xl ${idx === 0 ? 'theme-accent-text' : 'text-[var(--text-main)]'}`}>
                      {pr.weightKg}<span className="text-xs font-normal text-[var(--text-muted)]"> kg</span>
                    </span>
                    <button
                      onClick={() => deletePr(pr.id)}
                      className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════
          SECTION 5: CREAR RUTINA PERSONALIZADA
      ══════════════════════════════════════════════════════ */}
      {activeSection === 'custom' && (
        <div className="space-y-5">
          <h3 className="font-extrabold text-sm uppercase tracking-wider theme-accent-text flex items-center gap-2">
            <Plus className="w-4 h-4" /> Crear Rutina Personalizada
          </h3>

          {/* Add Exercise Form */}
          <div className="glass-card rounded-2xl p-5 border border-[var(--accent-color)]/30 space-y-3">
            <p className="text-xs font-bold theme-accent-text uppercase tracking-wider">➕ Añadir ejercicio a la rutina</p>

            <div>
              <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block mb-1">Nombre del Ejercicio</label>
              <input
                type="text"
                value={newEx.name || ''}
                onChange={e => setNewEx(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-[var(--bg-input)] border border-[var(--accent-color)]/40 focus:border-[var(--accent-color)] rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--text-main)] outline-none"
                placeholder="ej. Sentadilla Goblet"
                list="exercise-suggestions"
              />
              <datalist id="exercise-suggestions">
                {PR_EXERCISES.map(e => <option key={e} value={e} />)}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { key: 'sets', label: 'Series', placeholder: '4', min: 1, max: 10 },
                { key: 'reps', label: 'Reps', placeholder: '10', min: 1, max: 50 },
                { key: 'weightKg', label: 'Peso kg', placeholder: '20', min: 0, max: 500 },
                { key: 'rest', label: 'Descanso s', placeholder: '60', min: 0, max: 600 },
              ].map(field => (
                <div key={field.key}>
                  <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase block mb-1">{field.label}</label>
                  <input
                    type="number"
                    min={field.min}
                    max={field.max}
                    value={(newEx as any)[field.key] ?? ''}
                    onChange={e => setNewEx(p => ({ ...p, [field.key]: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] focus:border-[var(--accent-color)] rounded-xl px-2 py-2 text-sm font-mono font-black text-[var(--text-main)] outline-none text-center"
                    placeholder={field.placeholder}
                  />
                </div>
              ))}
            </div>

            <button
              onClick={addCustomExercise}
              disabled={!newEx.name}
              className="w-full theme-accent-bg py-3 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 transition-transform disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" /> Agregar Ejercicio
            </button>
          </div>

          {/* Current Routine */}
          {customExercises.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-[var(--text-muted)] uppercase">{customExercises.length} ejercicios en tu rutina</p>
              </div>

              {customExercises.map((ex, idx) => (
                <div key={ex.id} className="glass-card rounded-xl p-3 border border-[var(--border-card)] flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/40 flex items-center justify-center font-mono font-black text-xs theme-accent-text shrink-0">
                      {idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-black text-[var(--text-main)]">{ex.name}</p>
                      <p className="text-[9px] font-mono text-[var(--text-muted)]">
                        {ex.sets}×{ex.reps} reps • {ex.weightKg}kg • {ex.rest}s descanso
                      </p>
                    </div>
                  </div>
                  <button onClick={() => removeCustomExercise(ex.id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => startCustomRoutine(customExercises, routineName)}
                  className="flex-1 theme-accent-bg py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider theme-accent-glow active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" /> 🚀 Iniciar Sesión en Vivo
                </button>
                <button
                  onClick={() => setShowSaveForm(!showSaveForm)}
                  className="px-4 py-3.5 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] font-bold text-xs flex items-center gap-1.5 hover:border-[var(--accent-color)] transition-colors"
                >
                  <Save className="w-4 h-4" /> Guardar
                </button>
              </div>

              {showSaveForm && (
                <div className="glass-card p-4 rounded-2xl border border-[var(--accent-color)]/30 space-y-3">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">Nombre de la rutina</label>
                  <input
                    value={routineName}
                    onChange={e => setRoutineName(e.target.value)}
                    className="w-full bg-[var(--bg-input)] border border-[var(--accent-color)]/40 rounded-xl px-3 py-2.5 text-sm font-bold text-[var(--text-main)] outline-none"
                    placeholder="Mi Rutina de Fuerza"
                  />
                  <button
                    onClick={saveCustomRoutine}
                    className="w-full theme-accent-bg py-2.5 rounded-xl font-black text-xs uppercase tracking-wider active:scale-95 flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" /> Guardar Rutina
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Saved Routines */}
          {savedRoutines.length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold theme-accent-text uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5" /> Mis Rutinas Guardadas ({savedRoutines.length})
              </p>
              {savedRoutines.map((r, idx) => (
                <div key={idx} className="glass-card rounded-2xl p-4 border border-[var(--border-card)] space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-sm text-[var(--text-main)]">📋 {r.name}</p>
                    <span className="text-[10px] font-mono font-bold text-[var(--text-muted)]">
                      {r.exercises.length} ejercicios
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {r.exercises.map((ex, ei) => (
                      <span key={ei} className="px-2 py-0.5 rounded-lg bg-[var(--bg-input)] text-[9px] font-bold text-[var(--text-muted)] border border-[var(--border-subtle)]">
                        {ex.name}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => startCustomRoutine(r.exercises, r.name)}
                    className="w-full py-2.5 rounded-xl theme-accent-bg font-black text-xs uppercase tracking-wider active:scale-95 transition-transform flex items-center justify-center gap-2"
                  >
                    <Play className="w-3.5 h-3.5" /> Iniciar Esta Rutina
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Interactive Workout Modal ──────────────────────── */}
      {workoutDay && (
        <InteractiveWorkoutModal
          isOpen={showWorkoutModal}
          onClose={() => setShowWorkoutModal(false)}
          dayActivity={workoutDay}
          onCompleteWorkout={(tonnageKg, xpGained) => {
            setShowWorkoutModal(false);
            // bubble up could be done via onUpdateProfile
          }}
        />
      )}
    </div>
  );
};
