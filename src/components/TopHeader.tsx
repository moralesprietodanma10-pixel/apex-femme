import React, { useState, useEffect } from 'react';
import { PlayerProfile, ActiveTab, ThemeColor, ThemeMode } from '../types';
import { Award, Sun, Moon, Palette } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface TopHeaderProps {
  playerProfile: PlayerProfile;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
}

const THEME_OPTIONS: { id: ThemeColor; colorHex: string; label: string }[] = [
  { id: 'flash',    colorHex: '#EAB308', label: 'The Flash' },
  { id: 'avengers', colorHex: '#38BDF8', label: 'Capitán América' },
  { id: 'widow',    colorHex: '#EF4444', label: 'Black Widow' },
  { id: 'hulk',     colorHex: '#22C55E', label: 'Hulk' },
  { id: 'hawkeye',  colorHex: '#A855F7', label: 'Hawkeye' },
];

export const TopHeader: React.FC<TopHeaderProps> = ({
  playerProfile,
  activeTab,
  setActiveTab,
  onUpdateProfile,
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
        className="flex items-center gap-3 cursor-pointer group text-left focus:outline-none rounded-full p-1 transition-all"
        onClick={() => handleTabClick('settings')}
      >
        <div className="relative w-10 h-10 rounded-full border-2 border-cyan-400 overflow-hidden shadow-md transition-transform group-hover:scale-105">
          <img 
            src={playerProfile.avatarUrl} 
            alt={playerProfile.name}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="hidden sm:block">
          <h1 className="font-extrabold text-[15px] text-[var(--text-main)] leading-tight flex items-center gap-1.5">
            {playerProfile.name}
            <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500 text-black rounded font-mono font-bold">
              #{playerProfile.jerseyNumber}
            </span>
          </h1>
          <p className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-widest">
            {playerProfile.position}
          </p>
        </div>
      </button>

      {/* Live Clock — Center */}
      <div className="hidden md:flex flex-col items-center select-none rounded-xl px-3 py-1">
        <span className="font-mono text-[22px] font-black text-white tracking-tight leading-none">
          {currentTime}
        </span>
        <span className="text-[9px] text-[var(--text-muted)] font-mono uppercase tracking-widest capitalize">
          {currentDate}
        </span>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-2">
        {/* Color Picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => { sounds.playClick(); setShowColorPicker(!showColorPicker); }}
            aria-label="Cambiar Color del Tema Visual"
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-cyan-400 active:scale-95 transition-all cursor-pointer"
          >
            <Palette className="w-3.5 h-3.5 text-cyan-400" />
          </button>

          {showColorPicker && (
            <div className="absolute right-0 mt-2 p-2.5 rounded-2xl glass-card shadow-2xl border border-[var(--border-card)] z-50 flex items-center gap-2 animate-fade-in bg-black/90">
              {THEME_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleSelectColor(t.id)}
                  className={`w-6 h-6 rounded-full transition-transform active:scale-90 flex items-center justify-center cursor-pointer ${
                    playerProfile.themeColor === t.id ? 'ring-2 ring-offset-2 ring-white scale-110' : 'hover:scale-110'
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
          className="w-8 h-8 flex items-center justify-center rounded-full bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-cyan-400 active:scale-95 transition-all cursor-pointer"
        >
          {currentMode === 'dark' ? (
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          ) : (
            <Moon className="w-3.5 h-3.5 text-indigo-400" />
          )}
        </button>

        {/* Settings */}
        <button
          type="button"
          onClick={() => handleTabClick('settings')}
          className={`w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200 active:scale-95 cursor-pointer ${
            activeTab === 'settings' 
              ? 'bg-cyan-500 text-black shadow-md' 
              : 'bg-[var(--bg-input)] border border-[var(--border-subtle)] text-white hover:border-cyan-400'
          }`}
        >
          <Award className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
