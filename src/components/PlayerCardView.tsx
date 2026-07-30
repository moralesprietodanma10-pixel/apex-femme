import React, { useState } from 'react';
import { PlayerProfile, MatchLog } from '../types';
import { FEMALE_MENTORS } from '../data/initialData';
import { 
  Shield, 
  TrendingUp, 
  Award, 
  ChevronRight, 
  Trash2, 
  Sparkles, 
  Zap, 
  Star, 
  Flame, 
  Printer, 
  Share2, 
  Activity, 
  Layers, 
  Target,
  BarChart2
} from 'lucide-react';

interface PlayerCardViewProps {
  playerProfile: PlayerProfile;
  matchLogs: MatchLog[];
  onDeleteMatch?: (matchId: string) => void;
}

type FutCardTheme = 'gold' | 'totw' | 'tots' | 'hero' | 'future';

export const PlayerCardView: React.FC<PlayerCardViewProps> = ({ playerProfile, matchLogs, onDeleteMatch }) => {
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'PARTIDO' | 'ENTRENAMIENTO'>('ALL');
  const [cardTheme, setCardTheme] = useState<FutCardTheme>('gold');
  const [selectedCompareMentorId, setSelectedCompareMentorId] = useState<string>('mentor-1');

  const { rhythm, passing, vision, physical, recovery, shooting } = playerProfile.attributes;

  // Calculate standard FUT six stats
  const pac = Math.round(rhythm);
  const sho = Math.round(shooting);
  const pas = Math.round(passing);
  const dri = Math.round(vision); // Vision / Dribbling
  const def = Math.round(recovery);
  const phy = Math.round(physical);

  const comparedMentor = FEMALE_MENTORS.find(m => m.id === selectedCompareMentorId) || FEMALE_MENTORS[0];

  // PlayStyles list for EA FC Style
  const playstyles = [
    { name: 'Pase Incisivo+', category: 'Pases', icon: '🎯', desc: 'Pases filtrados milimétricos entre líneas' },
    { name: 'Tiki-Taka+', category: 'Control', icon: '⚽', desc: 'Pases al primer toque ultra precisos' },
    { name: 'Regate Hábil+', category: 'Técnica', icon: '⚡', desc: 'Agilidad superior en espacios reducidos' },
    { name: 'Intercepción+', category: 'Defensa', icon: '🛡️', desc: 'Lectura anticipada de líneas de pase rivales' }
  ];

  // Radar polygon math (0-100 values mapped to SVG 200x200 canvas)
  const getRadarPoints = (statsArray: number[]) => {
    const angles = [-90, -30, 30, 90, 150, 210];
    return statsArray.map((val, i) => {
      const angleRad = (angles[i] * Math.PI) / 180;
      const radius = (val / 100) * 65;
      const x = 100 + radius * Math.cos(angleRad);
      const y = 100 + radius * Math.sin(angleRad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    }).join(' ');
  };

  const myStatsArray = [rhythm, passing, vision, physical, recovery, shooting];
  // Mentor estimated 6-axis attributes
  const mentorStatsArray = [
    comparedMentor.OVR - 2, 
    comparedMentor.OVR + 3, 
    comparedMentor.OVR + 1, 
    comparedMentor.OVR - 4, 
    comparedMentor.OVR - 1, 
    comparedMentor.OVR - 3
  ];

  const filteredLogs = matchLogs.filter(log => {
    if (filterType === 'ALL') return true;
    return log.type === filterType;
  });

  const handlePrintCard = () => {
    window.print();
  };

  // Card background styling based on FUT Theme
  const getCardThemeStyles = () => {
    switch (cardTheme) {
      case 'totw':
        return {
          bg: 'bg-gradient-to-b from-[#111111] via-[#1f1f1f] to-[#0a0a0a]',
          border: 'border-[#eab308]',
          glow: 'shadow-[0_0_25px_rgba(234,179,8,0.35)]',
          badgeBg: 'bg-[#eab308] text-black',
          titleColor: 'text-[#eab308]',
          name: 'TOTW (EQUIPO DE LA SEMANA)'
        };
      case 'tots':
        return {
          bg: 'bg-gradient-to-b from-[#0284c7] via-[#0369a1] to-[#082f49]',
          border: 'border-[#38bdf8]',
          glow: 'shadow-[0_0_25px_rgba(56,189,248,0.45)]',
          badgeBg: 'bg-[#38bdf8] text-black',
          titleColor: 'text-[#7dd3fc]',
          name: 'TOTS (EQUIPO DE LA TEMPORADA)'
        };
      case 'hero':
        return {
          bg: 'bg-gradient-to-b from-[#7e22ce] via-[#581c87] to-[#3b0764]',
          border: 'border-[#c084fc]',
          glow: 'shadow-[0_0_25px_rgba(192,132,252,0.45)]',
          badgeBg: 'bg-[#c084fc] text-black',
          titleColor: 'text-[#e9d5ff]',
          name: 'FUT HERO / LEYENDA'
        };
      case 'future':
        return {
          bg: 'bg-gradient-to-b from-[#be185d] via-[#9d174d] to-[#500724]',
          border: 'border-[#f472b6]',
          glow: 'shadow-[0_0_25px_rgba(244,114,182,0.45)]',
          badgeBg: 'bg-[#f472b6] text-black',
          titleColor: 'text-[#fbcfe8]',
          name: 'FUTURE STARS'
        };
      case 'gold':
      default:
        return {
          bg: 'bg-gradient-to-b from-[#ca8a04] via-[#854d0e] to-[#451a03]',
          border: 'border-[#facc15]',
          glow: 'shadow-[0_0_25px_rgba(250,204,21,0.35)]',
          badgeBg: 'bg-[#facc15] text-black',
          titleColor: 'text-[#fef08a]',
          name: 'CARTA ORO RARA'
        };
    }
  };

  const handleShareCard = async () => {
    const text = `⚽ APEX FEMME - Ficha EA FC de ${playerProfile.name}\n⭐ OVR: ${playerProfile.OVR} | Posición: ${playerProfile.position}\n🔥 Ritmo: ${pac} | Disparo: ${sho} | Pase: ${pas} | Visión: ${dri} | Recuperación: ${def} | Físico: ${phy}`;
    if (typeof navigator !== 'undefined' && (navigator as any).share) {
      try {
        await (navigator as any).share({
          title: `Ficha EA FC - ${playerProfile.name}`,
          text: text,
          url: window.location.href,
        });
      } catch { /* ignore */ }
    } else if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      alert('¡Estadísticas copiadas al portapapeles! Listo para compartir en tus redes sociales.');
    }
  };

  const currentTheme = getCardThemeStyles();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-32 animate-fade-in">
      {/* Top Header Single Question */}
      <section className="glass-card rounded-3xl p-6 border border-[var(--accent-color)]/40 relative overflow-hidden shadow-2xl space-y-2">
        <span className="text-[10px] font-mono font-bold uppercase tracking-widest theme-accent-text block">
          IDENTIDAD DE JUGADORA & EVALUACIÓN EA FC
        </span>
        <h2 className="font-extrabold text-2xl md:text-3xl text-[var(--text-main)]">
          ¿Quién soy como atleta?
        </h2>
        <p className="text-xs text-[var(--text-muted)]">
          Ficha interactiva de atributos FIFA/EA FC, radar comparativo de 6 ejes frente a referentes y desglose de PlayStyles+.
        </p>
      </section>

      {/* Theme Switcher & Actions Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--bg-input)] p-3.5 rounded-2xl border border-[var(--border-subtle)]">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-[var(--accent-color)]" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-[var(--text-main)]">
            Estilo de Carta EA FC Pro
          </h3>
        </div>

        <div className="flex gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 items-center justify-between sm:justify-end">
          <div className="flex gap-1.5 overflow-x-auto">
            {[
              { id: 'gold', label: 'Oro Rara' },
              { id: 'totw', label: 'TOTW' },
              { id: 'tots', label: 'TOTS' },
              { id: 'hero', label: 'FUT Hero' },
              { id: 'future', label: 'Future Stars' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setCardTheme(t.id as FutCardTheme)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all whitespace-nowrap ${
                  cardTheme === t.id
                    ? 'theme-accent-bg shadow-md'
                    : 'bg-[var(--bg-card-solid)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border-subtle)]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="flex gap-1">
            <button
              onClick={handleShareCard}
              className="p-1.5 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)] shrink-0 transition-colors"
              title="Compartir / Copiar Ficha FUT"
            >
              <Share2 className="w-4 h-4" />
            </button>

            <button
              onClick={handlePrintCard}
              className="p-1.5 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)] shrink-0 transition-colors"
              title="Imprimir / Exportar Ficha FUT"
            >
              <Printer className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main EA FC Ultimate Team Card Showcase */}
      <section className="glass-card rounded-3xl p-6 relative overflow-hidden border border-[var(--border-card)] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* EA FC Card Container (3D Styled) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className={`w-64 h-[385px] rounded-3xl p-3.5 ${currentTheme.bg} border-2 ${currentTheme.border} ${currentTheme.glow} flex flex-col justify-between relative overflow-hidden transition-all duration-300 transform hover:scale-[1.02] shadow-2xl`}>
              
              {/* Metallic Shine Overlay */}
              <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/10 rounded-full blur-2xl pointer-events-none" />

              {/* Top Rating & Position & Flag */}
              <div className="flex justify-between items-start relative z-10">
                <div className="flex flex-col items-center leading-none">
                  <span className="font-mono font-extrabold text-4xl text-white drop-shadow-md">
                    {playerProfile.OVR}
                  </span>
                  <span className={`font-mono text-xs font-black uppercase tracking-wider mt-1 px-1.5 py-0.5 rounded ${currentTheme.badgeBg}`}>
                    {playerProfile.position.split('/')[1] || 'MC'}
                  </span>
                  <span className="text-base mt-1.5">{playerProfile.country === 'ESP' ? '🇪🇸' : '🌐'}</span>
                </div>

                <div className="text-right">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-white/80 block">
                    {currentTheme.name}
                  </span>
                  <span className="text-[10px] font-mono text-white/90">
                    DORSAL {playerProfile.jerseyNumber}
                  </span>
                </div>
              </div>

              {/* Player Image */}
              <div className="relative w-full h-44 my-1 overflow-hidden rounded-xl border border-white/20 shadow-inner">
                <img
                  src={playerProfile.playerCardPhotoUrl}
                  alt={playerProfile.name}
                  className="w-full h-full object-cover object-top"
                />
              </div>

              {/* Player Name */}
              <div className="text-center relative z-10">
                <h2 className="font-extrabold text-xl text-white tracking-wide uppercase drop-shadow-md truncate">
                  {playerProfile.name}
                </h2>
                <p className={`text-[10px] font-bold ${currentTheme.titleColor} uppercase tracking-wider`}>
                  {playerProfile.preferredFoot} • {playerProfile.club || 'FC Club Pro'}
                </p>
              </div>

              {/* Six Core EA FC Stats Row */}
              <div className="grid grid-cols-6 gap-1 bg-black/60 backdrop-blur-md rounded-xl p-2 text-center text-white border border-white/20 relative z-10 font-mono">
                <div>
                  <span className="text-[9px] text-white/60 block">PAC</span>
                  <span className="font-bold text-xs">{pac}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/60 block">SHO</span>
                  <span className="font-bold text-xs">{sho}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/60 block">PAS</span>
                  <span className="font-bold text-xs">{pas}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/60 block">DRI</span>
                  <span className="font-bold text-xs">{dri}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/60 block">DEF</span>
                  <span className="font-bold text-xs">{def}</span>
                </div>
                <div>
                  <span className="text-[9px] text-white/60 block">PHY</span>
                  <span className="font-bold text-xs">{phy}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Radar Chart & Head-to-Head Mentor Comparison */}
          <div className="lg:col-span-7 space-y-5">
            
            {/* Tactical Radar Diagram with Mentor Overlay */}
            <div className="bg-[var(--bg-input)] p-5 rounded-2xl border border-[var(--border-subtle)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-2 text-center sm:text-left flex-1">
                <span className="text-[10px] font-bold uppercase tracking-wider theme-accent-text">
                  EVALUACIÓN TÁCTICA Y BIOMECÁNICA
                </span>
                <h3 className="font-extrabold text-lg text-[var(--text-main)]">Polígono de Rendimiento</h3>
                
                {/* Mentor Selector for Comparison */}
                <div className="space-y-1 pt-1">
                  <label className="text-[10px] font-bold text-[var(--text-muted)] block uppercase">
                    Comparar con Referente Mundial:
                  </label>
                  <select
                    value={selectedCompareMentorId}
                    onChange={(e) => setSelectedCompareMentorId(e.target.value)}
                    className="w-full bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] rounded-xl px-2.5 py-1.5 text-xs text-[var(--text-main)] outline-none font-bold"
                  >
                    {FEMALE_MENTORS.map((m) => (
                      <option key={m.id} value={m.id} className="bg-[var(--bg-card-solid)] text-[var(--text-main)]">
                        {m.flag} {m.name} (OVR {m.OVR})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3 text-[10px] font-bold pt-1 justify-center sm:justify-start">
                  <span className="flex items-center gap-1 theme-accent-text">
                    <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-color)] inline-block" /> {playerProfile.name}
                  </span>
                  <span className="flex items-center gap-1 text-cyan-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> {comparedMentor.name}
                  </span>
                </div>
              </div>

              {/* SVG Dual Radar Canvas */}
              <div className="relative w-48 h-48 shrink-0">
                <svg className="w-full h-full drop-shadow-[0_0_12px_rgba(132,204,22,0.3)]" viewBox="0 0 200 200">
                  <polygon points="100,30 160,65 160,135 100,170 40,135 40,65" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
                  <polygon points="100,53 140,76 140,123 100,147 60,123 60,76" fill="none" stroke="var(--border-subtle)" strokeWidth="1" />
                  <line x1="100" y1="100" x2="100" y2="30" stroke="var(--border-subtle)" strokeWidth="1" />
                  <line x1="100" y1="100" x2="160" y2="65" stroke="var(--border-subtle)" strokeWidth="1" />
                  <line x1="100" y1="100" x2="160" y2="135" stroke="var(--border-subtle)" strokeWidth="1" />
                  <line x1="100" y1="100" x2="100" y2="170" stroke="var(--border-subtle)" strokeWidth="1" />
                  <line x1="100" y1="100" x2="40" y2="135" stroke="var(--border-subtle)" strokeWidth="1" />
                  <line x1="100" y1="100" x2="40" y2="65" stroke="var(--border-subtle)" strokeWidth="1" />

                  {/* Mentor Polygon (Cyan) */}
                  <polygon
                    points={getRadarPoints(mentorStatsArray)}
                    fill="rgba(6, 182, 212, 0.15)"
                    stroke="#06b6d4"
                    strokeWidth="1.5"
                    strokeDasharray="3 3"
                  />

                  {/* Player Polygon (Accent) */}
                  <polygon
                    points={getRadarPoints(myStatsArray)}
                    fill="var(--accent-glow)"
                    stroke="var(--accent-color)"
                    strokeWidth="2.5"
                  />
                </svg>

                <span className="absolute top-0 left-1/2 -translate-x-1/2 font-bold text-[10px] theme-accent-text">RIT {rhythm}</span>
                <span className="absolute top-1/4 -right-2 font-bold text-[10px] theme-accent-text">PAS {passing}</span>
                <span className="absolute bottom-1/4 -right-2 font-bold text-[10px] theme-accent-text">VIS {vision}</span>
                <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 font-bold text-[10px] theme-accent-text">FIS {physical}</span>
                <span className="absolute bottom-1/4 -left-2 font-bold text-[10px] theme-accent-text">REC {recovery}</span>
                <span className="absolute top-1/4 -left-2 font-bold text-[10px] theme-accent-text">DIS {shooting}</span>
              </div>
            </div>

            {/* PlayStyles+ Badge Grid (EA FC Feature) */}
            <div className="space-y-2">
              <h4 className="font-extrabold text-xs uppercase tracking-wider text-[var(--text-main)] flex items-center gap-1.5">
                <Zap className="w-4 h-4 theme-accent-text" /> ESTILOS DE JUEGO (PLAYSTYLES+)
              </h4>

              <div className="grid grid-cols-2 gap-2.5">
                {playstyles.map((ps, idx) => (
                  <div key={idx} className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-subtle)] flex items-center gap-2.5">
                    <span className="text-xl shrink-0">{ps.icon}</span>
                    <div>
                      <p className="font-extrabold text-xs text-[var(--text-main)]">{ps.name}</p>
                      <p className="text-[10px] text-[var(--text-muted)] leading-tight">{ps.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* GPS Field Telemetry & Seasonal Heatmap Overview */}
      <section className="glass-card p-5 rounded-2xl border border-[var(--border-card)] space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-base text-[var(--text-main)] flex items-center gap-2">
            <Activity className="w-5 h-5 theme-accent-text" /> TELEMETRÍA GPS Y MAPA DE CALOR DE TEMPORADA
          </h3>
          <span className="text-xs font-mono font-bold theme-accent-text uppercase">
            Zona Clave: Mediocentro Ofensivo
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          {/* Mini 2D Pitch Simulation */}
          <div className="md:col-span-2 tactical-pitch h-44 rounded-xl relative p-3 border border-emerald-500/40 overflow-hidden flex flex-col justify-between">
            {/* Center Circle & Halfway Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/30" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 rounded-full border border-white/30 pointer-events-none" />

            {/* Heat Spot Highlights */}
            <div className="absolute top-1/3 left-1/2 w-24 h-24 bg-amber-500/50 rounded-full blur-xl pointer-events-none animate-pulse-slow" />
            <div className="absolute bottom-1/4 left-1/3 w-20 h-20 bg-lime-400/45 rounded-full blur-lg pointer-events-none" />

            <div className="relative z-10 flex justify-between text-[10px] font-mono font-extrabold text-white/80">
              <span>DEFENSA PROPRIA</span>
              <span>MEDIOCAMPO TÁCTICO</span>
              <span>ÁREA RIVAL</span>
            </div>

            <div className="relative z-10 flex justify-around text-center text-white font-mono">
              <div className="bg-black/60 backdrop-blur p-1.5 rounded-lg border border-white/20 text-[10px]">
                <span className="block text-emerald-400 font-bold">64% Presencia</span>
                <span>Tercio Medio</span>
              </div>
              <div className="bg-black/60 backdrop-blur p-1.5 rounded-lg border border-white/20 text-[10px]">
                <span className="block text-amber-400 font-bold">28% Incursión</span>
                <span>Último Tercio</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase">DISTANCIA MEDIA / PARTIDO</span>
              <span className="font-mono text-lg font-extrabold theme-accent-text">9.85 km</span>
            </div>
            <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border-subtle)]">
              <span className="text-[10px] text-[var(--text-muted)] font-bold block uppercase">SPRINTS DE ALTA INTENSIDAD</span>
              <span className="font-mono text-lg font-extrabold text-cyan-400">22 sprints/partido</span>
            </div>
          </div>
        </div>
      </section>

      {/* Monthly Attribute Progression */}
      <section className="space-y-3">
        <div className="flex justify-between items-end">
          <h3 className="font-extrabold text-base text-[var(--text-main)] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 theme-accent-text" /> PROGRESO MENSUAL EN CAMPO
          </h3>
          <span className="font-bold text-xs theme-accent-text font-mono">
            +2.4 OVR TOTAL ESTE MES
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="glass-card p-4 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-[var(--text-muted)]">PASE Y DISTRIBUCIÓN</span>
              <div className="flex items-center gap-1 theme-accent-text font-mono font-bold text-sm">
                <TrendingUp className="w-4 h-4" /> +3
              </div>
            </div>
            <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-400" style={{ width: `${passing}%` }} />
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Top 3% de la liga en pases progresivos entre líneas.</p>
          </div>

          <div className="glass-card p-4 rounded-2xl space-y-2.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-xs text-[var(--text-muted)]">DESPLIEGUE FÍSICO Y RECUPERACIÓN</span>
              <div className="flex items-center gap-1 theme-accent-text font-mono font-bold text-sm">
                <TrendingUp className="w-4 h-4" /> +2
              </div>
            </div>
            <div className="w-full h-2 bg-[var(--bg-input)] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-lime-500 to-emerald-400" style={{ width: `${recovery}%` }} />
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">Mejora notable en resistencia al sprint final y duelos ganados.</p>
          </div>
        </div>
      </section>

      {/* Match History Trigger Button & Quick List */}
      <section className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-extrabold text-base text-[var(--text-main)]">
            PARTIDOS Y SESIONES RECIENTES
          </h3>
          <button
            onClick={() => setShowHistoryModal(true)}
            className="text-xs theme-accent-text font-bold hover:underline flex items-center gap-1"
          >
            Ver Historial Completo ({matchLogs.length})
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2.5">
          {matchLogs.slice(0, 3).map((match) => (
            <div 
              key={match.id}
              onClick={() => setShowHistoryModal(true)}
              className="glass-card p-4 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-[var(--bg-input)] transition-all border border-[var(--border-subtle)]"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 bg-[var(--bg-input)] rounded-xl border border-[var(--border-subtle)] flex items-center justify-center font-mono font-bold text-base theme-accent-text">
                  {match.rating.toFixed(1)}
                </div>
                <div>
                  <p className="font-bold text-sm text-[var(--text-main)]">
                    {match.result} vs {match.opponent}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">
                    {match.goals} Gol • {match.assists} Asist. • {match.recoveries} Rec. • {match.minutesPlayed}' Jugados
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[var(--text-muted)]" />
            </div>
          ))}
        </div>
      </section>

      {/* Match History Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-[var(--border-card)] max-h-[85vh] flex flex-col space-y-4">
            <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
              <h3 className="font-extrabold text-lg text-[var(--text-main)] flex items-center gap-2">
                <Award className="w-5 h-5 theme-accent-text" />
                HISTORIAL DE PARTIDOS Y RENDIMIENTO
              </h3>
              <button
                onClick={() => setShowHistoryModal(false)}
                className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1 font-bold text-lg"
              >
                ✕
              </button>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => setFilterType('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterType === 'ALL' 
                    ? 'theme-accent-bg' 
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                }`}
              >
                Todos ({matchLogs.length})
              </button>
              <button
                onClick={() => setFilterType('PARTIDO')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                  filterType === 'PARTIDO' 
                    ? 'theme-accent-bg' 
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)]'
                }`}
              >
                Partidos Oficiales
              </button>
            </div>

            {/* Log Items List */}
            <div className="overflow-y-auto space-y-3 pr-1 flex-1">
              {filteredLogs.map((log) => (
                <div key={log.id} className="glass-card p-4 rounded-2xl border border-[var(--border-subtle)] space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono font-bold theme-accent-text uppercase block">
                        {log.date} • {log.type}
                      </span>
                      <h4 className="font-bold text-sm text-[var(--text-main)]">
                        {log.result} vs {log.opponent}
                      </h4>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2.5 py-1 theme-accent-bg rounded-lg">
                        {log.rating.toFixed(1)} / 10
                      </span>
                      {onDeleteMatch && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`¿Eliminar registro de partido contra ${log.opponent}?`)) {
                              onDeleteMatch(log.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-[11px] bg-[var(--bg-input)] p-2 rounded-xl font-mono text-[var(--text-main)]">
                    <div><span className="text-[var(--text-muted)] block text-[9px]">MINUTOS</span>{log.minutesPlayed}'</div>
                    <div><span className="text-[var(--text-muted)] block text-[9px]">GOLES</span>{log.goals}</div>
                    <div><span className="text-[var(--text-muted)] block text-[9px]">ASIST.</span>{log.assists}</div>
                    <div><span className="text-[var(--text-muted)] block text-[9px]">REC.</span>{log.recoveries}</div>
                  </div>

                  {log.tacticalNotes && (
                    <p className="text-xs text-[var(--text-muted)] italic bg-[var(--bg-card-solid)] p-2 rounded-xl border border-[var(--border-subtle)]">
                      "{log.tacticalNotes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
