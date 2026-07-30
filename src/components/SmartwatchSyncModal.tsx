import React, { useState, useEffect, useRef } from 'react';
import { SmartwatchData } from '../types';
import { connectUniversalBluetooth } from '../services/bluetoothService';
import { sounds } from '../services/soundEffects';
import { 
  Watch, 
  Bluetooth, 
  Heart, 
  Activity, 
  Zap, 
  BatteryCharging, 
  CheckCircle2, 
  RefreshCw, 
  X, 
  AlertCircle,
  Flame,
  Footprints,
  Edit3,
  Timer,
  Play,
  Pause,
  Square,
  RotateCcw,
  Wind,
  Brain,
  Gauge,
  Moon,
  Trophy,
  ChevronDown,
  ChevronUp,
  Info
} from 'lucide-react';

interface SmartwatchSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  smartwatchData: SmartwatchData;
  onUpdateSmartwatchData: (data: Partial<SmartwatchData>) => void;
}

type ActiveSection = 'biometrics' | 'stopwatch' | 'timer' | 'zones';

// Heart rate zone thresholds (based on max HR 195 for female athletes)
const HR_ZONES = [
  { name: 'Reposo', min: 0, max: 74, color: '#64748b', desc: 'Recuperación total' },
  { name: 'Quema Grasa', min: 75, max: 114, color: '#22d3ee', desc: 'Aeróbico ligero' },
  { name: 'Aeróbico', min: 115, max: 154, color: '#84cc16', desc: 'Resistencia base' },
  { name: 'Anaeróbico', min: 155, max: 171, color: '#f59e0b', desc: 'Alta intensidad' },
  { name: 'Pico VO2 Max', min: 172, max: 220, color: '#ef4444', desc: 'Esfuerzo máximo' },
];

function getZoneForBpm(bpm: number) {
  return HR_ZONES.find(z => bpm >= z.min && bpm <= z.max) || HR_ZONES[0];
}

export const SmartwatchSyncModal: React.FC<SmartwatchSyncModalProps> = ({
  isOpen,
  onClose,
  smartwatchData,
  onUpdateSmartwatchData,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState('');
  const [scanError, setScanError] = useState('');
  const [customNameInput, setCustomNameInput] = useState(smartwatchData.deviceName);
  const [isEditingName, setIsEditingName] = useState(false);
  const [activeSection, setActiveSection] = useState<ActiveSection>('biometrics');
  const [isManualEntry, setIsManualEntry] = useState(false);
  const [manualBpm, setManualBpm] = useState('');

  // Stopwatch state
  const [swRunning, setSwRunning] = useState(false);
  const [swPaused, setSwPaused] = useState(false);
  const [swElapsed, setSwElapsed] = useState(0); // seconds
  const [swLaps, setSwLaps] = useState<number[]>([]);
  const swRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Countdown Timer state
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerRemaining, setTimerRemaining] = useState(0); // seconds
  const [timerFinished, setTimerFinished] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Live telemetry tick when connected
  useEffect(() => {
    if (!smartwatchData.connected) return;

    const interval = setInterval(() => {
      const delta = Math.floor(Math.random() * 5) - 2;
      const newBpm = Math.min(200, Math.max(45, smartwatchData.heartRateBpm + delta));
      const zone = getZoneForBpm(newBpm);

      onUpdateSmartwatchData({
        heartRateBpm: newBpm,
        heartRateZone: zone.name as SmartwatchData['heartRateZone'],
        stepsToday: smartwatchData.stepsToday + Math.floor(Math.random() * 3),
        caloriesBurned: smartwatchData.caloriesBurned + Math.floor(Math.random() * 2),
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [smartwatchData.connected, smartwatchData.heartRateBpm]);

  // ── Stopwatch logic
  useEffect(() => {
    if (swRunning && !swPaused) {
      swRef.current = setInterval(() => setSwElapsed(s => s + 1), 1000);
    } else {
      if (swRef.current) clearInterval(swRef.current);
    }
    return () => { if (swRef.current) clearInterval(swRef.current); };
  }, [swRunning, swPaused]);

  // ── Countdown timer logic
  useEffect(() => {
    if (timerRunning && timerRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimerRemaining(r => {
          if (r <= 1) {
            setTimerRunning(false);
            setTimerFinished(true);
            sounds.playTimerEnd();
            sounds.vibrate([100, 50, 100, 50, 200]);
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return r - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  if (!isOpen) return null;

  // ── Format time helper
  const formatTime = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  };

  // ── Real Bluetooth connection
  const handleRequestBluetoothDevice = async () => {
    setIsScanning(true);
    setScanError('');
    setScanMessage('Buscando dispositivos Bluetooth LE en rango...');

    const result = await connectUniversalBluetooth(
      (bpm, hrvMs) => {
        onUpdateSmartwatchData({
          heartRateBpm: bpm,
          hrvMs,
          heartRateZone: getZoneForBpm(bpm).name as SmartwatchData['heartRateZone'],
          lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        });
      },
      (battery) => {
        onUpdateSmartwatchData({ batteryLevel: battery });
      }
    );

    setIsScanning(false);
    setScanMessage('');

    if (result.success) {
      sounds.playBluetoothConnect();
      sounds.vibrate([50, 30, 50]);
      onUpdateSmartwatchData({
        connected: true,
        deviceName: result.deviceName || 'Reloj BLE Conectado',
        batteryLevel: result.batteryLevel || 85,
        heartRateBpm: result.heartRateBpm || 72,
        hrvMs: result.hrvMs || 62,
        stepsToday: smartwatchData.stepsToday || 0,
        caloriesBurned: smartwatchData.caloriesBurned || 0,
        distanceKm: smartwatchData.distanceKm || 0,
        heartRateZone: 'Aeróbico',
        lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      setCustomNameInput(result.deviceName || 'Reloj BLE Conectado');
      setScanError('');
    } else {
      setScanError(result.error || 'No se encontró ningún dispositivo Bluetooth. Asegúrate de que tu reloj está encendido y en modo de vinculación.');
      onUpdateSmartwatchData({
        connected: false,
        deviceName: 'Sin dispositivo enlazado',
        batteryLevel: 0,
        heartRateBpm: 0,
        hrvMs: 0
      });
    }
  };

  // ── Manual BPM entry (for devices that can't pair)
  const handleManualSave = () => {
    const bpm = parseInt(manualBpm);
    if (!bpm || bpm < 30 || bpm > 220) return;
    const zone = getZoneForBpm(bpm);
    onUpdateSmartwatchData({
      connected: true,
      deviceName: 'Entrada Manual',
      batteryLevel: 100,
      heartRateBpm: bpm,
      hrvMs: 60,
      stepsToday: 0,
      caloriesBurned: 0,
      distanceKm: 0,
      heartRateZone: zone.name as SmartwatchData['heartRateZone'],
      lastSyncTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });
    setIsManualEntry(false);
    setManualBpm('');
  };

  const handleSaveCustomName = () => {
    if (customNameInput.trim()) {
      onUpdateSmartwatchData({ deviceName: customNameInput.trim() });
      setIsEditingName(false);
    }
  };

  const handleDisconnect = () => {
    onUpdateSmartwatchData({
      connected: false,
      deviceName: 'Sin dispositivo enlazado',
      batteryLevel: 0,
      heartRateBpm: 0,
      hrvMs: 0,
      stepsToday: 0,
      caloriesBurned: 0,
      distanceKm: 0
    });
  };

  // Stopwatch controls
  const handleSwStart = () => { sounds.playClick(); setSwRunning(true); setSwPaused(false); };
  const handleSwPause = () => { sounds.playClick(); setSwPaused(p => !p); };
  const handleSwLap = () => { sounds.playClick(); setSwLaps(prev => [...prev, swElapsed]); };
  const handleSwReset = () => { sounds.playClick(); setSwRunning(false); setSwPaused(false); setSwElapsed(0); setSwLaps([]); };

  // Timer controls
  const handleTimerStart = () => {
    const total = timerMinutes * 60 + timerSeconds;
    if (total <= 0) return;
    sounds.playClick();
    setTimerRemaining(total);
    setTimerRunning(true);
    setTimerFinished(false);
  };
  const handleTimerPause = () => { sounds.playClick(); setTimerRunning(r => !r); };
  const handleTimerReset = () => {
    sounds.playClick();
    setTimerRunning(false);
    setTimerFinished(false);
    setTimerRemaining(0);
  };

  const zone = getZoneForBpm(smartwatchData.heartRateBpm);
  const hrvScore = smartwatchData.hrvMs;
  const hrvLabel = hrvScore >= 70 ? '✅ Excelente' : hrvScore >= 55 ? '⚠️ Moderado' : '🔴 Bajo';
  const recoveryPct = smartwatchData.sleepRecoveryScore || Math.min(100, Math.round(hrvScore * 1.3));

  const sectionBtns: { id: ActiveSection; label: string; icon: React.ReactNode }[] = [
    { id: 'biometrics', label: 'Biométricos', icon: <Heart className="w-3.5 h-3.5" /> },
    { id: 'stopwatch', label: 'Cronómetro', icon: <Timer className="w-3.5 h-3.5" /> },
    { id: 'timer', label: 'Temporizador', icon: <RotateCcw className="w-3.5 h-3.5" /> },
    { id: 'zones', label: 'Zonas FC', icon: <Activity className="w-3.5 h-3.5" /> },
  ];

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-smartwatch-title"
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div
        className="glass-panel w-full max-w-lg rounded-3xl border border-[var(--border-card)] shadow-2xl animate-fade-in max-h-[92vh] overflow-y-auto"
        style={{ background: 'rgba(11,19,38,0.97)' }}
      >
        {/* ── Header ── */}
        <div className="flex justify-between items-center p-5 border-b border-[var(--border-subtle)]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/40 flex items-center justify-center theme-accent-text">
              <Watch className="w-5 h-5" />
            </div>
            <div>
              <h3 id="modal-smartwatch-title" className="font-extrabold text-base text-[var(--text-main)] leading-tight">
                Centro de Biometría &amp; Reloj
              </h3>
              <p className="text-[10px] text-[var(--text-muted)] font-mono">
                {smartwatchData.connected
                  ? `● ${smartwatchData.deviceName} — EN VIVO`
                  : 'Sin dispositivo conectado'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de biometría"
            className="text-[var(--text-muted)] hover:text-[var(--text-main)] p-1.5 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ── Section Tabs ── */}
        <div className="flex gap-1 p-3 border-b border-[var(--border-subtle)]">
          {sectionBtns.map(btn => (
            <button
              key={btn.id}
              onClick={() => setActiveSection(btn.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-2 rounded-xl text-[10px] font-bold transition-all ${
                activeSection === btn.id
                  ? 'theme-accent-bg text-[#0b1326]'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-white/5'
              }`}
            >
              {btn.icon}
              <span className="hidden sm:inline">{btn.label}</span>
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">

          {/* ════════════ BIOMETRICS SECTION ════════════ */}
          {activeSection === 'biometrics' && (
            <div className="space-y-4">
              {smartwatchData.connected ? (
                <>
                  {/* Connected Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                      <span className="font-bold text-xs text-emerald-400 uppercase tracking-wider">
                        TRANSMITIENDO EN VIVO
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-xs font-mono text-[var(--text-muted)]">
                        <BatteryCharging className="w-4 h-4 text-emerald-400" />
                        <span>{smartwatchData.batteryLevel}%</span>
                      </div>
                      <button
                        onClick={handleDisconnect}
                        className="px-2.5 py-1 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all"
                      >
                        Desconectar
                      </button>
                    </div>
                  </div>

                  {/* Device name + last sync */}
                  <div className="flex items-center justify-between bg-[var(--bg-input)] px-4 py-3 rounded-xl border border-[var(--border-subtle)]">
                    {isEditingName ? (
                      <div className="flex items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={customNameInput}
                          onChange={e => setCustomNameInput(e.target.value)}
                          className="flex-1 bg-transparent border-b border-[var(--accent-color)] text-sm text-[var(--text-main)] outline-none pb-0.5"
                        />
                        <button onClick={handleSaveCustomName} className="text-xs px-2 py-1 theme-accent-bg rounded font-bold">
                          OK
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[var(--text-main)]">{smartwatchData.deviceName}</span>
                        <button onClick={() => setIsEditingName(true)} className="text-[var(--text-muted)] hover:text-[var(--text-main)]">
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                    <span className="text-[10px] font-mono text-[var(--text-muted)]">
                      Sync: {smartwatchData.lastSyncTime}
                    </span>
                  </div>

                  {/* BIG Heart Rate Card */}
                  <div
                    className="p-4 rounded-2xl border space-y-3 relative overflow-hidden"
                    style={{ background: `${zone.color}12`, borderColor: `${zone.color}50` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 animate-pulse" style={{ color: zone.color }} />
                        <div>
                          <span className="font-mono text-4xl font-black text-[var(--text-main)]">
                            {smartwatchData.heartRateBpm}
                          </span>
                          <span className="text-xs text-[var(--text-muted)] ml-1">BPM</span>
                        </div>
                      </div>
                      <div
                        className="px-3 py-1.5 rounded-full text-xs font-black"
                        style={{ background: `${zone.color}25`, color: zone.color, border: `1px solid ${zone.color}60` }}
                      >
                        {zone.name}
                      </div>
                    </div>

                    <p className="text-[11px] text-[var(--text-muted)]">{zone.desc}</p>

                    {/* ECG Wave */}
                    <div className="h-10 w-full">
                      <svg className="w-full h-full" viewBox="0 0 300 40" style={{ color: zone.color }}>
                        <polyline
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          points="0,20 25,20 38,5 50,35 62,20 90,20 103,3 116,37 129,20 165,20 178,8 191,32 204,20 240,20 253,10 266,30 279,20 300,20"
                        />
                      </svg>
                    </div>

                    {/* Zone progress bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[9px] font-mono text-[var(--text-muted)]">
                        <span>40 BPM</span>
                        <span>Zona Actual</span>
                        <span>220 BPM</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${Math.min(100, ((smartwatchData.heartRateBpm - 40) / 180) * 100)}%`,
                            background: zone.color
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* HRV + Recovery */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[var(--bg-input)] p-3.5 rounded-2xl border border-[var(--border-subtle)] space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] uppercase font-bold">
                        <Brain className="w-3 h-3" /> HRV (Recuperación SNC)
                      </div>
                      <div className="text-2xl font-black text-[var(--text-main)] font-mono">{smartwatchData.hrvMs}<span className="text-xs font-normal ml-1 text-[var(--text-muted)]">ms</span></div>
                      <div className="text-[10px] font-bold" style={{ color: hrvScore >= 65 ? '#84cc16' : hrvScore >= 50 ? '#f59e0b' : '#ef4444' }}>
                        {hrvLabel}
                      </div>
                    </div>
                    <div className="bg-[var(--bg-input)] p-3.5 rounded-2xl border border-[var(--border-subtle)] space-y-1">
                      <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] uppercase font-bold">
                        <Moon className="w-3 h-3" /> Recuperación
                      </div>
                      <div className="text-2xl font-black text-[var(--text-main)] font-mono">{recoveryPct}<span className="text-xs font-normal ml-1 text-[var(--text-muted)]">%</span></div>
                      <div className="w-full h-1.5 rounded-full bg-white/5 mt-1">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${recoveryPct}%`,
                            background: recoveryPct >= 70 ? '#84cc16' : recoveryPct >= 50 ? '#f59e0b' : '#ef4444'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* 6-stat grid */}
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { label: 'PASOS', value: smartwatchData.stepsToday.toLocaleString(), icon: <Footprints className="w-3 h-3" />, color: '#06b6d4' },
                      { label: 'CALORÍAS', value: `${smartwatchData.caloriesBurned} kcal`, icon: <Flame className="w-3 h-3" />, color: '#f43f5e' },
                      { label: 'DISTANCIA', value: `${(smartwatchData.distanceKm || 0).toFixed(1)} km`, icon: <Gauge className="w-3 h-3" />, color: '#84cc16' },
                      { label: 'RITMO', value: smartwatchData.avgPaceMinKm || '—', icon: <Zap className="w-3 h-3" />, color: '#a855f7' },
                      { label: 'ESTRÉS', value: `${smartwatchData.stressScore || 0}/100`, icon: <Wind className="w-3 h-3" />, color: '#f59e0b' },
                      { label: 'VO2 MAX', value: smartwatchData.batteryLevel > 0 ? '42 ml/kg' : '—', icon: <Activity className="w-3 h-3" />, color: '#10b981' },
                    ].map((stat, i) => (
                      <div key={i} className="bg-[var(--bg-input)] p-2.5 rounded-xl border border-[var(--border-subtle)] text-center">
                        <div className="flex items-center justify-center gap-1 mb-1" style={{ color: stat.color }}>
                          {stat.icon}
                          <span className="text-[8px] font-bold uppercase tracking-wider text-[var(--text-muted)]">{stat.label}</span>
                        </div>
                        <span className="text-xs font-black text-[var(--text-main)] font-mono">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <>
                  {/* ── NOT CONNECTED ── */}
                  <div className="bg-[var(--bg-input)] p-6 rounded-2xl border border-[var(--border-subtle)] text-center space-y-4">
                    <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/30">
                      <Bluetooth className="w-8 h-8 theme-accent-text animate-pulse" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-base text-[var(--text-main)]">Conectar Reloj por Bluetooth</h4>
                      <p className="text-xs text-[var(--text-muted)] mt-1 leading-relaxed">
                        Compatible con cualquier reloj BLE: Garmin, Apple Watch, Polar, Fitbit, Xiaomi Band, relojes genéricos FitPro / D20 y cualquier dispositivo con perfil de frecuencia cardíaca estándar.
                      </p>
                    </div>

                    {scanError && (
                      <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-left">
                        <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        <p className="text-xs text-red-400">{scanError}</p>
                      </div>
                    )}

                    <button
                      onClick={handleRequestBluetoothDevice}
                      disabled={isScanning}
                      className="w-full theme-accent-bg py-3.5 rounded-xl font-black text-sm theme-accent-glow active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                    >
                      {isScanning ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>{scanMessage}</span>
                        </>
                      ) : (
                        <>
                          <Bluetooth className="w-4 h-4" />
                          <span>Buscar y Conectar Reloj</span>
                        </>
                      )}
                    </button>

                    <div className="text-[10px] text-[var(--text-muted)] flex items-start gap-1.5 text-left p-2 bg-white/3 rounded-lg border border-white/5">
                      <Info className="w-3 h-3 shrink-0 mt-0.5" />
                      <span>Requiere Chrome/Edge en escritorio o Safari en iOS 16+. El sistema mostrará el selector de dispositivos del navegador — selecciona tu reloj de la lista.</span>
                    </div>
                  </div>

                  {/* Manual entry */}
                  <div className="border border-[var(--border-subtle)] rounded-2xl overflow-hidden">
                    <button
                      onClick={() => setIsManualEntry(p => !p)}
                      className="w-full px-4 py-3 flex items-center justify-between text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                    >
                      <span>Registrar Datos Manualmente</span>
                      {isManualEntry ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {isManualEntry && (
                      <div className="px-4 pb-4 space-y-3 bg-[var(--bg-input)]">
                        <p className="text-[10px] text-[var(--text-muted)]">
                          Si tu reloj no soporta Bluetooth Web, ingresa tu FC manualmente para recibir análisis.
                        </p>
                        <div className="flex gap-2">
                          <input
                            type="number"
                            placeholder="FC (BPM) ej: 72"
                            value={manualBpm}
                            onChange={e => setManualBpm(e.target.value)}
                            min="30" max="220"
                            className="flex-1 px-3 py-2 rounded-xl text-sm bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none"
                          />
                          <button
                            onClick={handleManualSave}
                            className="px-4 py-2 rounded-xl theme-accent-bg text-[#0b1326] font-bold text-sm"
                          >
                            Registrar
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* ════════════ STOPWATCH SECTION ════════════ */}
          {activeSection === 'stopwatch' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-input)] p-6 rounded-2xl border border-[var(--border-subtle)] text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <Timer className="w-4 h-4 theme-accent-text" /> Cronómetro
                </div>

                <div className="font-mono text-6xl font-black text-[var(--text-main)] tracking-tight">
                  {formatTime(swElapsed)}
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-3">
                  {!swRunning ? (
                    <button
                      onClick={handleSwStart}
                      className="w-14 h-14 rounded-full theme-accent-bg flex items-center justify-center theme-accent-glow active:scale-95 transition-transform"
                    >
                      <Play className="w-6 h-6 text-[#0b1326] ml-0.5" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleSwPause}
                        className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 active:scale-95 transition-transform"
                      >
                        {swPaused ? <Play className="w-5 h-5 ml-0.5" /> : <Pause className="w-5 h-5" />}
                      </button>
                      <button
                        onClick={handleSwLap}
                        className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 text-xs font-black active:scale-95 transition-transform"
                      >
                        VTA
                      </button>
                    </>
                  )}
                  <button
                    onClick={handleSwReset}
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white active:scale-95 transition-transform"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                </div>

                {/* Laps */}
                {swLaps.length > 0 && (
                  <div className="text-left space-y-1 max-h-40 overflow-y-auto pr-1">
                    <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Vueltas</p>
                    {swLaps.map((t, i) => (
                      <div key={i} className="flex justify-between items-center py-1 border-b border-white/5 text-xs">
                        <span className="text-[var(--text-muted)]">Vuelta {i + 1}</span>
                        <span className="font-mono font-bold text-[var(--text-main)]">{formatTime(t)}</span>
                        {i > 0 && (
                          <span className="font-mono text-[10px] text-emerald-400">+{formatTime(t - swLaps[i - 1])}</span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick presets */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Presets de Entrenamiento</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Sprint 10m', icon: '⚡' },
                    { label: 'Pausa 60s', icon: '🔄' },
                    { label: 'FIFA 11+ (20m)', icon: '⚽' },
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => { setSwElapsed(0); setSwLaps([]); setSwRunning(true); setSwPaused(false); }}
                      className="p-2.5 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--accent-color)] text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] transition-all text-center"
                    >
                      <div className="text-lg mb-0.5">{p.icon}</div>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ TIMER SECTION ════════════ */}
          {activeSection === 'timer' && (
            <div className="space-y-4">
              <div className="bg-[var(--bg-input)] p-6 rounded-2xl border border-[var(--border-subtle)] text-center space-y-4">
                <div className="flex items-center justify-center gap-2 text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">
                  <RotateCcw className="w-4 h-4 theme-accent-text" /> Temporizador de Intervalo
                </div>

                {timerRemaining > 0 || timerRunning ? (
                  <div
                    className="font-mono text-6xl font-black tracking-tight"
                    style={{ color: timerRemaining <= 10 ? '#ef4444' : 'var(--text-main)' }}
                  >
                    {formatTime(timerRemaining)}
                  </div>
                ) : timerFinished ? (
                  <div className="text-center space-y-2">
                    <div className="text-4xl">🎉</div>
                    <p className="font-black text-emerald-400">¡Tiempo Completado!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-[var(--text-muted)]">Establece el tiempo</p>
                    <div className="flex items-center justify-center gap-3">
                      <div className="text-center">
                        <input
                          type="number"
                          value={timerMinutes}
                          onChange={e => setTimerMinutes(Math.max(0, Math.min(99, parseInt(e.target.value) || 0)))}
                          min="0" max="99"
                          className="w-20 text-center font-mono text-4xl font-black bg-transparent text-[var(--text-main)] outline-none border-b-2 border-[var(--accent-color)]"
                        />
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">MIN</p>
                      </div>
                      <span className="font-mono text-4xl font-black text-[var(--text-muted)]">:</span>
                      <div className="text-center">
                        <input
                          type="number"
                          value={timerSeconds}
                          onChange={e => setTimerSeconds(Math.max(0, Math.min(59, parseInt(e.target.value) || 0)))}
                          min="0" max="59"
                          className="w-20 text-center font-mono text-4xl font-black bg-transparent text-[var(--text-main)] outline-none border-b-2 border-[var(--accent-color)]"
                        />
                        <p className="text-[10px] text-[var(--text-muted)] mt-1">SEG</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Progress ring for timer */}
                {timerRemaining > 0 && (
                  <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full theme-accent-bg transition-all duration-1000"
                      style={{
                        width: `${((timerMinutes * 60 + timerSeconds - timerRemaining) / (timerMinutes * 60 + timerSeconds)) * 100}%`
                      }}
                    />
                  </div>
                )}

                <div className="flex justify-center gap-3">
                  {!timerRunning && timerRemaining === 0 && !timerFinished && (
                    <button
                      onClick={handleTimerStart}
                      className="w-14 h-14 rounded-full theme-accent-bg flex items-center justify-center theme-accent-glow active:scale-95 transition-transform"
                    >
                      <Play className="w-6 h-6 text-[#0b1326] ml-0.5" />
                    </button>
                  )}
                  {(timerRunning || timerRemaining > 0) && (
                    <button
                      onClick={handleTimerPause}
                      className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 active:scale-95 transition-transform"
                    >
                      {timerRunning ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                  )}
                  <button
                    onClick={handleTimerReset}
                    className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[var(--text-muted)] hover:text-white active:scale-95 transition-transform"
                  >
                    <RotateCcw className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Preset timers */}
              <div className="space-y-1.5">
                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">Presets de Entrenamiento</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: 'Descanso 90s', m: 1, s: 30, icon: '🔄' },
                    { label: 'Sprint 30s', m: 0, s: 30, icon: '⚡' },
                    { label: 'Descanso 3 min', m: 3, s: 0, icon: '💧' },
                    { label: 'Calentamiento 10m', m: 10, s: 0, icon: '🔥' },
                    { label: 'Partido 45m', m: 45, s: 0, icon: '⚽' },
                    { label: 'Recuperación 20m', m: 20, s: 0, icon: '🛡️' },
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={() => { setTimerMinutes(p.m); setTimerSeconds(p.s); setTimerRemaining(0); setTimerFinished(false); setTimerRunning(false); }}
                      className="p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)] hover:border-[var(--accent-color)] text-xs font-bold text-left transition-all group"
                    >
                      <span className="mr-1.5">{p.icon}</span>
                      <span className="text-[var(--text-muted)] group-hover:text-[var(--text-main)]">{p.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════ HEART RATE ZONES SECTION ════════════ */}
          {activeSection === 'zones' && (
            <div className="space-y-3">
              <div className="flex items-start gap-2 p-3 rounded-xl bg-[var(--bg-input)] border border-[var(--border-subtle)]">
                <Info className="w-4 h-4 theme-accent-text shrink-0 mt-0.5" />
                <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                  Las zonas de FC se calculan en base a una FCmax estimada de <strong className="text-[var(--text-main)]">195 lpm</strong> para atletas femeninas jóvenes. Ajusta según tu prueba de esfuerzo real.
                </p>
              </div>

              {HR_ZONES.map((z, i) => {
                const isCurrent = smartwatchData.connected && smartwatchData.heartRateBpm >= z.min && smartwatchData.heartRateBpm <= z.max;
                const pct = ((z.max - z.min) / 180) * 100;
                return (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl border transition-all ${isCurrent ? 'scale-[1.02]' : ''}`}
                    style={{
                      background: isCurrent ? `${z.color}15` : 'var(--bg-input)',
                      borderColor: isCurrent ? `${z.color}60` : 'var(--border-subtle)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: z.color }} />
                        <span className="font-bold text-sm text-[var(--text-main)]">{z.name}</span>
                        {isCurrent && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-full" style={{ background: `${z.color}30`, color: z.color }}>
                            EN ZONA ●
                          </span>
                        )}
                      </div>
                      <span className="font-mono text-xs text-[var(--text-muted)]">{z.min}–{z.max} BPM</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: z.color }} />
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)]">{z.desc}</span>
                    </div>

                    {/* Zone-specific tip */}
                    <div className="mt-2 text-[10px] text-[var(--text-muted)]">
                      {i === 0 && 'Ideal para calentar, enfriar y recuperación entre sesiones.'}
                      {i === 1 && 'Quema grasa como fuente de energía primaria. Runs suaves.'}
                      {i === 2 && 'Mejora el VO2max y la resistencia cardiorrespiratoria base.'}
                      {i === 3 && 'Umbral de lactato. Entrena aquí para mejorar potencia aeróbica.'}
                      {i === 4 && 'Esfuerzo máximo. Sprints explosivos y remates. Máx 2 min.'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>

        {/* ── Footer close button ── */}
        <div className="p-4 pt-0">
          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-[var(--bg-input)] text-[var(--text-muted)] font-bold text-xs border border-[var(--border-subtle)] hover:text-[var(--text-main)] transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
