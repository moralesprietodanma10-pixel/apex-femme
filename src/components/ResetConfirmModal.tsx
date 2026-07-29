import React, { useState } from 'react';
import { PlayerProfile, ThemeColor } from '../types';
import { POSITIONS_LIST, COUNTRIES_LIST } from '../data/initialData';
import { ShieldAlert, LogIn, User, Sparkles, Check, Camera, RefreshCcw } from 'lucide-react';

interface ResetConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: (newProfileData: Partial<PlayerProfile>) => void;
}

export const ResetConfirmModal: React.FC<ResetConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirmReset,
}) => {
  const [isGoogleSignedIn, setIsGoogleSignedIn] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [position, setPosition] = useState(POSITIONS_LIST[0]);
  const [country, setCountry] = useState('ESP');
  const [preferredFoot, setPreferredFoot] = useState('Derecha');
  const [jerseyNumber, setJerseyNumber] = useState('#10');
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'
  );

  if (!isOpen) return null;

  const handleSimulateGoogleLogin = () => {
    setIsGoogleSignedIn(true);
    setName('Danna Morales');
    setEmail('moralesprietodanna7@gmail.com');
    setAvatarUrl(
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=400'
    );
  };

  const handleCustomPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setAvatarUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitReset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Por favor escribe tu nombre para configurar la nueva cuenta.');
      return;
    }

    onConfirmReset({
      name: name.trim(),
      email: email || 'usuario@gmail.com',
      position,
      country,
      preferredFoot,
      jerseyNumber,
      avatarUrl,
      playerCardPhotoUrl: avatarUrl,
      level: 1,
      OVR: 60,
      xp: 0,
      xpToNextLevel: 1000,
      streakDays: 0,
      monthlyMinutes: 0,
      avgRating: 6.0,
      attributes: {
        rhythm: 60,
        passing: 60,
        vision: 60,
        physical: 60,
        recovery: 60,
        shooting: 60,
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-[110] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border-2 border-red-500/50 shadow-[0_0_35px_rgba(239,68,68,0.3)] space-y-5 my-8">
        {/* Header Alert */}
        <div className="flex items-start justify-between border-b border-red-500/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-400 shrink-0">
              <ShieldAlert className="w-7 h-7 animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                ⚠️ ¿REINICIAR ESTADO BASE A 0?
              </h3>
              <p className="text-xs text-red-200 leading-snug">
                Atención: Toda tu información actual (Nivel, Partidos, Registros y XP) se eliminará de la memoria y comenzarás un nuevo perfil desde cero.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-lg font-bold p-1"
          >
            ✕
          </button>
        </div>

        {/* Gmail Sign In Option */}
        <div className="bg-[#131b2e] p-4 rounded-2xl border border-[#424936]/60 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-[#7bd0ff] flex items-center gap-2 uppercase tracking-wider">
              <LogIn className="w-4 h-4" /> VINCULAR CUENTA DE GMAIL
            </span>
            {isGoogleSignedIn && (
              <span className="text-[10px] bg-[#84cc16]/20 text-[#9ee939] px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                <Check className="w-3 h-3" /> Gmail Vinculado
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleSimulateGoogleLogin}
            className="w-full py-2.5 px-4 bg-white text-gray-900 font-bold text-xs rounded-xl hover:bg-gray-100 transition-colors flex items-center justify-center gap-3 shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleSignedIn ? 'Cambiar Cuenta de Gmail' : 'Iniciar Sesión con Google / Gmail'}</span>
          </button>
        </div>

        {/* New Player Onboarding Form */}
        <form onSubmit={handleSubmitReset} className="space-y-4">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider">
            NUEVA CONFIGURACIÓN DE JUGADORA
          </h4>

          {/* Photo Import / URL */}
          <div className="flex items-center gap-4 bg-[#171f33] p-3 rounded-2xl border border-[#424936]/40">
            <div className="relative w-16 h-16 rounded-full border-2 border-[#84cc16] overflow-hidden shrink-0">
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-1">
              <label className="text-[10px] font-bold text-[#c1cab0] uppercase block">
                Foto / Avatar de Jugadora
              </label>
              <div className="flex gap-2">
                <label className="bg-[#2d3449] hover:bg-[#3d4661] text-[#7bd0ff] px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer flex items-center gap-1.5 active:scale-95">
                  <Camera className="w-3.5 h-3.5" /> Subir Foto
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleCustomPhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#c1cab0] uppercase block mb-1">
                Nombre Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Sara Morales"
                className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
              />
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#c1cab0] uppercase block mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jugadora@gmail.com"
                className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#c1cab0] uppercase block mb-1">
                Posición
              </label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
              >
                {POSITIONS_LIST.map((pos) => (
                  <option key={pos} value={pos}>
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#c1cab0] uppercase block mb-1">
                Nacionalidad / País
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
              >
                {COUNTRIES_LIST.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.flag} {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-[#c1cab0] uppercase block mb-1">
                Pierna Hábil
              </label>
              <select
                value={preferredFoot}
                onChange={(e) => setPreferredFoot(e.target.value)}
                className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-xs text-white focus:border-[#84cc16] outline-none"
              >
                <option value="Derecha">Derecha</option>
                <option value="Izquierda">Izquierda</option>
                <option value="Ambidiestra">Ambidiestra</option>
              </select>
            </div>

            <div>
              <label className="text-[10px] font-bold text-[#c1cab0] uppercase block mb-1">
                Dorsal / Número
              </label>
              <input
                type="text"
                value={jerseyNumber}
                onChange={(e) => setJerseyNumber(e.target.value)}
                placeholder="#10"
                className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-xs text-white text-center font-mono font-bold focus:border-[#84cc16] outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-[#424936] text-[#c1cab0] hover:text-white font-bold text-xs"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-red-600/30 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <RefreshCcw className="w-4 h-4" />
              Confirmar y Empezar a 0
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
