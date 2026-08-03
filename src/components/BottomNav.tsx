import React from 'react';
import { ActiveTab } from '../types';
import { Home, Layers, Cpu, Dumbbell, Settings } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCoach?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, onOpenCoach }) => {
  const primaryTabs = [
    { id: 'dashboard' as ActiveTab, label: 'Inicio', icon: Home },
    { id: 'football'  as ActiveTab, label: 'FutLab', icon: Layers },
    { id: 'coach'     as ActiveTab, label: 'APEX MIND', icon: Cpu },
    { id: 'gym'       as ActiveTab, label: 'Gimnasio', icon: Dumbbell },
    { id: 'settings'  as ActiveTab, label: 'Ajustes', icon: Settings },
  ];

  const handleSelectTab = (tabId: ActiveTab) => {
    sounds.playClick();
    if (tabId === 'coach' && onOpenCoach) {
      onOpenCoach();
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <nav 
      aria-label="Navegación principal de la aplicación" 
      role="tablist"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md z-50 flex justify-around items-center h-16 px-2 bg-[var(--bg-header)] backdrop-blur-2xl border border-[var(--border-card)] rounded-full shadow-2xl transition-all duration-300 touch-none"
    >
      {primaryTabs.map((tab) => {
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
            className={`relative flex flex-col items-center justify-center min-h-[48px] min-w-[56px] transition-all duration-150 active:scale-95 px-3 py-1.5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] ${
              isActive
                ? 'theme-accent-text font-black scale-105'
                : 'text-[var(--text-muted)] opacity-70 hover:opacity-100 hover:text-[var(--text-main)]'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'stroke-[2.5] scale-110' : 'stroke-2'}`} />
            <span className="text-[10px] mt-0.5 tracking-tight font-black uppercase">
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
