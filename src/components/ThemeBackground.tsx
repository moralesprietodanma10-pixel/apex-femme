import React from 'react';
import { ThemeColor } from '../types';

interface ThemeBackgroundProps {
  theme: ThemeColor;
}

export const ThemeBackground: React.FC<ThemeBackgroundProps> = ({ theme }) => {
  const accent = {
    flash:    '#EAB308', // Amarillo Neón
    avengers: '#EF4444', // Capitán América - Rojo Neón
    widow:    '#E11D48', // Viuda Negra - Carmesí
    hulk:     '#22C55E', // Hulk - Verde Radiactivo
    hawkeye:  '#A855F7', // Hawkeye - Morado Eléctrico
  }[theme] || '#EAB308';

  const glow = {
    flash:    'rgba(234,179,8,',
    avengers: 'rgba(239,68,68,',
    widow:    'rgba(225,29,72,',
    hulk:     'rgba(34,197,94,',
    hawkeye:  'rgba(168,85,247,',
  }[theme] || 'rgba(234,179,8,';

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">

      {/* ── Flash Theme: Lightning Bolts ─────────────────────── */}
      {theme === 'flash' && (
        <>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: '20%', left: '50%',
            width: 650, height: 650, borderRadius: '50%',
            background: `radial-gradient(circle, ${glow}0.12) 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            animation: 'flash-core-pulse 4s ease-in-out infinite',
            filter: 'blur(60px)',
          }} />
          {/* Lightning bolt 1 */}
          <svg style={{
            position: 'absolute', top: '10%', left: '10%',
            width: 90, height: 180, opacity: 0,
            animation: 'flash-bolt-1 5s ease-in-out infinite',
          }} viewBox="0 0 40 80" fill={accent}>
            <polygon points="24,0 10,40 20,40 16,80 30,30 20,30" opacity="0.85"/>
          </svg>
          {/* Lightning bolt 2 */}
          <svg style={{
            position: 'absolute', top: '30%', right: '15%',
            width: 70, height: 140, opacity: 0,
            animation: 'flash-bolt-2 7s ease-in-out infinite 1.5s',
          }} viewBox="0 0 40 80" fill={accent}>
            <polygon points="24,0 10,40 20,40 16,80 30,30 20,30" opacity="0.75"/>
          </svg>
          {/* Lightning bolt 3 - small */}
          <svg style={{
            position: 'absolute', bottom: '25%', left: '25%',
            width: 50, height: 100, opacity: 0,
            animation: 'flash-bolt-1 9s ease-in-out infinite 3s',
          }} viewBox="0 0 40 80" fill={accent}>
            <polygon points="24,0 10,40 20,40 16,80 30,30 20,30" opacity="0.65"/>
          </svg>
          {/* Sparks */}
          {[...Array(6)].map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              top: `${15 + i * 13}%`,
              left: `${10 + i * 14}%`,
              width: 5, height: 5, borderRadius: '50%',
              background: accent,
              boxShadow: `0 0 10px 4px ${glow}0.7)`,
              animation: `flash-spark ${2 + i * 0.5}s ease-in-out infinite ${i * 0.3}s`,
            }} />
          ))}
          {/* Large Flash symbol in background */}
          <svg style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 420, height: 420,
            transform: 'translate(-50%, -50%)',
            opacity: 0.15,
            animation: 'flash-core-pulse 4s ease-in-out infinite',
          }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={accent} strokeWidth="3.5"/>
            <polygon points="60,5 35,55 50,55 40,95 65,45 50,45" fill={accent}/>
          </svg>
        </>
      )}

      {/* ── Avengers / Capitán América Theme: Red Shield + Rings ───── */}
      {theme === 'avengers' && (
        <>
          {/* Rotating shield */}
          <svg style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 380, height: 380,
            animation: 'avengers-spin 20s linear infinite',
            opacity: 0.18,
          }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={accent} strokeWidth="4"/>
            <circle cx="50" cy="50" r="36" fill="none" stroke={accent} strokeWidth="3"/>
            <circle cx="50" cy="50" r="22" fill="none" stroke={accent} strokeWidth="2"/>
            {/* Captain America Star */}
            <polygon points="50,28 55,42 70,42 58,52 62,66 50,56 38,66 42,52 30,42 45,42" fill={accent}/>
          </svg>
          {/* Expanding red rings */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 220, height: 220, borderRadius: '50%',
            border: `2px solid ${accent}`,
            animation: 'avengers-ring-expand 4s ease-out infinite',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 220, height: 220, borderRadius: '50%',
            border: `2px solid ${accent}`,
            animation: 'avengers-ring-expand-2 4s ease-out infinite 2s',
          }} />
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 220, height: 220, borderRadius: '50%',
            border: `1.5px solid ${accent}`,
            animation: 'avengers-ring-expand 4s ease-out infinite 1s',
          }} />
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: '40%', left: '40%',
            width: 550, height: 550, borderRadius: '50%',
            background: `radial-gradient(circle, ${glow}0.12) 0%, transparent 70%)`,
            animation: 'avengers-breathe 5s ease-in-out infinite',
            filter: 'blur(50px)',
          }} />
        </>
      )}

      {/* ── Black Widow Theme: Floating Hourglasses ───────────── */}
      {theme === 'widow' && (
        <>
          {/* Hourglass 1 */}
          <svg style={{
            position: 'absolute', left: '20%', bottom: '-10%',
            width: 80, height: 80, opacity: 0,
            animation: 'widow-float-1 12s ease-in-out infinite',
          }} viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="28" fill={accent} opacity="0.18"/>
            <polygon points="10,8 50,8 30,30" fill={accent} opacity="0.85"/>
            <polygon points="10,52 50,52 30,30" fill={accent} opacity="0.85"/>
          </svg>
          {/* Hourglass 2 */}
          <svg style={{
            position: 'absolute', left: '60%', bottom: '-10%',
            width: 60, height: 60, opacity: 0,
            animation: 'widow-float-2 16s ease-in-out infinite 4s',
          }} viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="28" fill={accent} opacity="0.15"/>
            <polygon points="10,8 50,8 30,30" fill={accent} opacity="0.75"/>
            <polygon points="10,52 50,52 30,30" fill={accent} opacity="0.75"/>
          </svg>
          {/* Hourglass 3 */}
          <svg style={{
            position: 'absolute', left: '40%', bottom: '-5%',
            width: 50, height: 50, opacity: 0,
            animation: 'widow-float-1 14s ease-in-out infinite 7s',
          }} viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="28" fill={accent} opacity="0.12"/>
            <polygon points="10,8 50,8 30,30" fill={accent} opacity="0.70"/>
            <polygon points="10,52 50,52 30,30" fill={accent} opacity="0.70"/>
          </svg>
          {/* Ambient pulse */}
          <div style={{
            position: 'absolute', bottom: '10%', left: '50%',
            width: 450, height: 450, borderRadius: '50%',
            background: `radial-gradient(circle, ${glow}0.12) 0%, transparent 70%)`,
            transform: 'translate(-50%, 0)',
            animation: 'widow-pulse 4s ease-in-out infinite',
            filter: 'blur(60px)',
          }} />
          {/* Large symbol in background */}
          <svg style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 380, height: 380,
            transform: 'translate(-50%, -50%)',
            opacity: 0.05,
          }} viewBox="0 0 60 60">
            <circle cx="30" cy="30" r="28" fill="none" stroke={accent} strokeWidth="3"/>
            <polygon points="8,6 52,6 30,30" fill={accent}/>
            <polygon points="8,54 52,54 30,30" fill={accent}/>
          </svg>
        </>
      )}

      {/* ── Hulk Theme: Fist Impact + Gamma Cracks ───────────── */}
      {theme === 'hulk' && (
        <>
          {/* Large fist 1 */}
          <svg style={{
            position: 'absolute', top: '15%', right: '5%',
            width: 220, height: 220,
            animation: 'hulk-fist-pulse 6s ease-in-out infinite',
          }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" fill="none" stroke={accent} strokeWidth="3" opacity="0.20"/>
            <ellipse cx="50" cy="62" rx="28" ry="18" fill={accent} opacity="0.25"/>
            <rect x="24" y="30" width="52" height="32" rx="6" fill={accent} opacity="0.22"/>
            <rect x="26" y="22" width="12" height="18" rx="4" fill={accent} opacity="0.22"/>
            <rect x="40" y="20" width="12" height="18" rx="4" fill={accent} opacity="0.22"/>
            <rect x="54" y="22" width="12" height="18" rx="4" fill={accent} opacity="0.22"/>
            <rect x="66" y="26" width="10" height="16" rx="4" fill={accent} opacity="0.22"/>
          </svg>
          {/* Large fist 2 */}
          <svg style={{
            position: 'absolute', bottom: '10%', left: '5%',
            width: 180, height: 180,
            animation: 'hulk-fist-pulse-2 8s ease-in-out infinite 2s',
          }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="47" fill="none" stroke={accent} strokeWidth="3" opacity="0.16"/>
            <ellipse cx="50" cy="62" rx="28" ry="18" fill={accent} opacity="0.18"/>
            <rect x="24" y="30" width="52" height="32" rx="6" fill={accent} opacity="0.18"/>
            <rect x="26" y="22" width="12" height="18" rx="4" fill={accent} opacity="0.18"/>
            <rect x="40" y="20" width="12" height="18" rx="4" fill={accent} opacity="0.18"/>
            <rect x="54" y="22" width="12" height="18" rx="4" fill={accent} opacity="0.18"/>
          </svg>
          {/* Gamma crack lines */}
          <svg style={{
            position: 'absolute', top: '50%', left: '50%',
            width: '100%', height: '40%',
            transform: 'translate(-50%, -50%)',
            animation: 'hulk-gamma-crack 8s ease-in-out infinite 3s',
          }} viewBox="0 0 400 200">
            <polyline points="200,100 220,60 240,90 260,40 280,80" fill="none" stroke={accent} strokeWidth="2" opacity="0.6"/>
            <polyline points="200,100 180,70 160,100 140,50 120,85" fill="none" stroke={accent} strokeWidth="2" opacity="0.6"/>
            <polyline points="200,100 210,130 230,110 250,150 270,120" fill="none" stroke={accent} strokeWidth="1.5" opacity="0.5"/>
          </svg>
          {/* Ambient green glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 650, height: 650, borderRadius: '50%',
            background: `radial-gradient(circle, ${glow}0.10) 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            animation: 'hulk-ambient 5s ease-in-out infinite',
            filter: 'blur(70px)',
          }} />
        </>
      )}

      {/* ── Hawkeye Theme: Arrow Streaks ──────────────────────── */}
      {theme === 'hawkeye' && (
        <>
          {/* Arrow streak 1 */}
          <svg style={{
            position: 'absolute', top: '25%', left: '-5%',
            width: 260, height: 35, opacity: 0,
            animation: 'hawkeye-arrow-1 6s ease-in-out infinite',
          }} viewBox="0 0 240 30">
            <line x1="0" y1="15" x2="200" y2="15" stroke={accent} strokeWidth="2.5" opacity="0.85"/>
            <polygon points="200,5 240,15 200,25" fill={accent} opacity="0.85"/>
            <line x1="0" y1="15" x2="100" y2="15" stroke={accent} strokeWidth="4.5" opacity="0.35"/>
          </svg>
          {/* Arrow streak 2 */}
          <svg style={{
            position: 'absolute', top: '60%', right: '-5%',
            width: 220, height: 30, opacity: 0,
            animation: 'hawkeye-arrow-2 8s ease-in-out infinite 2s',
            transform: 'scaleX(-1)',
          }} viewBox="0 0 240 30">
            <line x1="0" y1="15" x2="200" y2="15" stroke={accent} strokeWidth="2.5" opacity="0.75"/>
            <polygon points="200,6 240,15 200,24" fill={accent} opacity="0.75"/>
            <line x1="0" y1="15" x2="120" y2="15" stroke={accent} strokeWidth="3.5" opacity="0.3"/>
          </svg>
          {/* Arrow streak 3 */}
          <svg style={{
            position: 'absolute', top: '45%', left: '-5%',
            width: 200, height: 25, opacity: 0,
            animation: 'hawkeye-arrow-3 10s ease-in-out infinite 5s',
          }} viewBox="0 0 240 30">
            <line x1="0" y1="15" x2="200" y2="15" stroke={accent} strokeWidth="2" opacity="0.7"/>
            <polygon points="200,7 240,15 200,23" fill={accent} opacity="0.7"/>
          </svg>
          {/* Hawkeye chevron symbol in background */}
          <svg style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 350, height: 350,
            transform: 'translate(-50%, -50%)',
            opacity: 0.06,
          }} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="none" stroke={accent} strokeWidth="4"/>
            <polygon points="50,20 78,45 66,45 66,65 34,65 34,45 22,45" fill={accent}/>
          </svg>
          {/* Ambient glow */}
          <div style={{
            position: 'absolute', top: '50%', left: '50%',
            width: 550, height: 550, borderRadius: '50%',
            background: `radial-gradient(circle, ${glow}0.10) 0%, transparent 70%)`,
            transform: 'translate(-50%, -50%)',
            animation: 'hawkeye-ambient 4s ease-in-out infinite',
            filter: 'blur(60px)',
          }} />
        </>
      )}
    </div>
  );
};
