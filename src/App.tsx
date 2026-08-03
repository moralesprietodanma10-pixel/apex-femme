import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import { 
  FullProfileRecord, 
  getActiveProfileRecord, 
  saveProfileRecord, 
  setActiveProfileId 
} from './services/profileStorage';
import { 
  PlayerProfile, 
  ScheduleDay, 
  MatchLog, 
  ChatMessage, 
  Challenge, 
  Badge, 
  ActiveTab
} from './types';
import { 
  INITIAL_PLAYER_PROFILE, 
  INITIAL_WEEKLY_SCHEDULE, 
  INITIAL_CHAT_HISTORY, 
  INITIAL_CHALLENGES, 
  INITIAL_BADGES,
  FEMALE_MENTORS
} from './data/initialData';

import { TopHeader } from './components/TopHeader';
import { BottomNav } from './components/BottomNav';
import { ToastNotification, ToastData } from './components/ToastNotification';
import { OfflineBanner } from './components/OfflineBanner';

import { ResetConfirmModal } from './components/ResetConfirmModal';
import { BackgroundMusicPlayer } from './components/BackgroundMusicPlayer';
import { ThemeBackground } from './components/ThemeBackground';
import { InteractiveWorkoutModal } from './components/InteractiveWorkoutModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkeletonLoader } from './components/SkeletonLoader';
import { sounds } from './services/soundEffects';
import { generateAIResponse } from './services/aiEngineService';

import { FootballLabView } from './components/FootballLabView';

// Code-splitting via React.lazy for optimized bundle size & fast TTI
const DashboardView = lazy(() => import('./components/DashboardView').then(m => ({ default: m.DashboardView })));
const CoachView = lazy(() => import('./components/CoachView').then(m => ({ default: m.CoachView })));
const GymHubView = lazy(() => import('./components/GymHubView').then(m => ({ default: m.GymHubView })));
const FemaleMentorsView = lazy(() => import('./components/FemaleMentorsView').then(m => ({ default: m.FemaleMentorsView })));
const MatchTrackerView = lazy(() => import('./components/MatchTrackerView').then(m => ({ default: m.MatchTrackerView })));
const PlayerCardView = lazy(() => import('./components/PlayerCardView').then(m => ({ default: m.PlayerCardView })));
const GamificationView = lazy(() => import('./components/GamificationView').then(m => ({ default: m.GamificationView })));
const SettingsView = lazy(() => import('./components/SettingsView').then(m => ({ default: m.SettingsView })));

export default function App() {
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() => {
    const rec = getActiveProfileRecord();
    return rec ? rec.id : null;
  });

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(() => {
    return activeProfileId !== null;
  });

  const initialRecord = getActiveProfileRecord();

  // Load state from active profile record or use defaults
  const [playerProfile, setPlayerProfile] = useState<PlayerProfile>(() => {
    return initialRecord ? initialRecord.profile : INITIAL_PLAYER_PROFILE;
  });

  const [weeklySchedule, setWeeklySchedule] = useState<ScheduleDay[]>(() => {
    return initialRecord?.weeklySchedule && initialRecord.weeklySchedule.length > 0
      ? initialRecord.weeklySchedule
      : INITIAL_WEEKLY_SCHEDULE;
  });

  const [matchLogs, setMatchLogs] = useState<MatchLog[]>(() => {
    return initialRecord?.matchLogs || [];
  });

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>(() => {
    return initialRecord?.chatHistory && initialRecord.chatHistory.length > 0
      ? initialRecord.chatHistory
      : INITIAL_CHAT_HISTORY;
  });

  const [challenges, setChallenges] = useState<Challenge[]>(() => {
    return initialRecord?.challenges && initialRecord.challenges.length > 0
      ? initialRecord.challenges
      : INITIAL_CHALLENGES;
  });

  const [badges, setBadges] = useState<Badge[]>(() => {
    return initialRecord?.badges && initialRecord.badges.length > 0
      ? initialRecord.badges
      : INITIAL_BADGES;
  });

  const handleSelectProfile = (record: FullProfileRecord) => {
    document.documentElement.style.removeProperty('--accent-color');
    document.documentElement.style.removeProperty('--accent-hover');
    document.documentElement.style.removeProperty('--accent-glow');

    setActiveProfileId(record.id);
    setActiveProfileIdState(record.id);

    setPlayerProfile(record.profile);
    setWeeklySchedule(record.weeklySchedule || INITIAL_WEEKLY_SCHEDULE);
    setMatchLogs(record.matchLogs || []);
    setChatHistory(record.chatHistory || INITIAL_CHAT_HISTORY);
    setChallenges(record.challenges || INITIAL_CHALLENGES);
    setBadges(record.badges || INITIAL_BADGES);

    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setActiveProfileId(null);
    setActiveProfileIdState(null);
    setIsLoggedIn(false);
  };

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [toast, setToast] = useState<ToastData | null>(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState<boolean>(false);
  const [activeWorkoutDay, setActiveWorkoutDay] = useState<ScheduleDay | null>(null);
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState<boolean>(false);

  const handleStartInteractiveWorkout = (day: ScheduleDay) => {
    sounds.playClick();
    setActiveWorkoutDay(day);
    setIsWorkoutModalOpen(true);
  };

  const handleCompleteInteractiveWorkout = (tonnageKg: number, xpGained: number) => {
    if (activeWorkoutDay) {
      setWeeklySchedule((prev) =>
        prev.map((d) =>
          d.id === activeWorkoutDay.id
            ? { ...d, status: 'completed' as const, totalTonnageKg: (d.totalTonnageKg || 0) + tonnageKg }
            : d
        )
      );
    }
    addXp(xpGained, 'Entrenamiento Interactivo en Vivo');
    setPlayerProfile((prev) => {
      const attr = { ...prev.attributes };
      attr.physical = Math.min(99, attr.physical + 1);
      attr.recovery = Math.min(99, attr.recovery + 1);
      const sum = attr.rhythm + attr.passing + attr.vision + attr.physical + attr.recovery + attr.shooting;
      return {
        ...prev,
        attributes: attr,
        OVR: Math.round(sum / 6),
        streakDays: prev.streakDays + 1
      };
    });
  };

  // Sync state to LocalStorage (Profile Record & Document Theme)
  useEffect(() => {
    if (!isLoggedIn || !activeProfileId) return;

    try {
      document.documentElement.setAttribute('data-theme', playerProfile.themeColor || 'flash');
      document.documentElement.setAttribute('data-mode', playerProfile.themeMode || 'dark');
      document.documentElement.style.removeProperty('--accent-color');
      document.documentElement.style.removeProperty('--accent-hover');
      document.documentElement.style.removeProperty('--accent-glow');

      saveProfileRecord({
        id: activeProfileId,
        lastActive: new Date().toISOString(),
        profile: playerProfile,
        weeklySchedule,
        matchLogs,
        chatHistory,
        challenges,
        badges
      });
    } catch (e) {
      console.warn("Error saving active profile state to localStorage", e);
    }
  }, [isLoggedIn, activeProfileId, playerProfile, weeklySchedule, matchLogs, chatHistory, challenges, badges]);

  // Helper for adding XP and handling level ups
  const addXp = (amount: number, reason: string) => {
    setPlayerProfile((prev) => {
      const newXp = prev.xp + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      const leveledUp = newLevel > prev.level;

      if (leveledUp) {
        sounds.playLevelUp();
        setToast({
          id: Date.now().toString(),
          title: `¡NIVEL ALCANZADO! LEVEL ${newLevel}`,
          message: `Has desbloqueado el rango Playmaker Avanzada. +${amount} XP ganado por ${reason}.`,
          type: 'level',
          xpGained: amount
        });
      } else {
        sounds.playSuccess();
        setToast({
          id: Date.now().toString(),
          title: `¡PROGRESO REGISTRADO!`,
          message: `+${amount} XP ganado (${reason}).`,
          type: 'xp',
          xpGained: amount
        });
      }

      return {
        ...prev,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newLevel * 1000
      };
    });
  };

  // 1. Confirm Day Activity (From Dashboard)
  const handleConfirmDayActivity = () => {
    setWeeklySchedule((prev) => {
      let updated = false;
      const nextSchedule = prev.map((item) => {
        if (!updated && (item.status === 'today' || item.status === 'pending')) {
          updated = true;
          return { ...item, status: 'completed' as const };
        }
        return item;
      });
      return nextSchedule;
    });

    addXp(100, 'Confirmar Actividad Diaria');

    setPlayerProfile((prev) => ({
      ...prev,
      streakDays: prev.streakDays + 1
    }));
  };

  // Select day in schedule
  const handleSelectDay = (dayId: string) => {
    setWeeklySchedule((prev) =>
      prev.map((d) => {
        if (d.id === dayId) {
          const nextStatus = d.status === 'completed' ? 'pending' : 'completed';
          return { ...d, status: nextStatus };
        }
        return d;
      })
    );
  };

  // 2. AI Coach Chat Interaction
  const handleUpdateWeeklySchedule = (newSchedule: ScheduleDay[]) => {
    setWeeklySchedule(newSchedule);
    setToast({
      id: Date.now().toString(),
      title: "¡PLANIFICACIÓN IMPORTADA!",
      message: "Tus entrenamientos en gimnasio, casa o sprints han sido cargados en tu horario.",
      type: "success"
    });
  };

  const handleSendMessage = useCallback((userText: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setChatHistory((prev) => [...prev, userMsg]);

    const delay = 800 + Math.random() * 700;

    setTimeout(() => {
      // V12: Pass matchLogs for richer context and higher confidence scores
      const response = generateAIResponse(userText, playerProfile, undefined, matchLogs);

      const currentTone = playerProfile.aiTone || 'gemini';
      const headers: Record<string, string> = {
        gemini: '🤖 **APEX Coach IA:**',
        demanding: '🔥 **Entrenadora Exigente:**',
        scientific: '🔬 **Análisis Científico:**',
        tactical: '⚡ **Analista Táctica Élite:**',
      };
      const header = headers[currentTone] || headers.gemini;

      if (response.importGym) {
        const t = response.importTime || '18:00';
        setWeeklySchedule(prev => prev.map(item =>
          ['LUN','MIE','VIE'].includes(item.dayShort)
            ? { ...item, activityType: 'gimnasio', title: 'Gimnasio: Fuerza Explosiva & Core', scheduledTime: t, location: 'gym', focusArea: 'fuerza', exercises: ['Sentadillas Búlgaras 4x8','Hip Thrust 4x10','Prensa Unilateral 3x12','Pallof Press Core 3x15s'], isImported: true }
            : item
        ));
      }
      if (response.importTechnique) {
        const t = response.importTime || '17:00';
        setWeeklySchedule(prev => prev.map(item =>
          ['MAR','JUE'].includes(item.dayShort)
            ? { ...item, activityType: 'entrenamiento', title: 'Técnica & Control Orientado', scheduledTime: t, location: 'casa', focusArea: 'tecnica', exercises: ['100 Pases a pared alternos','Control orientado 2 toques','Malabarismos 5 min','Conos en 8 x4'], isImported: true }
            : item
        ));
      }
      if (response.importSprints) {
        const t = response.importTime || '09:00';
        setWeeklySchedule(prev => prev.map(item =>
          ['MAR','VIE'].includes(item.dayShort)
            ? { ...item, activityType: 'entrenamiento', title: 'Sprints & Aceleración', scheduledTime: t, location: 'pista', focusArea: 'sprints', exercises: ['Salida reactiva 10m x6','Sprints 20m freno x4','Circuito Z cambios x5'], isImported: true }
            : item
        ));
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `${header}\n\n${response.text}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        // V12: AI Confidence Engine — every response shows its data basis
        confidence: response.confidence
      };
      setChatHistory((prev) => [...prev, aiMsg]);
    }, delay);
  }, [playerProfile, matchLogs]);


  // Recalculate Week with AI
  const handleRecalculateWeek = () => {
    setWeeklySchedule((prev) =>
      prev.map((item) => {
        if (item.dayShort === 'JUE') {
          return {
            ...item,
            activityType: 'recuperacion',
            title: 'Recuperación Activa y Crioterapia (Ajustado por IA)',
            intensity: 'baja',
            durationMin: 30
          };
        }
        if (item.dayShort === 'VIE') {
          return {
            ...item,
            activityType: 'descanso',
            title: 'Descanso Absoluto / Estrategia',
            intensity: 'baja',
            durationMin: 0
          };
        }
        return item;
      })
    );

    const aiNotice: ChatMessage = {
      id: Date.now().toString(),
      sender: 'ai',
      text: "⚡ **Plan Semanal Re-calculado por la IA:** He reducido la carga del Jueves a Recuperación Activa (30 min) y asignado Descanso Absoluto el Viernes para garantizar que llegues al 100% de frescura muscular al partido del Sábado.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isRecalculatedPlan: true
    };

    setChatHistory((prev) => [...prev, aiNotice]);

    setToast({
      id: Date.now().toString(),
      title: "¡SEMANA RE-CALCULADA CON IA!",
      message: "Carga de trabajo redistribuida para optimizar frescura física.",
      type: "success"
    });
  };

  // 3. Save Match Registration
  const handleSaveMatch = (newMatch: Partial<MatchLog>) => {
    const createdLog: MatchLog = {
      id: `match-${Date.now()}`,
      date: newMatch.date || new Date().toISOString().split('T')[0],
      opponent: newMatch.opponent || 'Rival Directo',
      type: newMatch.type || 'PARTIDO',
      result: newMatch.result || 'Registrado',
      goals: newMatch.goals || 0,
      assists: newMatch.assists || 0,
      keyPasses: newMatch.keyPasses || 0,
      recoveries: newMatch.recoveries || 0,
      minutesPlayed: newMatch.minutesPlayed || 60,
      rpe: newMatch.rpe || 7,
      rating: newMatch.rating || 8.0,
      tacticalNotes: newMatch.tacticalNotes || '',
      verified: true
    };

    setMatchLogs((prev) => [createdLog, ...prev]);

    setPlayerProfile((prev) => {
      const attr = { ...prev.attributes };

      if (createdLog.assists > 0 || createdLog.keyPasses >= 3) {
        attr.passing = Math.min(99, attr.passing + 1);
        attr.vision = Math.min(99, attr.vision + 1);
      }
      if (createdLog.recoveries >= 5) {
        attr.recovery = Math.min(99, attr.recovery + 1);
      }
      if (createdLog.minutesPlayed >= 75) {
        attr.physical = Math.min(99, attr.physical + 1);
      }

      const sum = attr.rhythm + attr.passing + attr.vision + attr.physical + attr.recovery + attr.shooting;
      const newOvr = Math.round(sum / 6);

      return {
        ...prev,
        attributes: attr,
        OVR: newOvr,
        monthlyMinutes: prev.monthlyMinutes + createdLog.minutesPlayed
      };
    });

    addXp(250, 'Registro Post-Partido');
    setActiveTab('dashboard');
  };

  // Delete Match Log
  const handleDeleteMatch = (matchId: string) => {
    const deletedMatch = matchLogs.find(m => m.id === matchId);
    setMatchLogs((prev) => prev.filter(m => m.id !== matchId));

    if (deletedMatch) {
      setPlayerProfile((prev) => ({
        ...prev,
        monthlyMinutes: Math.max(0, prev.monthlyMinutes - deletedMatch.minutesPlayed)
      }));
    }

    setToast({
      id: Date.now().toString(),
      title: "REGISTRO ELIMINADO",
      message: "El partido ha sido eliminado correctamente del historial.",
      type: "success"
    });
  };

  // Select Mentor
  const handleSelectMentor = (mentorId: string) => {
    const mentor = FEMALE_MENTORS.find(m => m.id === mentorId);
    setPlayerProfile((prev) => ({ ...prev, mentorId }));

    if (mentor) {
      setToast({
        id: Date.now().toString(),
        title: "¡REFERENTE SELECCIONADA!",
        message: `${mentor.name} es ahora tu inspiradora en el campo.`,
        type: "success"
      });
    }
  };

  // Ask mentor question via AI Chat
  const handleAskMentorQuestion = (mentorName: string, mentorRole: string) => {
    setActiveTab('coach');
    handleSendMessage(`¿Cuál es el mejor consejo táctico de ${mentorName} para una ${playerProfile.position}?`);
  };

  // 4. Claim Challenge Reward
  const handleClaimChallenge = (challengeId: string) => {
    const target = challenges.find((c) => c.id === challengeId);
    if (!target || target.claimed) return;

    setChallenges((prev) =>
      prev.map((c) => (c.id === challengeId ? { ...c, claimed: true } : c))
    );

    if (target.badgeId) {
      setBadges((prev) =>
        prev.map((b) => (b.id === target.badgeId ? { ...b, unlocked: true } : b))
      );
    }

    addXp(target.rewardXp, `Desafío: ${target.title}`);
  };

  // Update Profile Settings
  const handleUpdateProfile = (updated: Partial<PlayerProfile>) => {
    setPlayerProfile((prev) => ({ ...prev, ...updated }));
    setToast({
      id: Date.now().toString(),
      title: "PERFIL ACTUALIZADO",
      message: "Tus datos de jugadora han sido guardados correctamente.",
      type: "success"
    });
  };

  // Confirm Full Reset to 0
  const handleConfirmReset = (newProfileData: Partial<PlayerProfile>) => {
    const freshProfile: PlayerProfile = {
      name: newProfileData.name || "Jugadora Pro",
      email: newProfileData.email || "jugadora@gmail.com",
      position: newProfileData.position || "Volante de Contención / MC",
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
        shooting: 60
      },
      streakDays: 0,
      monthlyMinutes: 0,
      avgRating: 6.0,
      preferredFoot: newProfileData.preferredFoot || "Derecha",
      jerseyNumber: newProfileData.jerseyNumber || "#10",
      country: newProfileData.country || "ESP",
      avatarUrl: newProfileData.avatarUrl || INITIAL_PLAYER_PROFILE.avatarUrl,
      playerCardPhotoUrl: newProfileData.playerCardPhotoUrl || INITIAL_PLAYER_PROFILE.playerCardPhotoUrl,
      themeColor: 'flash',
      mentorId: 'mentor-1'
    };

    setPlayerProfile(freshProfile);
    setMatchLogs([]);
    setChatHistory([
      {
        id: "msg-welcome-new",
        sender: "ai",
        text: `¡Bienvenida ${freshProfile.name}! Tu cuenta ha sido reiniciada con éxito desde cero. Tus estadísticas están listas para registrar tu primera sesión o partido.`,
        timestamp: "Ahora"
      }
    ]);
    setWeeklySchedule(INITIAL_WEEKLY_SCHEDULE.map(s => ({ ...s, status: 'pending' as const })));
    setChallenges(INITIAL_CHALLENGES.map(c => ({ ...c, progress: 0, completed: false, claimed: false })));
    setBadges(INITIAL_BADGES.map(b => ({ ...b, unlocked: false })));

    localStorage.clear();

    setToast({
      id: Date.now().toString(),
      title: "¡ESTADO REINICIADO A 0!",
      message: `Hola ${freshProfile.name}, tu nueva cuenta ha sido configurada desde cero.`,
      type: "success"
    });

    setActiveTab('dashboard');
  };

  // Show welcome screen if not logged in
  if (!isLoggedIn || !activeProfileId) {
    return <WelcomeScreen onSelectProfile={handleSelectProfile} />;
  }

  return (
    <div className="min-h-screen bg-[var(--bg-app)] text-[var(--text-main)] transition-colors duration-300 relative selection:bg-[var(--accent-color)] selection:text-black">
      {/* Offline Resilience Banner */}
      <OfflineBanner />

      {/* Dynamic Animated Background Mesh Theme */}
      <ThemeBackground theme={playerProfile.themeColor || 'flash'} />

      {/* Toast Notification Banner */}
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      {/* Top App Bar */}
      <TopHeader
        playerProfile={playerProfile}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Main Content Area Wrapped with Error Boundary & Lazy Loaded Views */}
      <ErrorBoundary>
        <main className="pt-20 px-4 sm:px-6 md:px-8 max-w-5xl mx-auto min-h-[calc(100vh-160px)]">
          <Suspense fallback={<SkeletonLoader type="full" />}>
            {activeTab === 'dashboard' && (
              <DashboardView
                playerProfile={playerProfile}
                weeklySchedule={weeklySchedule}
                onConfirmDayActivity={handleConfirmDayActivity}
                onSelectDay={handleSelectDay}
                onNavigateTab={setActiveTab}
                onStartInteractiveWorkout={handleStartInteractiveWorkout}
              />
            )}

            {activeTab === 'football' && (
              <FootballLabView
                playerProfile={playerProfile}
                onUpdateProfile={handleUpdateProfile}
                onStartInteractiveWorkout={handleStartInteractiveWorkout}
              />
            )}

            {activeTab === 'gym' && (
              <GymHubView
                playerProfile={playerProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'coach' && (
              <CoachView
                playerProfile={playerProfile}
                weeklySchedule={weeklySchedule}
                chatHistory={chatHistory}
                onSendMessage={handleSendMessage}
                onRecalculateWeek={handleRecalculateWeek}
                onUpdateWeeklySchedule={handleUpdateWeeklySchedule}
              />
            )}

            {activeTab === 'mentors' && (
              <FemaleMentorsView
                playerProfile={playerProfile}
                onSelectMentor={handleSelectMentor}
                onAskMentorQuestion={handleAskMentorQuestion}
              />
            )}

            {activeTab === 'tracker' && (
              <MatchTrackerView
                onSaveMatch={handleSaveMatch}
                onCancel={() => setActiveTab('dashboard')}
              />
            )}

            {activeTab === 'card' && (
              <PlayerCardView
                playerProfile={playerProfile}
                matchLogs={matchLogs}
                onDeleteMatch={handleDeleteMatch}
              />
            )}

            {activeTab === 'gamification' && (
              <GamificationView
                playerProfile={playerProfile}
                challenges={challenges}
                badges={badges}
                onClaimChallenge={handleClaimChallenge}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsView
                playerProfile={playerProfile}
                onUpdateProfile={handleUpdateProfile}
                onOpenResetModal={() => setIsResetModalOpen(true)}
                onLogout={handleLogout}
              />
            )}
          </Suspense>
        </main>
      </ErrorBoundary>

      {/* Reset Confirmation Modal */}
      <ResetConfirmModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onConfirmReset={handleConfirmReset}
      />

      {/* Interactive Live Workout Modal */}
      {activeWorkoutDay && (
        <InteractiveWorkoutModal
          isOpen={isWorkoutModalOpen}
          onClose={() => setIsWorkoutModalOpen(false)}
          dayActivity={activeWorkoutDay}
          onCompleteWorkout={handleCompleteInteractiveWorkout}
        />
      )}

      {/* Floating Glassmorphism Bottom Navigation */}
      <BottomNav 
        activeTab={activeTab} 
        setActiveTab={(tab) => { sounds.playClick(); setActiveTab(tab); }} 
        onOpenCoach={() => { sounds.playClick(); setActiveTab('coach'); }}
      />

      {/* Floating Background Music Player */}
      <BackgroundMusicPlayer />
    </div>
  );
}
