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
import { 
  User, 
  Trash2, 
  Download, 
  Upload, 
  Plus, 
  Play, 
  ShieldAlert, 
  Sparkles, 
  CheckCircle2, 
  Trophy, 
  Flame,
  Zap,
  Target,
  Shield,
  Activity,
  ArrowRight
} from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface WelcomeScreenProps {
  onSelectProfile: (record: FullProfileRecord) => void;
}

const FOOT_OPTIONS = ['Derecho', 'Izquierdo', 'Ambidiestra'];
const THEME_COLORS: { id: ThemeColor; label: string; heroName: string; value: string; glow: string }[] = [
  { id: 'flash',    label: 'The Flash',       heroName: 'Speed Force',    value: '#EAB308', glow: 'rgba(234,179,8,0.5)' },
  { id: 'avengers', label: 'Capitán América', heroName: 'Vibranium Shield', value: '#38BDF8', glow: 'rgba(56,189,248,0.5)' },
  { id: 'widow',    label: 'Black Widow',     heroName: 'Stealth Scan',   value: '#EF4444', glow: 'rgba(239,68,68,0.5)' },
  { id: 'hulk',     label: 'Hulk',            heroName: 'Gamma Core',     value: '#22C55E', glow: 'rgba(34,197,94,0.5)' },
  { id: 'hawkeye',  label: 'Hawkeye',         heroName: 'Target Lock',    value: '#A855F7', glow: 'rgba(168,85,247,0.5)' },
];

export function saveProfile(profile: PlayerProfile) {
  console.log('Legacy saveProfile called for', profile.name);
}

export function clearProfile() {
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
    }, 1600);
    return () => clearTimeout(t);
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleEnterWithRecord = (record: FullProfileRecord) => {
    sounds.playClick();
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

    setSavedProfiles(getSavedProfiles());
    showToast(`¡Perfil de ${finalName} creado exitosamente!`);
    handleEnterWithRecord(newRecord);
  };

  const handleDeleteConfirm = () => {
    if (!profileToDelete) return;
    sounds.playClick();
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
          showToast('Archivo de respaldo no válido.');
        }
      }
    };
    reader.readAsText(file);
    if (e.target) e.target.value = '';
  };

  const currentTheme = THEME_COLORS[themeIdx];
  const accent = currentTheme?.value || '#EAB308';
  const accentGlow = currentTheme?.glow || 'rgba(234,179,8,0.5)';

  // ─── DYNAMIC SUPERHERO BACKGROUND SYSTEM ──────────────────────────────
  const bg = (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #05080f 0%, #0b1326 50%, #080d1a 100%)' }} />
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: `linear-gradient(${accent}33 1px, transparent 1px), linear-gradient(90deg, ${accent}33 1px, transparent 1px)`,
        backgroundSize: '50px 50px',
      }} />

      {/* Dynamic Superhero Radial Aura */}
      <div className="absolute rounded-full transition-all duration-700 ease-out" style={{
        width: 600, height: 600, top: '-10%', right: '-15%',
        background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
        filter: 'blur(70px)',
      }} />

      {/* Hero Specific Particle Background FX */}
      {currentTheme.id === 'flash' && (
        <div className="absolute top-1/4 right-1/4 w-72 h-72 rounded-full bg-amber-500/10 blur-3xl animate-pulse" />
      )}
      {currentTheme.id === 'hawkeye' && (
        <div className="absolute top-10 left-10 w-96 h-96 rounded-full border border-purple-500/20 animate-spin-slow" style={{ animationDuration: '30s' }} />
      )}
      {currentTheme.id === 'widow' && (
        <div className="absolute inset-0 bg-gradient-to-t from-red-600/10 via-transparent to-transparent animate-pulse" />
      )}
      {currentTheme.id === 'avengers' && (
        <div className="absolute top-1/3 left-1/3 w-80 h-80 rounded-full border-2 border-cyan-400/20 animate-ping" style={{ animationDuration: '6s' }} />
      )}
      {currentTheme.id === 'hulk' && (
        <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl animate-pulse" />
      )}
    </div>
  );

  // ─── Header Logo Component ──────────────────────────────────────────
  const logo = (
    <div className="flex flex-col items-center select-none text-center relative z-10">
      <div className="relative flex items-center justify-center">
        {/* Dynamic Superhero Hero Ring */}
        {currentTheme.id === 'hawkeye' && (
          <div className="absolute -inset-4 rounded-full border-2 border-dashed border-purple-500 animate-spin-slow pointer-events-none" style={{ animationDuration: '15s' }} />
        )}
        {currentTheme.id === 'flash' && (
          <div className="absolute -inset-3 rounded-full bg-amber-500/20 animate-pulse blur-md pointer-events-none" />
        )}
        {currentTheme.id === 'widow' && (
          <div className="absolute -inset-3 rounded-full border border-red-500/50 animate-pulse pointer-events-none" />
        )}

        <div className="transition-transform duration-300 hover:scale-105" style={{ filter: `drop-shadow(0 0 25px ${accentGlow})` }}>
          <svg width="72" height="72" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <polygon points="40,4 74,22 74,58 40,76 6,58 6,22" fill={accent} opacity="0.2" stroke={accent} strokeWidth="2.5"/>
            <text x="40" y="52" textAnchor="middle" fontSize="34" fontWeight="900" fill={accent} fontFamily="'Inter',sans-serif">A</text>
            <circle cx="40" cy="40" r="36" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.6"/>
          </svg>
        </div>
      </div>

      <div className="mt-3">
        <div className="font-black tracking-widest text-2xl md:text-3xl text-white" style={{ letterSpacing: '0.2em', textShadow: `0 0 25px ${accentGlow}` }}>
          APEX FEMME
        </div>
        <div className="text-[10px] tracking-[0.3em] font-mono font-bold text-cyan-400 mt-1">
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
        <div className="relative z-10 flex flex-col items-center animate-fade-in">
          {logo}
          <div className="mt-8 flex gap-2">
            {[0,1,2].map(i => (
              <div key={i} className="rounded-full" style={{
                width: 8, height: 8, background: accent, opacity: 0.8,
                animation: `pulse 1s ${i * 0.2}s infinite`,
              }} />
            ))}
          </div>
          <p className="mt-4 text-xs font-mono tracking-widest font-bold text-[var(--text-muted)]">
            CARGANDO SISTEMA DE ALTO RENDIMIENTO...
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
          <div className="fixed top-6 z-50 px-5 py-3 rounded-2xl bg-black/90 border border-cyan-500/50 text-cyan-300 text-xs font-mono font-bold shadow-2xl flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-cyan-400" />
            {toastMessage}
          </div>
        )}

        <div className="relative z-10 flex flex-col items-center gap-6 px-4 animate-fade-in w-full max-w-2xl">
          {logo}

          {/* Subtitle / Action instructions */}
          <div className="text-center space-y-1">
            <h2 className="text-xl md:text-2xl font-black text-white flex items-center justify-center gap-2">
              <User className="w-6 h-6 text-cyan-400" />
              Selecciona tu Perfil de Jugadora
            </h2>
            <p className="text-xs text-[var(--text-muted)] font-mono">
              Guarda tus avances, cambia de perfil o crea una nueva jugadora para mantener todo tu progreso a salvo.
            </p>
          </div>

          {/* Profile Cards Container */}
          {savedProfiles.length > 0 ? (
            <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
              {savedProfiles.map((record) => {
                const prof = record.profile;
                const matchCount = record.matchLogs?.length || 0;

                return (
                  <div
                    key={record.id}
                    className="relative group rounded-3xl border p-5 transition-all duration-300 hover:scale-[1.02] flex flex-col justify-between glass-card bg-black/80 border-cyan-500/30 hover:border-cyan-400 shadow-2xl"
                  >
                    {/* Top Row: Avatar + Name + OVR Badge */}
                    <div className="flex items-start gap-4">
                      <div className="relative">
                        <img
                          src={prof.avatarUrl}
                          alt={prof.name}
                          className="w-14 h-14 rounded-2xl object-cover border-2 border-cyan-400 shadow-md"
                        />
                        <span className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-lg text-[10px] font-black bg-cyan-500 text-black font-mono shadow">
                          {prof.OVR}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="font-extrabold text-base text-white truncate">
                            {prof.name}
                          </h3>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 text-cyan-400 font-bold border border-cyan-500/30">
                            #{prof.jerseyNumber || '10'}
                          </span>
                        </div>

                        <p className="text-xs font-mono text-[var(--text-muted)] truncate mt-0.5">
                          {prof.position}
                        </p>

                        <div className="flex items-center gap-3 mt-2 text-[10px] font-bold font-mono">
                          <span className="flex items-center gap-1 text-amber-400">
                            <Trophy className="w-3 h-3" /> Nivel {prof.level}
                          </span>
                          <span className="flex items-center gap-1 text-emerald-400">
                            <Flame className="w-3 h-3" /> {prof.streakDays || 1}d racha
                          </span>
                          <span className="text-[var(--text-muted)]">
                            {matchCount} partidos
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Action Row */}
                    <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2">
                      <button
                        onClick={() => handleEnterWithRecord(record)}
                        className="flex-1 py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider theme-accent-bg text-black flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" /> ENTRAR AL DASHBOARD
                      </button>

                      <button
                        onClick={() => exportProfileBackup(record)}
                        title="Guardar / Exportar copia de respaldo"
                        className="p-3 rounded-xl border border-white/10 bg-black/40 text-white hover:bg-cyan-500/20 transition-all cursor-pointer"
                      >
                        <Download className="w-4 h-4 text-cyan-400" />
                      </button>

                      <button
                        onClick={() => setProfileToDelete(record)}
                        title="Eliminar perfil"
                        className="p-3 rounded-xl border border-red-500/30 bg-red-950/30 text-red-400 hover:bg-red-500 hover:text-black transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full text-center py-10 px-4 rounded-3xl border border-white/10 bg-black/60 glass-panel">
              <User className="w-12 h-12 text-cyan-400 mx-auto mb-3 opacity-60" />
              <p className="text-sm font-bold text-white">No hay ningún perfil guardado aún.</p>
              <p className="text-xs text-[var(--text-muted)] font-mono mt-1">Crea tu primer perfil de jugadora para comenzar tu entrenamiento.</p>
            </div>
          )}

          {/* Action Row: Create New / Import Backup */}
          <div className="w-full flex flex-col sm:flex-row items-center gap-3 mt-2">
            <button
              onClick={() => { sounds.playClick(); setFormError(''); setPhase('create'); }}
              className="w-full sm:flex-1 py-4 px-5 rounded-2xl font-black text-xs uppercase tracking-wider theme-accent-bg text-black flex items-center justify-center gap-2 shadow-xl cursor-pointer"
            >
              <Plus className="w-4 h-4" /> CREAR NUEVO PERFIL
            </button>

            <button
              onClick={() => { sounds.playClick(); fileInputRef.current?.click(); }}
              className="w-full sm:w-auto py-4 px-5 rounded-2xl font-extrabold text-xs font-mono border border-white/10 bg-black/50 text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4 text-cyan-400" /> Importar Backup (.json)
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
            <div className="w-full max-w-md rounded-3xl border border-red-500/40 bg-black p-6 text-center shadow-2xl space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/40 flex items-center justify-center mx-auto text-red-400">
                <ShieldAlert className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-black text-white">¿Eliminar este perfil?</h3>
                <p className="text-xs text-[var(--text-muted)] font-mono mt-2">
                  Estás a punto de borrar el perfil de <strong className="text-amber-400">{profileToDelete.profile.name}</strong>.
                </p>
                <p className="text-[11px] font-bold text-red-400 mt-1 font-mono">Esta acción no se puede deshacer.</p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setProfileToDelete(null)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-xs font-bold text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-black text-white shadow-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
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
        <div className="relative z-10 flex flex-col items-center gap-5 px-4 animate-fade-in w-full max-w-md">
          {logo}

          <div
            className="w-full rounded-3xl border p-6 sm:p-7 glass-card bg-black/85 transition-all duration-500"
            style={{
              borderColor: `${accent}66`,
              boxShadow: `0 0 60px ${accentGlow}, 0 20px 60px rgba(0,0,0,0.8)`,
            }}
          >
            <div className="text-center space-y-1 mb-5">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono font-extrabold border border-cyan-500/30 uppercase inline-block">
                TEMA: {currentTheme.label} ({currentTheme.heroName})
              </span>
              <h3 className="text-xl font-black text-white flex items-center justify-center gap-2">
                <Sparkles className="w-5 h-5 text-cyan-400" />
                Crear Perfil de Jugadora
              </h3>
            </div>

            <form onSubmit={handleCreateProfile} className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-[10px] font-mono font-bold tracking-widest uppercase mb-1.5 text-cyan-400">
                  NOMBRE DE LA JUGADORA
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={e => { setName(e.target.value); setFormError(''); }}
                  placeholder="Ej. Alejandra García"
                  className="w-full px-4 py-3 rounded-2xl text-xs font-mono text-white border outline-none bg-black/60 transition-all focus:border-cyan-400"
                  style={{
                    borderColor: name ? accent : 'rgba(255,255,255,0.15)',
                    boxShadow: name ? `0 0 15px ${accentGlow}` : 'none',
                  }}
                  autoFocus
                />
              </div>

              {/* Position + Number */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-mono font-bold tracking-widest uppercase mb-1.5 text-cyan-400">
                    POSICIÓN
                  </label>
                  <select
                    value={position}
                    onChange={e => setPosition(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl text-xs font-mono font-bold border border-white/15 bg-black text-white outline-none focus:border-cyan-400"
                  >
                    {POSITIONS_LIST.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-mono font-bold tracking-widest uppercase mb-1.5 text-cyan-400">
                    DORSAL
                  </label>
                  <input
                    type="number"
                    value={number}
                    min={1} max={99}
                    onChange={e => setNumber(e.target.value)}
                    className="w-full px-3 py-3 rounded-2xl text-xs font-mono font-bold border border-white/15 bg-black text-white outline-none focus:border-cyan-400 text-center"
                  />
                </div>
              </div>

              {/* Country */}
              <div>
                <label className="block text-[10px] font-mono font-bold tracking-widest uppercase mb-1.5 text-cyan-400">
                  PAÍS / NACIONALIDAD
                </label>
                <select
                  value={countryCode}
                  onChange={e => setCountryCode(e.target.value)}
                  className="w-full px-3 py-3 rounded-2xl text-xs font-mono font-bold border border-white/15 bg-black text-white outline-none focus:border-cyan-400"
                >
                  {COUNTRIES_LIST.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </div>

              {/* Dominant Foot */}
              <div>
                <label className="block text-[10px] font-mono font-bold tracking-widest uppercase mb-1.5 text-cyan-400">
                  PIE DOMINANTE
                </label>
                <div className="flex gap-2">
                  {FOOT_OPTIONS.map(f => (
                    <button
                      type="button"
                      key={f}
                      onClick={() => { sounds.playClick(); setFoot(f); }}
                      className={`flex-1 py-2.5 rounded-2xl text-xs font-mono font-bold border transition-all cursor-pointer ${
                        foot === f
                          ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 font-black'
                          : 'bg-black/40 text-[var(--text-muted)] border-white/10 hover:text-white'
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Theme color with Superhero Labels */}
              <div>
                <label className="block text-[10px] font-mono font-bold tracking-widest uppercase mb-2 text-cyan-400 text-center">
                  ESTILO SUPERHÉROE DIVERSIFICADO
                </label>
                <div className="flex gap-3 justify-center items-center">
                  {THEME_COLORS.map((c, i) => (
                    <button
                      type="button"
                      key={c.value}
                      onClick={() => { sounds.playClick(); setThemeIdx(i); }}
                      title={`${c.label} (${c.heroName})`}
                      className="w-9 h-9 rounded-full transition-all duration-300 cursor-pointer relative flex items-center justify-center"
                      style={{
                        background: c.value,
                        border: themeIdx === i ? `3px solid white` : '2px solid rgba(255,255,255,0.2)',
                        boxShadow: themeIdx === i ? `0 0 20px ${c.glow}` : 'none',
                        transform: themeIdx === i ? 'scale(1.25)' : 'scale(1)',
                      }}
                    >
                      {themeIdx === i && <CheckCircle2 className="w-4 h-4 text-black font-black" />}
                    </button>
                  ))}
                </div>
              </div>

              {formError && (
                <p className="text-xs font-mono text-center text-red-400 bg-red-950/40 p-2.5 rounded-xl border border-red-800/40">
                  {formError}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-4 theme-accent-bg text-black font-black text-xs uppercase tracking-wider rounded-2xl theme-accent-glow flex items-center justify-center gap-2 cursor-pointer shadow-2xl mt-2 transition-transform active:scale-98"
              >
                <Sparkles className="w-4 h-4" /> CREAR Y ENTRAR AHORA
              </button>

              <button
                type="button"
                onClick={() => { sounds.playClick(); setPhase('preliminary'); }}
                className="w-full text-center text-xs font-mono text-[var(--text-muted)] hover:text-white transition-colors pt-1 cursor-pointer"
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
