import React, { useState } from 'react';
import { PlayerProfile, ThemeColor, ThemeMode, AiTone } from '../types';
import { POSITIONS_LIST, COUNTRIES_LIST } from '../data/initialData';
import { getActiveProfileRecord, exportProfileBackup, importProfileBackup } from '../services/profileStorage';
import { sounds } from '../services/soundEffects';
import { 
  User, 
  Settings as SettingsIcon, 
  Save, 
  RotateCcw, 
  Check, 
  Palette, 
  Bot, 
  Sun, 
  Moon, 
  ShieldAlert, 
  Sparkles,
  Camera,
  Flame,
  Brain,
  Zap,
  Activity,
  LogOut,
  FileText,
  Smartphone,
  Printer
} from 'lucide-react';

interface SettingsViewProps {
  playerProfile: PlayerProfile;
  onUpdateProfile: (updated: Partial<PlayerProfile>) => void;
  onOpenResetModal: () => void;
  onOpenReportModal?: () => void;
  onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  playerProfile,
  onUpdateProfile,
  onOpenResetModal,
  onOpenReportModal,
  onLogout,
}) => {
  const [name, setName] = useState(playerProfile.name);
  const [position, setPosition] = useState(playerProfile.position);
  const [jerseyNumber, setJerseyNumber] = useState(playerProfile.jerseyNumber);
  const [country, setCountry] = useState(playerProfile.country);
  const [preferredFoot, setPreferredFoot] = useState(playerProfile.preferredFoot);
  const [email, setEmail] = useState(playerProfile.email || '');
  const [themeColor, setThemeColor] = useState<ThemeColor>(playerProfile.themeColor || 'flash');
  const [themeMode, setThemeMode] = useState<ThemeMode>(playerProfile.themeMode || 'dark');
  const [aiTone, setAiTone] = useState<AiTone>(playerProfile.aiTone || 'gemini');
  const [avatarUrl, setAvatarUrl] = useState(playerProfile.avatarUrl);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        if (result) setAvatarUrl(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateProfile({
      name,
      position,
      jerseyNumber,
      country,
      preferredFoot,
      email,
      themeColor,
      themeMode,
      aiTone,
      avatarUrl,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleThemeModeChange = (mode: ThemeMode) => {
    setThemeMode(mode);
    document.documentElement.setAttribute('data-mode', mode);
    onUpdateProfile({ themeMode: mode });
  };

  const handleThemeColorChange = (color: ThemeColor) => {
    setThemeColor(color);
    document.documentElement.setAttribute('data-theme', color);
    document.documentElement.style.removeProperty('--accent-color');
    document.documentElement.style.removeProperty('--accent-hover');
    document.documentElement.style.removeProperty('--accent-glow');
    onUpdateProfile({ themeColor: color });
  };

  const handleAiToneChange = (tone: AiTone) => {
    setAiTone(tone);
    onUpdateProfile({ aiTone: tone });
  };

  const themes: { id: ThemeColor; label: string; colorHex: string; emoji: string; bgName: string }[] = [
    { id: 'flash',    label: 'Flash ⚡',            colorHex: '#EAB308', emoji: '⚡', bgName: 'Tormenta Eléctrica (Amarillo Neón)' },
    { id: 'avengers', label: 'Capitán América 🛡️', colorHex: '#EF4444', emoji: '🛡️', bgName: 'Escudo Vibratorio (Rojo Neón)' },
    { id: 'widow',    label: 'Black Widow 🕷️',      colorHex: '#E11D48', emoji: '🕷️', bgName: 'Pulso Térmico (Carmesí)' },
    { id: 'hulk',     label: 'Hulk 💚',             colorHex: '#22C55E', emoji: '💚', bgName: 'Impacto Gamma (Verde Radiactivo)' },
    { id: 'hawkeye',  label: 'Hawkeye 🎯',          colorHex: '#A855F7', emoji: '🎯', bgName: 'Flechas de Luz (Morado Eléctrico)' },
  ];

  return (
    <div className="space-y-6 max-w-2xl mx-auto pb-32 animate-fade-in">
      {/* Title */}
      <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-3">
        <div>
          <h2 className="font-extrabold text-2xl text-[var(--text-main)] flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 theme-accent-text" />
            Configuración & Ajustes de Perfil
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            Personaliza la interfaz, avatar y el tono del Chatbot IA
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-extrabold theme-accent-bg px-3 py-1.5 rounded-xl animate-bounce flex items-center gap-1">
            <Check className="w-4 h-4" /> Guardado
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Profile Photo & Avatar Photo Import */}
        <section className="glass-card rounded-2xl p-6 flex flex-col items-center border border-[var(--border-subtle)]">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full border-4 border-[var(--accent-color)] p-1 overflow-hidden theme-accent-glow shadow-xl">
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <label className="absolute bottom-0 right-0 theme-accent-bg p-2 rounded-full shadow-lg active:scale-90 cursor-pointer transition-transform">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-4 w-full max-w-xs space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] block text-center">
              Nombre de la Jugadora
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-4 py-2.5 text-center font-extrabold text-lg text-[var(--text-main)] focus:border-[var(--accent-color)] outline-none"
            />
          </div>
        </section>

        {/* Sports Profile & Nationality */}
        <section className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-xs theme-accent-text flex items-center gap-2 uppercase tracking-wider">
            <User className="w-4 h-4" /> PERFIL DEPORTIVO Y NACIONALIDAD
          </h3>

          <div className="space-y-3">
            <div>
              <label className="text-[11px] text-[var(--text-muted)] font-bold block mb-1">POSICIÓN TÁCTICA</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-main)] focus:border-[var(--accent-color)] outline-none"
              >
                {POSITIONS_LIST.map((pos) => (
                  <option key={pos} value={pos} className="bg-[var(--bg-card-solid)] text-[var(--text-main)]">
                    {pos}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] font-bold block mb-1">NACIONALIDAD / PAÍS</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-main)] focus:border-[var(--accent-color)] outline-none"
                >
                  {COUNTRIES_LIST.map((c) => (
                    <option key={c.code} value={c.code} className="bg-[var(--bg-card-solid)] text-[var(--text-main)]">
                      {c.flag} {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-[var(--text-muted)] font-bold block mb-1">CORREO DE CONTACTO</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tuemail@ejemplo.com"
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2.5 text-xs text-[var(--text-main)] outline-none focus:border-[var(--accent-color)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="text-[11px] text-[var(--text-muted)] font-bold block mb-1">DORSAL / NÚMERO</label>
                <input
                  type="text"
                  value={jerseyNumber}
                  onChange={(e) => setJerseyNumber(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs font-mono font-bold text-[var(--text-main)] outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-[var(--text-muted)] font-bold block mb-1">PIE PREFERIDO</label>
                <select
                  value={preferredFoot}
                  onChange={(e) => setPreferredFoot(e.target.value)}
                  className="w-full bg-[var(--bg-input)] border border-[var(--border-subtle)] rounded-xl px-3 py-2 text-xs text-[var(--text-main)] outline-none"
                >
                  <option value="Derecha" className="bg-[var(--bg-card-solid)]">Derecha</option>
                  <option value="Izquierda" className="bg-[var(--bg-card-solid)]">Izquierda</option>
                  <option value="Ambidiestra" className="bg-[var(--bg-card-solid)]">Ambidiestra</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* AI Tone & Personality Section */}
        <section className="glass-card rounded-2xl p-5 space-y-4 border border-[var(--accent-color)]/30">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-xs theme-accent-text flex items-center gap-2 uppercase tracking-wider">
              <Brain className="w-4 h-4" /> PERSONALIDAD Y TONO DE LA IA COACH
            </h3>
            <span className="text-[10px] font-mono theme-accent-bg px-2 py-0.5 rounded font-bold">
              ESTILO GEMINI
            </span>
          </div>

          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            Selecciona cómo quieres que hable y responda tu Coach IA en el Chatbot y análisis de video:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tone 1: Gemini */}
            <button
              type="button"
              onClick={() => handleAiToneChange('gemini')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                aiTone === 'gemini'
                  ? 'border-[var(--accent-color)] bg-[var(--bg-input)] ring-2 ring-[var(--accent-color)]/30 shadow-lg'
                  : 'bg-[var(--bg-card-solid)] border-[var(--border-subtle)] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Gemini Inteligente & Amigable
                </span>
                {aiTone === 'gemini' && <Check className="w-4 h-4 theme-accent-text" />}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">
                Empático, claro, explicativo y adaptado a tus necesidades diarias.
              </p>
            </button>

            {/* Tone 2: Demanding */}
            <button
              type="button"
              onClick={() => handleAiToneChange('demanding')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                aiTone === 'demanding'
                  ? 'border-amber-400 bg-[var(--bg-input)] ring-2 ring-amber-400/30 shadow-lg'
                  : 'bg-[var(--bg-card-solid)] border-[var(--border-subtle)] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-amber-400" /> DT Exigente de Alto Rendimiento
                </span>
                {aiTone === 'demanding' && <Check className="w-4 h-4 text-amber-400" />}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">
                Directo, enfocado en disciplina, superación de límites y cero excusas.
              </p>
            </button>

            {/* Tone 3: Scientific */}
            <button
              type="button"
              onClick={() => handleAiToneChange('scientific')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                aiTone === 'scientific'
                  ? 'border-purple-400 bg-[var(--bg-input)] ring-2 ring-purple-400/30 shadow-lg'
                  : 'bg-[var(--bg-card-solid)] border-[var(--border-subtle)] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-purple-400" /> Científico del Deporte & Biometría
                </span>
                {aiTone === 'scientific' && <Check className="w-4 h-4 text-purple-400" />}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">
                Basado en datos de HRV, lactato, recuperación fisiológica y nutrición.
              </p>
            </button>

            {/* Tone 4: Tactical */}
            <button
              type="button"
              onClick={() => handleAiToneChange('tactical')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                aiTone === 'tactical'
                  ? 'border-emerald-400 bg-[var(--bg-input)] ring-2 ring-emerald-400/30 shadow-lg'
                  : 'bg-[var(--bg-card-solid)] border-[var(--border-subtle)] opacity-70 hover:opacity-100'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-xs text-[var(--text-main)] flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-400" /> Táctico Élite Premier League
                </span>
                {aiTone === 'tactical' && <Check className="w-4 h-4 text-emerald-400" />}
              </div>
              <p className="text-[10px] text-[var(--text-muted)] mt-1 leading-relaxed">
                Análisis profundo de sistemas de juego, pases filtrados y temporización.
              </p>
            </button>
          </div>
        </section>

        {/* Interface Mode */}
        <section className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-xs theme-accent-text flex items-center gap-2 uppercase tracking-wider">
            <Sun className="w-4 h-4" /> MODO DE LA INTERFAZ
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleThemeModeChange('dark')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                themeMode === 'dark'
                  ? 'border-[var(--accent-color)] bg-[var(--bg-input)] ring-2 ring-[var(--accent-color)]/30'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card-solid)] opacity-60'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-amber-400">
                <Moon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-[var(--text-main)]">Modo Oscuro</p>
                <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Recomendado Táctico</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleThemeModeChange('light')}
              className={`p-4 rounded-xl border flex items-center gap-3 transition-all ${
                themeMode === 'light'
                  ? 'border-[var(--accent-color)] bg-[var(--bg-input)] ring-2 ring-[var(--accent-color)]/30'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-card-solid)] opacity-60'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-bold text-xs text-[var(--text-main)]">Modo Claro</p>
                <p className="text-[9px] text-[var(--text-muted)] mt-0.5">Luminoso & Limpio</p>
              </div>
            </button>
          </div>
        </section>

        {/* Accent Color / Superhero Theme */}
        <section className="glass-card rounded-2xl p-5 space-y-4">
          <h3 className="font-bold text-xs theme-accent-text flex items-center gap-2 uppercase tracking-wider">
            <Palette className="w-4 h-4" /> TEMA DE SUPERHEROÍNA
          </h3>
          <p className="text-[10px] text-[var(--text-muted)]">Cada tema activa un color neón y una animación de fondo única</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themes.map((t) => {
              const isSelected = themeColor === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => handleThemeColorChange(t.id)}
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'ring-2 bg-[var(--bg-input)]'
                      : 'border-[var(--border-subtle)] bg-[var(--bg-card-solid)] opacity-70 hover:opacity-100'
                  }`}
                  style={isSelected ? {
                    borderColor: t.colorHex,
                    boxShadow: `0 0 12px ${t.colorHex}55, 0 0 24px ${t.colorHex}22`,
                  } : {}}
                >
                  <div
                    className="w-9 h-9 rounded-full shadow-md shrink-0 flex items-center justify-center text-lg"
                    style={{
                      backgroundColor: `${t.colorHex}22`,
                      border: `2px solid ${t.colorHex}`,
                      boxShadow: isSelected ? `0 0 10px ${t.colorHex}88` : 'none',
                    }}
                  >
                    {t.emoji}
                  </div>
                  <div className="text-left flex-1">
                    <span className="text-xs font-black text-[var(--text-main)] block" style={isSelected ? { color: t.colorHex } : {}}>
                      {t.label}
                    </span>
                    <span className="text-[9px] text-[var(--text-muted)]">
                      {t.bgName}
                    </span>
                  </div>
                  {isSelected && (
                    <Check className="w-4 h-4 shrink-0" style={{ color: t.colorHex }} />
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Save Button */}
        <button
          type="submit"
          className="w-full theme-accent-bg py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider theme-accent-glow active:scale-95 transition-all flex items-center justify-center gap-2"
        >
          <Save className="w-4 h-4" /> Guardar Ajustes de Perfil e IA
        </button>
      </form>

      {/* Executive Season Report PDF Section */}
      {onOpenReportModal && (
        <section className="glass-card rounded-2xl p-5 border border-[var(--accent-color)]/40 space-y-3 bg-[var(--bg-input)]">
          <div className="flex items-center gap-2 theme-accent-text">
            <FileText className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Reporte Ejecutivo de Temporada en PDF</h3>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Genera un informe técnico oficial descargable en PDF con tus estadísticas de rendimiento, atributos radar, biometría y diagnóstico del Coach IA.
          </p>
          <button
            type="button"
            onClick={onOpenReportModal}
            className="w-full py-3.5 rounded-xl theme-accent-bg text-[#0b1326] text-xs font-black uppercase tracking-wider theme-accent-glow active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" /> Generar & Descargar Reporte PDF
          </button>
        </section>
      )}

      {/* PWA App Installation Info */}
      <section className="glass-card rounded-2xl p-5 border border-[var(--border-card)] space-y-3">
        <div className="flex items-center gap-2 text-cyan-400">
          <Smartphone className="w-5 h-5" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Aplicación Móvil PWA</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          APEX Femme está lista para funcionar como App nativa en tu teléfono (Android o iOS) o PC sin necesidad de tiendas.
        </p>
        <div className="p-3 rounded-xl bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] text-[11px] text-[var(--text-main)] space-y-1 font-mono">
          <p>📲 <strong>En iPhone (Safari):</strong> Toca "Compartir" → "Añadir a la pantalla de inicio".</p>
          <p>🤖 <strong>En Android (Chrome):</strong> Toca los 3 puntos → "Instalar aplicación".</p>
        </div>
      </section>

      {/* Profile Backup & Import Section */}
      <section className="glass-card rounded-2xl p-5 border border-[var(--border-card)] space-y-3">
        <div className="flex items-center gap-2 theme-accent-text">
          <FileText className="w-5 h-5" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider">Copia de Seguridad & Importación JSON</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Exporta tu perfil completo con todas tus estadísticas, historial de partidos y medallas en un archivo JSON o importa una copia de seguridad existente.
        </p>

        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              const activeRecord = getActiveProfileRecord();
              if (activeRecord) {
                sounds.playSuccess();
                exportProfileBackup(activeRecord);
              }
            }}
            className="flex-1 py-3 px-4 bg-[var(--bg-input)] hover:border-[var(--accent-color)] text-[var(--text-main)] font-bold text-xs rounded-xl border border-[var(--border-subtle)] transition-all flex items-center justify-center gap-2"
          >
            📥 Exportar Copia de Seguridad JSON
          </button>

          <label className="flex-1 py-3 px-4 theme-accent-bg hover:opacity-95 text-[#0b1326] font-black text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-2 text-center">
            📤 Importar Perfil desde JSON
            <input
              type="file"
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (event) => {
                  const text = event.target?.result as string;
                  if (text) {
                    const imported = importProfileBackup(text);
                    if (imported) {
                      sounds.playLevelUp();
                      onUpdateProfile(imported.profile);
                      alert(`✅ ¡Perfil de ${imported.profile.name} importado con éxito!`);
                    } else {
                      sounds.playError();
                      alert('❌ El archivo JSON no tiene un formato válido de perfil APEX.');
                    }
                  }
                };
                reader.readAsText(file);
              }}
              className="hidden"
            />
          </label>
        </div>
      </section>

      {/* Danger Zone: Reset Data */}
      <section className="glass-card rounded-2xl p-5 border border-red-500/30 space-y-3">
        <div className="flex items-center gap-2 text-red-500">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="font-extrabold text-sm uppercase tracking-wider">ZONA DE REINICIO DE CUENTA</h3>
        </div>
        <p className="text-xs text-[var(--text-muted)]">
          Reinicia todos tus datos almacenados localmente a los valores iniciales.
        </p>

        <button
          onClick={onOpenResetModal}
          className="w-full py-3 rounded-xl bg-red-500/20 text-red-500 border border-red-500/40 text-xs font-bold hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Reiniciar Cuenta a 0
        </button>
      </section>

      {/* Logout */}
      {onLogout && (
        <section className="glass-card rounded-2xl p-5 border border-[rgba(51,65,85,0.5)] space-y-3">
          <div className="flex items-center gap-2" style={{ color: '#94a3b8' }}>
            <LogOut className="w-5 h-5" />
            <h3 className="font-extrabold text-sm uppercase tracking-wider">Cerrar Sesión</h3>
          </div>
          <p className="text-xs text-[var(--text-muted)]">
            Sal de tu perfil. Podrás volver a iniciar sesión o crear uno nuevo.
          </p>
          <button
            onClick={onLogout}
            className="w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 hover:opacity-80"
            style={{ background: 'rgba(148,163,184,0.1)', color: '#94a3b8', border: '1px solid rgba(148,163,184,0.3)' }}
          >
            <LogOut className="w-4 h-4" /> Cerrar Sesión / Cambiar Jugadora
          </button>
        </section>
      )}
    </div>
  );
};
