import React, { useState, useEffect } from 'react';
import { ScheduleDay, ExerciseDetail, WorkoutSetDetail } from '../types';
import { 
  Dumbbell, 
  X, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Trophy, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  Activity,
  CheckCircle2
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface InteractiveWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayActivity: ScheduleDay;
  onCompleteWorkout: (tonnageKg: number, xpGained: number) => void;
}

export const DEFAULT_DRILLS_LIBRARY: Record<string, ExerciseDetail[]> = {
  gimnasio: [
    {
      id: 'ex-1',
      name: 'Sentadillas Búlgaras con Mancuernas',
      targetSets: 4,
      defaultReps: 8,
      defaultWeightKg: 12,
      restSeconds: 90,
      targetMuscles: ['Cuádriceps', 'Glúteo Mayor', 'Estabilizadores de Cadera'],
      injuryPreventionTag: '🛡️ Protege rodilla & prevención valgo dinámico',
      techniqueTip: 'Mantén el torso erguido y baja en vertical. La rodilla delantera alineada con el segundo dedo del pie.',
    },
    {
      id: 'ex-2',
      name: 'Hip Thrust con Barra en Banco',
      targetSets: 4,
      defaultReps: 10,
      defaultWeightKg: 45,
      restSeconds: 90,
      targetMuscles: ['Glúteo Máximo', 'Isquiotibiales'],
      injuryPreventionTag: '⚡ Potencia de sprint & extensión de cadera',
      techniqueTip: 'Empuja con los talones y haz una pausa de 1 segundo arriba apretando fuerte el glúteo.',
    },
    {
      id: 'ex-3',
      name: 'Prensa Unilateral a 45°',
      targetSets: 3,
      defaultReps: 10,
      defaultWeightKg: 30,
      restSeconds: 60,
      targetMuscles: ['Cuádriceps', 'Aductores'],
      injuryPreventionTag: '🛡️ Fuerza unilateral para saltos y choques',
      techniqueTip: 'Controla la bajada en 3 segundos sin despegar la zona lumbar del respaldo.',
    },
    {
      id: 'ex-4',
      name: 'Plancha Pallof Press Anti-Rotación (Core)',
      targetSets: 3,
      defaultReps: 12,
      defaultWeightKg: 10,
      restSeconds: 45,
      targetMuscles: ['Abdomen Oblicuo', 'Core Profundo', 'Zona Lumbar'],
      injuryPreventionTag: '🛡️ Estabilidad en cambios de dirección',
      techniqueTip: 'Resiste la tensión de la polea/banda sin girar la cadera ni los hombros.',
    },
    {
      id: 'ex-5',
      name: 'Curl Nórdico Excéntrico de Isquios',
      targetSets: 3,
      defaultReps: 6,
      defaultWeightKg: 0,
      restSeconds: 90,
      targetMuscles: ['Isquiotibiales', 'Pantorrillas'],
      injuryPreventionTag: '🛡️ Prevención #1 de desgarros de isquiotibiales',
      techniqueTip: 'Frena la caída lo máximo posible usando únicamente la fuerza de la parte posterior del muslo.',
    }
  ],
  entrenamiento: [
    {
      id: 'ex-t1',
      name: 'Sprints Reactivos de 10m & Freno',
      targetSets: 5,
      defaultReps: 1,
      defaultWeightKg: 0,
      restSeconds: 60,
      targetMuscles: ['Aceleradores', 'Gemelos', 'Cuádriceps'],
      injuryPreventionTag: '⚡ Aceleración de élite en espacio corto',
      techniqueTip: 'Salida explosiva tras señal auditiva. Centro de gravedad bajo en los primeros 3 pasos.',
    },
    {
      id: 'ex-t2',
      name: 'Circuito Z: Cambios de Dirección a 45°',
      targetSets: 4,
      defaultReps: 3,
      defaultWeightKg: 0,
      restSeconds: 75,
      targetMuscles: ['Aductores', 'Abductores', 'Tobillos'],
      injuryPreventionTag: '🛡️ Estabilidad de tobillo y cambio de ritmo',
      techniqueTip: 'Decelera en 2 pasos cortos antes de hincar el pie exterior para salir hacia el nuevo cono.',
    },
    {
      id: 'ex-t3',
      name: 'Pases a Pared & Control Orientado en 2 Toques',
      targetSets: 4,
      defaultReps: 25,
      defaultWeightKg: 0,
      restSeconds: 45,
      targetMuscles: ['Coordinación Técnica', 'Piezometría de Pase'],
      injuryPreventionTag: '⚽ Visión de juego & precisión de primer toque',
      techniqueTip: 'Primer toque siempre orientado lejos de la presión simulada. Alterna pie hábil e izquierdo.',
    }
  ]
};

export const InteractiveWorkoutModal: React.FC<InteractiveWorkoutModalProps> = ({
  isOpen,
  onClose,
  dayActivity,
  onCompleteWorkout
}) => {
  const [exercises, setExercises] = useState<ExerciseDetail[]>([]);
  const [currentExIdx, setCurrentExIdx] = useState<number>(0);
  const [timerSeconds, setTimerSeconds] = useState<number>(60);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [restPreset, setRestPreset] = useState<number>(60);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  // Initialize drills details from activity or defaults
  useEffect(() => {
    if (!isOpen) return;

    const baseDrills = dayActivity.exerciseDetails && dayActivity.exerciseDetails.length > 0
      ? dayActivity.exerciseDetails
      : (DEFAULT_DRILLS_LIBRARY[dayActivity.activityType] || DEFAULT_DRILLS_LIBRARY.gimnasio);

    const initialized = baseDrills.map((ex) => ({
      ...ex,
      sets: ex.sets || Array.from({ length: ex.targetSets }).map((_, idx) => ({
        setNumber: idx + 1,
        targetReps: ex.defaultReps,
        weightKg: ex.defaultWeightKg || 0,
        completed: false,
        restSeconds: ex.restSeconds
      }))
    }));

    setExercises(initialized);
    setCurrentExIdx(0);
    setIsFinished(false);
    setIsTimerRunning(false);
    setTimerSeconds(initialized[0]?.restSeconds || 60);
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
      sounds.playLevelUp(); // Sound alert when rest finishes
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  if (!isOpen || exercises.length === 0) return null;

  const currentExercise = exercises[currentExIdx];

  const handleToggleSet = (exIdx: number, setIdx: number) => {
    sounds.playClick();
    setExercises((prev) =>
      prev.map((ex, i) => {
        if (i !== exIdx) return ex;
        const newSets = ex.sets?.map((s, sj) => {
          if (sj !== setIdx) return s;
          const nextCompleted = !s.completed;
          if (nextCompleted) {
            // Auto start rest timer on completing a set
            setTimerSeconds(s.restSeconds || restPreset);
            setIsTimerRunning(true);
          }
          return { ...s, completed: nextCompleted };
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
    const xpGained = 200 + Math.min(300, Math.floor(totalTonnageKg / 10));
    onCompleteWorkout(totalTonnageKg, xpGained);
    setIsFinished(true);
  };

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl glass-card rounded-3xl border border-[var(--accent-color)] overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">

        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[var(--border-subtle)] flex items-center justify-between bg-[var(--bg-header)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl theme-accent-bg flex items-center justify-center theme-accent-glow shrink-0">
              <Dumbbell className="w-5 h-5 text-[#0b1326]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold font-mono theme-accent-bg px-2 py-0.5 rounded uppercase">
                  {dayActivity.activityType}
                </span>
                <span className="text-xs text-[var(--text-muted)] font-mono font-bold">
                  {dayActivity.dayFull} • {dayActivity.durationMin} min
                </span>
              </div>
              <h3 className="font-black text-lg text-[var(--text-main)] truncate max-w-[240px] sm:max-w-md">
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

        {/* Global Progress Bar & Live Tonnage Stats */}
        <div className="px-5 py-3 bg-[var(--bg-card-solid)] border-b border-[var(--border-subtle)] flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-[var(--text-muted)]">Progreso de la Sesión</span>
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
            <div className="bg-[var(--bg-input)] px-3 py-1.5 rounded-xl border border-[var(--accent-color)]/30 text-right shrink-0">
              <span className="text-[9px] font-bold text-[var(--text-muted)] block uppercase">Carga Total</span>
              <span className="font-mono text-xs font-black theme-accent-text">
                {totalTonnageKg.toLocaleString()} kg
              </span>
            </div>
          )}
        </div>

        {/* Exercise Selector Tabs */}
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
                    ? 'theme-accent-bg theme-accent-glow border-transparent'
                    : isDone
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:opacity-100'
                }`}
              >
                {isDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span>{idx + 1}.</span>}
                <span className="truncate max-w-[120px]">{ex.name}</span>
              </button>
            );
          })}
        </div>

        {/* Content Area: Current Active Exercise */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Exercise Card */}
          <div className="glass-card rounded-2xl p-4 sm:p-5 border border-[var(--accent-color)]/40 space-y-3 relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] font-mono uppercase block">
                  EJERCICIO {currentExIdx + 1} DE {exercises.length}
                </span>
                <h4 className="text-xl font-black text-[var(--text-main)] mt-0.5">
                  {currentExercise.name}
                </h4>
              </div>

              {currentExercise.injuryPreventionTag && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>{currentExercise.injuryPreventionTag}</span>
                </div>
              )}
            </div>

            {/* Target Muscles Badges */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold text-[var(--text-muted)] mr-1">Músculos:</span>
              {currentExercise.targetMuscles.map((m) => (
                <span key={m} className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--bg-input)] text-[var(--text-main)] border border-[var(--border-subtle)]">
                  {m}
                </span>
              ))}

              {currentExercise.evidenceLevel && (
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  currentExercise.evidenceLevel === 'Alta' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                  currentExercise.evidenceLevel === 'Moderada' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40' :
                  'bg-red-500/20 text-red-400 border border-red-500/40'
                }`}>
                  🔬 Evidencia {currentExercise.evidenceLevel}
                </span>
              )}
            </div>

            {/* Scientific Citation & Pitch Transfer */}
            {(currentExercise.citation || currentExercise.pitchTransfer) && (
              <div className="bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/20 text-xs space-y-1">
                {currentExercise.citation && (
                  <p className="text-[10px] font-mono text-emerald-400/90 font-bold">
                    📚 Respaldado por: {currentExercise.citation}
                  </p>
                )}
                {currentExercise.pitchTransfer && (
                  <p className="text-[11px] text-[var(--text-main)] font-medium leading-snug">
                    ⚡ <span className="font-extrabold text-emerald-400">Transferencia al campo:</span> {currentExercise.pitchTransfer}
                  </p>
                )}
              </div>
            )}

            {/* Technique Tip */}
            {currentExercise.techniqueTip && (
              <p className="text-xs text-[var(--text-muted)] italic bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-subtle)] leading-relaxed">
                💡 <span className="font-semibold text-[var(--text-main)]">Técnica clave:</span> {currentExercise.techniqueTip}
              </p>
            )}
          </div>

          {/* Sets Table */}
          <div className="space-y-2">
            <div className="flex justify-between items-center px-2 text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">
              <span>SERIE</span>
              <span>OBJETIVO</span>
              <span>PESO CARGADO (KG)</span>
              <span>ESTADO</span>
            </div>

            {currentExercise.sets?.map((set, setIdx) => (
              <div
                key={set.setNumber}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  set.completed
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                    : 'bg-[var(--bg-card-solid)] border-[var(--border-subtle)]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] font-mono font-black text-xs flex items-center justify-center">
                    #{set.setNumber}
                  </span>
                  <span className="text-xs font-bold">
                    {set.targetReps} repeticiones
                  </span>
                </div>

                {/* Weight Input */}
                <div className="flex items-center gap-1 bg-[var(--bg-input)] px-2 py-1 rounded-xl border border-[var(--border-subtle)]">
                  <input
                    type="number"
                    min="0"
                    max="300"
                    value={set.weightKg || ''}
                    onChange={(e) => handleWeightChange(currentExIdx, setIdx, parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-12 bg-transparent text-center font-mono font-black text-xs text-[var(--text-main)] outline-none"
                  />
                  <span className="text-[10px] font-bold text-[var(--text-muted)]">kg</span>
                </div>

                {/* Checkbox Complete */}
                <button
                  type="button"
                  onClick={() => handleToggleSet(currentExIdx, setIdx)}
                  className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
                    set.completed
                      ? 'bg-emerald-500 text-[#0b1326] shadow-lg shadow-emerald-500/30 scale-105'
                      : 'bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:border-[var(--accent-color)]'
                  }`}
                >
                  <Check className="w-5 h-5 stroke-[3]" />
                </button>
              </div>
            ))}
          </div>

          {/* Interactive Rest Timer Bar */}
          <div className="glass-card rounded-2xl p-4 border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--bg-input)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--accent-color)]/20 text-[var(--accent-color)] flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase block">TEMPORIZADOR DE DESCANSO</span>
                <span className="font-mono text-2xl font-black theme-accent-text">
                  {formatTimer(timerSeconds)}
                </span>
              </div>
            </div>

            {/* Presets & Controls */}
            <div className="flex items-center gap-2">
              {[30, 60, 90, 120].map((sec) => (
                <button
                  key={sec}
                  onClick={() => { setRestPreset(sec); setTimerSeconds(sec); setIsTimerRunning(false); }}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold border transition-all ${
                    restPreset === sec && timerSeconds === sec
                      ? 'theme-accent-bg'
                      : 'bg-[var(--bg-card)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                  }`}
                >
                  {sec}s
                </button>
              ))}

              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2.5 rounded-xl theme-accent-bg theme-accent-glow font-bold active:scale-95 transition-transform"
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>

              <button
                onClick={() => { setIsTimerRunning(false); setTimerSeconds(restPreset); }}
                className="p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-subtle)] text-[var(--text-muted)] active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="p-4 bg-[var(--bg-header)] border-t border-[var(--border-subtle)] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              disabled={currentExIdx === 0}
              onClick={() => setCurrentExIdx((prev) => Math.max(0, prev - 1))}
              className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs font-bold disabled:opacity-30 flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Anterior
            </button>

            <button
              disabled={currentExIdx === exercises.length - 1}
              onClick={() => setCurrentExIdx((prev) => Math.min(exercises.length - 1, prev + 1))}
              className="px-3 py-2 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-xs font-bold disabled:opacity-30 flex items-center gap-1"
            >
              Siguiente <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={handleFinish}
            className="px-5 py-3 rounded-2xl theme-accent-bg text-sm font-black uppercase tracking-wider theme-accent-glow active:scale-95 transition-transform flex items-center gap-2"
          >
            <Trophy className="w-4 h-4" /> Finalizar Rutina & XP
          </button>
        </div>

        {/* Completion Modal Overlay */}
        {isFinished && (
          <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-6 text-center animate-bounce-in">
            <div className="space-y-4 max-w-sm">
              <div className="w-20 h-20 rounded-full theme-accent-bg flex items-center justify-center mx-auto theme-accent-glow">
                <Trophy className="w-10 h-10 text-[#0b1326]" />
              </div>
              <h3 className="text-2xl font-black text-white">¡ENTRENAMIENTO COMPLETADO!</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Has completado la rutina de <span className="text-white font-bold">{dayActivity.title}</span>.
              </p>

              <div className="bg-[var(--bg-card)] p-4 rounded-2xl border border-[var(--accent-color)]/30 space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-muted)]">XP Ganado:</span>
                  <span className="theme-accent-text font-mono">+{200 + Math.min(300, Math.floor(totalTonnageKg / 10))} XP</span>
                </div>
                {totalTonnageKg > 0 && (
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[var(--text-muted)]">Tonelaje Movido:</span>
                    <span className="font-mono text-white">{totalTonnageKg.toLocaleString()} kg</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-bold">
                  <span className="text-[var(--text-muted)]">Series Completadas:</span>
                  <span className="font-mono text-emerald-400">{completedSetsCount} / {totalSetsCount}</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full theme-accent-bg py-3.5 rounded-xl font-black text-xs uppercase tracking-wider theme-accent-glow active:scale-95"
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
