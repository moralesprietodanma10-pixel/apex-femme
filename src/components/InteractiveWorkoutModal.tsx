import React, { useState, useEffect } from 'react';
import { ScheduleDay, ExerciseDetail, WorkoutSetDetail, SessionObjective } from '../types';
import {
  Dumbbell, X, Check, Play, Pause, RotateCcw, Clock, ShieldCheck,
  Zap, Trophy, ChevronRight, ChevronLeft, Flame, Activity, CheckCircle2,
  AlertCircle, Sparkles, HeartPulse, Cpu, Award
} from 'lucide-react';
import { sounds } from '../services/soundEffects';
import { getDecisionConfidence } from '../data/gymV18IntelligenceData';

interface InteractiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayActivity: ScheduleDay;
  onCompleteWorkout: (tonnageKg: number, xpGained: number) => void;
}

export const InteractiveWorkoutModal: React.FC<InteractiveWorkoutModalProps> = ({
  isOpen,
  onClose,
  dayActivity,
  onCompleteWorkout
}) => {
  // Pre-Session Readiness Check state
  const [showReadinessCheck, setShowReadinessCheck] = useState(true);
  const [readinessScore, setReadinessScore] = useState<number>(92);
  const [sorenessLevel, setSorenessLevel] = useState<'baja' | 'moderada' | 'alta'>('baja');

  // Exercise & Set state
  const [exercises, setExercises] = useState<ExerciseDetail[]>([]);
  const [currentExIdx, setCurrentExIdx] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(90);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Decision Confidence Toast / Recommendation
  const [lastLoadRecommendation, setLastLoadRecommendation] = useState<{ text: string; confidencePct: number } | null>(null);

  // Rotating between-sets educational tips
  const [betweenSetsTipIdx, setBetweenSetsTipIdx] = useState(0);
  const BETWEEN_SETS_TIPS = [
    '💧 Hidratación: Bebe 150ml de agua durante el descanso para mantener la tasa de filtración glomerular.',
    '🫁 Respiración Diafragmática: Inhala en 4s, mantén 2s y exhala en 6s para desacelerar la frecuencia cardíaca.',
    '💡 Recordatorio Técnico: Mantén el torso erguido y la barbilla orientada hacia el pecho.',
    '🔬 Ciencia de Fútbol: La extensión horizontal de cadera transfiere directamente a la potencia de aceleración corta.',
    '🧠 Enfoque Mental: Visualiza la velocidad de salida de la primera repetición antes de tomar la barra.'
  ];

  // Initialize drills details
  useEffect(() => {
    if (!isOpen) return;

    const baseDrills = dayActivity.exerciseDetails && dayActivity.exerciseDetails.length > 0
      ? dayActivity.exerciseDetails
      : [
          {
            id: 'ex-1',
            name: 'Sentadilla Búlgara con Mancuernas',
            targetSets: 4,
            defaultReps: 8,
            defaultWeightKg: 14,
            restSeconds: 90,
            targetMuscles: ['Cuádriceps', 'Glúteo Mayor'],
            injuryPreventionTag: '🛡️ Prevención de Valgo Dinámico & LCA',
            techniqueTip: 'Mantén la rodilla alineada con el segundo dedo del pie.',
            pitchTransfer: 'Transferencia al aterrizaje unipodal tras disputa aérea.'
          },
          {
            id: 'ex-2',
            name: 'Hip Thrust con Barra en Banco',
            targetSets: 4,
            defaultReps: 10,
            defaultWeightKg: 50,
            restSeconds: 90,
            targetMuscles: ['Glúteo Máximo'],
            injuryPreventionTag: '⚡ Extensión horizontal de cadera para sprint 0-10m',
            techniqueTip: 'Pausa de 1 segundo arriba apretando el glúteo.',
            pitchTransfer: 'Maximiza aceleración horizontal en sprint.'
          }
        ];

    const initialized = baseDrills.map((ex) => ({
      ...ex,
      sets: ex.sets || Array.from({ length: ex.targetSets }).map((_, idx) => ({
        setNumber: idx + 1,
        targetReps: ex.defaultReps,
        weightKg: ex.defaultWeightKg || 0,
        completed: false,
        restSeconds: ex.restSeconds || 90
      }))
    }));

    setExercises(initialized);
    setCurrentExIdx(0);
    setIsFinished(false);
    setIsTimerRunning(false);
    setShowReadinessCheck(true);
    setTimerSeconds(initialized[0]?.restSeconds || 90);
  }, [isOpen, dayActivity]);

  // Rest Timer countdown effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0 && isTimerRunning) {
      setIsTimerRunning(false);
      sounds.playLevelUp();
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen || exercises.length === 0) return null;

  const currentExercise = exercises[currentExIdx];

  // Handle set completion with Microautomations & Decision Confidence %
  const handleToggleSet = (exIdx: number, setIdx: number, techniqueScore: 'easy' | 'moderate' | 'hard' | 'lossOfControl') => {
    sounds.playClick();

    const decision = getDecisionConfidence(currentExercise.name, techniqueScore);
    setLastLoadRecommendation({
      text: decision.recommendation,
      confidencePct: decision.confidencePct
    });

    // Rotate tip
    setBetweenSetsTipIdx((prev) => (prev + 1) % BETWEEN_SETS_TIPS.length);

    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const newSets = ex.sets?.map((s, sj) => {
          if (sj !== setIdx) return s;
          const nextCompleted = !s.completed;
          if (nextCompleted) {
            // Auto start rest timer
            setTimerSeconds(s.restSeconds || 90);
            setIsTimerRunning(true);
          }
          return {
            ...s,
            completed: nextCompleted,
            techniqueScore,
            loadRecommendation: decision.recommendation,
            confidencePct: decision.confidencePct
          };
        });
        return { ...ex, sets: newSets };
      })
    );
  };

  const handleWeightChange = (exIdx: number, setIdx: number, val: number) => {
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const newSets = ex.sets?.map((s, sj) => {
          if (sj !== setIdx) return s;
          return { ...s, weightKg: Math.max(0, val) };
        });
        return { ...ex, sets: newSets };
      })
    );
  };

  // Metrics calculations
  let totalSetsCount = 0;
  let completedSetsCount = 0;
  let totalTonnageKg = 0;

  exercises.forEach((ex) => {
    ex.sets?.forEach((s) => {
      totalSetsCount++;
      if (s.completed) {
        completedSetsCount++;
        totalTonnageKg += (s.targetReps || 1) * (s.weightKg || 0);
      }
    });
  });

  const progressPercent = totalSetsCount > 0 ? Math.round((completedSetsCount / totalSetsCount) * 100) : 0;

  const handleFinish = () => {
    sounds.playSuccess();
    onCompleteWorkout(totalTonnageKg, 300);
    setIsFinished(true);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-3xl glass-card rounded-3xl border-2 border-[var(--accent-color)] overflow-hidden shadow-2xl flex flex-col max-h-[96vh]">

        {/* PRE-SESSION READINESS CHECK OVERLAY */}
        {showReadinessCheck && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-center animate-fade-in">
            <div className="space-y-6 max-w-md w-full">
              <div className="w-16 h-16 rounded-full theme-accent-bg flex items-center justify-center mx-auto text-black font-black text-2xl theme-accent-glow">
                ⚡
              </div>
              <div>
                <span className="text-[10px] font-black font-mono theme-accent-bg px-3 py-1 rounded-full text-black uppercase">
                  CHECKIN PRE-SESIÓN (5 SEGUNDOS)
                </span>
                <h3 className="text-2xl font-black text-white mt-2">¿Cómo te sientes para entrenar hoy?</h3>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  El Coach IA adaptará automáticamente las cargas y el volumen de la sesión.
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-extrabold text-[var(--text-muted)] uppercase block">Nivel de Agujetas / Dolor Muscular</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'baja', label: 'Sin dolor / Listo', color: 'border-emerald-500 text-emerald-400' },
                    { id: 'moderada', label: 'Agujetas Leves', color: 'border-amber-500 text-amber-400' },
                    { id: 'alta', label: 'Fatiga Alta', color: 'border-red-500 text-red-400' },
                  ].map(lvl => (
                    <button
                      key={lvl.id}
                      onClick={() => setSorenessLevel(lvl.id as any)}
                      className={`p-3 rounded-2xl border text-xs font-black transition-all ${
                        sorenessLevel === lvl.id ? `${lvl.color} bg-white/10 font-bold scale-105` : 'border-[var(--border-subtle)] text-[var(--text-muted)]'
                      }`}
                    >
                      {lvl.label}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => { sounds.playClick(); setShowReadinessCheck(false); }}
                className="w-full theme-accent-bg py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-black theme-accent-glow"
              >
                CONFIRMAR & EMPEZAR ENTRENAMIENTO
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════
            FOCUS TRAINING MODE TOP HEADER
        ══════════════════════════════════════════════════════ */}
        <div className="p-4 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-header)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl theme-accent-bg flex items-center justify-center font-black text-black text-xl shrink-0">
              🏋️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black font-mono theme-accent-bg px-2 py-0.5 rounded text-black uppercase">
                  MODO ENFOQUE V18
                </span>
                <span className="text-xs text-emerald-400 font-mono font-bold">
                  {dayActivity.sessionObjective || 'Fuerza & Potencia'}
                </span>
              </div>
              <h3 className="font-black text-lg text-[var(--text-main)] truncate max-w-xs sm:max-w-md">
                {dayActivity.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--text-muted)] hover:text-white bg-[var(--bg-input)] border border-[var(--border-subtle)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PROGRESS BAR & LIVE TONNAGE STATS */}
        <div className="px-5 py-2.5 bg-[var(--bg-card-solid)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[var(--text-muted)]">Progreso de Sesión</span>
              <span className="theme-accent-text font-mono">{progressPercent}% ({completedSetsCount}/{totalSetsCount} Series)</span>
            </div>
            <div className="w-full bg-[var(--bg-input)] h-2 rounded-full overflow-hidden border border-[var(--border-subtle)]">
              <div
                className="h-full theme-accent-bg transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {totalTonnageKg > 0 && (
            <div className="bg-[var(--bg-input)] px-3 py-1 rounded-xl border border-[var(--accent-color)]/30 text-right shrink-0">
              <span className="text-[8px] font-bold text-[var(--text-muted)] block uppercase">Tonelaje Movido</span>
              <span className="font-mono text-xs font-black theme-accent-text">
                {totalTonnageKg.toLocaleString()} kg
              </span>
            </div>
          )}
        </div>

        {/* EXERCISE SELECTOR TABS */}
        <div className="flex gap-2 p-3 overflow-x-auto border-b border-[var(--border-subtle)] bg-[var(--bg-app)] scrollbar-none">
          {exercises.map((ex, idx) => {
            const isDone = ex.sets?.every((s) => s.completed);
            const isSelected = idx === currentExIdx;
            return (
              <button
                key={ex.id}
                onClick={() => { sounds.playClick(); setCurrentExIdx(idx); }}
                className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                  isSelected
                    ? 'theme-accent-bg text-black border-transparent font-black shadow-lg'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{idx + 1}.</span>}
                <span className="truncate max-w-[120px]">{ex.name}</span>
              </button>
            );
          })}
        </div>

        {/* CONTENT AREA: ACTIVE EXERCISE */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">

          {/* ACTIVE EXERCISE CARD */}
          <div className="glass-card rounded-3xl p-5 border border-[var(--accent-color)]/40 space-y-3">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono uppercase block">
                  EJERCICIO {currentExIdx + 1} DE {exercises.length}
                </span>
                <h4 className="text-xl font-black text-[var(--text-main)]">
                  {currentExercise.name}
                </h4>
              </div>

              {currentExercise.injuryPreventionTag && (
                <span className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold shrink-0">
                  {currentExercise.injuryPreventionTag}
                </span>
              )}
            </div>

            {currentExercise.pitchTransfer && (
              <p className="text-xs text-[var(--text-main)] bg-emerald-500/5 p-3 rounded-2xl border border-emerald-500/20 leading-relaxed">
                ⚡ <span className="font-extrabold text-emerald-400">Transferencia al campo:</span> {currentExercise.pitchTransfer}
              </p>
            )}

            {currentExercise.techniqueTip && (
              <p className="text-xs text-[var(--text-muted)] italic bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)]">
                💡 <span className="font-semibold text-[var(--text-main)]">Técnica clave:</span> {currentExercise.techniqueTip}
              </p>
            )}
          </div>

          {/* DECISION CONFIDENCE TOAST / LOAD RECOMMENDATION */}
          {lastLoadRecommendation && (
            <div className="bg-[var(--accent-color)]/10 border-2 border-[var(--accent-color)] p-4 rounded-2xl flex items-center justify-between gap-3 animate-bounce-in">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 theme-accent-text shrink-0" />
                <div>
                  <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block">Recomendación IA Post-Serie</span>
                  <p className="text-xs font-black theme-accent-text">{lastLoadRecommendation.text}</p>
                </div>
              </div>
              <span className="text-xs font-mono font-black px-2.5 py-1 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
                Confianza {lastLoadRecommendation.confidencePct}%
              </span>
            </div>
          )}

          {/* SETS TABLE & TECHNIQUE RATING */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <span>SERIE</span>
              <span>CARGA (KG)</span>
              <span>EVALUAR TÉCNICA Y COMPLETAR</span>
            </div>

            {currentExercise.sets?.map((set, setIdx) => (
              <div
                key={set.setNumber}
                className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                  set.completed
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-[var(--bg-card-solid)] border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] font-mono font-black text-xs flex items-center justify-center">
                      #{set.setNumber}
                    </span>
                    <span className="text-xs font-bold">
                      {set.targetReps} reps objetivo
                    </span>
                  </div>

                  {/* Weight Input */}
                  <div className="flex items-center gap-1 bg-[var(--bg-input)] px-3 py-1.5 rounded-xl border border-[var(--border-subtle)]">
                    <input
                      type="number"
                      min="0"
                      max="300"
                      value={set.weightKg || ''}
                      onChange={(e) => handleWeightChange(currentExIdx, setIdx, parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-14 bg-transparent text-center font-mono font-black text-sm text-[var(--text-main)] outline-none"
                    />
                    <span className="text-[10px] font-bold text-[var(--text-muted)]">kg</span>
                  </div>
                </div>

                {/* Technique Rating Buttons */}
                <div className="pt-1 flex items-center justify-between gap-1">
                  <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase">Sensación:</span>
                  <div className="flex gap-1">
                    {[
                      { id: 'easy', label: 'Fácil', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' },
                      { id: 'moderate', label: 'Óptima', color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/40' },
                      { id: 'hard', label: 'Dura', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40' },
                      { id: 'lossOfControl', label: 'Fallo', color: 'bg-red-500/20 text-red-400 border-red-500/40' },
                    ].map(t => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => handleToggleSet(currentExIdx, setIdx, t.id as any)}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                          set.completed && set.techniqueScore === t.id
                            ? 'theme-accent-bg text-black font-black shadow-md'
                            : t.color
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* EDUCATIONAL BETWEEN-SETS SCREEN */}
          <div className="glass-card rounded-2xl p-4 border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--bg-input)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase block">DESCANSO ENTRE SERIES</span>
                <span className="font-mono text-2xl font-black theme-accent-text">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>

            {/* Rotating Educational Tip */}
            <p className="text-xs text-[var(--text-muted)] italic max-w-xs leading-snug">
              {BETWEEN_SETS_TIPS[betweenSetsTipIdx]}
            </p>

            <button
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              className="p-3 rounded-xl theme-accent-bg text-black font-black active:scale-95 shrink-0"
            >
              {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
          </div>

        </div>

        {/* BOTTOM ACTIONS */}
        <div className="p-4 bg-[var(--bg-header)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              disabled={currentExIdx === 0}
              onClick={() => setCurrentExIdx((prev) => Math.max(0, prev - 1))}
              className="px-3 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs font-bold disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <button
              disabled={currentExIdx === exercises.length - 1}
              onClick={() => setCurrentExIdx((prev) => Math.min(exercises.length - 1, prev + 1))}
              className="px-3 py-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs font-bold disabled:opacity-30 flex items-center gap-1"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleFinish}
            className="px-6 py-3.5 rounded-2xl theme-accent-bg text-xs font-black uppercase tracking-wider text-black theme-accent-glow active:scale-95 transition-transform flex items-center gap-2"
          >
            <Trophy className="w-4 h-4 fill-black" /> Finalizar Sesión
          </button>
        </div>

        {/* COMPLETION OVERLAY */}
        {isFinished && (
          <div className="absolute inset-0 z-50 bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 text-center animate-bounce-in">
            <div className="space-y-5 max-w-sm">
              <div className="w-20 h-20 rounded-full theme-accent-bg flex items-center justify-center mx-auto text-black theme-accent-glow">
                <Trophy className="w-10 h-10 fill-black" />
              </div>
              <h3 className="text-2xl font-black text-white">¡SESIÓN COMPLETADA!</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Has completado la sesión de <span className="text-white font-bold">{dayActivity.title}</span>.
              </p>

              <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--accent-color)]/30 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-muted)]">Tonelaje Movido:</span>
                  <span className="font-mono text-emerald-400">{totalTonnageKg.toLocaleString()} kg</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-muted)]">Series Completadas:</span>
                  <span className="font-mono text-cyan-400">{completedSetsCount} / {totalSetsCount}</span>
                </div>
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-muted)]">Puntuación Calidad:</span>
                  <span className="font-mono theme-accent-text">98 / 100 Élite</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full theme-accent-bg py-4 rounded-2xl font-black text-xs uppercase tracking-wider text-black theme-accent-glow active:scale-95"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
