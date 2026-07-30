import React, { useEffect } from 'react';
import { Sparkles, Trophy, CheckCircle, Zap } from 'lucide-react';

export interface ToastData {
  id: string;
  title: string;
  message: string;
  xpGained?: number;
  type?: 'success' | 'level' | 'xp';
}

interface ToastNotificationProps {
  toast: ToastData | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onClose();
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-20 left-1/2 -translate-x-1/2 z-[100] w-[92%] max-w-md animate-bounce-short"
    >
      <div className="glass-panel rounded-2xl p-4 border border-[#84cc16] shadow-[0_0_25px_rgba(132,204,22,0.4)] flex items-center justify-between gap-3 bg-[#131b2e]/95">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#84cc16]/20 border border-[#84cc16]/50 flex items-center justify-center shrink-0 text-[#9ee939]">
            {toast.type === 'level' ? (
              <Trophy className="w-6 h-6 animate-pulse" />
            ) : toast.type === 'xp' ? (
              <Zap className="w-6 h-6 text-[#7bd0ff]" />
            ) : (
              <CheckCircle className="w-6 h-6" />
            )}
          </div>
          <div>
            <h4 className="font-bold text-sm text-[#dae2fd] flex items-center gap-2">
              {toast.title}
              {toast.xpGained && (
                <span className="bg-[#84cc16] text-[#102000] text-[11px] font-bold px-2 py-0.5 rounded-full font-mono">
                  +{toast.xpGained} XP
                </span>
              )}
            </h4>
            <p className="text-xs text-[#c1cab0] leading-snug">{toast.message}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="text-[#c1cab0] hover:text-white p-1 text-xs"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
