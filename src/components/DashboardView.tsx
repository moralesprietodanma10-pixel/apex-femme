import React from 'react';
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
  BatteryCharging
} from 'lucide-react';

interface DashboardViewProps {
  playerProfile: PlayerProfile;
  weeklySchedule: ScheduleDay[];
  onConfirmDayActivity: () => void;
  onSelectDay: (dayId: string) => void;
  onNavigateTab: (tab: 'coach' | 'tracker' | 'card' | 'gamification') => void;
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

  return (
    <div className="space-y-6 pb-28 max-w-4xl mx-auto animate-fade-in">
      {/* Hero Section: Game Day Ready */}
      <section className="relative overflow-hidden rounded-3xl glass-card p-6 border border-[var(--accent-color)]/40 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[var(--accent-color)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--border-subtle)] pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block px-2.5 py-0.5 theme-accent-bg text-[10px] font-extrabold rounded-md uppercase tracking-wider">
                  PRÓXIMO MATCHDAY
                </span>
                <span className="text-xs font-mono font-bold theme-accent-text">
                  {playerProfile.club || 'FC CLUB PRO'}
                </span>
              </div>
              <h2 className="font-extrabold text-2xl md:text-3xl text-[var(--text-main)] tracking-tight mt-1">
                PREPARACIÓN DÍA DE PARTIDO
              </h2>
            </div>

            <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between">
              <p className="text-[var(--text-muted)] text-[10px] font-bold uppercase tracking-widest">ESTADO FÍSICO Y RPE</p>
              <p className="theme-accent-text font-mono text-2xl font-black">92% ÓPTIMO</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-0.5">
                Cuenta Regresiva
              </p>
              <p className="font-mono text-base font-bold theme-accent-text">2d 14h 22m</p>
            </div>

            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)]">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-0.5">
                Terreno & Clima
              </p>
              <p className="font-bold text-xs text-[var(--text-main)] truncate">Césped Natural • 19°C</p>
            </div>

            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] col-span-2 sm:col-span-1">
              <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-wider mb-0.5">
                Rol Táctico
              </p>
              <p className="font-bold text-xs theme-accent-text truncate">{playerProfile.position}</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
            <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
              <MapPin className="w-4 h-4 theme-accent-text" />
              <span>Estadio Central • Domingo 18:00 hrs</span>
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

      {/* ACWR Workload & Weekly Gym Volume Tracker */}
      <section className="glass-card p-5 rounded-2xl border border-[var(--border-card)] grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-amber-400">
            <Activity className="w-4 h-4" />
            <h4 className="font-extrabold text-xs uppercase tracking-wider">Ratio de Carga ACWR</h4>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-2xl font-black text-emerald-400">1.12</span>
            <span className="text-[10px] font-bold text-emerald-400 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
              🟢 Zona Óptima
            </span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            Relación Carga Aguda (7d) vs Crónica (28d). Riesgo de lesión bajo.
          </p>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[var(--border-subtle)] pt-3 md:pt-0 md:pl-4">
          <div className="flex items-center gap-2 theme-accent-text">
            <Dumbbell className="w-4 h-4" />
            <h4 className="font-extrabold text-xs uppercase tracking-wider">Tonelaje Gym Semanal</h4>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black theme-accent-text">
              {weeklySchedule.reduce((sum, d) => sum + (d.totalTonnageKg || 0), 0).toLocaleString()}
            </span>
            <span className="text-xs font-bold text-[var(--text-muted)]">kg movidos</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            Sumatoria acumulada de series × repeticiones × peso (kg).
          </p>
        </div>

        <div className="space-y-1 border-t md:border-t-0 md:border-l border-[var(--border-subtle)] pt-3 md:pt-0 md:pl-4">
          <div className="flex items-center gap-2 text-purple-400">
            <Flame className="w-4 h-4" />
            <h4 className="font-extrabold text-xs uppercase tracking-wider">Minutos Totales</h4>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-2xl font-black text-purple-400">
              {weeklySchedule.reduce((sum, d) => sum + (d.durationMin || 0), 0)}
            </span>
            <span className="text-xs font-bold text-[var(--text-muted)]">min entrenados</span>
          </div>
          <p className="text-[10px] text-[var(--text-muted)]">
            Volumen semanal distribuido en gimnasio, táctica y sprints.
          </p>
        </div>
      </section>

      {/* Smartwatch Live Biometrics Telemetry Widget */}
      {smartwatchData && (
        <section className="glass-card p-5 rounded-2xl border border-[var(--border-card)] space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Watch className="w-5 h-5 theme-accent-text" />
              <h3 className="font-extrabold text-base text-[var(--text-main)]">
                BIOMETRÍA SMARTWATCH EN VIVO (BLE)
              </h3>
            </div>
            <button
              onClick={onOpenSmartwatchModal}
              className="text-xs font-bold font-mono px-3 py-1 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)] transition-all"
            >
              {smartwatchData.connected ? `⚡ ${smartwatchData.deviceName}` : '🔗 Sincronizar Reloj'}
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
                <span>RITMO CARDÍACO</span>
                <Heart className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              </div>
              <p className="font-mono text-lg font-black text-[var(--text-main)]">
                {smartwatchData.connected ? smartwatchData.heartRateBpm : '--'} <span className="text-xs font-normal text-[var(--text-muted)]">BPM</span>
              </p>
              <span className="text-[9px] font-bold theme-accent-text block truncate">
                {smartwatchData.connected ? smartwatchData.heartRateZone : 'Desconectado'}
              </span>
            </div>

            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
                <span>HRV (REC. SNC)</span>
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <p className="font-mono text-lg font-black text-cyan-400">
                {smartwatchData.connected ? `${smartwatchData.hrvMs} ms` : '--'}
              </p>
              <span className="text-[9px] text-[var(--text-muted)] block">Recuperación Óptima</span>
            </div>

            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
                <span>DISTANCIA</span>
                <MapPin className="w-3.5 h-3.5 theme-accent-text" />
              </div>
              <p className="font-mono text-lg font-black theme-accent-text">
                {smartwatchData.connected ? `${(smartwatchData.distanceKm || 6.4).toFixed(1)} km` : '--'}
              </p>
              <span className="text-[9px] text-[var(--text-muted)] block">Recorrido Total</span>
            </div>

            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
                <span>RITMO MEDIO</span>
                <Zap className="w-3.5 h-3.5 text-purple-400" />
              </div>
              <p className="font-mono text-lg font-black text-purple-400">
                {smartwatchData.connected ? (smartwatchData.avgPaceMinKm || '5:15 /km') : '--'}
              </p>
              <span className="text-[9px] text-[var(--text-muted)] block">Pacing de Carrera</span>
            </div>

            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
                <span>PASOS HOY</span>
                <Footprints className="w-3.5 h-3.5 theme-accent-text" />
              </div>
              <p className="font-mono text-lg font-black theme-accent-text">
                {smartwatchData.connected ? (smartwatchData.stepsToday || 0).toLocaleString() : '--'}
              </p>
              <span className="text-[9px] text-[var(--text-muted)] block">Meta: 10,000</span>
            </div>

            <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] space-y-1">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-bold uppercase">
                <span>CALORÍAS</span>
                <Flame className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <p className="font-mono text-lg font-black text-amber-500">
                {smartwatchData.connected ? `${smartwatchData.caloriesBurned || 0} kcal` : '--'}
              </p>
              <span className="text-[9px] text-[var(--text-muted)] block">Gasto Activo</span>
            </div>
          </div>
        </section>
      )}

      {/* Weekly Planning Grid */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-base text-[var(--text-main)] flex items-center gap-2">
            PLANIFICACIÓN SEMANAL
            <span className="text-[10px] theme-accent-bg px-2 py-0.5 rounded font-mono font-bold">
              IA ADAPTATIVE
            </span>
          </h3>
          <span className="text-xs text-[var(--text-muted)] font-mono">Microciclo de 7 Días</span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {weeklySchedule.map((day) => {
            const isToday = day.status === 'today';
            const isCompleted = day.status === 'completed';

            return (
              <div
                key={day.id}
                onClick={() => onSelectDay(day.id)}
                className={`flex flex-col items-center p-2 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
                  isToday
                    ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/20 shadow-md'
                    : isCompleted
                    ? 'bg-[var(--bg-card-solid)] border-[var(--border-subtle)] hover:border-[var(--accent-color)]/50'
                    : 'bg-[var(--bg-input)] border-[var(--border-subtle)]/60 hover:bg-[var(--bg-card-solid)]'
                }`}
              >
                <span className={`text-[10px] font-bold ${isToday ? 'theme-accent-text' : 'text-[var(--text-muted)]'}`}>
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

      {/* Performance Summary Bento Cards */}
      <section className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Streak */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-32 border-l-4 border-[var(--accent-color)] relative overflow-hidden">
          <div className="flex justify-between items-center theme-accent-text">
            <Flame className="w-5 h-5 animate-pulse" />
            <span className="text-[10px] font-mono font-bold">+100 XP hoy</span>
          </div>
          <div>
            <h4 className="text-2xl font-mono font-bold text-[var(--text-main)]">
              {playerProfile.streakDays} Días
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Racha de Entrenamiento
            </p>
          </div>
        </div>

        {/* Minutes */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-32 border-l-4 border-cyan-500">
          <Clock className="w-5 h-5 text-cyan-500" />
          <div>
            <h4 className="text-2xl font-mono font-bold text-[var(--text-main)]">
              {playerProfile.monthlyMinutes} min
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Minutos del Mes
            </p>
          </div>
        </div>

        {/* Rating */}
        <div className="glass-card p-4 rounded-2xl flex flex-col justify-between h-32 border-l-4 border-purple-500 col-span-2 md:col-span-1">
          <Star className="w-5 h-5 text-purple-500" />
          <div>
            <h4 className="text-2xl font-mono font-bold text-[var(--text-main)]">
              {playerProfile.avgRating} / 10
            </h4>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">
              Calificación Media
            </p>
          </div>
        </div>
      </section>

      {/* Insights / AI Section */}
      <section className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between gap-4">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 shrink-0 bg-[var(--accent-color)]/15 rounded-xl border border-[var(--accent-color)]/30 flex items-center justify-center theme-accent-text">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] theme-accent-text font-bold uppercase tracking-wider block mb-0.5">
              RECOMENDACIÓN TÁCTICA DEL COACH IA
            </span>
            <p className="text-xs text-[var(--text-main)] italic leading-relaxed">
              "Tu recuperación muscular está en su punto óptimo. La IA sugiere mantener la precisión en pases filtrados y ritmo de presión tras pérdida."
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
