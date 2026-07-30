import React, { useState, useEffect } from 'react';
import { WifiOff, ShieldCheck } from 'lucide-react';

/**
 * APEX FEMME - Offline Resilience Banner
 * Displays non-intrusive status when network connectivity is lost on the pitch/stadium.
 * All training logs and match registrations are saved locally without loss.
 */
export const OfflineBanner: React.FC = () => {
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-black px-4 py-2 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg animate-slide-up"
    >
      <WifiOff className="w-4 h-4 shrink-0" />
      <span>Modo Offline Activo — Tus entrenamientos y partidos se guardan localmente en el dispositivo.</span>
      <span className="hidden sm:inline-flex items-center gap-1 opacity-80 text-[10px] uppercase font-mono">
        <ShieldCheck className="w-3 h-3" /> Sin pérdida de datos
      </span>
    </div>
  );
};
