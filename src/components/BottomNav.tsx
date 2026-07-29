import React from 'react';
import { ActiveTab } from '../types';
import { Home, Bot, PlusCircle, User, Trophy, Star, Settings, Dumbbell } from 'lucide-react';

interface BottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'dashboard' as ActiveTab, label: 'Inicio', icon: Home },
    { id: 'gym'       as ActiveTab, label: 'Gym', icon: Dumbbell },
    { id: 'coach'     as ActiveTab, label: 'Coach', icon: Bot },
    { id: 'mentors'   as ActiveTab, label: 'Referentes', icon: Star },
    { id: 'tracker'   as ActiveTab, label: 'Registrar', icon: PlusCircle, isFab: true },
    { id: 'card'      as ActiveTab, label: 'FUT Card', icon: User },
    { id: 'gamification' as ActiveTab, label: 'Desafíos', icon: Trophy },
    { id: 'settings'  as ActiveTab, label: 'Ajustes', icon: Settings },
  ];

  return (
    <nav className="fixed bottom-4 left-3 right-3 max-w-xl mx-auto z-50 flex justify-around items-center h-16 px-3 bg-[var(--bg-header)] backdrop-blur-xl border border-[var(--border-card)] rounded-full shadow-2xl transition-colors duration-200">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        if (tab.isFab) {
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex flex-col items-center justify-center p-1 transition-all duration-200 active:scale-95"
              title={tab.label}
            >
              <div className="theme-accent-bg theme-accent-glow p-2.5 rounded-full shadow-lg transition-transform hover:scale-105">
                <PlusCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`relative flex flex-col items-center justify-center transition-all duration-200 active:scale-90 px-1 py-1 ${
              isActive
                ? 'theme-accent-text scale-105 font-bold'
                : 'text-[var(--text-muted)] opacity-70 hover:opacity-100 hover:theme-accent-text'
            }`}
            title={tab.label}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
            <span className="text-[9px] mt-0.5 tracking-tight font-medium hidden sm:block">
              {tab.label}
            </span>
            {isActive && (
              <span className="w-1.5 h-1.5 bg-[var(--accent-color)] absolute -bottom-1.5 rounded-full theme-accent-glow" />
            )}
          </button>
        );
      })}
    </nav>
  );
};
