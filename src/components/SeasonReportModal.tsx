import React from 'react';
import { PlayerProfile, MatchLog, SmartwatchData } from '../types';
import { Printer, X, Award, FileText, Activity, ShieldCheck, Download, Calendar } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface SeasonReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  playerProfile: PlayerProfile;
  matchLogs: MatchLog[];
  smartwatchData: SmartwatchData;
}

export const SeasonReportModal: React.FC<SeasonReportModalProps> = ({
  isOpen,
  onClose,
  playerProfile,
  matchLogs,
  smartwatchData,
}) => {
  if (!isOpen) return null;

  const totalMatches = matchLogs.length;
  const totalGoals = matchLogs.reduce((acc, m) => acc + (m.goals || 0), 0);
  const totalAssists = matchLogs.reduce((acc, m) => acc + (m.assists || 0), 0);
  const totalMinutes = matchLogs.reduce((acc, m) => acc + (m.minutesPlayed || 0), 0) || playerProfile.monthlyMinutes;
  const avgRating = totalMatches > 0
    ? (matchLogs.reduce((acc, m) => acc + (m.rating || 0), 0) / totalMatches).toFixed(1)
    : playerProfile.avgRating.toFixed(1);

  const handlePrint = () => {
    sounds.playClick();
    window.print();
  };

  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-[#0b1326] text-[#dae2fd] w-full max-w-3xl rounded-3xl p-6 sm:p-8 border border-[var(--border-card)] shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto print:max-h-none print:p-0 print:border-none print:shadow-none print:bg-white print:text-black">

        {/* Action Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--border-subtle)] print:hidden">
          <div className="flex items-center gap-2 text-[var(--accent-color)] font-black">
            <FileText className="w-5 h-5" />
            <h3 className="text-base uppercase tracking-wider">Reporte Ejecutivo de Temporada (PDF)</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl theme-accent-bg text-[#0b1326] font-extrabold text-xs flex items-center gap-2 theme-accent-glow active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Descargar PDF / Imprimir</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 text-[var(--text-muted)] hover:text-white rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable PDF Report Sheet */}
        <div id="pdf-report-sheet" className="space-y-6">
          
          {/* Header Badge & Title */}
          <div className="flex items-center justify-between border-b pb-5 border-slate-700/60 print:border-black">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl border-2 border-[var(--accent-color)] overflow-hidden shadow-lg">
                <img src={playerProfile.avatarUrl} alt={playerProfile.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-[var(--accent-color)] print:text-black tracking-widest uppercase block">
                  INFORME TÉCNICO OFICIAL • APEX PERFORMANCE
                </span>
                <h1 className="text-2xl font-black text-white print:text-black uppercase tracking-tight">
                  {playerProfile.name}
                </h1>
                <p className="text-xs text-slate-400 print:text-slate-700 font-semibold">
                  {playerProfile.position} · Dorsal {playerProfile.jerseyNumber} · {playerProfile.club || 'APEX FC'}
                </p>
              </div>
            </div>

            <div className="text-right font-mono">
              <div className="w-14 h-14 rounded-2xl theme-accent-bg text-[#0b1326] font-black text-2xl flex items-center justify-center mx-auto print:border print:border-black">
                {playerProfile.OVR}
              </div>
              <span className="text-[9px] font-bold text-slate-400 print:text-black block mt-1 uppercase">VALORACIÓN OVR</span>
            </div>
          </div>

          {/* Key Metrics Grid */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--accent-color)] print:text-black mb-3">
              1. Resumen Estadístico de Temporada
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 print:border-black print:bg-slate-100">
                <span className="text-[9px] text-slate-400 print:text-slate-700 font-bold block uppercase">MINUTOS JUGADOS</span>
                <span className="text-xl font-black theme-accent-text print:text-black font-mono">{totalMinutes} min</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 print:border-black print:bg-slate-100">
                <span className="text-[9px] text-slate-400 print:text-slate-700 font-bold block uppercase">GOLES & ASISTENCIAS</span>
                <span className="text-xl font-black text-cyan-400 print:text-black font-mono">{totalGoals} G / {totalAssists} A</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 print:border-black print:bg-slate-100">
                <span className="text-[9px] text-slate-400 print:text-slate-700 font-bold block uppercase">VALORACIÓN MEDIA</span>
                <span className="text-xl font-black text-amber-400 print:text-black font-mono">⭐ {avgRating} / 10</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-700/50 print:border-black print:bg-slate-100">
                <span className="text-[9px] text-slate-400 print:text-slate-700 font-bold block uppercase">RACHA DE CONSTANCIA</span>
                <span className="text-xl font-black text-emerald-400 print:text-black font-mono">{playerProfile.streakDays} Días ⚡</span>
              </div>
            </div>
          </div>

          {/* Attributes Breakdown Table */}
          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-[var(--accent-color)] print:text-black mb-3">
              2. Evaluación Biomecánica & Atributos FUT
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              {[
                { label: 'Ritmo / Aceleración (RIT)', val: playerProfile.attributes.rhythm, color: 'text-amber-400' },
                { label: 'Precisión de Pase (PAS)', val: playerProfile.attributes.passing, color: 'text-cyan-400' },
                { label: 'Visión de Juego (VIS)', val: playerProfile.attributes.vision, color: 'text-purple-400' },
                { label: 'Fuerza & Resistencia (FIS)', val: playerProfile.attributes.physical, color: 'theme-accent-text' },
                { label: 'Recuperación / Defensa (REC)', val: playerProfile.attributes.recovery, color: 'text-emerald-400' },
                { label: 'Potencia de Disparo (DIS)', val: playerProfile.attributes.shooting, color: 'text-rose-400' },
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-700/40 print:border-black print:bg-white flex justify-between items-center">
                  <span className="text-slate-300 print:text-black text-[10px] font-bold">{item.label}</span>
                  <span className={`font-black text-sm ${item.color} print:text-black`}>{item.val} / 99</span>
                </div>
              ))}
            </div>
          </div>

          {/* Biometrics & AI Coach Diagnostic */}
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-700/60 print:border-black print:bg-slate-50 space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider theme-accent-text print:text-black flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Diagnóstico del APEX Coach IA
            </h4>
            <p className="text-xs leading-relaxed text-slate-300 print:text-black">
              La jugadora <strong>{playerProfile.name}</strong> presenta un perfil de alto impacto en la posición de <strong>{playerProfile.position}</strong>. 
              Su variabilidad cardíaca ({smartwatchData.hrvMs > 0 ? `${smartwatchData.hrvMs} ms` : 'Óptima'}) y nivel de consistencia técnica avalan su progresión hacia el rango de rendimiento de élite. 
              Se recomienda priorizar las sesiones de aceleración en espacios reducidos y mantener la sobrecarga progresiva en gimnasio.
            </p>
          </div>

          {/* Signatures & Footer */}
          <div className="pt-6 border-t border-slate-700/60 print:border-black flex justify-between items-end text-[10px] text-slate-400 print:text-black font-mono">
            <div>
              <p>Fecha de Emisión: <strong>{currentDate}</strong></p>
              <p>ID de Validación: <strong>APEX-{Date.now().toString().substring(6)}</strong></p>
            </div>
            <div className="text-right border-t border-slate-500 pt-1 px-4">
              <p className="font-bold">Firma Dirección Técnica</p>
              <p className="text-[9px] opacity-75">APEX Femme AI System</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
