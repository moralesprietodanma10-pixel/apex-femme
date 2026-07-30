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
    { id: 'mentors'   as ActiveTab, label: 'Salud & Referentes', icon: Star, question: 'Salud & Referentes' },
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
      className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-50 flex justify-between items-center h-16 px-4 bg-[var(--bg-header)] backdrop-blur-2xl border border-[var(--border-card)] rounded-full shadow-2xl transition-all duration-300"
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
            className={`relative flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-3 py-1 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
              isActive
                ? 'theme-accent-text font-bold scale-105'
                : 'text-[var(--text-muted)] opacity-70 hover:opacity-100 hover:text-[var(--text-main)]'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight font-semibold">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-[var(--accent-color)] absolute -bottom-1 rounded-full theme-accent-glow animate-pulse" />
            )}
          </button>
        );
      })}

      {/* Floating Center Action Button for Coach IA */}
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
        className="relative -top-4 flex flex-col items-center justify-center transition-transform active:scale-95 group focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] rounded-full p-1"
      >
        <div className="w-13 h-13 rounded-full theme-accent-bg theme-accent-glow p-3.5 flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 border-2 border-white/20">
          <Bot className="w-6 h-6 stroke-[2.5] text-black" />
        </div>
        <span className="text-[9px] font-extrabold uppercase tracking-wider text-[var(--accent-color)] mt-0.5 opacity-90 drop-shadow">
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
            className={`relative flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-3 py-1 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
              isActive
                ? 'theme-accent-text font-bold scale-105'
                : 'text-[var(--text-muted)] opacity-70 hover:opacity-100 hover:text-[var(--text-main)]'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
            <span className="text-[10px] mt-1 tracking-tight font-semibold">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-[var(--accent-color)] absolute -bottom-1 rounded-full theme-accent-glow animate-pulse" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
