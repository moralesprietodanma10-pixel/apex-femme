import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile, ThemeColor } from '../types';
import { 
  FullProfileRecord, 
  getSavedProfiles, 
  deleteProfileRecord, 
  createNewProfileRecord, 
  exportProfileBackup, 
  importProfileBackup 
} from '../services/profileStorage';
import { POSITIONS_LIST, COUNTRIES_LIST } from '../data/initialData';
import { User, Trash2, Download, Upload, Plus, Play, ShieldAlert, Sparkles, CheckCircle2, Trophy, Flame } from 'lucide-react';

interface WelcomeScreenProps {
  onSelectProfile: (record: FullProfileRecord) => void;
}

const FOOT_OPTIONS = ['Derecho', 'Izquierdo', 'Ambidiestra'];
const THEME_COLORS: { id: ThemeColor; label: string; value: string; glow: string; emoji: string }[] = [
  { id: 'flash',    label: 'Flash ⚡',            value: '#EAB308', glow: 'rgba(234,179,8,0.4)',    emoji: '⚡' },
  { id: 'avengers', label: 'Capitán América 🛡️', value: '#EF4444', glow: 'rgba(239,68,68,0.4)', emoji: '🛡️' },
  { id: 'widow',    label: 'Black Widow 🕷️',      value: '#E11D48', glow: 'rgba(225,29,72,0.4)',  emoji: '🕷️' },
  { id: 'hulk',     label: 'Hulk 💚',             value: '#22C55E', glow: 'rgba(34,197,94,0.4)',   emoji: '💚' },
  { id: 'hawkeye',  label: 'Hawkeye 🎯',          value: '#A855F7', glow: 'rgba(168,85,247,0.4)', emoji: '🎯' },
];

export function saveProfile(profile: PlayerProfile) {
  // Legacy export compatibility
  console.log('Legacy saveProfile called for', profile.name);
}

export function clearProfile() {
  // Legacy export compatibility - safely no-op to prevent wiping profiles
  console.log('Legacy clearProfile no-op');
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onSelectProfile }) => {
  const [phase, setPhase] = useState<'splash' | 'preliminary' | 'create'>('splash');
  const [savedProfiles, setSavedProfiles] = useState<FullProfileRecord[]>([]);
  const [profileToDelete, setProfileToDelete] = useState<FullProfileRecord | null>(null);
  const [exitingRecord, setExitingRecord] = useState<FullProfileRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form State for Profile Creation
  const [name, setName] = useState('');
  const [position, setPosition] = useState(POSITIONS_LIST[0]);
  const [number, setNumber] = useState('10');
  const [foot, setFoot] = useState(FOOT_OPTIONS[0]);
  const [countryCode, setCountryCode] = useState('ESP');
  const [themeIdx, setThemeIdx] = useState(0);
  const [formError, setFormError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loaded = getSavedProfiles();
    setSavedProfiles(loaded);

    const t = setTimeout(() => {
      setPhase('preliminary');
    }, 1800);
    return () => clearTimeout(t);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEnterWithRecord = (record: FullProfileRecord) => {
    setExitingRecord(record);
    setTimeout(() => {
      onSelectProfile(record);
    }, 400);
  };

  const handleCreateProfile = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalName = name.trim();
    if (!finalName) {
      setFormError('Por favor ingresa un nombre para la jugadora.');
      return;
    }

    const selectedTheme = THEME_COLORS[themeIdx].id;
    const newRecord = createNewProfileRecord({
      name: finalName,
      position,
      jerseyNumber: number,
      preferredFoot: foot,
      themeColor: selectedTheme,
      country: countryCode,
    });

    // Update list & enter
    setSavedProfiles(getSavedProfiles());
    showToast(`¡Perfil de ${finalName} creado exitosamente!`);
    handleEnterWithRecord(newRecord);
  };

  const handleDeleteConfirm = () => {
    if (!profileToDelete) return;
    const updated = deleteProfileRecord(profileToDelete.id);
    setSavedProfiles(updated);
    showToast(`Perfil de ${profileToDelete.profile.name} eliminado.`);
    setProfileToDelete(null);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const imported = importProfileBackup(content);
        if (imported) {
          const updated = getSavedProfiles();
          setSavedProfiles(updated);
          showToast(`¡Perfil de ${imported.profile.name} importado con éxito!`);
        } else {
          showToast('⚠️ Archivo de respaldo no válido.');
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const accent = THEME_COLORS[themeIdx]?.value || '#EAB308';
  const accentGlow = THEME_COLORS[themeIdx]?.glow || 'rgba(234,179,8,0.4)';

  // ─── Shared Visual Background ───────────────────────────────────────
  const bg = (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #05080f 0%, #0b1326 50%, #080d1a 100%)' }} />
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(${accent}33 1px, transparent 1px), linear-gradient(90deg, ${accent}33 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      <div className="absolute rounded-full animate-pulse-slow" style={{
        width: 500, height: 500, top: '-10%', right: '-15%',
        background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
        filter: 'blur(60px)',
      }} />
      <div className="absolute rounded-full animate-pulse-slow" style={{
        width: 400, height: 400, bottom: '-10%', left: '-10%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)',
        filter: 'blur(80px)', animationDelay: '1.5s',
      }} />
    </div>
  );

  // ─── Header Logo Component ──────────────────────────────────────────
  const logo = (
    <div className="flex flex-col items-center select-none text-center">
      <div className="animate-logo-glow" style={{ filter: `drop-shadow(0 0 24px ${accentGlow})` }}>
        <svg width="68" height="68" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="40,4 74,22 74,58 40,76 6,58 6,22" fill={accent} opacity="0.15" stroke={accent} strokeWidth="2"/>
          <text x="40" y="52" textAnchor="middle" fontSize="32" fontWeight="900" fill={accent} fontFamily="'Inter',sans-serif">A</text>
          <circle cx="40" cy="40" r="36" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5"/>
        </svg>
      </div>
      <div className="mt-2">
        <div className="font-black tracking-widest text-2xl" style={{ color: accent, letterSpacing: '0.18em', textShadow: `0 0 20px ${accentGlow}` }}>
          APEX FEMME
        </div>
        <div className="text-[10px] tracking-[0.3em] font-bold text-slate-400 mt-0.5">
          PLATAFORMA DE RENDIMIENTO DEPORTIVO DE ÉLITE
        </div>
      </div>
    </div>
  );

  // ─── SPLASH PHASE ───────────────────────────────────────────────────
  if (phase === 'splash') {
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        {bg}
        <div className="relative z-10 flex flex-col items-center animate-bounce-in">
          {logo}
          <div className="mt-8 flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="rounded-full" style={{
                width: 8, height: 8, background: accent, opacity: 0.7,
                animation: `pulse-slow 1s ${i * 0.25}s infinite`,
              }} />
            ))}
          </div>
          <p className="mt-4 text-xs tracking-widest font-bold text-slate-400">
            CARGANDO PERFILES Y DATOS...
          </p>
        </div>
      </div>
    );
  }

  // ─── PRELIMINARY PHASE (SELECCIÓN / GESTIÓN DE PERFILES) ─────────────
  if (phase === 'preliminary') {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 overflow-y-auto py-8 ${exitingRecord ? 'animate-exit' : ''}`}>
        {bg}

        {/* Floating Toast Notification */}
        {toastMessage && (
          <div className="fixed top-6 z-50 px-5 py-3 rounded-xl bg-slate-900/90 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-2xl flex items-center gap-2 animate-bounce-in">
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
            {toastMessage}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center gap-6 px-4 animate-welcome-fade-in w-full max-w-2xl">
          {logo}

          {/* Subtitle / Action instructions */}
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center justify-center gap-2">
              <User className="w-6 h-6 text-amber-400" />
              Selecciona tu Perfil de Jugadora
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Guarda tus avances, cambia de perfil o crea una nueva jugadora para mantener todo tu progreso a salvo.
            </p>
          </div>

          {/* Profile Cards Container */}
          {savedProfiles.length > 0 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedProfiles.map((record) => {
                const prof = record.profile;
                const matchCount = record.matchLogs?.length || 0;
                const lastDate = record.lastActive ? new Date(record.lastActive).toLocaleDateString('es-MX', { month: 'short', day: 'numeric' }) : 'Hoy';

                return (
                  <div
                    key={record.id}
                    className="relative group rounded-2xl border p-5 transition-all duration-200 hover:scale-[1.02] flex flex-col justify-between"
                    style={{
                      background: 'rgba(11,19,38,0.85)',
                      borderColor: `${accent}33`,
                      backdropFilter: 'blur(20px)',
                      boxShadow: `0 0 30px rgba(0,0,0,0.5)`,
                    }}
                  >
                    {/* Top Row: Avatar + Name + OVR Badge */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={prof.avatarUrl}
                          alt={prof.name}
                          className="w-14 h-14 rounded-full object-cover border-2"
                          style={{ borderColor: accent }}
                        />
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 border border-slate-900">
                          {prof.OVR}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-base text-white truncate">
                            {prof.name}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-bold border border-slate-700">
                            {prof.jerseyNumber || '#10'}
                          </span>
                        </div>

                        <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">
                          {prof.position}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-300">
                          <span className="flex items-center gap-1 text-amber-400">
                            <Trophy className="w-3 h-3" /> Nivel {prof.level}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Flame className="w-3 h-3" /> {prof.streakDays || 1}d racha
                          </span>
                          <span className="text-slate-500">
                            {matchCount} partidos
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center gap-2">
                      <button
                        onClick={() => handleEnterWithRecord(record)}
                        className="flex-1 py-2.5 px-3 rounded-xl font-black text-xs tracking-wider flex items-center justify-center gap-2 transition-transform active:scale-95 shimmer-btn"
                        style={{
                          background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                          color: '#0b1326',
                          boxShadow: `0 0 15px ${accentGlow}`,
                        }}
                      >
                        <Play className="w-3.5 h-3.5 fill-current" /> ENTRAR AL DASHBOARD
                      </button>

                      <button
                        onClick={() => exportProfileBackup(record)}
                        title="Guardar / Exportar copia de respaldo"
                        className="p-2.5 rounded-xl border border-slate-700 bg-slate-800/60 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setProfileToDelete(record)}
                        title="Eliminar perfil"
                        className="p-2.5 rounded-xl border border-red-900/40 bg-red-950/40 text-red-400 hover:bg-red-900/60 hover:text-red-200 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full text-center py-8 px-4 rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-md">
              <User className="w-12 h-12 text-slate-500 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-300">No hay ningún perfil guardado aún.</p>
              <p className="text-xs text-slate-500 mt-1">Crea tu primer perfil de jugadora para comenzar tu entrenamiento.</p>
            </div>
          )}

          {/* Action Row: Create New / Import Backup */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-2">
            <button
              onClick={() => { setFormError(''); setPhase('create'); }}
              className="w-full sm:flex-1 py-3.5 px-4 rounded-xl font-extrabold text-xs tracking-wider border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus className="w-4 h-4" /> CREAR NUEVO PERFIL
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto py-3.5 px-4 rounded-xl font-extrabold text-xs border border-slate-700 bg-slate-800/80 text-slate-300 hover:bg-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4 text-slate-400" /> Importar Backup (.json)
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportFile}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>

        {/* ─── DELETE PROFILE CONFIRMATION MODAL ───────────────────────── */}
        {profileToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
            <div className="w-full max-w-md rounded-2xl border border-red-500/40 bg-slate-900 p-6 text-center shadow-2xl space-y-4">
              <div className="w-14 h-14 rounded-full bg-red-950/80 border border-red-500/50 flex items-center justify-center mx-auto text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">¿Eliminar este perfil?</h3>
                <p className="text-xs text-slate-300 mt-2">
                  Estás a punto de borrar el perfil de <strong className="text-amber-400">{profileToDelete.profile.name}</strong>. Se eliminarán sus estadísticas, partidos registrados e historial de chat.
                </p>
                <p className="text-[11px] font-bold text-red-400 mt-1">⚠️ Esta acción no se puede deshacer.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setProfileToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-700 text-xs font-extrabold text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white shadow-lg transition-colors flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="w-4 h-4" /> Eliminar Perfil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── CREATE PROFILE PHASE ──────────────────────────────────────────
  if (phase === 'create') {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 overflow-y-auto py-8 ${exitingRecord ? 'animate-exit' : ''}`}>
        {bg}
        <div className="relative z-10 flex flex-col items-center gap-5 px-4 animate-welcome-fade-in w-full max-w-md">
          {logo}

          <div
            className="w-full rounded-2xl border p-6"
            style={{
              background: 'rgba(11,19,38,0.88)',
              borderColor: `${accent}44`,
              backdropFilter: 'blur(24px)',
              boxShadow: `0 0 60px ${accentGlow}, 0 20px 60px rgba(0,0,0,0.6)`,
            }}
          >
            <h3 className="text-xl font-black text-white mb-4 text-center flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              Crear Perfil de Jugadora
            </h3>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: accent }}>
                  NOMBRE DE LA JUGADORA
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setFormError(''); }}
                  placeholder="Ej. Alejandra García"
                  className="w-full px-4 py-3 rounded-xl text-sm font-semibold border outline-none transition-all"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'white',
                    border: `1.5px solid ${name ? accent + '88' : 'rgba(51,65,85,0.8)'}`,
                    boxShadow: name ? `0 0 12px ${accentGlow}` : 'none',
                  }}
                  autoFocus
                />
              </div>

              {/* Position + Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: accent }}>
                    POSICIÓN
                  </label>
                  <select
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-xs font-bold border outline-none transition-all"
                    style={{ background: '#0b1326', color: 'white', border: '1.5px solid rgba(51,65,85,0.8)' }}
                  >
                    {POSITIONS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: accent }}>
                    DORSAL
                  </label>
                  <input
                    type="number"
                    value={number}
                    min={1} max={99}
                    onChange={e => setNumber(e.target.value)}
                    className="w-full px-3 py-3 rounded-xl text-sm font-semibold border outline-none transition-all text-center"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1.5px solid rgba(51,65,85,0.8)' }}
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: accent }}>
                  PAÍS / NACIONALIDAD
                </label>
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl text-xs font-bold border outline-none transition-all"
                  style={{ background: '#0b1326', color: 'white', border: '1.5px solid rgba(51,65,85,0.8)' }}
                >
                  {COUNTRIES_LIST.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </div>

              {/* Dominant Foot */}
              <div>
                <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: accent }}>
                  PIE DOMINANTE
                </label>
                <div className="flex gap-2">
                  {FOOT_OPTIONS.map(f => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => setFoot(f)}
                      className="flex-1 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                      style={{
                        background: foot === f ? `${accent}22` : 'rgba(255,255,255,0.04)',
                        color: foot === f ? accent : '#94a3b8',
                        border: `1.5px solid ${foot === f ? accent + '88' : 'rgba(51,65,85,0.5)'}`,
                      }}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme color */}
              <div>
                <label className="block text-xs font-bold tracking-widest mb-1.5" style={{ color: accent }}>
                  COLOR DE TEMA DE ESTILO
                </label>
                <div className="flex gap-3 justify-center pt-1">
                  {THEME_COLORS.map((c, i) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => setThemeIdx(i)}
                      title={c.label}
                      className="w-8 h-8 rounded-full transition-all duration-150"
                      style={{
                        background: c.value,
                        border: themeIdx === i ? `3px solid white` : '3px solid transparent',
                        boxShadow: themeIdx === i ? `0 0 16px ${c.glow}` : 'none',
                        transform: themeIdx === i ? 'scale(1.25)' : 'scale(1)',
                      }}
                    />
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-xs font-semibold text-center text-red-400 bg-red-950/40 p-2 rounded-lg border border-red-800/40">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="relative w-full py-4 rounded-xl font-black text-xs tracking-widest overflow-hidden shimmer-btn transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] mt-2"
                style={{
                  background: `linear-gradient(135deg, ${accent}, ${accent}cc)`,
                  color: '#0b1326',
                  letterSpacing: '0.15em',
                  boxShadow: `0 0 30px ${accentGlow}`,
                }}
              >
                🚀 CREAR Y ENTRAR AHORA
              </button>

              <button
                type="button"
                onClick={() => setPhase('preliminary')}
                className="w-full text-center text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors pt-1"
              >
                ← Volver a Selección de Perfiles
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WelcomeScreen;
