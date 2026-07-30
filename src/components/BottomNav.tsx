import React from 'react';
import { ActiveTab } from '../types';
import { Home, Dumbbell, Activity, Star, User, Bot } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCoach?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenCoach }) => {
  const primaryTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Inicio', icon: Home, question: '¿Cómo estoy hoy?' },
    { id: 'gym'       as ActiveTab, label: 'Entrenar', icon: Dumbbell, question: '¿Qué debo entrenar?' },
    { id: 'tracker'   as ActiveTab, label: 'Estadísticas', icon: Activity, question: '¿Cómo progreso?' },
    { id: 'mentors'   as ActiveTab, label: 'Salud', icon: Star, question: 'Salud & Referentes' },
    { id: 'card'      as ActiveTab, label: 'Perfil', icon: User, question: '¿Quién soy como atleta?' },
  ];

  const handleSelectTab = (tabId: ActiveTab) => {
    sounds.playClick();
    setActiveTab(tabId);
  };

  return (
    <nav 
      aria-label="Navegación principal de la aplicación" 
      role="tablist"
      className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-50 flex justify-between items-center h-16 px-3 bg-[var(--bg-header)] backdrop-blur-2xl border border-[var(--border-card)] rounded-full shadow-2xl transition-all duration-300 touch-none"
    >
      {primaryTabs.slice(0, 2).map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => handleSelectTab(tab.id)}
            aria-label={`${tab.label} — ${tab.question}`}
            className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] transition-all duration-150 active:scale-95 px-3.5 py-1 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
              isActive
                ? 'theme-accent-text font-extrabold scale-105'
                : 'text-[var(--text-muted)] opacity-75 hover:opacity-100 hover:text-[var(--text-main)]'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-[var(--accent-color)] absolute -bottom-0.5 rounded-full theme-accent-glow animate-pulse" />
            )}
          </button>
        );
      })}

      {/* Floating Center Action Button for Coach IA — Enlarged for 1-Tap Thumb Sweep */}
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'coach'}
        aria-controls="panel-coach"
        id="tab-coach"
        onClick={() => {
          sounds.playClick();
          if (onOpenCoach) onOpenCoach();
          else setActiveTab('coach');
        }}
        aria-label="APEX Coach IA — Asistente Táctico y Físico"
        className="relative -top-4 flex flex-col items-center justify-center transition-transform active:scale-90 group focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-full p-1 min-h-[56px] min-w-[56px]"
      >
        <div className="w-14 h-14 rounded-full theme-accent-bg theme-accent-glow p-3.5 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105 border-2 border-white/25">
          <Bot className="w-6 h-6 stroke-[2.5] text-black" />
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider text-[var(--accent-color)] mt-0.5 opacity-90 drop-shadow">
          COACH IA
        </span>
      </button>

      {primaryTabs.slice(2).map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => handleSelectTab(tab.id)}
            aria-label={`${tab.label} — ${tab.question}`}
            className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[48px] transition-all duration-150 active:scale-95 px-3.5 py-1 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
              isActive
                ? 'theme-accent-text font-extrabold scale-105'
                : 'text-[var(--text-muted)] opacity-75 hover:opacity-100 hover:text-[var(--text-main)]'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-bold">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-[var(--accent-color)] absolute -bottom-0.5 rounded-full theme-accent-glow animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
