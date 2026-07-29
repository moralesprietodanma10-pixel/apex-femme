import React, { useState, useEffect, useRef } from 'react';
import { PlayerProfile } from '../types';

interface WelcomeScreenProps {
  onEnter: (profile: PlayerProfile) => void;
}

const POSITIONS = ['Delantera', 'Mediocampista', 'Defensora', 'Portera', 'Extremo'];
const FOOT_OPTIONS = ['Derecho', 'Izquierdo', 'Ambidiestra'];
const THEME_COLORS = [
  { label: '⚡ Flash', id: 'flash',    value: '#EAB308', glow: 'rgba(234,179,8,0.4)',    emoji: '⚡' },
  { label: '🛡️ Capitán América', id: 'avengers', value: '#EF4444', glow: 'rgba(239,68,68,0.4)', emoji: '🛡️' },
  { label: '🕷️ Black Widow', id: 'widow',    value: '#E11D48', glow: 'rgba(225,29,72,0.4)',  emoji: '🕷️' },
  { label: '💚 Hulk', id: 'hulk',     value: '#22C55E', glow: 'rgba(34,197,94,0.4)',   emoji: '💚' },
  { label: '🎯 Hawkeye', id: 'hawkeye',  value: '#A855F7', glow: 'rgba(168,85,247,0.4)', emoji: '🎯' },
];

const STORAGE_KEY = 'apex_femme_profile';

function loadSavedProfile(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as PlayerProfile;
  } catch { /* ignore */ }
  return null;
}

export function saveProfile(profile: PlayerProfile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function clearProfile() {
  localStorage.removeItem(STORAGE_KEY);
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onEnter }) => {
  const [phase, setPhase] = useState<'splash' | 'main' | 'create' | 'returning' | 'exiting'>('splash');
  const [savedProfile, setSavedProfile] = useState<PlayerProfile | null>(null);
  const [exiting, setExiting] = useState(false);

  // Create Profile form
  const [name, setName] = useState('');
  const [position, setPosition] = useState(POSITIONS[0]);
  const [number, setNumber] = useState('10');
  const [foot, setFoot] = useState(FOOT_OPTIONS[0]);
  const [themeIdx, setThemeIdx] = useState(0);
  const [formError, setFormError] = useState('');

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const existing = loadSavedProfile();
    setSavedProfile(existing);
    // Show splash for 2.2s then go main
    const t = setTimeout(() => {
      setPhase(existing ? 'returning' : 'main');
    }, 2200);
    return () => clearTimeout(t);
  }, []);

  const handleEnterWithProfile = (profile: PlayerProfile) => {
    setExiting(true);
    setTimeout(() => onEnter(profile), 450);
  };

  const handleReturnEnter = () => {
    if (savedProfile) handleEnterWithProfile(savedProfile);
  };

  const handleCreate = () => {
    const finalName = name.trim() || 'Jugadora APEX';
    const theme = THEME_COLORS[themeIdx];
    const profile: PlayerProfile = {
      name: finalName,
      position,
      jerseyNumber: `#${number || '10'}`,
      preferredFoot: foot,
      level: 1,
      OVR: 60,
      xp: 0,
      xpToNextLevel: 1000,
      attributes: {
        rhythm: 60,
        passing: 60,
        vision: 60,
        physical: 60,
        recovery: 60,
        shooting: 60,
      },
      streakDays: 1,
      monthlyMinutes: 0,
      avgRating: 7.0,
      country: 'ESP',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      playerCardPhotoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
      themeColor: (theme as any).id || 'flash',
      aiTone: 'gemini',
    };
    saveProfile(profile);
    // update CSS theme attribute
    document.documentElement.setAttribute('data-theme', (theme as any).id || 'flash');
    document.documentElement.style.removeProperty('--accent-color');
    document.documentElement.style.removeProperty('--accent-hover');
    document.documentElement.style.removeProperty('--accent-glow');
    handleEnterWithProfile(profile);
  };

  const accent = THEME_COLORS[themeIdx].value;
  const accentGlow = THEME_COLORS[themeIdx].glow;

  // ─── Shared background ───────────────────────────────────────
  const bg = (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, #05080f 0%, #0b1326 50%, #080d1a 100%)' }} />
      {/* Animated grid */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `linear-gradient(${accent}33 1px, transparent 1px), linear-gradient(90deg, ${accent}33 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />
      {/* Glowing orbs */}
      <div className="absolute rounded-full animate-pulse-slow" style={{
        width: 500, height: 500, top: '-10%', right: '-15%',
        background: `radial-gradient(circle, ${accentGlow} 0%, transparent 70%)`,
        filter: 'blur(60px)',
      }} />
      <div className="absolute rounded-full animate-pulse-slow" style={{
        width: 400, height: 400, bottom: '-10%', left: '-10%',
        background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)',
        filter: 'blur(80px)', animationDelay: '1.5s',
      }} />
      {/* Soccer field lines subtle */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 800 600\'%3E%3Crect x=\'40\' y=\'40\' width=\'720\' height=\'520\' fill=\'none\' stroke=\'white\' stroke-width=\'3\'/%3E%3Cline x1=\'400\' y1=\'40\' x2=\'400\' y2=\'560\' stroke=\'white\' stroke-width=\'2\'/%3E%3Ccircle cx=\'400\' cy=\'300\' r=\'80\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'/%3E%3Crect x=\'40\' y=\'190\' width=\'130\' height=\'220\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'/%3E%3Crect x=\'630\' y=\'190\' width=\'130\' height=\'220\' fill=\'none\' stroke=\'white\' stroke-width=\'2\'/%3E%3C/svg%3E")',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }} />
    </div>
  );

  // ─── Shared Logo ─────────────────────────────────────────────
  const logo = (
    <div className="flex flex-col items-center select-none">
      <div className="animate-logo-glow" style={{ filter: `drop-shadow(0 0 24px ${accentGlow})` }}>
        <svg width="72" height="72" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
          <polygon points="40,4 74,22 74,58 40,76 6,58 6,22" fill={accent} opacity="0.15" stroke={accent} strokeWidth="2"/>
          <text x="40" y="52" textAnchor="middle" fontSize="32" fontWeight="900" fill={accent} fontFamily="'Inter',sans-serif">A</text>
          <circle cx="40" cy="40" r="36" fill="none" stroke={accent} strokeWidth="1.5" strokeDasharray="6 4" opacity="0.5"/>
        </svg>
      </div>
      <div className="mt-3 text-center">
        <div className="font-black tracking-widest text-2xl" style={{ color: accent, letterSpacing: '0.18em', textShadow: `0 0 20px ${accentGlow}` }}>
          APEX FEMME
        </div>
        <div className="text-xs tracking-[0.3em] font-semibold" style={{ color: '#94a3b8', marginTop: 2 }}>
          PERFORMANCE AI
        </div>
      </div>
    </div>
  );

  // ─── SPLASH ───────────────────────────────────────────────────
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
          <p className="mt-4 text-xs tracking-widest font-semibold" style={{ color: '#94a3b8', letterSpacing: '0.25em' }}>
            CARGANDO...
          </p>
        </div>
      </div>
    );
  }

  // ─── RETURNING USER ───────────────────────────────────────────
  if (phase === 'returning' && savedProfile) {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${exiting ? 'animate-exit' : ''}`}>
        {bg}
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 animate-welcome-fade-in" style={{ maxWidth: 420, width: '100%' }}>
          {logo}

          <div className="w-full rounded-2xl border p-6 text-center" style={{
            background: 'rgba(11,19,38,0.8)',
            borderColor: `${accent}44`,
            backdropFilter: 'blur(20px)',
            boxShadow: `0 0 60px ${accentGlow}, 0 20px 60px rgba(0,0,0,0.5)`,
          }}>
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 font-black text-2xl" style={{ background: `${accent}22`, color: accent, border: `2px solid ${accent}44` }}>
              {savedProfile.name.charAt(0).toUpperCase()}
            </div>
            <p className="text-xs font-semibold tracking-widest mb-1" style={{ color: '#64748b' }}>BIENVENIDA DE VUELTA</p>
            <h2 className="text-2xl font-black text-white mb-1">{savedProfile.name}</h2>
            <p className="text-sm mb-6" style={{ color: '#94a3b8' }}>{savedProfile.position} · {savedProfile.jerseyNumber || '#10'}</p>

            <button
              onClick={handleReturnEnter}
              className="relative w-full py-4 rounded-xl font-black text-sm tracking-widest overflow-hidden shimmer-btn transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#0b1326', letterSpacing: '0.15em', boxShadow: `0 0 30px ${accentGlow}` }}
            >
              ⚡ ENTRAR AL DASHBOARD
            </button>

            <button
              onClick={() => { setSavedProfile(null); clearProfile(); setPhase('main'); }}
              className="mt-3 w-full py-2 rounded-xl text-sm font-semibold transition-all duration-200 hover:opacity-80"
              style={{ color: '#64748b', background: 'transparent', border: '1px solid rgba(100,116,139,0.3)' }}
            >
              Cambiar jugadora
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── MAIN: Nueva jugadora ──────────────────────────────────────
  if (phase === 'main') {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 ${exiting ? 'animate-exit' : ''}`}>
        {bg}
        <div className="relative z-10 flex flex-col items-center gap-8 px-6 animate-welcome-fade-in" style={{ maxWidth: 460, width: '100%' }}>
          {logo}

          <div className="w-full text-center" style={{ animationDelay: '0.1s' }}>
            <h2 className="text-3xl font-black text-white mb-2" style={{ textShadow: '0 0 30px rgba(255,255,255,0.1)' }}>
              Tu plataforma de<br/>
              <span style={{ color: accent }}>rendimiento deportivo</span>
            </h2>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              Analíticas avanzadas, IA entrenadora personal y mucho más.
            </p>
          </div>

          <button
            onClick={() => setPhase('create')}
            className="relative w-full py-4 rounded-xl font-black text-sm tracking-widest overflow-hidden shimmer-btn transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#0b1326', letterSpacing: '0.15em', boxShadow: `0 0 30px ${accentGlow}` }}
          >
            ⚽ CREAR MI PERFIL
          </button>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 justify-center">
            {['🏃 Entrenamiento con IA', '📊 Analíticas Pro', '🎙️ Coach de Voz', '⌚ Smartwatch', '🏆 Seguimiento de Metas'].map(f => (
              <span key={f} className="px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}>
                {f}
              </span>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── CREATE PROFILE ───────────────────────────────────────────
  if (phase === 'create') {
    return (
      <div className={`fixed inset-0 flex items-center justify-center z-50 overflow-y-auto py-8 ${exiting ? 'animate-exit' : ''}`}>
        {bg}
        <div className="relative z-10 flex flex-col items-center gap-5 px-4 animate-welcome-fade-in w-full" style={{ maxWidth: 460 }}>
          {logo}

          <div className="w-full rounded-2xl border p-6" style={{
            background: 'rgba(11,19,38,0.85)',
            borderColor: `${accent}33`,
            backdropFilter: 'blur(24px)',
            boxShadow: `0 0 60px ${accentGlow}, 0 20px 60px rgba(0,0,0,0.6)`,
          }}>
            <h3 className="text-xl font-black text-white mb-5 text-center">Crea tu Perfil de Jugadora</h3>

            {/* Name */}
            <div className="mb-4">
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: accent }}>TU NOMBRE</label>
              <input
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); setFormError(''); }}
                placeholder="Ej. Alejandra García"
                className="w-full px-4 py-3 rounded-xl text-sm font-semibold border outline-none transition-all"
                style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: `1.5px solid ${name ? accent + '66' : 'rgba(51,65,85,0.8)'}`, boxShadow: name ? `0 0 12px ${accentGlow}` : 'none' }}
                autoFocus
              />
            </div>

            {/* Position + Number */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: accent }}>POSICIÓN</label>
                <select
                  value={position}
                  onChange={e => setPosition(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl text-sm font-semibold border outline-none transition-all"
                  style={{ background: '#0b1326', color: 'white', border: '1.5px solid rgba(51,65,85,0.8)' }}
                >
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: accent }}>DORSAL</label>
                <input
                  type="number"
                  value={number}
                  min={1} max={99}
                  onChange={e => setNumber(e.target.value)}
                  className="w-full px-3 py-3 rounded-xl text-sm font-semibold border outline-none transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', color: 'white', border: '1.5px solid rgba(51,65,85,0.8)' }}
                />
              </div>
            </div>

            {/* Dominant Foot */}
            <div className="mb-4">
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: accent }}>PIE DOMINANTE</label>
              <div className="flex gap-2">
                {FOOT_OPTIONS.map(f => (
                  <button key={f} onClick={() => setFoot(f)} className="flex-1 py-2 rounded-xl text-sm font-bold transition-all duration-150"
                    style={{ background: foot === f ? `${accent}22` : 'rgba(255,255,255,0.04)', color: foot === f ? accent : '#94a3b8', border: `1.5px solid ${foot === f ? accent + '66' : 'rgba(51,65,85,0.5)'}`, boxShadow: foot === f ? `0 0 12px ${accentGlow}` : 'none' }}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme color */}
            <div className="mb-5">
              <label className="block text-xs font-bold tracking-widest mb-2" style={{ color: accent }}>COLOR DE TEMA</label>
              <div className="flex gap-3">
                {THEME_COLORS.map((c, i) => (
                  <button key={c.value} onClick={() => setThemeIdx(i)} title={c.label}
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
              <p className="text-xs font-semibold mb-3 text-center" style={{ color: '#f87171' }}>{formError}</p>
            )}

            <button
              onClick={handleCreate}
              className="relative w-full py-4 rounded-xl font-black text-sm tracking-widest overflow-hidden shimmer-btn transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{ background: `linear-gradient(135deg, ${accent}, ${accent}cc)`, color: '#0b1326', letterSpacing: '0.15em', boxShadow: `0 0 30px ${accentGlow}` }}
            >
              🚀 EMPEZAR AHORA
            </button>

            <button
              onClick={() => setPhase('main')}
              className="mt-3 w-full text-center text-xs font-semibold transition-opacity hover:opacity-70"
              style={{ color: '#64748b' }}
            >
              ← Volver
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default WelcomeScreen;
