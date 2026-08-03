import React, { useState, useMemo } from 'react';
import { PlayerProfile, ScheduleDay, ChatMessage, SmartwatchData } from '../types';
import { 
  Send, 
  Sparkles, 
  Zap, 
  Brain, 
  AlertCircle, 
  Check, 
  ArrowRight,
  Target,
  Clock,
  Layers,
  Activity,
  ShieldCheck,
  Bot,
  RefreshCw,
  Trophy,
  Compass,
  Cpu,
  Copy,
  SlidersHorizontal,
  Share2
} from 'lucide-react';
import { 
  FOOTBALL_DRILL_DATABASE, 
  FootballDrill, 
  getTotalDrills 
} from '../data/footballDrillDatabase';
import { sounds } from '../services/soundEffects';

interface CoachViewProps {
  playerProfile: PlayerProfile;
  weeklySchedule: ScheduleDay[];
  chatHistory: ChatMessage[];
  onSendMessage: (userText: string) => void;
  onRecalculateWeek?: () => void;
  onUpdateWeeklySchedule?: (newSchedule: ScheduleDay[]) => void;
  smartwatchData?: SmartwatchData;
}

export type QueryCategory = 'all' | 'tactica' | 'tecnica' | 'escaneo' | 'prevencion';

export const CoachView: React.FC<CoachViewProps> = ({
  playerProfile,
  weeklySchedule,
  chatHistory,
  onSendMessage,
  smartwatchData
}) => {
  // Active Module Sub-tab: 'generator' (Generador 1-Click) | 'audit' (Auditoría Real) | 'console' (Consola Táctica)
  const [activeModule, setActiveModule] = useState<'generator' | 'audit' | 'console'>('generator');

  // Generator Options
  const [selectedDuration, setSelectedDuration] = useState<number>(45);
  const [generatedSession, setGeneratedSession] = useState<{
    name: string;
    targetGoal: string;
    drills: FootballDrill[];
  } | null>(null);

  // Quick Prompt Category Filter
  const [selectedQueryCategory, setSelectedQueryCategory] = useState<QueryCategory>('all');

  // Copy Feedback Notification
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Chat Input State
  const [inputQuery, setInputQuery] = useState('');
  const [localMessages, setLocalMessages] = useState<ChatMessage[]>(() => {
    return [
      {
        id: 'init-msg',
        sender: 'ai',
        text: `Consola Táctica APEX MIND activa. He cargado tu perfil (${playerProfile.position || 'MC'}, OVR ${playerProfile.OVR || 78}) y la base de datos de ${getTotalDrills()} ejercicios tácticos. ¿En qué aspecto de tu juego trabajamos hoy?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });

  // Calculate Real Performance Audit from LocalStorage
  const auditMetrics = useMemo(() => {
    let completedWorkouts: any[] = [];
    let customPlans: any[] = [];
    try {
      const storedWorkouts = localStorage.getItem('apex_femme_completed_football_workouts');
      if (storedWorkouts) completedWorkouts = JSON.parse(storedWorkouts);
      const storedPlans = localStorage.getItem('apex_femme_custom_football_plans');
      if (storedPlans) customPlans = JSON.parse(storedPlans);
    } catch (e) {}

    const totalSessions = completedWorkouts.length;
    const weakFootSessions = completedWorkouts.filter(w => w.weakFoot || w.focusFamily === 'weak_foot').length;
    const weakFootPct = totalSessions > 0 ? Math.round((weakFootSessions / totalSessions) * 100) : 0;

    const scanningDrillsInPlan = customPlans.reduce((acc, p) => {
      const scanCount = (p.drills || []).filter((d: any) => d.family === 'scanning').length;
      return acc + scanCount;
    }, 0);

    return {
      totalSessions,
      weakFootPct,
      scanningDrillsInPlan,
      weakFootWarning: weakFootPct < 30,
      scanningWarning: scanningDrillsInPlan < 2
    };
  }, []);

  // 1-CLICK SESSION GENERATOR LOGIC
  const handleGenerateSession = (mins: number) => {
    sounds.playClick();
    setSelectedDuration(mins);

    const pos = playerProfile.position || 'MC';
    let focusDrills: FootballDrill[] = [];

    if (pos.includes('Contención') || pos.includes('Mediocentro') || pos.includes('MC')) {
      focusDrills = FOOTBALL_DRILL_DATABASE.filter(d => 
        d.family === 'scanning' || d.family === 'first_touch' || d.family === 'passing' || d.family === 'decision_making'
      );
    } else if (pos.includes('Delantera') || pos.includes('Extrema') || pos.includes('ST') || pos.includes('LW')) {
      focusDrills = FOOTBALL_DRILL_DATABASE.filter(d => 
        d.family === 'finishing' || d.family === 'dribbling' || d.family === 'ball_mastery'
      );
    } else {
      focusDrills = FOOTBALL_DRILL_DATABASE.filter(d => 
        d.family === 'passing' || d.family === 'ball_mastery' || d.family === 'turning'
      );
    }

    const shuffled = [...focusDrills].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, mins >= 45 ? 5 : 3);

    setGeneratedSession({
      name: `Sesión Táctica ${pos} (${mins} min)`,
      targetGoal: `Optimización posicional de ${pos}: escaneo visual, primer toque y toma de decisiones`,
      drills: selected
    });
  };

  // Push Generated Session to LocalStorage for Dashboard
  const handleApplySessionToDashboard = () => {
    if (!generatedSession) return;
    sounds.playSuccess();
    try {
      const stored = localStorage.getItem('apex_femme_custom_football_plans');
      const existing = stored ? JSON.parse(stored) : [];
      const newPlan = {
        id: `plan-ai-${Date.now()}`,
        name: generatedSession.name,
        targetGoal: generatedSession.targetGoal,
        createdAt: new Date().toLocaleDateString('es-ES'),
        origin: 'ai',
        drills: generatedSession.drills
      };
      localStorage.setItem('apex_femme_custom_football_plans', JSON.stringify([newPlan, ...existing]));
    } catch (e) {}
  };

  // EXPORT DIAGNOSTIC REPORT TO CLIPBOARD (SECONDARY AUTOMATION FEATURE)
  const handleExportDiagnosticReport = () => {
    sounds.playSuccess();
    const reportText = `[APEX MIND OS · INFORME TÁCTICO DE RENDIMIENTO]
Jugadora: ${playerProfile.name} (${playerProfile.position || 'MC'} · OVR ${playerProfile.OVR || 78})
Sesiones Completadas: ${auditMetrics.totalSessions}
Volumen Pierna No Hábil: ${auditMetrics.weakFootPct}% (${auditMetrics.weakFootWarning ? 'REQUERIDO: Aumentar a >=30%' : 'ÓPTIMO'})
Drills de Escaneo Registrados: ${auditMetrics.scanningDrillsInPlan}
Diagnóstico Táctico: ${auditMetrics.weakFootWarning ? 'Aumentar trabajo de pierna débil en calentamiento' : 'Mantener volumen bilateral'}
Base de Datos Activa: ${getTotalDrills()} Drills Futbolísticos Reales`;

    navigator.clipboard.writeText(reportText);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2500);
  };

  // AUTOMATED QUICK TACTICAL PROMPTS DATABASE (14+ CATEGORIZED PROMPTS)
  const quickTacticalPrompts = [
    { category: 'tactica', text: "¿Cómo salir de la presión alta cuando juego de MC?" },
    { category: 'tactica', text: "¿Cómo dar el pase filtrado rompiendo 2 líneas defensivas?" },
    { category: 'tactica', text: "¿Cuál es la distancia ideal entre líneas para mi posición de Volante?" },
    { category: 'tactica', text: "¿Cómo desmarcarme a la espalda de la contención rival?" },
    
    { category: 'tecnica', text: "¿Qué ejercicios debo hacer para mejorar mi pierna no hábil esta semana?" },
    { category: 'tecnica', text: "¿Cómo mejorar mi primer toque orientado en espacios reducidos?" },
    { category: 'tecnica', text: "¿Cómo dominar el control con el exterior a alta velocidad?" },
    { category: 'tecnica', text: "¿Qué técnica usar para pases rápidos a 1 sola intención?" },
    
    { category: 'escaneo', text: "Recomiéndame una sesión de escaneo táctico de 30 minutos" },
    { category: 'escaneo', text: "¿Cómo mantener la cabeza arriba durante la conducción rápida?" },
    { category: 'escaneo', text: "¿Cómo anticipar la presión del rival antes de recibir el balón?" },
    { category: 'escaneo', text: "¿Cómo mejorar la toma de decisiones bajo fatiga en el minuto 80?" },
    
    { category: 'prevencion', text: "¿Cómo adaptar mi entrenamiento si tengo HRV moderado hoy?" },
    { category: 'prevencion', text: "¿Qué protocolo hacer para reducir el riesgo de lesión de LCA en fútbol femenino?" },
  ];

  const filteredPrompts = useMemo(() => {
    if (selectedQueryCategory === 'all') return quickTacticalPrompts;
    return quickTacticalPrompts.filter(p => p.category === selectedQueryCategory);
  }, [selectedQueryCategory]);

  // CHAT / CONSOLE QUERY HANDLER
  const handleSendConsoleQuery = (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim()) return;

    sounds.playClick();
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setLocalMessages(prev => [...prev, userMsg]);
    if (!queryText) setInputQuery('');

    // Tactical Intelligence Response Engine
    setTimeout(() => {
      const q = textToSend.toLowerCase();
      let replyText = '';

      if (q.includes('presión') || q.includes('presion') || q.includes('salida')) {
        replyText = `Para salir de la presión alta como ${playerProfile.position || 'MC'}:\n\n1. **Escaneo Previo**: Realiza mínimo 2 escaneos visuales antes de recibir el balón (Método Jordet).\n2. **Perfilamiento Corporal**: Orienta las caderas a 45° hacia la banda para dominar un campo visual de 180°.\n3. **Primer Toque Aleatorio del Defensor**: Proyecta el control hacia el pasillo libre, nunca estático.\n\nEjercicios recomendados de la base de datos de 571 drills: Escaneo Táctico en Rombo (SC-001) y Control Orientado en Espacio Libre (BM-067).`;
      } else if (q.includes('filtrado') || q.includes('líneas') || q.includes('lineas')) {
        replyText = `Técnica de Pase Filtrado para ${playerProfile.position || 'MC'}:\n\n1. **Engaño de Mirada**: Fija la vista en el central rival antes de filtrar hacia el desmarque a la espalda.\n2. **Superficie de Contacto**: Usa el interior duro para pases rasos firmes o el empeine interior para darle comba al espacio.\n3. **Sincronización de Carrera**: El pase debe salir 0.5s antes de que la delantera rompa la línea de fuera de juego.`;
      } else if (q.includes('pierna') || q.includes('débil') || q.includes('debil') || q.includes('no hábil')) {
        replyText = `Diagnóstico de Pierna No Hábil:\n\nTu volumen actual de trabajo en pierna no hábil está en ${auditMetrics.weakFootPct}%. La meta metodológica UEFA Pro es de al menos 30%.\n\nRecomendación automatizada:\n- Dedica 10 minutos al inicio de cada entrenamiento a ejercicios exclusivos con la pierna no dominante (ej. Drill BM-020 Pull Push y BM-070 Conducción en Relevos).`;
      } else if (q.includes('escaneo') || q.includes('visión') || q.includes('vision') || q.includes('cabeza')) {
        replyText = `Protocolo de Escaneo Visual Táctico (La Masia / Ajax):\n\nLos mediocampistas de clase mundial (Aitana Bonmatí, Xavi) exploran el entorno 0.6 a 0.8 veces por segundo antes de recibir.\n\nRutina sugerida (30 min):\n1. SC-001 Escaneo con Señal Visual (10 min)\n2. SC-004 Rotación 360° con Percepción Aérea (10 min)\n3. BM-069 Tocata con Visión Periférica (10 min)`;
      } else if (q.includes('lca') || q.includes('lesión') || q.includes('lesion') || q.includes('hrv')) {
        replyText = `Protocolo de Prevención de Lesiones (Fútbol Femenino & Biomecánica):\n\n1. **Ratio I/Q (Isquios/Cuádriceps)**: Mantén una relación de fuerza ≥60% para proteger el ligamento cruzado anterior (LCA).\n2. **Aterrizaje Unipodal**: Asegura que la rodilla no colapse hacia adentro (valgo de rodilla) al frenar tras un sprint.\n3. **Gestión HRV**: Si el HRV baja de 55ms, reduce los giros a máxima velocidad y prioriza movilidad activa.`;
      } else {
        replyText = `Análisis de Inteligencia para ${playerProfile.name} (${playerProfile.position || 'MC'} · OVR ${playerProfile.OVR || 78}):\n\nCon base en tus métricas actuales y la base de datos de 571 drills tácticos, te sugiero enfocar este microciclo en:\n- Control de ritmo y pase filtrado a 1-2 toques.\n- 3 series de 10 min de Ball Mastery en espacio reducido.\n- Mantener racha de entrenamiento activo para optimizar la recuperación del SNC.`;
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setLocalMessages(prev => [...prev, aiMsg]);
      sounds.playSuccess();
    }, 500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-44 animate-fade-in relative">
      {/* Background Ambience */}
      <div className="absolute top-0 right-0 -z-10 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl pointer-events-none" />
      <div className="absolute top-40 left-0 -z-10 w-80 h-80 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      {/* HEADER PRINCIPAL DE APEX MIND OS */}
      <div className="glass-panel p-4 rounded-3xl border border-cyan-500/30 bg-black/70 backdrop-blur-xl flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-500 via-purple-600 to-amber-500 p-0.5 shadow-lg">
            <div className="w-full h-full bg-black rounded-[14px] flex items-center justify-center">
              <Cpu className="w-5 h-5 text-cyan-400 animate-pulse" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base text-white tracking-tight leading-none">
                APEX MIND OS
              </span>
              <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/20 text-cyan-300 font-mono text-[9px] font-bold border border-cyan-500/30">
                IA TÁCTICA AUTOMATIZADA
              </span>
            </div>
            <span className="text-[10px] text-[var(--text-muted)] font-mono">
              CENTRO DE INTELIGENCIA DE RENDIMIENTO Y ANÁLISIS 24/7
            </span>
          </div>
        </div>

        {/* 3 CORE CAPABILITY NAV TABS */}
        <div className="flex bg-[var(--bg-input)] p-1 rounded-2xl border border-[var(--border-subtle)] overflow-x-auto">
          {[
            { id: 'generator', label: 'GENERADOR 1-CLICK' },
            { id: 'audit', label: 'AUDITORÍA DE RENDIMIENTO' },
            { id: 'console', label: 'CONSOLA TÁCTICA' },
          ].map(mod => (
            <button
              key={mod.id}
              onClick={() => { sounds.playClick(); setActiveModule(mod.id as any); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold whitespace-nowrap transition-all cursor-pointer ${
                activeModule === mod.id
                  ? 'bg-cyan-500 text-black font-black shadow-md'
                  : 'text-[var(--text-muted)] hover:text-white'
              }`}
            >
              {mod.label}
            </button>
          ))}
        </div>
      </div>

      {/* AUTOMATED BIO-PRESET BANNER (SECONDARY AUTOMATION FEATURE) */}
      <div className="glass-panel p-4 rounded-2xl border border-cyan-500/40 bg-gradient-to-r from-cyan-500/10 via-black/80 to-purple-500/10 flex flex-wrap items-center justify-between gap-3 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 border border-cyan-500/30">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[9px] font-mono font-bold uppercase text-cyan-400 block">RECOMENDACIÓN AUTOMÁTICA DEL SNC</span>
            <p className="text-xs font-extrabold text-white">
              Generar Sesión Táctica de 45m para {playerProfile.position || 'MC'} con Enfoque en Escaneo Táctico
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerateSession(45)}
            className="py-2 px-4 bg-cyan-500 text-black font-black text-xs uppercase rounded-xl shadow-md cursor-pointer hover:bg-cyan-400 transition-all flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Generar con 1-Clic
          </button>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          CAPACIDAD 1: GENERADOR TÁCTICO DE SESIONES 1-CLICK
          ═════════════════════════════════════════════════════════════ */}
      {activeModule === 'generator' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-cyan-500/40 bg-black/60 space-y-6 shadow-2xl">
            <div className="space-y-1 border-b border-white/10 pb-4">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-cyan-400 block">
                MOTOR TÁCTICO DE SESIONES 100% AUTOMATIZADO
              </span>
              <h2 className="font-black text-xl sm:text-2xl text-white">
                Generador de Entrenamiento para {playerProfile.position || 'MC'}
              </h2>
              <p className="text-xs text-[var(--text-muted)] font-mono">
                La IA analiza tu posición y extrae ejercicios reales de la base de datos de 571 drills.
              </p>
            </div>

            {/* DURATION SELECTOR */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase block">
                SELECCIONA EL TIEMPO DISPONIBLE
              </span>
              <div className="grid grid-cols-4 gap-2">
                {[15, 30, 45, 60].map(mins => (
                  <button
                    key={mins}
                    onClick={() => handleGenerateSession(mins)}
                    className={`py-3 rounded-2xl font-mono text-xs font-black border transition-all cursor-pointer ${
                      selectedDuration === mins
                        ? 'bg-cyan-500 text-black border-cyan-400 shadow-lg scale-102'
                        : 'bg-black/40 text-[var(--text-muted)] border-white/10 hover:text-white'
                    }`}
                  >
                    {mins} Minutos
                  </button>
                ))}
              </div>
            </div>

            {/* GENERATED SESSION PREVIEW */}
            {generatedSession ? (
              <div className="p-5 rounded-2xl border border-cyan-500/40 bg-cyan-500/5 space-y-4 animate-fade-in">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-black text-lg text-white">{generatedSession.name}</h3>
                    <p className="text-xs text-cyan-300 font-mono">{generatedSession.targetGoal}</p>
                  </div>
                  <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold rounded-lg border border-cyan-500/30">
                    {selectedDuration} min
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-mono font-bold text-[var(--text-muted)] uppercase block">
                    EJERCICIOS SELECCIONADOS POR LA IA ({generatedSession.drills.length})
                  </span>
                  <div className="space-y-2">
                    {generatedSession.drills.map((drill, idx) => (
                      <div key={drill.id || idx} className="p-3 rounded-xl bg-black/60 border border-white/10 flex justify-between items-center text-xs">
                        <div>
                          <span className="font-bold text-white block">{drill.name}</span>
                          <span className="text-[10px] text-[var(--text-muted)] font-mono">{drill.durationMin || 8} min · {drill.difficulty} · {drill.technicalObjective}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 font-mono text-[9px] font-bold border border-purple-500/30 uppercase">
                          {drill.family}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleApplySessionToDashboard}
                  className="w-full py-3.5 theme-accent-bg text-black font-black text-xs uppercase tracking-wider rounded-xl theme-accent-glow flex items-center justify-center gap-2 cursor-pointer shadow-xl"
                >
                  <Check className="w-4 h-4" /> Cargar esta Sesión al Dashboard
                </button>
              </div>
            ) : (
              <div className="p-8 rounded-2xl border-2 border-dashed border-cyan-500/30 text-center space-y-3 bg-black/30">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-sm text-white">Haz clic en un tiempo para generar tu rutina automatizada.</h3>
                <p className="text-xs text-[var(--text-muted)] max-w-md mx-auto">
                  La IA creará una sesión estructurada al instante y podrás enviarla al Dashboard con un solo clic.
                </p>
                <button
                  onClick={() => handleGenerateSession(45)}
                  className="py-2.5 px-6 theme-accent-bg text-black font-black text-xs uppercase tracking-wider rounded-xl shadow-md cursor-pointer"
                >
                  Generar Sesión de 45 Minutos
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          CAPACIDAD 2: AUDITORÍA DE RENDIMIENTO REAL
          ═════════════════════════════════════════════════════════════ */}
      {activeModule === 'audit' && (
        <div className="space-y-6 animate-fade-in">
          <div className="glass-card rounded-3xl p-6 sm:p-8 border-2 border-purple-500/40 bg-black/60 space-y-6 shadow-2xl">
            <div className="flex flex-wrap justify-between items-start gap-4 border-b border-white/10 pb-4">
              <div className="space-y-1">
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-purple-400 block">
                  AUDITORÍA DE RENDIMIENTO & PUNTOS CIEGOS
                </span>
                <h2 className="font-black text-xl sm:text-2xl text-white">
                  Diagnóstico Automatizado de Datos Reales
                </h2>
                <p className="text-xs text-[var(--text-muted)] font-mono">
                  La IA analiza continuamente tus sesiones registradas en localStorage sin requerir ingresos manuales.
                </p>
              </div>

              {/* SECONDARY AUTOMATION: EXPORT REPORT BUTTON */}
              <button
                onClick={handleExportDiagnosticReport}
                className="py-2 px-4 bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-black font-mono font-bold text-xs rounded-xl border border-purple-500/40 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copyFeedback ? '¡Informe Copiado!' : 'Copiar Informe Táctico'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Audit Card 1: Pierna Débil */}
              <div className={`p-5 rounded-2xl border space-y-3 bg-black/60 ${auditMetrics.weakFootWarning ? 'border-amber-500/40' : 'border-emerald-500/40'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-amber-400 uppercase">BALANCE DE PIERNA NO HÁBIL</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${auditMetrics.weakFootWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                    {auditMetrics.weakFootPct}% Trabajo
                  </span>
                </div>
                <p className="text-xs text-white leading-relaxed">
                  {auditMetrics.weakFootWarning 
                    ? `Alerta Táctica: Tu volumen en pierna no hábil está en ${auditMetrics.weakFootPct}%. La directiva UEFA recomienda mínimo 30% para mediocampistas.`
                    : `Excelente balance de pierna no hábil (${auditMetrics.weakFootPct}%). Mantienes bilateralidad alta.`}
                </p>
                {auditMetrics.weakFootWarning && (
                  <button
                    onClick={() => {
                      setActiveModule('console');
                      handleSendConsoleQuery('¿Qué ejercicios debo hacer para mejorar mi pierna no hábil esta semana?');
                    }}
                    className="w-full py-2 bg-amber-500/20 text-amber-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-amber-500 hover:text-black transition-all"
                  >
                    <ArrowRight className="w-3.5 h-3.5" /> Ver Corrección de Pierna Débil
                  </button>
                )}
              </div>

              {/* Audit Card 2: Escaneo Táctico */}
              <div className={`p-5 rounded-2xl border space-y-3 bg-black/60 ${auditMetrics.scanningWarning ? 'border-purple-500/40' : 'border-emerald-500/40'}`}>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono font-bold text-purple-300 uppercase">FRECUENCIA DE ESCANEO</span>
                  <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 text-xs font-mono font-bold">
                    {auditMetrics.scanningDrillsInPlan} Drills en Planes
                  </span>
                </div>
                <p className="text-xs text-white leading-relaxed">
                  {auditMetrics.scanningWarning
                    ? `Punto Ciego Detectado: Tienes solo ${auditMetrics.scanningDrillsInPlan} ejercicios de escaneo visual en tus rutinas.`
                    : `Buen nivel de estímulo de percepción visual registrado.`}
                </p>
                <button
                  onClick={() => {
                    setActiveModule('console');
                    handleSendConsoleQuery('Recomiéndame una sesión de escaneo táctico de 30 minutos');
                  }}
                  className="w-full py-2 bg-purple-500/20 text-purple-300 font-bold text-xs rounded-xl flex items-center justify-center gap-1 cursor-pointer hover:bg-purple-500 hover:text-black transition-all"
                >
                  <ArrowRight className="w-3.5 h-3.5" /> Consultar Rutina de Escaneo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          CAPACIDAD 3: CONSOLA TÁCTICA PROACTIVA DE IA
          ═════════════════════════════════════════════════════════════ */}
      {activeModule === 'console' && (
        <div className="space-y-4 animate-fade-in">
          {/* CATEGORY FILTER FOR QUICK PROMPTS */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-[var(--text-muted)] block">
                CONSULTAS RÁPIDAS AUTOMATIZADAS POR CATEGORÍA
              </span>
              <span className="text-[10px] font-mono text-cyan-400">
                {filteredPrompts.length} Preguntas Disponibles
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5 pb-1">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'tactica', label: 'Táctica & Posición' },
                { id: 'tecnica', label: 'Pierna Débil & Técnica' },
                { id: 'escaneo', label: 'Escaneo & Game IQ' },
                { id: 'prevencion', label: 'Recuperación & Lesiones' },
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedQueryCategory(cat.id as QueryCategory)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                    selectedQueryCategory === cat.id
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-extrabold'
                      : 'bg-black/40 text-[var(--text-muted)] border-white/10 hover:text-white'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredPrompts.map((promptObj, i) => (
                <button
                  key={i}
                  onClick={() => handleSendConsoleQuery(promptObj.text)}
                  className="p-3 rounded-2xl bg-black/50 hover:bg-cyan-500/20 border border-[var(--border-subtle)] text-left text-xs font-mono text-white transition-all cursor-pointer flex items-center justify-between"
                >
                  <span>"{promptObj.text}"</span>
                  <ArrowRight className="w-3.5 h-3.5 text-cyan-400 shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>

          {/* CHAT MESSAGES WINDOW */}
          <div className="glass-card rounded-3xl p-5 border border-cyan-500/30 bg-black/70 space-y-4 min-h-[350px] max-h-[500px] overflow-y-auto shadow-2xl">
            {localMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'ai' && (
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`p-4 rounded-2xl max-w-xl text-xs leading-relaxed space-y-1 ${
                    msg.sender === 'user'
                      ? 'bg-cyan-500 text-black font-bold rounded-tr-none'
                      : 'bg-black/60 border border-white/10 text-white rounded-tl-none font-mono whitespace-pre-line'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className={`text-[8px] block opacity-60 ${msg.sender === 'user' ? 'text-black' : 'text-[var(--text-muted)]'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* INPUT BAR */}
          <div className="flex gap-2">
            <input
              type="text"
              value={inputQuery}
              onChange={e => setInputQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSendConsoleQuery()}
              placeholder="Escribe una consulta táctica (ej. '¿cómo mejorar mi visión de juego?')..."
              className="flex-1 bg-[var(--bg-input)] px-5 py-3.5 rounded-2xl border border-[var(--border-subtle)] text-xs font-mono text-white outline-none focus:border-cyan-400"
            />
            <button
              onClick={() => handleSendConsoleQuery()}
              className="py-3.5 px-6 theme-accent-bg text-black font-black text-xs uppercase rounded-2xl flex items-center gap-2 cursor-pointer shadow-lg"
            >
              <Send className="w-4 h-4" /> Enviar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
