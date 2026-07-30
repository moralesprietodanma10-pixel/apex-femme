import React, { useState } from 'react';
import { MatchLog, SmartwatchData } from '../types';
import { GpsTrackerView } from './GpsTrackerView';
import { Plus, Minus, ArrowRight, Brain, Trophy, ShieldCheck, CheckCircle, Activity, MapPin, Zap, Navigation } from 'lucide-react';

interface MatchTrackerViewProps {
  onSaveMatch: (newLog: Partial<MatchLog>) => void;
  onCancel?: () => void;
  smartwatchData?: SmartwatchData;
}

export const MatchTrackerView: React.FC<MatchTrackerViewProps> = ({ onSaveMatch, onCancel, smartwatchData }) => {
  const [activeTabMode, setActiveTabMode] = useState<'tracker' | 'gps'>('tracker');

  const [matchType, setMatchType] = useState<'PARTIDO' | 'ENTRENAMIENTO'>('PARTIDO');
  const [opponent, setOpponent] = useState('Valencia FF');
  const [result, setResult] = useState('Victoria 2-1');
  const [minutesPlayed, setMinutesPlayed] = useState(75);
  const [rpe, setRpe] = useState(7); // 1-10
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(1);
  const [keyPasses, setKeyPasses] = useState(3);
  const [recoveries, setRecoveries] = useState(6);
  const [tacticalNotes, setTacticalNotes] = useState('');
  
  // Interactive pitch heatmap zones
  const [selectedPitchZone, setSelectedPitchZone] = useState<'mediocampo' | 'banda_izq' | 'banda_der' | 'area_rival'>('mediocampo');

  // Calculated advanced telemetry metrics (xG, xA)
  const estimatedXg = (goals * 0.72 + (keyPasses > 3 ? 0.18 : 0.05)).toFixed(2);
  const estimatedXa = (assists * 0.65 + keyPasses * 0.12).toFixed(2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate rating based on metrics
    let baseRating = 6.5;
    baseRating += goals * 0.8;
    baseRating += assists * 0.6;
    baseRating += keyPasses * 0.3;
    baseRating += recoveries * 0.2;
    if (minutesPlayed > 60) baseRating += 0.5;
    const finalRating = Math.min(10, Math.max(5.0, Number(baseRating.toFixed(1))));

    onSaveMatch({
      date: new Date().toISOString().split('T')[0],
      opponent,
      result,
      goals,
      assists,
      minutesPlayed,
      rating: finalRating,
      rpe,
      keyPasses,
      recoveries,
      tacticalNotes: tacticalNotes || `Influencia principal en ${selectedPitchZone.replace('_', ' ')}. xG: ${estimatedXg}, xA: ${estimatedXa}.`
    });
  };

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-32 animate-fade-in">
      {/* Mode Sub-Navigation Tabs */}
      <nav className="glass-card p-1.5 rounded-2xl flex items-center gap-2 border border-[var(--border-card)]">
        <button
          onClick={() => setActiveTabMode('tracker')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTabMode === 'tracker'
              ? 'theme-accent-bg theme-accent-glow'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Activity className="w-4 h-4" />
          Registrar Estadísticas Partido
        </button>

        <button
          onClick={() => setActiveTabMode('gps')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeTabMode === 'gps'
              ? 'theme-accent-bg theme-accent-glow'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Navigation className="w-4 h-4 text-emerald-400" />
          Seguimiento GPS & Strava GPX
        </button>
      </nav>

      {activeTabMode === 'gps' ? (
        <GpsTrackerView smartwatchData={smartwatchData} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header Card */}
          <div className="glass-card rounded-3xl p-6 border border-[var(--accent-color)]/40 relative overflow-hidden shadow-2xl">
            <div className="flex justify-between items-center relative z-10">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-widest theme-accent-text block mb-1">
                  ESTADÍSTICAS & CONTROL DE CARGA
                </span>
                <h2 className="font-extrabold text-2xl md:text-3xl text-[var(--text-main)]">
                  ¿Cómo estoy progresando?
                </h2>
              </div>

              <div className="flex bg-[var(--bg-input)] p-1 rounded-xl border border-[var(--border-subtle)]">
                <button
                  type="button"
                  onClick={() => setMatchType('PARTIDO')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                    matchType === 'PARTIDO' ? 'theme-accent-bg' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Partido
                </button>
                <button
                  type="button"
                  onClick={() => setMatchType('ENTRENAMIENTO')}
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold transition-colors ${
                    matchType === 'ENTRENAMIENTO' ? 'theme-accent-bg' : 'text-[var(--text-muted)]'
                  }`}
                >
                  Entreno
                </button>
              </div>
            </div>
          </div>

          {/* Basic Match Info */}
          <div className="glass-card rounded-3xl p-6 border border-[var(--border-card)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">
              1. INFORMACIÓN DEL ENCUENTRO
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] block uppercase mb-1">
                  Rival o Sesión
                </label>
                <input
                  type="text"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-color)]"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] block uppercase mb-1">
                  Resultado o Score
                </label>
                <input
                  type="text"
                  value={result}
                  onChange={(e) => setResult(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-color)]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] block uppercase mb-1">
                  Minutos Jugados: <span className="font-bold theme-accent-text">{minutesPlayed} min</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={minutesPlayed}
                  onChange={(e) => setMinutesPlayed(Number(e.target.value))}
                  className="w-full accent-[var(--accent-color)]"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono text-[var(--text-muted)] block uppercase mb-1">
                  Esfuerzo RPE (1-10): <span className="font-bold text-amber-400">{rpe}</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={rpe}
                  onChange={(e) => setRpe(Number(e.target.value))}
                  className="w-full accent-amber-400"
                />
              </div>
            </div>
          </div>

          {/* Key Actions Counters */}
          <div className="glass-card rounded-3xl p-6 border border-[var(--border-card)] space-y-4">
            <h3 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">
              2. ESTADÍSTICAS INDIVIDUALES
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] text-center space-y-1">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block">GOLES</span>
                <div className="flex items-center justify-center gap-2">
                  <button type="button" onClick={() => setGoals(Math.max(0, goals - 1))} className="p-1 text-[var(--text-muted)] hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="font-mono text-xl font-black theme-accent-text">{goals}</span>
                  <button type="button" onClick={() => setGoals(goals + 1)} className="p-1 text-[var(--text-muted)] hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] text-center space-y-1">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block">ASISTENCIAS</span>
                <div className="flex items-center justify-center gap-2">
                  <button type="button" onClick={() => setAssists(Math.max(0, assists - 1))} className="p-1 text-[var(--text-muted)] hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="font-mono text-xl font-black text-cyan-400">{assists}</span>
                  <button type="button" onClick={() => setAssists(assists + 1)} className="p-1 text-[var(--text-muted)] hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] text-center space-y-1">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block">PASES CLAVE</span>
                <div className="flex items-center justify-center gap-2">
                  <button type="button" onClick={() => setKeyPasses(Math.max(0, keyPasses - 1))} className="p-1 text-[var(--text-muted)] hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="font-mono text-xl font-black text-amber-400">{keyPasses}</span>
                  <button type="button" onClick={() => setKeyPasses(keyPasses + 1)} className="p-1 text-[var(--text-muted)] hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>

              <div className="bg-[var(--bg-input)] p-3 rounded-2xl border border-[var(--border-subtle)] text-center space-y-1">
                <span className="text-[9px] text-[var(--text-muted)] font-bold uppercase block">RECUPERACIONES</span>
                <div className="flex items-center justify-center gap-2">
                  <button type="button" onClick={() => setRecoveries(Math.max(0, recoveries - 1))} className="p-1 text-[var(--text-muted)] hover:text-white"><Minus className="w-3.5 h-3.5" /></button>
                  <span className="font-mono text-xl font-black text-emerald-400">{recoveries}</span>
                  <button type="button" onClick={() => setRecoveries(recoveries + 1)} className="p-1 text-[var(--text-muted)] hover:text-white"><Plus className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>

            {/* Calculated xG and xA Telemetry Badge */}
            <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase block">TELEMETRÍA AVANZADA</span>
                <p className="text-xs text-[var(--text-main)] font-semibold mt-0.5">Métricas esperadas del encuentro</p>
              </div>
              <div className="flex gap-4 font-mono font-black text-sm">
                <span className="theme-accent-text">xG: {estimatedXg}</span>
                <span className="text-cyan-400">xA: {estimatedXa}</span>
              </div>
            </div>
          </div>

          {/* Interactive Field Zone Heatmap Selector */}
          <div className="glass-card rounded-3xl p-6 border border-[var(--border-card)] space-y-3">
            <h3 className="font-bold text-sm text-[var(--text-main)] uppercase tracking-wider">
              3. ZONA DE MAYOR INFLUENCIA EN EL CAMPO
            </h3>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPitchZone('mediocampo')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedPitchZone === 'mediocampo'
                    ? 'theme-accent-bg border-[var(--accent-color)] font-bold shadow-md'
                    : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
              >
                ⚽ Mediocampo & Creación
              </button>

              <button
                type="button"
                onClick={() => setSelectedPitchZone('banda_izq')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedPitchZone === 'banda_izq'
                    ? 'theme-accent-bg border-[var(--accent-color)] font-bold shadow-md'
                    : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
              >
                🏃‍♀️ Banda Izquierda / Extremo
              </button>

              <button
                type="button"
                onClick={() => setSelectedPitchZone('banda_der')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedPitchZone === 'banda_der'
                    ? 'theme-accent-bg border-[var(--accent-color)] border-[var(--accent-color)] font-bold shadow-md'
                    : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
              >
                ⚡ Banda Derecha / Extremo
              </button>

              <button
                type="button"
                onClick={() => setSelectedPitchZone('area_rival')}
                className={`p-3 rounded-2xl border text-left transition-all ${
                  selectedPitchZone === 'area_rival'
                    ? 'theme-accent-bg border-[var(--accent-color)] font-bold shadow-md'
                    : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-muted)]'
                }`}
              >
                🎯 Área Rival / Ataque Directo
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-4 rounded-2xl bg-[var(--bg-input)] text-[var(--text-main)] font-bold text-xs border border-[var(--border-subtle)] hover:bg-[var(--bg-card-solid)] transition-colors"
              >
                Cancelar
              </button>
            )}

            <button
              type="submit"
              className="flex-1 theme-accent-bg py-4 rounded-2xl font-extrabold text-xs uppercase tracking-wider theme-accent-glow active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Guardar Estadísticas en mi Ficha FUT (+150 XP)
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
