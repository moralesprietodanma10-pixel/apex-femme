import React, { useState, useEffect } from 'react';
import { PlayerProfile, ActiveTab, ThemeColor, ThemeMode, SmartwatchData } from '../types';
import { Award, Sun, Moon, Palette, Watch, Heart } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface TopHeaderProps {
  playerProfile: PlayerProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  smartwatchData: SmartwatchData;
  onOpenSmartwatchModal: () => void;
}

const THEME_OPTIONS: { id: ThemeColor; colorHex: string; label: string; emoji: string }[] = [
  { id: 'flash',    colorHex: '#EAB308', label: 'Flash ⚡', emoji: '⚡' },
  { id: 'avengers', colorHex: '#EF4444', label: 'Capitán América 🛡️', emoji: '🛡️' },
  { id: 'widow',    colorHex: '#E11D48', label: 'Black Widow 🕷️', emoji: '🕷️' },
  { id: 'hulk',     colorHex: '#22C55E', label: 'Hulk 💚', emoji: '💚' },
  { id: 'hawkeye',  colorHex: '#A855F7', label: 'Hawkeye 🎯', emoji: '🎯' },
];

export const TopHeader: React.FC<TopHeaderProps> = ({
  playerProfile,
  activeTab,
  setActiveTab,
  onUpdateProfile,
  smartwatchData,
  onOpenSmartwatchModal,
}) => {
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate, setCurrentDate] = useState('');
  const currentMode: ThemeMode = playerProfile.themeMode || 'dark';

  // Live clock
  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }));
      setCurrentDate(now.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleThemeMode = () => {
    sounds.playClick();
    const nextMode: ThemeMode = currentMode === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-mode', nextMode);
    onUpdateProfile({ themeMode: nextMode });
  };

  const handleSelectColor = (color: ThemeColor) => {
    sounds.playClick();
    document.documentElement.setAttribute('data-theme', color);
    document.documentElement.style.removeProperty('--accent-color');
    document.documentElement.style.removeProperty('--accent-hover');
    document.documentElement.style.removeProperty('--accent-glow');
    onUpdateProfile({ themeColor: color });
    setShowColorPicker(false);
  };

  const handleTabClick = (tab: ActiveTab) => {
    sounds.playClick();
    setActiveTab(tab);
  };

  return (
    <header className="flex justify-between items-center px-4 md:px-6 h-16 w-full z-50 fixed top-0 bg-[var(--bg-header)] backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors duration-200">
      {/* Player Identity Button */}
      <button 
        type="button"
        className="flex items-center gap-3 cursor-pointer group text-left focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-full p-1 transition-all"
        onClick={() => handleTabClick('card')}
        aria-label={`Ver Ficha de Jugadora de ${playerProfile.name}`}
      >
        <div className="relative w-10 h-10 rounded-full border-2 border-[var(--accent-color)] overflow-hidden theme-accent-glow transition-transform group-hover:scale-105">
          <img 
            src={playerProfile.avatarUrl} 
            alt={`Fotografía de ${playerProfile.name}`}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden sm:block">
          <h1 className="font-bold text-[15px] text-[var(--text-main)] leading-tight flex items-center gap-1.5">
            {playerProfile.name}
            <span className="text-[9px] px-1.5 py-0.5 theme-accent-bg rounded font-mono font-semibold text-[#0b1326]">
              #{playerProfile.jerseyNumber}
            </span>
          </h1>
          <p className="text-[9px] text-[var(--text-muted)] font-semibold uppercase tracking-widest">
            {playerProfile.position}
          </p>
        </div>
      </button>

      {/* Live Clock — Center */}
      <button
        type="button"
        className="hidden md:flex flex-col items-center cursor-pointer group select-none focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-xl px-3 py-1 transition-all"
        onClick={() => { sounds.playClick(); onOpenSmartwatchModal(); }}
        aria-label="Abrir Centro de Reloj y Biometría"
      >
        <span className="font-mono text-[22px] font-black text-[var(--text-main)] tracking-tight leading-none group-hover:theme-accent-text transition-colors">
          {currentTime}
        </span>
        <span className="text-[9px] text-[var(--text-muted)] font-semibold uppercase tracking-widest capitalize">
          {currentDate}
        </span>
      </button>

      {/* Action Controls */}
      <div className="flex items-center gap-1.5 md:gap-2">

        {/* Smartwatch / BLE Button */}
        <button
          type="button"
          onClick={() => { sounds.playClick(); onOpenSmartwatchModal(); }}
          aria-label={smartwatchData.connected ? `Reloj conectado: ${smartwatchData.deviceName}, ${smartwatchData.heartRateBpm} pulsaciones por minuto` : 'Conectar Reloj Inteligente o Banda Cardíaca BLE'}
          className={`px-2.5 py-1.5 rounded-full border flex items-center gap-1.5 text-xs font-mono font-bold transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
            smartwatchData.connected
              ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400 hover:bg-emerald-500/20'
              : 'bg-[var(--bg-input)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-[var(--accent-color)]'
          }`}
        >
          <Watch className={`w-3.5 h-3.5 ${smartwatchData.connected ? 'text-emerald-400' : ''}`} />
          {smartwatchData.connected ? (
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3 text-red-400 animate-pulse" />
              <span>{smartwatchData.heartRateBpm} BPM</span>
            </span>
          ) : (
            <span className="hidden sm:inline">Reloj</span>
          )}
        </button>

        {/* XP Badge */}
        <button 
          type="button"
          className="hidden lg:flex flex-col items-end cursor-pointer mr-1 text-right focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-lg px-2 py-0.5"
          onClick={() => handleTabClick('gamification')}
          aria-label={`Progreso: ${playerProfile.xp.toLocaleString()} Experiencia, Nivel ${playerProfile.level}, Valoración Global ${playerProfile.OVR}`}
        >
          <span className="theme-accent-text font-mono font-bold text-[13px] flex items-center gap-1 leading-none">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[var(--accent-color)] animate-ping" />
            {playerProfile.xp.toLocaleString()} XP
          </span>
          <span className="text-[8px] text-[var(--text-muted)] font-semibold uppercase tracking-wider">
            Nv.{playerProfile.level} • OVR {playerProfile.OVR}
          </span>
        </button>

        {/* Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { sounds.playClick(); setShowColorPicker(!showColorPicker); }}
            aria-haspopup="true"
            aria-expanded={showColorPicker}
            aria-label="Cambiar Color del Tema Visual"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          >
            <Palette className="w-3.5 h-3.5 text-[var(--accent-color)]" />
          </button>

          {showColorPicker && (
            <div 
              role="menu" 
              aria-label="Opciones de Color de Tema"
              className="absolute right-0 mt-2 p-2.5 rounded-2xl glass-card shadow-2xl border border-[var(--border-card)] z-50 flex items-center gap-2 animate-fade-in bg-[var(--bg-card-solid)]"
            >
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  role="menuitem"
                  onClick={() => handleSelectColor(t.id)}
                  aria-label={`Seleccionar tema ${t.label}`}
                  className={`w-6 h-6 rounded-full transition-transform active:scale-90 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white ${
                    playerProfile.themeColor === t.id ? 'ring-2 ring-offset-2 ring-[var(--text-main)] scale-110' : 'hover:scale-110'
                  }`}
                  style={{ backgroundColor: t.colorHex }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Dark/Light Toggle */}
        <button
          type="button"
          onClick={toggleThemeMode}
          aria-label={currentMode === 'dark' ? 'Cambiar a Modo Claro' : 'Cambiar a Modo Oscuro'}
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)] active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
        >
          {currentMode === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-500" />
          )}
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => handleTabClick('settings')}
          aria-label="Abrir Ajustes de Perfil"
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
            activeTab === 'settings' 
              ? 'theme-accent-bg theme-accent-glow' 
              : 'bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)]'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
