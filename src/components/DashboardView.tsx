import React, { useState, useMemo } from 'react';
import { PlayerProfile, ScheduleDay, SmartwatchData, WeeklyTrend } from '../types';
import {
  Flame, Clock, Star, MapPin, CalendarCheck, Brain,
  CheckCircle2, Dumbbell, Activity, Footprints,
  Trophy, Bed, ChevronRight, Zap, Watch, Heart,
  Sparkles, ChevronDown, ChevronUp, TrendingUp,
  TrendingDown, Minus, Target, ShieldCheck,
  HeartPulse, Moon, ArrowRight, AlertTriangle,
  Eye, EyeOff, GripVertical
} from 'lucide-react';

interface DashboardViewProps {
  playerProfile: PlayerProfile;
  weeklySchedule: ScheduleDay[];
  onConfirmDayActivity: () => void;
  onSelectDay: (dayId: string) => void;
  onNavigateTab: (tab: 'coach' | 'tracker' | 'card' | 'gamification' | 'gym' | 'mentors') => void;
  onStartInteractiveWorkout?: (day: ScheduleDay) => void;
}

// ─── Helper: Trend computation ────────────────────────────────────────────────
function computeTrend(trend: WeeklyTrend) {
  const pct = trend.previousWeek > 0
    ? Math.round(((trend.current - trend.previousWeek) / trend.previousWeek) * 100)
    : 0;
  const direction: 'up' | 'down' | 'flat' = pct > 2 ? 'up' : pct < -2 ? 'down' : 'flat';
  return { pct, direction };
}

// ─── Helper: Activity icon ────────────────────────────────────────────────────
function getActivityIcon(iconName: string, size = 'w-4 h-4') {
  switch (iconName) {
    case 'Dumbbell': return <Dumbbell className={`${size} theme-accent-text`} />;
    case 'Activity': return <Activity className={`${size} theme-accent-text`} />;
    case 'Footprints': return <Footprints className={`${size} theme-accent-text`} />;
    case 'HeartPulse': return <HeartPulse className={`${size} text-purple-400`} />;
    case 'Moon': return <Moon className={`${size} text-cyan-400`} />;
    case 'Trophy': return <Trophy className={`${size} theme-accent-text`} />;
    case 'Bed': default: return <Bed className={`${size} text-[var(--text-muted)]`} />;
  }
}

// ─── Sub-component: Quick Answer Pill ─────────────────────────────────────────
// L1 hierarchy: answers one question in ≤1 second
const QuickAnswerPill: React.FC<{
  question: string;
  answer: string;
  subtext?: string;
  color: 'emerald' | 'amber' | 'red' | 'cyan' | 'accent';
  icon: React.ReactNode;
}> = ({ question, answer, subtext, color, icon }) => {
  const colorMap = {
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/25',
    amber: 'text-amber-400 bg-amber-500/10 border-amber-500/25',
    red: 'text-red-400 bg-red-500/10 border-red-500/25',
    cyan: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/25',
    accent: 'theme-accent-text bg-[var(--accent-color)]/10 border-[var(--accent-color)]/25',
  };
  return (
    <div className={`flex flex-col p-3 rounded-2xl border ${colorMap[color]} overflow-hidden`}>
      <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-70 mb-1">{question}</span>
      <div className="flex items-center gap-1.5 min-w-0">
        <span className="shrink-0">{icon}</span>
        <span className="font-black text-xs leading-snug break-words truncate max-w-full">{answer}</span>
      </div>
      {subtext && <span className="text-[9px] opacity-60 mt-1 leading-tight truncate">{subtext}</span>}
    </div>
  );
};

// ─── Sub-component: Contextual Metric Card (L2) ───────────────────────────────
const MetricCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  unit?: string;
  trend?: WeeklyTrend;
  accentColor: string;
  recommendation?: string;
  goalPct?: number;
}> = ({ icon, label, value, unit, trend, accentColor, recommendation, goalPct }) => {
  const trendData = trend ? computeTrend(trend) : null;
  const TIcon = trendData?.direction === 'up' ? TrendingUp
    : trendData?.direction === 'down' ? TrendingDown : Minus;
  const trendClass = trendData?.direction === 'up' ? 'trend-up'
    : trendData?.direction === 'down' ? 'trend-down' : 'trend-flat';

  return (
    <div
      className="glass-card p-4 rounded-2xl card-lift relative overflow-hidden"
      style={{ borderLeftColor: accentColor, borderLeftWidth: '3px' }}
    >
      {/* Ambient glow */}
      <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full opacity-15 blur-xl"
        style={{ backgroundColor: accentColor }} />

      <div className="relative z-10 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span style={{ color: accentColor }}>{icon}</span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
              {label}
            </span>
          </div>
          {trendData && (
            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg flex items-center gap-0.5 ${trendClass}`}>
              <TIcon className="w-2.5 h-2.5" />
              {trendData.pct > 0 ? '+' : ''}{trendData.pct}%
            </span>
          )}
        </div>

        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-black font-mono text-[var(--text-main)] leading-none">{value}</span>
          {unit && <span className="text-xs text-[var(--text-muted)] font-medium">{unit}</span>}
        </div>

        {trend && (
          <p className="text-[9px] text-[var(--text-secondary)] leading-snug">
            Promedio mensual: {trend.monthlyAvg} {trend.unit}
            {trend.goalValue && ` · Meta: ${trend.goalValue} ${trend.unit}`}
          </p>
        )}

        {goalPct !== undefined && (
          <div>
            <div className="w-full h-1 bg-[var(--bg-input)] rounded-full overflow-hidden mt-1">
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(100, goalPct)}%`, backgroundColor: accentColor }} />
            </div>
          </div>
        )}

        {recommendation && (
          <p className="text-[9px] text-[var(--text-secondary)] leading-snug border-t border-[var(--border-subtle)] pt-1.5 mt-1">
            → {recommendation}
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Sub-component: Week day cell ─────────────────────────────────────────────
const WeekDayCell: React.FC<{
  day: ScheduleDay;
  onClick: () => void;
}> = ({ day, onClick }) => {
  const isToday = day.status === 'today';
  const isCompleted = day.status === 'completed';
  const isPending = day.status === 'pending';

  const intensityColor: Record<string, string> = {
    alta: '#EF4444',
    moderada: '#F59E0B',
    baja: '#10B981',
  };

  return (
    <button
      onClick={onClick}
      aria-label={`${day.dayFull}: ${day.title}`}
      className={`flex flex-col items-center py-2.5 px-1 rounded-2xl border cursor-pointer transition-all duration-200 relative w-full focus-visible:ring-2 focus-visible:ring-[var(--accent-color)] ${
        isToday
          ? 'border-[var(--accent-color)] bg-[var(--accent-color)]/15 shadow-lg'
          : isCompleted
          ? 'border-[var(--accent-color)]/30 bg-[var(--accent-color)]/5'
          : 'border-[var(--border-subtle)]/60 bg-[var(--bg-input)] hover:bg-[var(--bg-card-solid)]'
      }`}
    >
      <span className={`text-[10px] font-extrabold tracking-wide ${
        isToday ? 'theme-accent-text' : 'text-[var(--text-muted)]'
      }`}>
        {day.dayShort}
      </span>

      <div className={`w-7 h-7 my-1.5 flex items-center justify-center rounded-xl ${
        isToday ? 'theme-accent-bg' : isCompleted ? 'bg-[var(--accent-color)]/15' : 'bg-[var(--bg-card-solid)]'
      }`}>
        {isCompleted
          ? <CheckCircle2 className="w-3.5 h-3.5 theme-accent-text" />
          : getActivityIcon(day.icon, 'w-3.5 h-3.5')}
      </div>

      {/* Intensity dot */}
      <div
        className="w-1.5 h-1.5 rounded-full"
        style={{
          backgroundColor: isCompleted
            ? 'var(--accent-color)'
            : isToday
            ? intensityColor[day.intensity] || '#94A3B8'
            : isPending
            ? '#374151'
            : '#1F2937'
        }}
      />
    </button>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export const DashboardView: React.FC<DashboardViewProps> = ({
  playerProfile,
  weeklySchedule,
  onConfirmDayActivity,
  onSelectDay,
  onNavigateTab,
  onStartInteractiveWorkout
}) => {
  const [showBioDetails, setShowBioDetails] = useState(false);
  const [showPersonalize, setShowPersonalize] = useState(false);
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());

  const toggleSection = (id: string) => {
    setHiddenSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const todayActivity = weeklySchedule.find(d => d.status === 'today') || weeklySchedule[2];
  const completedDays = weeklySchedule.filter(d => d.status === 'completed').length;
  const trends = playerProfile.weeklyTrends;
  const hrv = 68;
  const fc = 64;

  // ─── L1: READINESS (the most important computation) ────────────────────────
  const readiness = useMemo(() => {
    const streakBonus = playerProfile.streakDays > 3 ? 8 : playerProfile.streakDays > 1 ? 4 : 0;
    const score = Math.min(99, Math.max(45, Math.round(hrv * 1.08 + streakBonus)));

    if (score >= 85) return {
      score, label: 'Lista para rendir', shortLabel: 'ÓPTIMA',
      color: 'emerald' as const,
      bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400',
      ringGradient: 'conic-gradient(#10B981 0%, #10B981 VAR%, #1F2937 VAR%, #1F2937 100%)',
      action: 'Alta intensidad recomendada. Ventana ideal para fuerza o sprints.',
      avoid: 'No evites nada hoy — SNC recuperado.',
      evidenceLevel: 'Moderada',
    };
    if (score >= 68) return {
      score, label: 'Carga moderada', shortLabel: 'MODERADA',
      color: 'amber' as const,
      bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-400',
      ringGradient: 'conic-gradient(#F59E0B 0%, #F59E0B VAR%, #1F2937 VAR%, #1F2937 100%)',
      action: 'Sesión técnica o táctica de volumen medio.',
      avoid: 'Evita máximos de fuerza o sprints repetidos hoy.',
      evidenceLevel: 'Moderada',
    };
    return {
      score, label: 'Recuperación activa', shortLabel: 'BAJA',
      color: 'red' as const,
      bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400',
      ringGradient: 'conic-gradient(#EF4444 0%, #EF4444 VAR%, #1F2937 VAR%, #1F2937 100%)',
      action: 'Movilidad de cadera 20min + foam roller isquios.',
      avoid: 'Evita alta intensidad — riesgo LCA elevado con HRV bajo.',
      evidenceLevel: 'Alta',
    };
  }, [hrv, playerProfile.streakDays]);

  // ─── L2: AI Recommendation (position-aware) ────────────────────────────────
  const aiRecommendation = useMemo(() => {
    const pos = playerProfile.position;
    const name = playerProfile.name.split(' ')[0];
    if (hrv >= 65) {
      if (pos.includes('Contención') || pos.includes('Mediocentro')) {
        return `HRV ${hrv}ms — SNC recuperado. Ventana ideal para ${pos}: Escaneo visual, primer toque orientado y distribución de pase.`;
      }
      if (pos.includes('Extrema') || pos.includes('LW') || pos.includes('RW')) {
        return `HRV ${hrv}ms óptimo. Sistema ATP-PCr activo: haz aceleraciones 1v1 explosivas. Es tu mejor día de la semana.`;
      }
      return `HRV ${hrv}ms — carga alta permitida. ${playerProfile.streakDays} días de racha activa. Monitorea RPE: para si superas 8/10.`;
    }
    return `HRV ${hrv}ms sugiere fatiga acumulada (Flatt & Esco, 2017). Mayor riesgo LCA con fatiga en fútbol femenino. Recuperación activa hoy, ${name}.`;
  }, [hrv, playerProfile.position, playerProfile.streakDays, playerProfile.name]);

  // ─── Weekly load score (ACWR proxy) ─────────────────────────────────────────
  const weeklyLoadScore = useMemo(() => {
    if (!trends) return null;
    const ratio = trends.minutes.current / (trends.minutes.monthlyAvg || 1);
    if (ratio > 1.4) return { level: 'Alta', color: '#EF4444', ratio: ratio.toFixed(2), warning: true };
    if (ratio > 1.1) return { level: 'Moderada', color: '#F59E0B', ratio: ratio.toFixed(2), warning: false };
    return { level: 'Óptima', color: '#10B981', ratio: ratio.toFixed(2), warning: false };
  }, [trends]);

  const sections = [
    { id: 'biometrics', label: 'Biometría' },
    { id: 'microcycle', label: 'Microciclo' },
    { id: 'performance', label: 'Rendimiento' },
  ];

  return (
    <div className="space-y-4 pb-40 max-w-4xl mx-auto pt-1 animate-fade-in">

      {/* ═══════════════════════════════════════════════════════════
          L1: ESTADO HOY — responde ¿Cómo estoy? en <3 segundos
      ═══════════════════════════════════════════════════════════ */}
      <section
        aria-label="Estado fisiológico hoy"
        className="relative overflow-hidden rounded-3xl border border-[var(--accent-color)]/30 hero-card-notion hero-dynamic-card"
        style={{
          background: 'linear-gradient(135deg, var(--bg-card) 0%, var(--bg-card-solid) 100%)',
          boxShadow: '0 20px 60px -20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)'
        }}
      >
        {/* Ambient glow layers */}
        <div className="absolute -top-16 -right-16 w-80 h-80 rounded-full opacity-[0.07] blur-3xl pointer-events-none"
          style={{ backgroundColor: 'var(--accent-color)' }} />
        <div className={`absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-[0.04] blur-3xl pointer-events-none ${
          readiness.color === 'emerald' ? 'bg-emerald-500' : readiness.color === 'amber' ? 'bg-amber-500' : 'bg-red-500'
        }`} />

        <div className="relative z-10 p-5 md:p-6 space-y-4">

          {/* ── Row 1: Identity + Phase + Status ── */}
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 theme-accent-bg text-[9px] font-black rounded-lg uppercase tracking-widest shadow-sm">
                  <Sparkles className="w-2.5 h-2.5" />
                  APEX FEMME
                </span>
                <span className="text-[9px] font-bold text-cyan-400 px-2 py-0.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                  FASE FOLICULAR · PICO FUERZA
                </span>
              </div>
              <h1 className="text-xl md:text-2xl font-black text-[var(--text-main)] tracking-tight leading-tight">
                ¿Cómo estás hoy,<br className="sm:hidden" /> {playerProfile.name.split(' ')[0]}?
              </h1>
            </div>

            {/* Readiness Score — Dynamic Theme HUD */}
            <div className={`shrink-0 flex flex-col items-center justify-center w-20 h-20 rounded-2xl border-2 hero-dynamic-hud ${readiness.bg} ${readiness.border}`}>
              <span className={`text-2xl font-black font-mono leading-none ${readiness.text}`}>
                {readiness.score}
              </span>
              <span className={`text-[8px] font-extrabold uppercase tracking-wider ${readiness.text} opacity-70 mt-0.5`}>
                {readiness.shortLabel}
              </span>
              <span className="text-[7px] text-[var(--text-muted)] mt-0.5">DISPOSICIÓN</span>
            </div>
          </div>

          {/* ── Row 2: 5 Quick Answers — L1 visual hierarchy ── */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <QuickAnswerPill
              question="¿Cómo estoy?"
              answer={readiness.label}
              subtext={`HRV ${hrv}ms · Evidencia ${readiness.evidenceLevel}`}
              color={readiness.color}
              icon={<HeartPulse className="w-4 h-4" />}
            />
            <QuickAnswerPill
              question="¿Qué debo hacer?"
              answer={todayActivity?.title || 'Entrenamiento hoy'}
              subtext={todayActivity?.scheduledTime ? todayActivity.scheduledTime : undefined}
              color="accent"
              icon={<Zap className="w-4 h-4" />}
            />
            <QuickAnswerPill
              question="¿Qué evitar?"
              answer={readiness.color === 'red' ? 'Alta intensidad' : readiness.color === 'amber' ? 'Esfuerzo máximo' : 'Sin restricciones'}
              subtext={readiness.avoid}
              color={readiness.color}
              icon={<AlertTriangle className="w-4 h-4" />}
            />
            <QuickAnswerPill
              question="¿Estoy mejorando?"
              answer={trends?.rating
                ? (trends.rating.current > trends.rating.previousWeek ? 'Sí, mejorando' : trends.rating.current < trends.rating.previousWeek ? 'Bajó' : '→ Estable')
                : `OVR ${playerProfile.OVR}`}
              subtext={trends?.rating
                ? `Rating ${trends.rating.current}/10 vs ${trends.rating.previousWeek} sem. ant.`
                : `${playerProfile.streakDays} días racha activa`}
              color={trends?.rating && trends.rating.current > trends.rating.previousWeek ? 'emerald' : 'cyan'}
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <QuickAnswerPill
              question="¿Qué cambió?"
              answer={weeklyLoadScore
                ? `Carga ${weeklyLoadScore.level}`
                : `${completedDays}/7 días`}
              subtext={weeklyLoadScore
                ? `ACWR ${weeklyLoadScore.ratio} · ${weeklyLoadScore.warning ? 'Reducir hoy' : 'Zona segura'}`
                : `${completedDays} días completados esta semana`}
              color={weeklyLoadScore?.warning ? 'amber' : 'emerald'}
              icon={<Activity className="w-4 h-4" />}
            />
            <div className={`flex flex-col p-3 rounded-2xl border theme-accent-text bg-[var(--accent-color)]/10 border-[var(--accent-color)]/25 col-span-2 sm:col-span-1`}>
              <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-70 mb-1">PRÓXIMO PARTIDO</span>
              <span className="font-black text-sm leading-tight">SAB 16:00</span>
              <span className="text-[9px] opacity-60 mt-1">vs Valencia FF · 3 días</span>
            </div>
          </div>

          {/* ── Row 3: AI Context Insights (Max 2 — Why, Reasoning, Action) ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <div className={`p-3 rounded-2xl border text-[11px] leading-relaxed ${readiness.bg} ${readiness.border} ${readiness.text} space-y-1`}>
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider text-[9px] flex items-center gap-1 opacity-80">
                  <Brain className="w-3 h-3" /> AI INSIGHT #1 · CONTROL DE VOLUMEN
                </span>
                <span className="text-[9px] font-mono opacity-70">Confianza: 96%</span>
              </div>
              <p className="font-bold text-xs">"Llevas 8 días sin entrenar primer toque con pared."</p>
              <p className="text-[10px] opacity-80 font-mono"><strong>Razonamiento:</strong> El volumen en pierna no hábil disminuyó 26% esta semana (Hewett et al., 2005).</p>
              <p className="text-[10px] font-bold underline">→ Acción: Añadir 15 min de primer toque hoy.</p>
            </div>

            <div className="p-3 rounded-2xl border text-[11px] leading-relaxed bg-cyan-500/10 border-cyan-500/30 text-cyan-400 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider text-[9px] flex items-center gap-1 opacity-80">
                  <ShieldCheck className="w-3 h-3" /> AI INSIGHT #2 · PREVENCIÓN DE LESIONES
                </span>
                <span className="text-[9px] font-mono opacity-70">Evidencia Alta</span>
              </div>
              <p className="font-bold text-xs">"Ventana óptima para fuerza unipodal."</p>
              <p className="text-[10px] opacity-80 font-mono"><strong>Razonamiento:</strong> HRV {hrv}ms en fase folicular. Máxima tolerancia de carga de rodilla.</p>
              <p className="text-[10px] font-bold underline">→ Acción: Mantener Sentadillas Búlgaras en 4x8 @75% 1RM.</p>
            </div>
          </div>

          {/* ── Row 4: Quick Session Compression & Primary Hero Actions ── */}
          <div className="p-3 rounded-2xl bg-[var(--bg-input)] border border-[var(--border-subtle)] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-400" /> COMPRESIÓN RÁPIDA DE SESIÓN (REORGANIZACIÓN EN VIVO)
              </span>
              <span className="text-[9px] text-[var(--text-muted)]">¿Poco tiempo hoy?</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onStartInteractiveWorkout && todayActivity) {
                    const compressed = {
                      ...todayActivity,
                      title: `${todayActivity.title} (30 min)`,
                      durationMin: 30
                    };
                    onStartInteractiveWorkout(compressed);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-extrabold text-xs hover:bg-amber-500 hover:text-black transition-all flex items-center justify-center gap-1"
              >
                Solo tengo 30 Minutos
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onStartInteractiveWorkout && todayActivity) {
                    const compressed = {
                      ...todayActivity,
                      title: `${todayActivity.title} (45 min)`,
                      durationMin: 45
                    };
                    onStartInteractiveWorkout(compressed);
                  }
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-extrabold text-xs hover:bg-cyan-500 hover:text-black transition-all flex items-center justify-center gap-1"
              >
                Solo tengo 45 Minutos
              </button>
            </div>
          </div>

          {/* ── Row 5: Giant START TRAINING Button ── */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            {onStartInteractiveWorkout && (
              <button
                onClick={() => onStartInteractiveWorkout(todayActivity)}
                id="btn-start-workout"
                className="w-full hero-button-speed theme-accent-bg text-black py-4 rounded-2xl font-black text-sm uppercase tracking-wider theme-accent-glow flex items-center justify-center gap-2 shadow-2xl cursor-pointer border-2 border-white/40"
              >
                <Zap className="w-5 h-5 fill-current animate-pulse" />
                INICIAR ENTRENAMIENTO DE HOY
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ─── PERSONALIZACIÓN TOGGLE ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-1">
        <h2 className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">
          PANEL DE RENDIMIENTO
        </h2>
        <button
          onClick={() => setShowPersonalize(!showPersonalize)}
          className="flex items-center gap-1 text-[9px] font-bold text-[var(--text-muted)] hover:theme-accent-text transition-colors px-2 py-1 rounded-lg hover:bg-[var(--bg-input)]"
          aria-label="Personalizar dashboard"
        >
          <GripVertical className="w-3 h-3" />
          {showPersonalize ? 'Listo' : 'Personalizar'}
        </button>
      </div>

      {showPersonalize && (
        <div className="flex flex-wrap gap-2 p-3 bg-[var(--bg-input)] rounded-2xl border border-[var(--border-subtle)] animate-slide-up">
          {sections.map(s => (
            <button
              key={s.id}
              onClick={() => toggleSection(s.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold border transition-all ${
                hiddenSections.has(s.id)
                  ? 'bg-[var(--bg-card-solid)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                  : 'theme-accent-bg border-transparent'
              }`}
            >
              {hiddenSections.has(s.id) ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {s.label}
            </button>
          ))}
          <span className="text-[9px] text-[var(--text-muted)] self-center ml-1">Toca para ocultar secciones</span>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          L2: BIOMETRÍA — compacta, expandible, siempre útil
      ═══════════════════════════════════════════════════════════ */}
      {!hiddenSections.has('biometrics') && (
        <section aria-label="Biometría en tiempo real" className="glass-card rounded-2xl overflow-hidden border border-[var(--border-card)]">
          {/* Header (always visible) */}
          <button
            onClick={() => setShowBioDetails(!showBioDetails)}
            className="w-full flex items-center justify-between p-4 hover:bg-[var(--bg-card-hover)] transition-colors"
            aria-expanded={showBioDetails}
          >
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl theme-accent-bg flex items-center justify-center">
                <Watch className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="text-sm font-extrabold text-[var(--text-main)] leading-tight">Biometría</p>
                <p className="text-[10px] text-[var(--text-muted)]">
                  Registro biológico activo
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* HRV pill — always visible even when collapsed */}
              <span className={`text-[10px] font-bold font-mono px-2 py-1 rounded-lg ${readiness.bg} ${readiness.border} border ${readiness.text}`}>
                HRV {hrv}ms
              </span>
              {showBioDetails ? <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" /> : <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />}
            </div>
          </button>

          {/* Expanded biometrics */}
          {showBioDetails && (
            <div className="px-4 pb-4 space-y-3 border-t border-[var(--border-subtle)] pt-3 animate-slide-up">
              <div className="grid grid-cols-3 gap-2.5">
                {[
                  { label: 'FC ACTUAL', value: `${fc}`, unit: 'BPM', sub: 'Zona Reposo', color: '#EF4444', icon: <Heart className="w-3.5 h-3.5 text-red-500" />, pulse: true },
                  { label: 'PASOS HOY', value: '8,420', unit: '', sub: 'Meta 10,000', color: 'var(--accent-color)', icon: <Footprints className="w-3.5 h-3.5 theme-accent-text" />, pulse: false },
                  { label: 'CALORÍAS', value: '1,840', unit: 'kcal', sub: 'Gasto activo', color: '#F59E0B', icon: <Flame className="w-3.5 h-3.5 text-amber-500" />, pulse: false },
                ].map((m) => (
                  <div key={m.label} className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-subtle)] space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-[9px] font-extrabold text-[var(--text-muted)] uppercase tracking-wider">{m.label}</span>
                      <span className={m.pulse ? 'animate-pulse' : ''}>{m.icon}</span>
                    </div>
                    <p className="font-mono text-base font-black text-[var(--text-main)]">
                      {m.value} <span className="text-[10px] font-normal text-[var(--text-muted)]">{m.unit}</span>
                    </p>
                    <span className="text-[9px] text-[var(--text-muted)] block">{m.sub}</span>
                  </div>
                ))}
              </div>

              {/* Steps progress bar */}
              {(() => {
                const steps = 8420;
                const pct = Math.min(100, Math.round((steps / 10000) * 100));
                return (
                  <div>
                    <div className="flex justify-between text-[9px] text-[var(--text-muted)] mb-1">
                      <span>Pasos hacia meta diaria</span>
                      <span className="font-bold theme-accent-text">{pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-[var(--bg-card-solid)] rounded-full overflow-hidden">
                      <div className="h-full theme-accent-bg rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2.5 text-[10px] text-[var(--text-muted)]">
                  <span>Distancia: <strong className="theme-accent-text">6.4 km</strong></span>
                  <span>·</span>
                  <span>Ritmo: <strong className="text-purple-400">5:15 /km</strong></span>
                </div>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          L2: MICROCICLO SEMANAL — responde ¿Qué cambió esta semana?
      ═══════════════════════════════════════════════════════════ */}
      {!hiddenSections.has('microcycle') && (
        <section aria-label="Microciclo semanal" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)]">
                SEMANA EN CURSO
              </h2>
              {weeklyLoadScore && (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
                  style={{
                    color: weeklyLoadScore.color,
                    backgroundColor: weeklyLoadScore.color + '18',
                    borderColor: weeklyLoadScore.color + '40'
                  }}>
                  Carga {weeklyLoadScore.level} · {weeklyLoadScore.ratio}
                </span>
              )}
            </div>
            <button
              onClick={() => onNavigateTab('gym')}
              className="text-[10px] theme-accent-text font-bold hover:underline flex items-center gap-0.5"
            >
              Hub Gym <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 7-day pill strip */}
          <div className="grid grid-cols-7 gap-1.5">
            {weeklySchedule.map((day) => (
              <WeekDayCell
                key={day.id}
                day={day}
                onClick={() => onSelectDay(day.id)}
              />
            ))}
          </div>

          {/* Weekly progress summary */}
          <div className="flex items-center gap-2 px-0.5">
            <div className="flex-1 h-1.5 bg-[var(--bg-input)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full theme-accent-bg transition-all duration-700"
                style={{ width: `${(completedDays / 7) * 100}%` }}
              />
            </div>
            <span className="text-[9px] font-bold text-[var(--text-muted)] shrink-0">
              {completedDays}/7 días · {Math.round((completedDays / 7) * 100)}%
            </span>
          </div>

          {/* Today's session card */}
          {todayActivity && (
            <div className="bg-[var(--bg-input)] p-3.5 rounded-xl border border-[var(--border-subtle)] flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-[var(--accent-color)]/15 border border-[var(--accent-color)]/30 flex items-center justify-center theme-accent-text shrink-0">
                  {getActivityIcon(todayActivity.icon)}
                </div>
                <div>
                  <p className="text-xs font-extrabold text-[var(--text-main)] leading-tight">
                    {todayActivity.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                    {todayActivity.scheduledTime && (
                      <span className="font-mono theme-accent-text font-bold mr-1">⏰ {todayActivity.scheduledTime} ·</span>
                    )}
                    {todayActivity.durationMin} min · {todayActivity.location === 'gym' ? '🏋️' : todayActivity.location === 'campo' ? '⚽' : '🏠'} {todayActivity.intensity}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className={`text-[9px] font-bold px-2 py-1 rounded-lg ${
                  todayActivity.status === 'completed'
                    ? 'theme-accent-bg'
                    : 'bg-[var(--accent-color)]/15 theme-accent-text border border-[var(--accent-color)]/30'
                }`}>
                  {todayActivity.status === 'completed' ? '✓ Listo' : 'Hoy'}
                </span>
                <button
                  onClick={() => onNavigateTab('coach')}
                  className="p-1.5 rounded-lg text-[var(--text-muted)] hover:theme-accent-text hover:bg-[var(--bg-card-solid)] transition-all"
                  aria-label="Modificar plan"
                >
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          L2: RENDIMIENTO EN CONTEXTO — responde ¿Estoy mejorando?
      ═══════════════════════════════════════════════════════════ */}
      {!hiddenSections.has('performance') && (
        <section aria-label="Métricas de rendimiento con tendencias" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-main)]">
              RENDIMIENTO · TENDENCIAS
            </h2>
            <span className="text-[9px] text-[var(--text-muted)]">cada dato responde una pregunta</span>
          </div>

          {trends ? (
            <div className="grid grid-cols-2 gap-2.5 stagger-children">
              <MetricCard
                icon={<Flame className="w-4 h-4" />}
                label="Racha activa"
                value={`${playerProfile.streakDays}`}
                unit="días"
                accentColor="var(--accent-color)"
                recommendation={playerProfile.streakDays >= 5 ? 'Excelente consistencia. Monitorea señales de sobreentrenamiento.' : 'Mantén la racha — la consistencia construye adaptación.'}
              />
              <MetricCard
                icon={<Clock className="w-4 h-4" />}
                label="Volumen mensual"
                value={`${playerProfile.monthlyMinutes}`}
                unit="min"
                trend={trends.minutes}
                accentColor="#06B6D4"
                goalPct={trends.minutes.goalValue
                  ? Math.round((playerProfile.monthlyMinutes / trends.minutes.goalValue) * 100)
                  : undefined}
                recommendation={trends.minutes.current > trends.minutes.monthlyAvg
                  ? 'Por encima de tu promedio. Revisa señales de fatiga.'
                  : 'Margen para incrementar carga esta semana.'}
              />
              <MetricCard
                icon={<Star className="w-4 h-4" />}
                label="Rating promedio"
                value={`${playerProfile.avgRating}`}
                unit="/10"
                trend={trends.rating}
                accentColor="#A855F7"
                recommendation={trends.rating.current > trends.rating.previousWeek
                  ? `Mejoraste ${Math.abs(Math.round(((trends.rating.current - trends.rating.previousWeek) / trends.rating.previousWeek) * 100))}% respecto a la semana pasada.`
                  : 'Trabaja decisión bajo presión con rondos 1v1.'}
              />
              <MetricCard
                icon={<Target className="w-4 h-4" />}
                label="Distancia partido"
                value={`${trends.distance.current}`}
                unit="km"
                trend={trends.distance}
                accentColor="#10B981"
                goalPct={trends.distance.goalValue
                  ? Math.round((trends.distance.current / trends.distance.goalValue) * 100)
                  : undefined}
                recommendation={`Meta élite ${playerProfile.position.includes('Lateral') ? '10–12' : '8–10'} km/partido.`}
              />
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { label: 'Racha', value: `${playerProfile.streakDays} días`, color: 'var(--accent-color)', icon: <Flame className="w-5 h-5" /> },
                { label: 'Volumen', value: `${playerProfile.monthlyMinutes} min`, color: '#06B6D4', icon: <Clock className="w-5 h-5" /> },
                { label: 'Rating', value: `${playerProfile.avgRating}/10`, color: '#A855F7', icon: <Star className="w-5 h-5" /> },
              ].map(m => (
                <div key={m.label} className="glass-card p-3.5 rounded-xl border-l-2" style={{ borderLeftColor: m.color }}>
                  <span style={{ color: m.color }}>{m.icon}</span>
                  <p className="text-lg font-black font-mono text-[var(--text-main)] mt-1">{m.value}</p>
                  <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-wide">{m.label}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ═══════════════════════════════════════════════════════════
          L3: AI COACH — responde ¿Qué recomienda la IA? 
          Siempre al final — es profundización, no urgencia
      ═══════════════════════════════════════════════════════════ */}
      <section
        aria-label="Recomendación IA"
        className="rounded-2xl p-4 border border-[var(--border-subtle)] bg-[var(--bg-input)] flex items-start gap-3 animate-slide-up"
      >
        <div className="w-9 h-9 shrink-0 rounded-xl bg-[var(--accent-color)]/15 border border-[var(--accent-color)]/25 flex items-center justify-center theme-accent-text mt-0.5">
          <Brain className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-[9px] theme-accent-text font-extrabold uppercase tracking-widest block mb-1">
            APEX IA · ANÁLISIS BIOLÓGICO Y TÁCTICO
          </span>
          <p className="text-[11px] text-[var(--text-main)] leading-relaxed">
            {aiRecommendation}
          </p>
        </div>
        <button
          onClick={() => onNavigateTab('coach')}
          className="shrink-0 p-2 rounded-xl bg-[var(--bg-card-solid)] theme-accent-text hover:bg-[var(--bg-input)] transition-colors mt-0.5"
          aria-label="Consultar Coach IA completo"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </section>

    </div>
  );
};
