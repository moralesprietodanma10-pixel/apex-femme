import React, { useState } from 'react';
import { PlayerProfile, Challenge, Badge, ChallengeTimeframe, ChallengeDifficulty, ChallengeFocus } from '../types';
import { 
  Trophy, 
  Flame, 
  CheckCircle2, 
  Lock, 
  Zap, 
  Award, 
  Brain, 
  ShieldCheck, 
  Sparkles, 
  Users, 
  GitCommit, 
  ChevronRight,
  Eye,
  CalendarCheck,
  Dumbbell,
  Clock,
  Target,
  Filter,
  Check
} from 'lucide-react';

interface GamificationViewProps {
  playerProfile: PlayerProfile;
  challenges: Challenge[];
  badges: Badge[];
  onClaimChallenge: (challengeId: string) => void;
}

export const GamificationView: React.FC<GamificationViewProps> = ({
  playerProfile,
  challenges,
  badges,
  onClaimChallenge
}) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState<ChallengeTimeframe | 'all'>('diario');
  const [selectedDifficulty, setSelectedDifficulty] = useState<ChallengeDifficulty | 'all'>('all');
  const [selectedFocus, setSelectedFocus] = useState<ChallengeFocus | 'all'>('all');

  const xpInCurrentLevel = playerProfile.xp % 1000;
  const progressPercent = Math.min(100, Math.round((xpInCurrentLevel / 1000) * 100));
  const strokeDashoffset = 364.4 - (364.4 * progressPercent) / 100;

  // Filter Challenges
  const filteredChallenges = challenges.filter((c) => {
    if (selectedTimeframe !== 'all' && c.timeframe !== selectedTimeframe) return false;
    if (selectedDifficulty !== 'all' && c.difficulty !== selectedDifficulty) return false;
    if (selectedFocus !== 'all' && c.focusArea !== selectedFocus) return false;
    return true;
  });

  const getTimeframeCountdown = (tf: ChallengeTimeframe | 'all') => {
    switch (tf) {
      case 'diario': return 'Se reinicia en 14h 22m';
      case 'semanal': return 'Se reinicia en 3d 18h';
      case 'mensual': return 'Se reinicia en 12d';
      case 'anual': return 'Temporada 2026';
      default: return 'Reinicios periódicos';
    }
  };

  const getDifficultyBadge = (diff: ChallengeDifficulty) => {
    switch (diff) {
      case 'facil': return <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded">Fácil</span>;
      case 'medio': return <span className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/40 text-[10px] font-bold px-2 py-0.5 rounded">Medio</span>;
      case 'dificil': return <span className="bg-orange-500/20 text-orange-300 border border-orange-500/40 text-[10px] font-bold px-2 py-0.5 rounded">Difícil</span>;
      case 'elite': return <span className="bg-purple-500/20 text-purple-300 border border-purple-500/40 text-[10px] font-bold px-2 py-0.5 rounded">Élite / Leyenda</span>;
    }
  };

  const getFocusBadge = (focus: ChallengeFocus) => {
    switch (focus) {
      case 'tactica': return <span className="text-[10px] font-mono text-[#7bd0ff]">🎯 Táctica</span>;
      case 'fisico': return <span className="text-[10px] font-mono text-[#9ee939]">⚡ Físico</span>;
      case 'tecnico': return <span className="text-[10px] font-mono text-[#facc15]">⚽ Técnico</span>;
      case 'mental': return <span className="text-[10px] font-mono text-[#c084fc]">🧠 Mental</span>;
    }
  };

  const getBadgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Users': return <Users className="w-6 h-6" />;
      case 'GitCommit': return <GitCommit className="w-6 h-6" />;
      case 'ShieldCheck': return <ShieldCheck className="w-6 h-6" />;
      case 'Zap': return <Zap className="w-6 h-6" />;
      case 'Sparkles': return <Sparkles className="w-6 h-6" />;
      case 'Award': default: return <Award className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-32 animate-fade-in">
      {/* Circular Progress Gauge & Level Info */}
      <section className="glass-card rounded-3xl p-6 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden bg-gradient-to-br from-[#171f33] to-[#131b2e] border border-[#424936]/60 shadow-xl">
        <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              className="text-[#2d3449]"
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
            />
            <circle
              className="text-[#84cc16] transition-all duration-700 ease-out"
              cx="64"
              cy="64"
              r="58"
              fill="transparent"
              stroke="currentColor"
              strokeWidth="8"
              strokeDasharray="364.4"
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono text-3xl font-extrabold text-[#dae2fd]">
              {playerProfile.level}
            </span>
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#c1cab0]">
              NIVEL
            </span>
          </div>
        </div>

        <div className="flex-grow text-center md:text-left space-y-1.5">
          <span className="text-[10px] font-bold text-[#84cc16] uppercase tracking-wider bg-[#84cc16]/10 px-2.5 py-0.5 rounded border border-[#84cc16]/30 inline-block">
            RANGO ACTUAL: PLAYMAKER DE ÉLITE
          </span>
          <h2 className="font-extrabold text-2xl text-[#dae2fd]">
            Siguiente Rango: Maestra Táctica
          </h2>
          <p className="text-xs text-[#c1cab0] leading-relaxed">
            Faltan {1000 - xpInCurrentLevel} XP para alcanzar el Nivel {playerProfile.level + 1}. Completa retos diarios, semanales, mensuales y anuales para subir de categoría.
          </p>

          <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
            <div className="px-3 py-1 bg-[#84cc16]/15 border border-[#84cc16]/30 rounded-full flex items-center gap-1.5 text-xs text-[#9ee939] font-bold">
              <Flame className="w-3.5 h-3.5 animate-pulse" />
              <span>{playerProfile.streakDays} Días de Racha Activa</span>
            </div>
            <div className="px-3 py-1 bg-[#00a6e0]/15 border border-[#00a6e0]/30 rounded-full flex items-center gap-1.5 text-xs text-[#7bd0ff] font-bold font-mono">
              <span>TOTAL XP: {playerProfile.xp.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Timeframe Selector & Challenge Filters */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#424936]/40 pb-3">
          <div>
            <h3 className="font-extrabold text-lg text-[#dae2fd] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#84cc16]" /> LOGROS Y RETOS PERIODICOS
            </h3>
            <p className="text-xs text-[#c1cab0] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#84cc16]" />
              {getTimeframeCountdown(selectedTimeframe)}
            </p>
          </div>

          {/* Timeframe Tabs */}
          <div className="flex gap-1 overflow-x-auto bg-[#131b2e] p-1 rounded-xl border border-[#424936]">
            {[
              { id: 'diario', label: 'Diarios' },
              { id: 'semanal', label: 'Semanales' },
              { id: 'mensual', label: 'Mensuales' },
              { id: 'anual', label: 'Anuales' },
              { id: 'all', label: 'Todos' },
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => setSelectedTimeframe(tf.id as ChallengeTimeframe | 'all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  selectedTimeframe === tf.id
                    ? 'bg-[#84cc16] text-[#102000] shadow'
                    : 'text-[#c1cab0] hover:text-white'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Controls (Difficulty & Focus Area) */}
        <div className="flex flex-wrap gap-3 items-center justify-between bg-[#131b2e] p-3 rounded-2xl border border-[#424936]/60 text-xs">
          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-bold text-[#c1cab0] flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-[#84cc16]" /> Dificultad:
            </span>
            {['all', 'facil', 'medio', 'dificil', 'elite'].map((diff) => (
              <button
                key={diff}
                onClick={() => setSelectedDifficulty(diff as ChallengeDifficulty | 'all')}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                  selectedDifficulty === diff
                    ? 'bg-[#84cc16]/20 text-[#9ee939] border border-[#84cc16]'
                    : 'bg-[#171f33] text-[#c1cab0] border border-[#424936]/40'
                }`}
              >
                {diff === 'all' ? 'Todas' : diff}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            <span className="font-bold text-[#c1cab0] flex items-center gap-1">
              <Target className="w-3.5 h-3.5 text-[#00a6e0]" /> Área:
            </span>
            {['all', 'tactica', 'fisico', 'tecnico', 'mental'].map((f) => (
              <button
                key={f}
                onClick={() => setSelectedFocus(f as ChallengeFocus | 'all')}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all ${
                  selectedFocus === f
                    ? 'bg-[#00a6e0]/20 text-[#7bd0ff] border border-[#00a6e0]'
                    : 'bg-[#171f33] text-[#c1cab0] border border-[#424936]/40'
                }`}
              >
                {f === 'all' ? 'Todas' : f}
              </button>
            ))}
          </div>
        </div>

        {/* Challenge Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredChallenges.length === 0 ? (
            <div className="col-span-2 text-center py-8 glass-card rounded-2xl">
              <p className="text-sm text-[#c1cab0]">No hay retos que coincidan con los filtros seleccionados.</p>
            </div>
          ) : (
            filteredChallenges.map((challenge) => {
              const isDone = challenge.progress >= challenge.maxProgress;
              const canClaim = isDone && !challenge.claimed;

              return (
                <div
                  key={challenge.id}
                  className={`glass-card p-4 rounded-2xl border-l-4 transition-all flex flex-col justify-between ${
                    challenge.claimed 
                      ? 'border-[#424936] opacity-70' 
                      : isDone 
                      ? 'border-[#84cc16] bg-[#84cc16]/10' 
                      : 'border-[#00a6e0]'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          {getDifficultyBadge(challenge.difficulty)}
                          {getFocusBadge(challenge.focusArea)}
                          <span className="text-[10px] font-mono uppercase bg-[#131b2e] px-2 py-0.5 rounded text-[#c1cab0] border border-[#424936]">
                            {challenge.timeframe}
                          </span>
                        </div>

                        <h4 className="font-extrabold text-sm text-[#dae2fd] flex items-center gap-2">
                          {challenge.title}
                          {isDone && <CheckCircle2 className="w-4 h-4 text-[#9ee939]" />}
                        </h4>
                        <p className="text-[11px] text-[#c1cab0] leading-relaxed mt-0.5">{challenge.description}</p>
                      </div>

                      <span className="font-mono text-xs font-extrabold text-[#9ee939] bg-[#84cc16]/20 px-2.5 py-1 rounded shrink-0 border border-[#84cc16]/30">
                        +{challenge.rewardXp} XP
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-[#131b2e] h-2 rounded-full overflow-hidden my-3 border border-[#424936]/40">
                      <div
                        className={`h-full transition-all duration-500 ${
                          isDone ? 'bg-[#84cc16]' : 'bg-[#00a6e0]'
                        }`}
                        style={{
                          width: `${Math.min(100, (challenge.progress / challenge.maxProgress) * 100)}%`
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 text-xs pt-2 border-t border-[#424936]/30">
                    <span className="font-mono text-[#c1cab0] font-bold">
                      Progreso: {challenge.progress} / {challenge.maxProgress}
                    </span>

                    {canClaim ? (
                      <button
                        onClick={() => onClaimChallenge(challenge.id)}
                        className="bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] px-3.5 py-1.5 rounded-xl font-bold text-xs shadow-md active:scale-95 transition-all flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Reclamar
                      </button>
                    ) : challenge.claimed ? (
                      <span className="text-[11px] text-[#9ee939] font-bold flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> Recompensado
                      </span>
                    ) : (
                      <span className="text-[11px] text-[#7bd0ff] font-bold">En progreso</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Trophy Showcase (Vitrina de Trofeos) */}
      <section className="space-y-3 pt-4">
        <h3 className="font-extrabold text-lg text-[#dae2fd]">
          VITRINA DE TROFEOS & MEDALLAS
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {badges.map((badge) => {
            const isUnlocked = badge.unlocked;

            return (
              <div
                key={badge.id}
                className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl glass-card transition-all text-center ${
                  isUnlocked 
                    ? 'border-2 border-[#84cc16] neon-glow-lime' 
                    : 'border border-[#424936]/40 opacity-50 grayscale'
                }`}
                title={badge.description}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isUnlocked 
                    ? 'bg-[#84cc16]/20 text-[#9ee939]' 
                    : 'bg-[#1e293b] text-[#c1cab0]'
                }`}>
                  {isUnlocked ? getBadgeIcon(badge.icon) : <Lock className="w-5 h-5 text-[#c1cab0]" />}
                </div>

                <span className="text-[11px] font-bold text-[#dae2fd] leading-tight">
                  {badge.title}
                </span>

                <span className="text-[9px] text-[#c1cab0] font-mono">
                  {isUnlocked ? 'DESBLOQUEADO' : 'BLOQUEADO'}
                </span>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
