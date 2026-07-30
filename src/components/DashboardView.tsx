import React, { useState } from 'react';
import { PlayerProfile, ScheduleDay, SmartwatchData } from '../types';
import { 
  Flame, 
  Clock, 
  Star, 
  MapPin, 
  CalendarCheck, 
  Brain, 
  CheckCircle2, 
  Dumbbell, 
  Activity, 
  Footprints, 
  HeartPulse, 
  Moon, 
  Trophy, 
  Bed, 
  ChevronRight,
  Zap,
  Watch,
  Heart,
  Sparkles,
  Sliders,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface DashboardViewProps {
  playerProfile: PlayerProfile;
  weeklySchedule: ScheduleDay[];
  onConfirmDayActivity: () => void;
  onSelectDay: (dayId: string) => void;
  onNavigateTab: (tab: 'coach' | 'tracker' | 'card' | 'gamification' | 'gym' | 'mentors') => void;
  smartwatchData?: SmartwatchData;
  onOpenSmartwatchModal?: () => void;
  onStartInteractiveWorkout?: (day: ScheduleDay) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  playerProfile,
  weeklySchedule,
  onConfirmDayActivity,
  onSelectDay,
  onNavigateTab,
  smartwatchData,
  onOpenSmartwatchModal,
  onStartInteractiveWorkout
}) => {
  const [showTelemetryDetails, setShowTelemetryDetails] = useState(false);

  const getActivityIcon = (iconName: string) => {
    switch (iconName) {
      case 'Dumbbell': return <Dumbbell className="w-4 h-4 theme-accent-text" />;
      case 'Activity': return <Activity className="w-4 h-4 theme-accent-text" />;
      case 'Footprints': return <Footprints className="w-4 h-4 theme-accent-text" />;
      case 'HeartPulse': return <HeartPulse className="w-4 h-4 text-purple-400" />;
      case 'Moon': return <Moon className="w-4 h-4 text-cyan-400" />;
      case 'Trophy': return <Trophy className="w-4 h-4 theme-accent-text" />;
      case 'Bed': default: return <Bed className="w-4 h-4 text-[var(--text-muted)]" />;
    }
  };

  const todayActivity = weeklySchedule.find(d => d.status === 'today') || weeklySchedule[2];

  // Readiness computation based on smartwatch & profile
  const hrvMs = smartwatchData?.hrvMs || 68;
  const readinessScore = Math.min(99, Math.max(60, Math.round(hrvMs * 1.15 + (playerProfile.streakDays > 3 ? 10 : 5))));

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto animate-fade-in pt-2">
      
      {/* Primary Question Banner & Readiness Hero */}
      <section className="relative overflow-hidden rounded-3xl glass-card p-6 md:p-8 border border-[var(--accent-color)]/40 shadow-2xl">
        <div className="absolute -top-10 -right-10 w-96 h-96 bg-[var(--accent-color)]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-5">
          {/* Header Tagline */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-subtle)] pb-4">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1 px-3 py-1 theme-accent-bg text-[10px] font-black rounded-lg uppercase tracking-wider shadow-md">
                  <Sparkles className="w-3 h-3 text-black" />
                  READINESS & CICLO BIOLÓGICO
                </span>
                <span className="text-xs font-mono font-bold text-cyan-400 px-2.5 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  🌸 FASE FOLICULAR • PICO DE FUERZA
                </span>
              </div>
              <h2 className="font-extrabold text-2xl md:text-3xl text-[var(--text-main)] tracking-tight mt-2 flex items-center gap-2">
                ¿Cómo estás hoy, {playerProfile.name.split(' ')[0]}?
              </h2>
            </div>

            {/* Circular Readiness Score */}
            <div className="flex items-center gap-3 bg-[var(--bg-input)] px-4 py-2.5 rounded-2xl border border-[var(--border-subtle)] self-start sm:self-auto">
              <div className="relative flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500/20 border-t-emerald-400 flex items-center justify-center font-mono font-black text-lg text-emerald-400">
                  {readinessScore}%
                </div>
              </div>
              <div>
                <p className="text-[10px] text-[var(--text-muted)] font-extrabold uppercase tracking-wider mb-0.5">ESTADO FISIOLÓGICO</p>
                <p className="text-xs font-bold text-emerald-400">🟢 Óptimo para Entrenar</p>
              </div>
            </div>
          </div>

          {/* Quick Context Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[var(--bg-input)] p-3.5 rounded-2xl border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">
                Próximo Matchday
              </p>
              <p className="font-mono text-base font-extrabold theme-accent-text">2d 14h 22m</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">vs Valencia FF</p>
            </div>

            <div className="bg-[var(--bg-input)] p-3.5 rounded-2xl border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">
                Posición & Rol Táctico
              </p>
              <p className="font-bold text-xs theme-accent-text truncate">{playerProfile.position}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Dorsal #{playerProfile.jerseyNumber}</p>
            </div>

            <div className="bg-[var(--bg-input)] p-3.5 rounded-2xl border border-[var(--border-subtle)] col-span-2 sm:col-span-1">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-1">
                Recuperación SNC (HRV)
              </p>
              <p className="font-mono text-base font-extrabold text-cyan-400">{hrvMs} ms</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">Variabilidad de Ritmo</p>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <MapPin className="w-4 h-4 theme-accent-text shrink-0" />
              <span>Estadio Central • Próximo Encuentro Oficial</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onStartInteractiveWorkout && (
                <button
                  onClick={() => onStartInteractiveWorkout(todayActivity)}
                  className="bg-emerald-500 hover:bg-emerald-400 text-[#0b1326] px-5 py-3 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  <Dumbbell className="w-4 h-4" />
                  🚀 Iniciar Sesión en Vivo
                </button>
              )}

              <button
                onClick={onConfirmDayActivity}
                className="theme-accent-bg px-5 py-3 rounded-2xl font-extrabold text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 theme-accent-glow flex items-center justify-center gap-2"
              >
                <CalendarCheck className="w-4 h-4" />
                Confirmar Actividad (+100 XP)
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Smartwatch Telemetry Widget (Progressive Disclosure) */}
      <section className="glass-card p-5 rounded-3xl border border-[var(--border-card)] space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl theme-accent-bg flex items-center justify-center text-black">
              <Watch className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm md:text-base text-[var(--text-main)] leading-tight">
                BIOMETRÍA Y TELEMETRÍA DE RELOJ
              </h3>
              <p className="text-[10px] text-[var(--text-muted)]">
                {smartwatchData?.connected ? `Conectado a ${smartwatchData.deviceName}` : 'Monitoreo biométrico en tiempo real (BLE)'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSmartwatchModal}
              className="text-xs font-bold font-mono px-3 py-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)] transition-all"
            >
              {smartwatchData?.connected ? `⚡ Sincronizado` : '🔗 Sincronizar'}
            </button>
            <button
              onClick={() => setShowTelemetryDetails(!showTelemetryDetails)}
              className="p-1.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
              title="Expandir/Colapsar detalles"
            >
              {showTelemetryDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Essential 3 Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
              <span>PULSACIONES</span>
              <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" />
            </div>
            <p className="font-mono text-lg md:text-xl font-black text-[var(--text-main)]">
              {smartwatchData?.connected ? smartwatchData.heartRateBpm : '64'} <span className="text-xs font-normal text-[var(--text-muted)]">BPM</span>
            </p>
            <span className="text-[9px] font-bold theme-accent-text block truncate">
              {smartwatchData?.connected ? smartwatchData.heartRateZone : 'Zona Reposo'}
            </span>
          </div>

          <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
              <span>PASOS HOY</span>
              <Footprints className="w-3.5 h-3.5 theme-accent-text" />
            </div>
            <p className="font-mono text-lg md:text-xl font-black theme-accent-text">
              {smartwatchData?.connected ? (smartwatchData.stepsToday || 0).toLocaleString() : '8,420'}
            </p>
            <span className="text-[9px] text-[var(--text-muted)] block">Meta: 10,000</span>
          </div>

          <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
            <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
              <span>CALORÍAS</span>
              <Flame className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <p className="font-mono text-lg md:text-xl font-black text-amber-500">
              {smartwatchData?.connected ? `${smartwatchData.caloriesBurned || 0}` : '1,840'} <span className="text-xs font-normal text-[var(--text-muted)]">kcal</span>
            </p>
            <span className="text-[9px] text-[var(--text-muted)] block">Gasto Activo</span>
          </div>
        </div>

        {/* Detailed Telemetry (Progressive Disclosure) */}
        {showTelemetryDetails && (
          <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[var(--border-subtle)] animate-fade-in">
            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
                <span>DISTANCIA</span>
                <MapPin className="w-3.5 h-3.5 theme-accent-text" />
              </div>
              <p className="font-mono text-base font-bold theme-accent-text">
                {(smartwatchData?.distanceKm || 6.4).toFixed(1)} km
              </p>
              <span className="text-[9px] text-[var(--text-muted)] block">Recorrido Total</span>
            </div>

            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
                <span>RITMO MEDIO</span>
                <Zap className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="font-mono text-base font-bold text-purple-400">
                {smartwatchData?.avgPaceMinKm || '5:15 /km'}
              </p>
              <span className="text-[9px] text-[var(--text-muted)] block">Pacing de Carrera</span>
            </div>

            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
                <span>CARGA ACWR</span>
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <p className="font-mono text-base font-bold text-emerald-400">1.12 Ratio</p>
              <span className="text-[9px] text-[var(--text-muted)] block">🟢 Zona Segura</span>
            </div>
          </div>
        )}
      </section>

      {/* Weekly Microcycle Calendar */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[var(--text-main)] flex items-center gap-2">
            MICROCICLO SEMANAL DE ENTRENAMIENTO
            <span className="text-[10px] theme-accent-bg px-2 py-0.5 rounded font-mono font-bold">
              IA ADAPTATIVE
            </span>
          </h3>
          <button 
            onClick={() => onNavigateTab('gym')}
            className="text-xs text-[var(--accent-color)] font-bold hover:underline flex items-center gap-1"
          >
            Ver Hub Completo
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weeklySchedule.map((day) => {
            const isToday = day.status === 'today';
            const isCompleted = day.status === 'completed';

            return (
              <div
                key={day.id}
                onClick={() => onSelectDay(day.id)}
                className={`flex flex-col items-center p-2.5 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
                  isToday
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/20 shadow-lg scale-105 z-10'
                    : isCompleted
                    ? 'bg-[var(--bg-card-solid)] border-[var(--border-subtle)] hover:border-[var(--accent-color)]/50'
                    : 'bg-[var(--bg-input)] border-[var(--border-subtle)]/60 hover:bg-[var(--bg-card-solid)]'
                }`}
              >
                <span className={`text-[10px] font-extrabold ${isToday ? 'theme-accent-text' : 'text-[var(--text-muted)]'}`}>
                  {day.dayShort}
                </span>

                <div className={`w-8 h-8 my-1 flex items-center justify-center rounded-xl transition-transform ${
                  isToday 
                    ? 'theme-accent-bg' 
                    : isCompleted 
                    ? 'bg-[var(--bg-input)] theme-accent-text' 
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4 theme-accent-text" />
                  ) : (
                    getActivityIcon(day.icon)
                  )}
                </div>

                {day.scheduledTime && (
                  <span className="text-[9px] font-mono font-semibold theme-accent-text tracking-tight">
                    {day.scheduledTime}
                  </span>
                )}

                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${
                  isCompleted ? 'bg-[var(--accent-color)]' : isToday ? 'bg-cyan-400' : 'bg-[var(--border-subtle)]'
                }`} />
              </div>
            );
          })}
        </div>

        {/* Selected Today Activity Detail */}
        {todayActivity && (
          <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-subtle)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/40 flex items-center justify-center theme-accent-text shrink-0 mt-0.5 sm:mt-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-extrabold text-[var(--text-main)]">
                    Hoy ({todayActivity.dayFull}): {todayActivity.title}
                  </p>
                  {todayActivity.location && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--bg-card-solid)] theme-accent-text border border-[var(--border-subtle)] uppercase">
                      {todayActivity.location === 'gym' ? '🏋️ Gimnasio' : todayActivity.location === 'casa' ? '🏠 En Casa' : todayActivity.location === 'campo' ? '⚡ Campo' : todayActivity.location}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                  {todayActivity.scheduledTime && <span className="font-mono theme-accent-text font-bold mr-1.5">⏰ {todayActivity.scheduledTime} hrs •</span>}
                  Duración: {todayActivity.durationMin} min • Intensidad {todayActivity.intensity}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-2">
              <button
                onClick={() => onNavigateTab('coach')}
                className="text-[11px] font-bold theme-accent-text hover:underline flex items-center gap-1"
              >
                Importar / Modificar Plan
                <ChevronRight className="w-4 h-4" />
              </button>

              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                todayActivity.status === 'completed' 
                  ? 'theme-accent-bg' 
                  : 'bg-[var(--accent-color)]/20 theme-accent-text border border-[var(--accent-color)]/40'
              }`}>
                {todayActivity.status === 'completed' ? 'Completado' : 'Pendiente hoy'}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* Athlete Performance Bento Grid */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 border-l-4 border-[var(--accent-color)]">
          <div className="flex justify-between items-center theme-accent-text">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-mono font-bold">+100 XP hoy</span>
          </div>
          <div>
            <h4 className="text-2xl font-mono font-black text-[var(--text-main)]">
              {playerProfile.streakDays} Días
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Racha de Trabajo
            </p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 border-l-4 border-cyan-500">
          <Clock className="w-5 h-5 text-cyan-500" />
          <div>
            <h4 className="text-2xl font-mono font-black text-[var(--text-main)]">
              {playerProfile.monthlyMinutes} min
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Volumen Mensual
            </p>
          </div>
        </div>

        <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-28 border-l-4 border-purple-500 col-span-2 md:col-span-1">
          <Star className="w-5 h-5 text-purple-500" />
          <div>
            <h4 className="text-2xl font-mono font-black text-[var(--text-main)]">
              {playerProfile.avgRating} / 10
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Rating Promedio
            </p>
          </div>
        </div>
      </section>

      {/* AI Coach Recommendation Banner */}
      <section className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between gap-4">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 shrink-0 bg-[var(--accent-color)]/15 rounded-xl border border-[var(--accent-color)]/30 flex items-center justify-center theme-accent-text">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] theme-accent-text font-bold uppercase tracking-wider block mb-0.5">
              RECOMENDACIÓN TÁCTICA Y BIOLÓGICA DE APEX AI
            </span>
            <p className="text-xs text-[var(--text-main)] italic leading-relaxed">
              "Tu índice de HRV indica recuperación óptima. En la fase folicular actual, aprovecha la ventana metabólica para cargas elevadas de fuerza explosiva y sprints."
            </p>
          </div>
        </div>
        <button
          onClick={() => onNavigateTab('coach')}
          className="shrink-0 p-2.5 bg-[var(--bg-card-solid)] hover:bg-[var(--bg-input)] rounded-xl theme-accent-text transition-colors"
          title="Consultar Coach IA"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </section>

    </div>
  );
};

