import React, { useState, useRef, useEffect } from 'react';
import { PlayerProfile, ScheduleDay, ChatMessage, VideoAnalysis, TrainingLocation, TrainingFocus, SmartwatchData } from '../types';
import { 
  Bot, 
  Send, 
  Sparkles, 
  RefreshCw, 
  Dumbbell, 
  Activity, 
  Trophy, 
  Zap, 
  Calendar, 
  Heart, 
  CheckCircle2,
  Video,
  Upload,
  Brain,
  AlertCircle,
  Lightbulb,
  Film,
  Download,
  FileCode,
  Clock,
  MapPin,
  Home,
  Plus,
  Check,
  Share2,
  Trash2,
  ListPlus,
  Compass,
  ArrowRight,
  Volume2
} from 'lucide-react';

interface CoachViewProps {
  playerProfile: PlayerProfile;
  weeklySchedule: ScheduleDay[];
  chatHistory: ChatMessage[];
  onSendMessage: (userText: string) => void;
  onRecalculateWeek: () => void;
  onUpdateWeeklySchedule?: (newSchedule: ScheduleDay[]) => void;
  smartwatchData?: SmartwatchData;
}

// Preset Plans Library
const PRESET_PLANS = [
  {
    id: 'preset-gym-fuerza',
    name: '🏋️‍♂️ Gimnasio & Fuerza Explosiva Pro',
    description: 'Enfocado en fuerza útil unilateral, potencia de piernas y estabilización de core.',
    location: 'gym' as TrainingLocation,
    focusArea: 'fuerza' as TrainingFocus,
    categoryTag: 'Gimnasio & Fuerza',
    icon: Dumbbell,
    defaultTime: '18:00',
    defaultDays: ['LUN', 'MIE', 'VIE'],
    exercises: [
      'Sentadillas Búlgaras con Mancuernas 4x8 reps',
      'Hip Thrust en Barra 4x10 reps',
      'Prensa Unilateral 3x12 reps',
      'Core Anti-rotación Pallof Press 3x15 seg',
      'Isquios en máquina tumbada 3x10 reps'
    ]
  },
  {
    id: 'preset-casa-tecnica',
    name: '🏠 Técnica & Control Orientado en Casa',
    description: 'Rutina en espacio reducido. Trabaja el primer toque, perfilamiento y malabarismos.',
    location: 'casa' as TrainingLocation,
    focusArea: 'tecnica' as TrainingFocus,
    categoryTag: 'Técnica en Casa',
    icon: Activity,
    defaultTime: '17:00',
    defaultDays: ['MAR', 'JUE'],
    exercises: [
      '100 Tocados de pared a un toque (50 pie derecho / 50 pie izquierdo)',
      'Control orientado cambiando de perfil con conos 10 min',
      'Malabarismos de precisión alternando empeine y muslo 5 min',
      'Conos en 8s a máxima velocidad en salón 4x45 seg'
    ]
  },
  {
    id: 'preset-sprints-velocidad',
    name: '⚡ Sprints, Aceleración & Reacción',
    description: 'Potencia tu zancada inicial, aceleración en 10 metros y freno reactivo.',
    location: 'pista' as TrainingLocation,
    focusArea: 'sprints' as TrainingFocus,
    categoryTag: 'Sprints & Velocidad',
    icon: Zap,
    defaultTime: '09:00',
    defaultDays: ['MAR', 'VIE'],
    exercises: [
      'Salida en reacción 10m tras estímulo sonoro/visual 6x',
      'Sprints 20m con desaceleración controlada 4x',
      'Circuito en Z con cambios de dirección a 45° 5x',
      'Aceleración con banda de resistencia 4x8m'
    ]
  },
  {
    id: 'preset-pliometria',
    name: '🦘 Pliometría & Salto Explosivo',
    description: 'Aumenta tu potencia de salto para balones divididos aéreos y explosividad.',
    location: 'gym' as TrainingLocation,
    focusArea: 'fuerza' as TrainingFocus,
    categoryTag: 'Pliometría & Potencia',
    icon: Trophy,
    defaultTime: '11:00',
    defaultDays: ['MIE', 'SAB'],
    exercises: [
      'Salto al cajón 4x6 reps',
      'Saltos unipodales horizontales alternados 3x8 reps',
      'Rebote reactivo continuo sobre minivallas 4x6',
      'Estabilidad reactiva de tobillo y sóleo 3x12'
    ]
  },
  {
    id: 'preset-recuperacion',
    name: '🧘 Movilidad Hip/Ankle & Recuperación',
    description: 'Sesión de regeneración articular, soltura muscular y prevención de pubalgia.',
    location: 'casa' as TrainingLocation,
    focusArea: 'recuperacion' as TrainingFocus,
    categoryTag: 'Recuperación Activa',
    icon: Heart,
    defaultTime: '19:30',
    defaultDays: ['DOM'],
    exercises: [
      'Apertura de cadera 90/90 2x10 reps',
      'Foam Roller en Isquios, Cuádriceps y Gemelos 10 min',
      'Movilidad de tobillo contra pared 3x12 por pierna',
      'Respiración diafragmática post-esfuerzo 5 min'
    ]
  }
];

export const CoachView: React.FC<CoachViewProps> = ({
  playerProfile,
  weeklySchedule,
  chatHistory,
  onSendMessage,
  onRecalculateWeek,
  onUpdateWeeklySchedule
}) => {
  const [activeMode, setActiveMode] = useState<'chat' | 'import' | 'planner' | 'video'>('chat');
  const [importSubTab, setImportSubTab] = useState<'presets' | 'manual' | 'json'>('presets');
  
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Preset Selection State
  const [selectedPresetTimes, setSelectedPresetTimes] = useState<{ [key: string]: string }>({
    'preset-gym-fuerza': '18:00',
    'preset-casa-tecnica': '17:00',
    'preset-sprints-velocidad': '09:00',
    'preset-pliometria': '11:00',
    'preset-recuperacion': '19:30'
  });

  const [selectedPresetDays, setSelectedPresetDays] = useState<{ [key: string]: string[] }>({
    'preset-gym-fuerza': ['LUN', 'MIE', 'VIE'],
    'preset-casa-tecnica': ['MAR', 'JUE'],
    'preset-sprints-velocidad': ['MAR', 'VIE'],
    'preset-pliometria': ['MIE'],
    'preset-recuperacion': ['DOM']
  });

  // Custom Manual Import Form State
  const [manualDay, setManualDay] = useState<string>('LUN');
  const [manualTime, setManualTime] = useState<string>('18:00');
  const [manualLocation, setManualLocation] = useState<TrainingLocation>('gym');
  const [manualFocus, setManualFocus] = useState<TrainingFocus>('fuerza');
  const [manualTitle, setManualTitle] = useState<string>('Rutina Gimnasio & Core');
  const [manualExercises, setManualExercises] = useState<string>(
    'Sentadillas Búlgaras 4x8\nHip Thrust 4x10\nPrensa Unilateral 3x12\nCore Pallof Press 3x15s'
  );
  const [manualDuration, setManualDuration] = useState<number>(60);
  const [manualIntensity, setManualIntensity] = useState<'baja' | 'moderada' | 'alta'>('alta');

  // JSON Import/Export State
  const [jsonText, setJsonText] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [importNotice, setImportNotice] = useState<string | null>(null);

  // Video Analysis State
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [analysesList, setAnalysesList] = useState<VideoAnalysis[]>(() => {
    try {
      const saved = localStorage.getItem('APEX_FEMME_VIDEO_ANALYSIS');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      {
        id: 'va-demo-1',
        title: 'Pase Filtrado Rompiendo Líneas (vs FC Barcelona B)',
        date: 'Ayer',
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-women-playing-soccer-in-a-stadium-41132-large.mp4',
        status: 'completed',
        tacticalScore: 88,
        strengths: [
          'Visión periférica rápida antes de recibir el balón.',
          'Orientación corporal óptima hacia el perfil de pase progresivo.',
          'Excelente timing para batir la línea de 4 defensoras rivales.'
        ],
        areasToImprove: [
          'Un toque extra de aceleración al desprenderse tras dar el pase.',
          'Ligero retraso en la transición defensiva si se pierde el balón.'
        ],
        recommendedDrills: [
          'Rondo Táctico 4v2 con transición rápida tras pérdida.',
          'Trabajo de potencia de zancada en sprints de 10 metros.'
        ],
        aiFeedback: 'Analizando tu secuencia en el minuto 34, demostraste una lectura de juego propia de Aitana Bonmatí. Para dar el salto a Nivel 15, reduce el tiempo de toma de decisiones en medio segundo adicional.'
      }
    ];
  });

  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);

  const speakText = (msgId: string, text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      if (speakingMsgId === msgId) {
        setSpeakingMsgId(null);
        return;
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'es-ES';
      utterance.rate = 1.0;
      utterance.onend = () => setSpeakingMsgId(null);
      utterance.onerror = () => setSpeakingMsgId(null);
      setSpeakingMsgId(msgId);
      window.speechSynthesis.speak(utterance);
    }
  };

  const promptChips = [
    "👋 Hola Coach, ¿cómo estás hoy?",
    "🔍 Noticias del Balón de Oro Femenino",
    "⌚ ¿Cómo están mis pulsaciones y HRV hoy?",
    "⚡ Prevención de lesiones (LCA) en fútbol femenino",
    "📥 Importar plan de Gimnasio a las 18:00",
    "📥 Importar rutina de Técnica en Casa a las 17:00",
    "🥗 ¿Qué comer 3 horas antes del partido?"
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isTyping]);

  // Handle Chat Input
  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    if (text.includes("📹 Analizar mi último clip")) {
      setActiveMode('video');
      setInputText('');
      return;
    }

    onSendMessage(text);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
    }, 1200);
  };

  // Video Upload
  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreviewUrl(URL.createObjectURL(file));
    }
  };

  // Run AI Video Analysis
  const runAiVideoAnalysis = () => {
    setIsAnalyzing(true);
    setAnalysisStep('Iniciando visión por computadora APEX Vision Engine...');

    setTimeout(() => setAnalysisStep('Detectando patrones de carrera y postura biomecánica...'), 1000);
    setTimeout(() => setAnalysisStep('Analizando orientación espacial y toma de decisiones tácticas...'), 2200);
    setTimeout(() => setAnalysisStep('Evaluando líneas de pase y presión defensiva rival...'), 3400);

    setTimeout(() => {
      setIsAnalyzing(false);
      setAnalysisStep('');

      const newAnalysis: VideoAnalysis = {
        id: `va-${Date.now()}`,
        title: videoFile ? videoFile.name.replace(/\.[^/.]+$/, "") : 'Secuencia Táctica Individual',
        date: 'Hoy',
        videoUrl: videoPreviewUrl || 'https://assets.mixkit.co/videos/preview/mixkit-women-playing-soccer-in-a-stadium-41132-large.mp4',
        status: 'completed',
        tacticalScore: Math.floor(Math.random() * 15) + 82,
        strengths: [
          `Excelente posicionamiento inicial en zona de ${playerProfile.position}.`,
          'Postura corporal abierta permitiendo panorama completo del campo.',
          'Buen control de balón bajo presión inicial.'
        ],
        areasToImprove: [
          'Velocidad de ejecución en el primer toque orientado.',
          'Giro de cabeza (scanning) debe incrementarse antes de recibir el pase.'
        ],
        recommendedDrills: [
          'Ejercicio de Rondo 5v2 a 1 y 2 toques.',
          'Entrenamiento de perfilamiento con balón a espaldas.'
        ],
        aiFeedback: `¡Análisis completado para ${playerProfile.name}! Tu toma de decisiones es sólida. Si incrementas la frecuencia de scanning en un 15% antes de recibir, serás imparable en la salida de balón.`
      };

      const updated = [newAnalysis, ...analysesList];
      setAnalysesList(updated);
      try {
        localStorage.setItem('APEX_FEMME_VIDEO_ANALYSIS', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }

      setVideoFile(null);
      setVideoPreviewUrl(null);
    }, 4500);
  };

  // Import Preset Plan to Weekly Schedule
  const handleImportPreset = (preset: typeof PRESET_PLANS[0]) => {
    const time = selectedPresetTimes[preset.id] || preset.defaultTime;
    const daysToApply = selectedPresetDays[preset.id] || preset.defaultDays;

    const newSchedule = weeklySchedule.map((day) => {
      if (daysToApply.includes(day.dayShort)) {
        return {
          ...day,
          activityType: preset.focusArea === 'fuerza' ? ('gimnasio' as const) : ('entrenamiento' as const),
          title: preset.name.replace(/^[^\s]+\s*/, ''),
          scheduledTime: time,
          location: preset.location,
          focusArea: preset.focusArea,
          exercises: preset.exercises,
          isImported: true,
          durationMin: 60,
          intensity: 'alta' as const
        };
      }
      return day;
    });

    if (onUpdateWeeklySchedule) {
      onUpdateWeeklySchedule(newSchedule);
    }
    setImportNotice(`✅ Plan "${preset.name}" importado con éxito a las ${time} para los días (${daysToApply.join(', ')}).`);
    setTimeout(() => setImportNotice(null), 4000);
  };

  // Import Full Microcycle (All Week)
  const handleImportFullWeekMicrocycle = () => {
    const fullWeekPlan: ScheduleDay[] = [
      { id: 'sc-1', dayShort: 'LUN', dayFull: 'Lunes', activityType: 'gimnasio', title: 'Gimnasio: Fuerza Unilateral & Core', durationMin: 60, status: 'pending', intensity: 'alta', icon: 'Dumbbell', scheduledTime: '08:30', location: 'gym', focusArea: 'fuerza', exercises: ['Sentadillas Búlgaras 4x8', 'Hip Thrust 4x10', 'Pallof Press 3x15s'], isImported: true },
      { id: 'sc-2', dayShort: 'MAR', dayFull: 'Martes', activityType: 'entrenamiento', title: 'Sprints, Aceleración & Reacción', durationMin: 50, status: 'pending', intensity: 'alta', icon: 'Zap', scheduledTime: '09:00', location: 'pista', focusArea: 'sprints', exercises: ['Salidas reactivas 10m 6x', 'Sprints 20m 4x', 'Circuito Z 5x'], isImported: true },
      { id: 'sc-3', dayShort: 'MIE', dayFull: 'Miércoles', activityType: 'entrenamiento', title: 'Técnica & Control Orientado en Casa', durationMin: 45, status: 'pending', intensity: 'moderada', icon: 'Activity', scheduledTime: '17:00', location: 'casa', focusArea: 'tecnica', exercises: ['100 Tocados pared', 'Control orientado', 'Malabarismos 5m'], isImported: true },
      { id: 'sc-4', dayShort: 'JUE', dayFull: 'Jueves', activityType: 'gimnasio', title: 'Pliometría & Salto Explosivo', durationMin: 50, status: 'pending', intensity: 'alta', icon: 'Trophy', scheduledTime: '18:00', location: 'gym', focusArea: 'fuerza', exercises: ['Salto cajón 4x6', 'Saltos unipodales 3x8'], isImported: true },
      { id: 'sc-5', dayShort: 'VIE', dayFull: 'Viernes', activityType: 'recuperacion', title: 'Movilidad Articular & Activación Pre-Partido', durationMin: 35, status: 'pending', intensity: 'baja', icon: 'Heart', scheduledTime: '19:00', location: 'casa', focusArea: 'recuperacion', exercises: ['Apertura 90/90', 'Foam roller 10m'], isImported: true },
      { id: 'sc-6', dayShort: 'SAB', dayFull: 'Sábado', activityType: 'partido', title: 'PARTIDO OFICIAL DE LIGA', durationMin: 90, status: 'pending', intensity: 'alta', icon: 'Trophy', scheduledTime: '18:00', location: 'campo', focusArea: 'partido', exercises: ['Calentamiento dinámico', '90 Minutos de partido'], isImported: true },
      { id: 'sc-7', dayShort: 'DOM', dayFull: 'Domingo', activityType: 'descanso', title: 'Descanso Total & Estrategia', durationMin: 0, status: 'pending', intensity: 'baja', icon: 'Bed', scheduledTime: '10:00', location: 'casa', focusArea: 'recuperacion', exercises: ['Descanso total', 'Análisis táctico en video'], isImported: true },
    ];

    if (onUpdateWeeklySchedule) {
      onUpdateWeeklySchedule(fullWeekPlan);
    }
    setImportNotice("🏆 Plan Microciclo Completo (Gym + Sprints + Casa) importado a toda la semana.");
    setTimeout(() => setImportNotice(null), 4000);
  };

  // Add Custom Manual Workout
  const handleAddManualWorkout = (e: React.FormEvent) => {
    e.preventDefault();

    const exercisesList = manualExercises
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 0);

    const updatedSchedule = weeklySchedule.map((day) => {
      if (day.dayShort === manualDay) {
        return {
          ...day,
          activityType: manualFocus === 'fuerza' ? ('gimnasio' as const) : ('entrenamiento' as const),
          title: manualTitle || 'Entrenamiento Personalizado',
          scheduledTime: manualTime,
          location: manualLocation,
          focusArea: manualFocus,
          exercises: exercisesList.length > 0 ? exercisesList : ['Ejercicio a elección'],
          durationMin: manualDuration,
          intensity: manualIntensity,
          isImported: true
        };
      }
      return day;
    });

    if (onUpdateWeeklySchedule) {
      onUpdateWeeklySchedule(updatedSchedule);
    }

    setImportNotice(`➕ Sesión "${manualTitle}" programada con éxito para el ${manualDay} a las ${manualTime}.`);
    setTimeout(() => setImportNotice(null), 4000);
  };

  // JSON Import
  const handleImportJson = () => {
    setJsonError(null);
    try {
      if (!jsonText.trim()) {
        setJsonError('Por favor pega o sube el código JSON de la planificación.');
        return;
      }

      const parsed = JSON.parse(jsonText);
      let newSchedule: ScheduleDay[] = [];

      if (Array.isArray(parsed)) {
        newSchedule = parsed;
      } else if (parsed.schedule && Array.isArray(parsed.schedule)) {
        newSchedule = parsed.schedule;
      } else {
        throw new Error('El formato JSON debe incluir una lista de días ("schedule": [...]).');
      }

      if (onUpdateWeeklySchedule) {
        onUpdateWeeklySchedule(newSchedule);
      }
      setImportNotice('📥 Planificación importada correctamente desde archivo JSON.');
      setTimeout(() => setImportNotice(null), 4000);
      setJsonText('');
    } catch (err: any) {
      setJsonError(err.message || 'Error al analizar el formato JSON.');
    }
  };

  // Export JSON
  const handleExportJson = () => {
    const jsonStr = JSON.stringify(weeklySchedule, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `planificacion_entrenamientos_${playerProfile.name.toLowerCase().replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);

    setImportNotice('📤 Planificación exportada a archivo JSON correctamente.');
    setTimeout(() => setImportNotice(null), 4000);
  };

  // Load Sample JSON to textarea
  const handleLoadSampleJson = () => {
    const sample = [
      {
        id: "sample-1",
        dayShort: "LUN",
        dayFull: "Lunes",
        activityType: "gimnasio",
        title: "Gimnasio: Tren Inferior & Core",
        durationMin: 60,
        status: "pending",
        intensity: "alta",
        icon: "Dumbbell",
        scheduledTime: "08:30",
        location: "gym",
        focusArea: "fuerza",
        exercises: [
          "Sentadillas Búlgaras 4x8",
          "Hip Thrust en Barra 4x10",
          "Pallof Press 3x15s"
        ],
        isImported: true
      },
      {
        id: "sample-2",
        dayShort: "MAR",
        dayFull: "Martes",
        activityType: "entrenamiento",
        title: "Técnica en Casa & Control Orientado",
        durationMin: 45,
        status: "pending",
        intensity: "moderada",
        icon: "Activity",
        scheduledTime: "17:00",
        location: "casa",
        focusArea: "tecnica",
        exercises: [
          "100 Tocados a pared",
          "Control orientado en espacio reducido"
        ],
        isImported: true
      }
    ];
    setJsonText(JSON.stringify(sample, null, 2));
  };

  return (
    <div className="space-y-5 max-w-3xl mx-auto pb-32 animate-fade-in">
      {/* Title & Online Status */}
      <section className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <h2 className="font-extrabold text-2xl text-[#dae2fd] flex items-center gap-2">
            APEX Coach IA <Sparkles className="w-5 h-5 text-[#84cc16]" />
          </h2>
          <span className="text-[10px] px-2.5 py-1 bg-[#84cc16]/20 text-[#9ee939] border border-[#84cc16]/40 rounded-full font-mono font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-[#9ee939] rounded-full animate-ping" />
            ONLINE / EN LÍNEA
          </span>
        </div>
        <p className="text-xs text-[#c1cab0]">
          Asistente táctico, importador de entrenamientos (gym, casa, sprints) y análisis de video para {playerProfile.position}.
        </p>
      </section>

      {/* Mode Navigation Bar */}
      <nav className="bg-[var(--bg-input)] rounded-2xl p-1 flex items-center border border-[var(--border-subtle)] shadow-inner text-xs font-bold gap-1 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveMode('chat')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeMode === 'chat'
              ? 'theme-accent-bg shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Bot className="w-4 h-4" />
          Chat & Consultas
        </button>

        <button
          onClick={() => setActiveMode('import')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap relative ${
            activeMode === 'import'
              ? 'theme-accent-bg shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Download className="w-4 h-4" />
          Importar Plan
        </button>

        <button
          onClick={() => setActiveMode('planner')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeMode === 'planner'
              ? 'theme-accent-bg shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Plan Semanal
        </button>

        <button
          onClick={() => setActiveMode('video')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeMode === 'video'
              ? 'theme-accent-bg shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Video className="w-4 h-4" />
          Análisis Video
        </button>

        <button
          onClick={() => setActiveMode('nutrition')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeMode === 'nutrition'
              ? 'theme-accent-bg shadow-md'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Heart className="w-4 h-4" />
          Nutrición IA
        </button>
      </nav>

      {/* Global Import Notice Banner */}
      {importNotice && (
        <div className="bg-[#84cc16]/20 border border-[#84cc16] text-[#9ee939] p-3.5 rounded-2xl text-xs font-bold flex items-center justify-between animate-fade-in shadow-lg">
          <span className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#84cc16]" />
            {importNotice}
          </span>
          <button onClick={() => setImportNotice(null)} className="text-[#c1cab0] hover:text-white font-mono">✕</button>
        </div>
      )}

      {/* MODE 1: CHAT VIEW */}
      {activeMode === 'chat' && (
        <div className="space-y-4">
          <div className="space-y-4 min-h-[260px] max-h-[420px] overflow-y-auto pr-1">
            {chatHistory.map((msg) => {
              const isAi = msg.sender === 'ai';
              return (
                <div key={msg.id} className={`flex gap-3 ${isAi ? '' : 'justify-end'}`}>
                  {isAi && (
                    <div className="w-8 h-8 rounded-xl bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center shrink-0 text-[#9ee939]">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`p-4 rounded-2xl max-w-[85%] text-xs sm:text-sm leading-relaxed relative group ${
                    isAi 
                      ? 'chat-bubble-ai text-[#dae2fd] shadow-lg' 
                      : 'bg-[var(--accent-color)] text-[var(--accent-text)] font-bold rounded-tr-none'
                  }`}>
                    <p className="whitespace-pre-line">{msg.text}</p>
                    
                    <div className="flex items-center justify-between mt-2 pt-1 border-t border-white/10 text-[9px] opacity-70 font-mono">
                      {isAi ? (
                        <button
                          onClick={() => speakText(msg.id, msg.text)}
                          className={`flex items-center gap-1 font-bold px-2 py-0.5 rounded-md transition-all ${
                            speakingMsgId === msg.id
                              ? 'bg-amber-400 text-black animate-pulse'
                              : 'bg-white/10 hover:bg-white/20 text-white'
                          }`}
                          title="Escuchar audio del Coach"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>{speakingMsgId === msg.id ? 'Hablando...' : 'Escuchar Audio'}</span>
                        </button>
                      ) : <span />}

                      <span>{msg.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex gap-3 items-center">
                <div className="w-8 h-8 rounded-xl bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center text-[#9ee939]">
                  <Sparkles className="w-4 h-4 animate-spin" />
                </div>
                <div className="chat-bubble-ai p-3 rounded-2xl text-xs text-[#c1cab0] italic flex items-center gap-2">
                  <span>Analizando plan y sugerencias para {playerProfile.name}...</span>
                  <span className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-[#9ee939] rounded-full animate-bounce" />
                    <span className="w-1.5 h-1.5 bg-[#9ee939] rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1.5 h-1.5 bg-[#9ee939] rounded-full animate-bounce [animation-delay:0.4s]" />
                  </span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div className="overflow-x-auto no-scrollbar py-1">
            <div className="flex gap-2 w-max">
              {promptChips.map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(chip)}
                  className="px-3.5 py-1.5 rounded-full border border-[#424936] bg-[#171f33] hover:bg-[#2d3449] hover:border-[#84cc16]/50 transition-colors text-xs font-semibold text-[#dae2fd] whitespace-nowrap flex items-center gap-1.5 active:scale-95"
                >
                  <Sparkles className="w-3 h-3 text-[#7bd0ff]" />
                  {chip}
                </button>
              ))}
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-2 flex items-center gap-2 border border-[#424936]/60 shadow-xl">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Escribe 'Importar plan de gym a las 18:00' o tu duda táctica..."
              className="flex-1 bg-transparent border-none focus:ring-0 text-xs sm:text-sm text-[#dae2fd] placeholder:text-[#c1cab0]/50 px-3 outline-none"
            />
            <button
              onClick={() => handleSend()}
              disabled={!inputText.trim()}
              className="p-3 bg-[#00a6e0] hover:bg-[#7bd0ff] text-[#001e2c] rounded-xl shadow-[0_0_15px_rgba(0,166,224,0.4)] active:scale-90 transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}

      {/* MODE 2: IMPORTAR PLANIFICACIÓN DE ENTRENAMIENTOS */}
      {activeMode === 'import' && (
        <div className="space-y-6 animate-fade-in">
          {/* Header Card */}
          <section className="glass-panel rounded-3xl p-6 border border-[#84cc16]/40 bg-gradient-to-br from-[#171f33] via-[#131b2e] to-[#0f172a] shadow-xl space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center text-[#9ee939]">
                  <Download className="w-6 h-6 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-white">Importador de Rutinas y Horarios</h3>
                  <p className="text-xs text-[#c1cab0]">
                    Carga tus planes de Gym, Casa, Sprints o Pliometría directamente en tu horario semanal.
                  </p>
                </div>
              </div>

              <button
                onClick={handleImportFullWeekMicrocycle}
                className="bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] px-4 py-2.5 rounded-2xl font-extrabold text-xs transition-all active:scale-95 shadow-lg shadow-[#84cc16]/20 flex items-center gap-1.5 shrink-0 hidden sm:flex"
              >
                <Trophy className="w-4 h-4" /> Importar Plan Semanal Completo Pro
              </button>
            </div>

            {/* Sub-tab switcher */}
            <div className="flex gap-2 border-t border-[#424936]/40 pt-3 text-xs font-bold">
              <button
                onClick={() => setImportSubTab('presets')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  importSubTab === 'presets'
                    ? 'bg-[#84cc16] text-[#102000]'
                    : 'bg-[#131b2e] text-[#c1cab0] hover:text-white border border-[#424936]/40'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" /> Plantillas de Rutinas
              </button>

              <button
                onClick={() => setImportSubTab('manual')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  importSubTab === 'manual'
                    ? 'bg-[#84cc16] text-[#102000]'
                    : 'bg-[#131b2e] text-[#c1cab0] hover:text-white border border-[#424936]/40'
                }`}
              >
                <Plus className="w-3.5 h-3.5" /> Diseñar A Medida
              </button>

              <button
                onClick={() => setImportSubTab('json')}
                className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                  importSubTab === 'json'
                    ? 'bg-[#84cc16] text-[#102000]'
                    : 'bg-[#131b2e] text-[#c1cab0] hover:text-white border border-[#424936]/40'
                }`}
              >
                <FileCode className="w-3.5 h-3.5" /> Archivo / JSON
              </button>
            </div>
          </section>

          {/* SUB-TAB 1: PRESETS LIBRARY */}
          {importSubTab === 'presets' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-extrabold text-sm uppercase tracking-wider text-[#dae2fd] flex items-center gap-2">
                  <ListPlus className="w-4 h-4 text-[#84cc16]" /> SELECCIONA Y CONFIGURA EL HORARIO DE TUS RUTINAS
                </h4>
                <button
                  onClick={handleImportFullWeekMicrocycle}
                  className="sm:hidden text-xs text-[#9ee939] font-bold underline"
                >
                  Importar Plan Completo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {PRESET_PLANS.map((preset) => {
                  const Icon = preset.icon;
                  const timeVal = selectedPresetTimes[preset.id] || preset.defaultTime;
                  const daysVal = selectedPresetDays[preset.id] || preset.defaultDays;

                  const toggleDay = (dayCode: string) => {
                    const current = [...daysVal];
                    const idx = current.indexOf(dayCode);
                    if (idx > -1) {
                      if (current.length > 1) current.splice(idx, 1);
                    } else {
                      current.push(dayCode);
                    }
                    setSelectedPresetDays(prev => ({ ...prev, [preset.id]: current }));
                  };

                  return (
                    <div
                      key={preset.id}
                      className="glass-card p-5 rounded-2xl border border-[#424936]/60 space-y-4 flex flex-col justify-between hover:border-[#84cc16]/50 transition-all"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-xl bg-[#84cc16]/20 border border-[#84cc16]/40 flex items-center justify-center text-[#9ee939]">
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <span className="text-[10px] font-mono font-bold text-[#7bd0ff] uppercase block">
                                {preset.categoryTag}
                              </span>
                              <h5 className="font-extrabold text-sm text-white">{preset.name}</h5>
                            </div>
                          </div>
                        </div>

                        <p className="text-xs text-[#c1cab0] leading-relaxed">
                          {preset.description}
                        </p>

                        {/* Exercises List */}
                        <div className="bg-[#131b2e] p-3 rounded-xl border border-[#424936]/40 space-y-1">
                          <p className="text-[10px] font-bold text-[#84cc16] uppercase">Ejercicios Incluidos:</p>
                          <ul className="text-[11px] text-[#dae2fd] space-y-1">
                            {preset.exercises.map((ex, i) => (
                              <li key={i} className="flex items-start gap-1.5">
                                <span className="text-[#84cc16] font-bold">•</span>
                                <span>{ex}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Time & Days Selector Controls */}
                        <div className="bg-[#171f33] p-3 rounded-xl border border-[#424936]/50 space-y-2">
                          <div className="flex items-center justify-between">
                            <label className="text-[11px] font-bold text-[#c1cab0] flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-[#7bd0ff]" /> Horario de Inicio:
                            </label>
                            <input
                              type="time"
                              value={timeVal}
                              onChange={(e) => setSelectedPresetTimes(prev => ({ ...prev, [preset.id]: e.target.value }))}
                              className="bg-[#0c1322] border border-[#424936] text-[#9ee939] px-2.5 py-1 rounded-lg text-xs font-mono font-bold outline-none focus:border-[#84cc16]"
                            />
                          </div>

                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-[#c1cab0] flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-[#7bd0ff]" /> Asignar a Días de la Semana:
                            </p>
                            <div className="flex gap-1 overflow-x-auto pt-0.5">
                              {['LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB', 'DOM'].map((d) => {
                                const selected = daysVal.includes(d);
                                return (
                                  <button
                                    key={d}
                                    type="button"
                                    onClick={() => toggleDay(d)}
                                    className={`px-2 py-1 rounded-lg text-[10px] font-bold font-mono transition-all ${
                                      selected
                                        ? 'bg-[#84cc16] text-[#102000]'
                                        : 'bg-[#0c1322] text-[#c1cab0] hover:text-white border border-[#424936]/40'
                                    }`}
                                  >
                                    {d}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Import Action Button */}
                      <button
                        type="button"
                        onClick={() => handleImportPreset(preset)}
                        className="w-full bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] py-2.5 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-[#84cc16]/20 flex items-center justify-center gap-2 mt-2"
                      >
                        <Download className="w-4 h-4" />
                        Importar a mi Horario ({timeVal})
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* SUB-TAB 2: MANUAL WORKOUT BUILDER */}
          {importSubTab === 'manual' && (
            <form onSubmit={handleAddManualWorkout} className="glass-card p-6 rounded-2xl border border-[#424936]/60 space-y-4">
              <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-[#84cc16]" /> DISEÑAR Y PROGRAMAR ENTRENAMIENTO PERSONALIZADO
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Day */}
                <div>
                  <label className="text-xs font-bold text-[#c1cab0] block mb-1">Día de la Semana</label>
                  <select
                    value={manualDay}
                    onChange={(e) => setManualDay(e.target.value)}
                    className="w-full bg-[#131b2e] border border-[#424936] text-white p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#84cc16]"
                  >
                    <option value="LUN">Lunes (LUN)</option>
                    <option value="MAR">Martes (MAR)</option>
                    <option value="MIE">Miércoles (MIE)</option>
                    <option value="JUE">Jueves (JUE)</option>
                    <option value="VIE">Viernes (VIE)</option>
                    <option value="SAB">Sábado (SAB)</option>
                    <option value="DOM">Domingo (DOM)</option>
                  </select>
                </div>

                {/* Time */}
                <div>
                  <label className="text-xs font-bold text-[#c1cab0] block mb-1">Horario (Hora de Inicio)</label>
                  <input
                    type="time"
                    value={manualTime}
                    onChange={(e) => setManualTime(e.target.value)}
                    className="w-full bg-[#131b2e] border border-[#424936] text-[#9ee939] p-2.5 rounded-xl text-xs font-bold font-mono outline-none focus:border-[#84cc16]"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="text-xs font-bold text-[#c1cab0] block mb-1">Ubicación de Entrenamiento</label>
                  <select
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value as TrainingLocation)}
                    className="w-full bg-[#131b2e] border border-[#424936] text-white p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#84cc16]"
                  >
                    <option value="gym">🏋️ Gimnasio</option>
                    <option value="casa">🏠 En Casa (Espacio Reducido)</option>
                    <option value="pista">⚡ Pista de Sprints / Aceleración</option>
                    <option value="campo">⚽ Campo de Fútbol</option>
                    <option value="otro">🌐 Centro de Rendimiento</option>
                  </select>
                </div>

                {/* Focus Area */}
                <div>
                  <label className="text-xs font-bold text-[#c1cab0] block mb-1">Enfoque Principal</label>
                  <select
                    value={manualFocus}
                    onChange={(e) => setManualFocus(e.target.value as TrainingFocus)}
                    className="w-full bg-[#131b2e] border border-[#424936] text-white p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#84cc16]"
                  >
                    <option value="fuerza">Fuerza & Masa Muscular</option>
                    <option value="tecnica">Técnica & Control de Balón</option>
                    <option value="sprints">Sprints & Aceleración</option>
                    <option value="recuperacion">Recuperación & Movilidad</option>
                    <option value="tactica">Táctica & Posicionamiento</option>
                  </select>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-[#c1cab0] block mb-1">Nombre / Título de la Sesión</label>
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Ej: Sprints 10m + Pliometría en Salón"
                  className="w-full bg-[#131b2e] border border-[#424936] text-white p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#84cc16]"
                />
              </div>

              {/* Exercises List */}
              <div>
                <label className="text-xs font-bold text-[#c1cab0] block mb-1">
                  Lista de Ejercicios (Uno por línea)
                </label>
                <textarea
                  rows={4}
                  value={manualExercises}
                  onChange={(e) => setManualExercises(e.target.value)}
                  placeholder="Sentadillas Búlgaras 4x8&#10;Hip Thrust 4x10&#10;Core Pallof Press 3x15s"
                  className="w-full bg-[#131b2e] border border-[#424936] text-[#dae2fd] p-3 rounded-xl text-xs outline-none focus:border-[#84cc16] font-mono leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#c1cab0] block mb-1">Duración (minutos)</label>
                  <input
                    type="number"
                    value={manualDuration}
                    onChange={(e) => setManualDuration(Number(e.target.value))}
                    className="w-full bg-[#131b2e] border border-[#424936] text-white p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#84cc16]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[#c1cab0] block mb-1">Intensidad</label>
                  <select
                    value={manualIntensity}
                    onChange={(e) => setManualIntensity(e.target.value as any)}
                    className="w-full bg-[#131b2e] border border-[#424936] text-white p-2.5 rounded-xl text-xs font-bold outline-none focus:border-[#84cc16]"
                  >
                    <option value="baja">Baja (Recuperación)</option>
                    <option value="moderada">Moderada</option>
                    <option value="alta">Alta (Máxima carga)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-lg shadow-[#84cc16]/20 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Programar e Importar al Horario ({manualDay} a las {manualTime})
              </button>
            </form>
          )}

          {/* SUB-TAB 3: JSON IMPORT / EXPORT */}
          {importSubTab === 'json' && (
            <div className="glass-card p-6 rounded-2xl border border-[#424936]/60 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-extrabold text-base text-white flex items-center gap-2">
                  <FileCode className="w-5 h-5 text-[#84cc16]" /> IMPORTAR Y EXPORTAR CÓDIGO JSON DE ENTRENAMIENTOS
                </h4>
                <button
                  onClick={handleLoadSampleJson}
                  className="text-xs text-[#7bd0ff] font-bold hover:underline"
                >
                  Cargar Ejemplo de JSON
                </button>
              </div>

              <p className="text-xs text-[#c1cab0]">
                Puedes pegar tu código JSON o subir un archivo descargado para actualizar toda tu semana de entrenamiento al instante.
              </p>

              {jsonError && (
                <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-xl text-xs font-bold">
                  ⚠️ {jsonError}
                </div>
              )}

              <textarea
                rows={8}
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                placeholder='Pega aquí tu JSON con la planificación de la semana...'
                className="w-full bg-[#131b2e] border border-[#424936] text-[#9ee939] p-3 rounded-xl text-xs outline-none focus:border-[#84cc16] font-mono leading-relaxed"
              />

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={handleImportJson}
                  className="flex-1 bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-[#84cc16]/20 flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" /> Importar Plan desde JSON
                </button>

                <button
                  type="button"
                  onClick={handleExportJson}
                  className="flex-1 bg-[#171f33] hover:bg-[#2d3449] text-white border border-[#424936] py-3 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all active:scale-95 flex items-center justify-center gap-2"
                >
                  <Share2 className="w-4 h-4 text-[#7bd0ff]" /> Exportar Mi Horario Actual (JSON)
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 3: PLANIFICADOR SEMANAL */}
      {activeMode === 'planner' && (
        <div className="space-y-4 animate-fade-in">
          <div className="glass-panel rounded-2xl p-5 border border-[#424936]/60 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#424936]/40 pb-3">
              <div>
                <h3 className="font-bold text-sm text-[#dae2fd] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#7bd0ff]" />
                  HORARIO Y PLAN SEMANAL DE ENTRENAMIENTOS
                </h3>
                <p className="text-[11px] text-[#c1cab0]">
                  Visualiza las horas programadas, ubicación (gym/casa/sprints) y lista de ejercicios.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setActiveMode('import')}
                  className="bg-[#84cc16]/20 hover:bg-[#84cc16]/30 text-[#9ee939] border border-[#84cc16]/40 px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Importar Nueva Rutina
                </button>

                <button
                  onClick={onRecalculateWeek}
                  className="bg-[#171f33] hover:bg-[#2d3449] text-white border border-[#424936] px-3.5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-[#7bd0ff]" />
                  Ajustar con IA
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {weeklySchedule.map((item) => {
                const isMatch = item.activityType === 'partido';
                const isRest = item.activityType === 'descanso';

                return (
                  <div
                    key={item.id}
                    className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                      isMatch
                        ? 'bg-[#84cc16]/20 border-[#84cc16] text-[#dae2fd]'
                        : isRest
                        ? 'bg-[#131b2e] border-[#424936]/30 text-[#c1cab0]'
                        : 'bg-[#171f33] border-[#424936]/60 text-[#dae2fd]'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-xs font-mono shrink-0 ${
                          isMatch 
                            ? 'bg-[#84cc16] text-[#102000]' 
                            : 'bg-[#0c1322] text-[#7bd0ff] border border-[#424936]'
                        }`}>
                          {item.dayShort}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-white">{item.title}</h4>
                            {item.isImported && (
                              <span className="text-[9px] font-mono bg-[#84cc16]/20 text-[#9ee939] px-1.5 py-0.2 rounded border border-[#84cc16]/40">
                                IMPORTADO
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#c1cab0] mt-0.5 font-mono">
                            <span className="text-[#9ee939] font-bold flex items-center gap-1">
                              <Clock className="w-3 h-3 text-[#7bd0ff]" /> {item.scheduledTime || '08:00'} hrs
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#84cc16]" /> {item.location === 'gym' ? 'Gimnasio' : item.location === 'casa' ? 'En Casa' : item.location === 'pista' ? 'Pista Sprints' : 'Campo'}
                            </span>
                            <span>•</span>
                            <span>{item.durationMin} min</span>
                            <span>•</span>
                            <span>Carga {item.intensity}</span>
                          </div>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg ${
                        item.status === 'completed' 
                          ? 'bg-[#84cc16]/20 text-[#9ee939] border border-[#84cc16]/40' 
                          : 'bg-[#0c1322] text-[#c1cab0] border border-[#424936]'
                      }`}>
                        {item.status === 'completed' ? 'Completado' : 'Programado'}
                      </span>
                    </div>

                    {/* Exercises list if present */}
                    {item.exercises && item.exercises.length > 0 && (
                      <div className="bg-[#0c1322] p-3 rounded-xl border border-[#424936]/40 text-xs space-y-1">
                        <p className="text-[10px] font-bold text-[#84cc16] uppercase">Rutina de Ejercicios:</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] text-[#c1cab0]">
                          {item.exercises.map((ex, idx) => (
                            <div key={idx} className="flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 bg-[#84cc16] rounded-full" />
                              <span>{ex}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODE 4: VIDEO ANALYSIS */}
      {activeMode === 'video' && (
        <div className="space-y-6 animate-fade-in">
          {/* Upload Video Card */}
          <section className="glass-panel rounded-3xl p-6 border border-purple-500/40 bg-gradient-to-br from-[#171f33] via-[#131b2e] to-[#0f172a] shadow-xl space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-white">Análisis Táctico de Video con IA APEX</h3>
                <p className="text-xs text-[#c1cab0]">Sube un video jugando para que la IA evalúe tu postura, visión y toma de decisiones.</p>
              </div>
            </div>

            {/* Video Input Box */}
            {!isAnalyzing ? (
              <div className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 bg-[#0b1326]/60 rounded-2xl p-6 text-center space-y-3 transition-colors">
                {videoPreviewUrl ? (
                  <div className="space-y-3">
                    <video
                      src={videoPreviewUrl}
                      controls
                      className="w-full max-h-56 rounded-xl mx-auto object-cover border border-purple-500/30"
                    />
                    <div className="flex justify-center gap-3">
                      <button
                        onClick={runAiVideoAnalysis}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-purple-600/30 active:scale-95 transition-all flex items-center gap-2"
                      >
                        <Brain className="w-4 h-4" /> Analizar Video con IA
                      </button>
                      <button
                        onClick={() => { setVideoFile(null); setVideoPreviewUrl(null); }}
                        className="bg-[#1e293b] text-[#c1cab0] hover:text-white px-4 py-2 rounded-xl text-xs font-bold border border-[#424936]"
                      >
                        Cambiar Video
                      </button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block space-y-2">
                    <Upload className="w-8 h-8 text-purple-400 mx-auto animate-bounce" />
                    <p className="font-bold text-sm text-white">Arrastra o haz clic para subir tu video (.mp4, .mov)</p>
                    <p className="text-[11px] text-[#c1cab0]">Duración recomendada: Clips de 10s a 2 minutos de partidos o entrenamientos</p>
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            ) : (
              /* AI Video Analysis Loader */
              <div className="bg-[#0b1326] p-8 rounded-2xl border border-purple-500/50 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-purple-500/20 border-2 border-purple-400 flex items-center justify-center mx-auto text-purple-300 animate-spin">
                  <Brain className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-white">La IA está pensando y analizando tu jugada...</h4>
                  <p className="text-xs text-purple-300 font-mono mt-1 animate-pulse">{analysisStep}</p>
                </div>
                <div className="w-full bg-[#1e293b] h-2 rounded-full overflow-hidden max-w-md mx-auto">
                  <div className="bg-gradient-to-r from-purple-500 to-[#84cc16] h-full animate-pulse w-full" />
                </div>
              </div>
            )}
          </section>

          {/* Historical Video Analyses List */}
          <section className="space-y-4">
            <h3 className="font-extrabold text-base text-[#dae2fd] flex items-center gap-2">
              <Film className="w-5 h-5 text-purple-400" /> HISTORIAL DE ANÁLISIS TÁCTICOS
            </h3>

            {analysesList.map((analysis) => (
              <div key={analysis.id} className="glass-card rounded-2xl p-5 border border-purple-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#424936]/40 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded uppercase">
                      {analysis.date}
                    </span>
                    <h4 className="font-extrabold text-base text-white mt-1">{analysis.title}</h4>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#c1cab0]">Puntuación Táctica:</span>
                    <span className="font-mono text-lg font-extrabold text-[#9ee939] bg-[#84cc16]/20 px-3 py-0.5 rounded-xl border border-[#84cc16]/40">
                      {analysis.tacticalScore} / 100
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Strengths */}
                  <div className="bg-[#131b2e] p-3.5 rounded-xl border border-emerald-500/30 space-y-1.5">
                    <h5 className="font-bold text-xs text-emerald-400 flex items-center gap-1.5 uppercase">
                      <CheckCircle2 className="w-4 h-4" /> Lo que hiciste excelente
                    </h5>
                    <ul className="text-xs text-[#c1cab0] space-y-1 pl-1">
                      {analysis.strengths.map((s, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span>{s}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas to Improve */}
                  <div className="bg-[#131b2e] p-3.5 rounded-xl border border-amber-500/30 space-y-1.5">
                    <h5 className="font-bold text-xs text-amber-400 flex items-center gap-1.5 uppercase">
                      <AlertCircle className="w-4 h-4" /> Lo que faltó / A mejorar
                    </h5>
                    <ul className="text-xs text-[#c1cab0] space-y-1 pl-1">
                      {analysis.areasToImprove.map((a, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* AI Detailed Feedback & Drills */}
                <div className="bg-[var(--bg-input)] p-4 rounded-xl border border-[var(--border-subtle)] space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold theme-accent-text">
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                    <span>Conclusión del IA Coach:</span>
                  </div>
                  <p className="text-xs text-[var(--text-main)] italic leading-relaxed">{analysis.aiFeedback}</p>

                  <div className="pt-2 border-t border-[var(--border-subtle)]">
                    <p className="text-[11px] font-bold theme-accent-text uppercase mb-1">Ejercicios Recomendados:</p>
                    <div className="flex flex-wrap gap-2">
                      {analysis.recommendedDrills.map((d, i) => (
                        <span key={i} className="text-[11px] bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] text-[var(--text-main)] px-2.5 py-1 rounded-lg">
                          ⚽ {d}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        </div>
      )}

      {/* Mode 5: Nutrition & Hydration IA Calculator */}
      {activeMode === 'nutrition' && (
        <div className="space-y-6 animate-fade-in">
          <section className="glass-card rounded-3xl p-6 border border-[var(--border-card)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider theme-accent-text">
                  NUTRICIÓN E HIDRATACIÓN DE ALTO RENDIMIENTO
                </span>
                <h3 className="font-extrabold text-xl text-[var(--text-main)] mt-1">
                  Plan Macronutricional Pre y Post Matchday
                </h3>
              </div>
              <Heart className="w-6 h-6 theme-accent-text" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">HIDRATACIÓN OBJETIVO</span>
                <p className="font-mono text-2xl font-black theme-accent-text">2.8 L / día</p>
                <p className="text-[10px] text-[var(--text-muted)]">+ 500ml Electrolitos durante partido</p>
              </div>

              <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">CARBOIDRATOS (RECARGA)</span>
                <p className="font-mono text-2xl font-black text-cyan-400">6.5 g / kg</p>
                <p className="text-[10px] text-[var(--text-muted)]">Arroz integral, avena, plátano, boniato</p>
              </div>

              <div className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-1">
                <span className="text-[10px] text-[var(--text-muted)] font-bold uppercase">PROTEÍNA REGENERADORA</span>
                <p className="font-mono text-2xl font-black text-amber-400">1.8 g / kg</p>
                <p className="text-[10px] text-[var(--text-muted)]">Pollo, salmón, huevos, suero aislado</p>
              </div>
            </div>

            {/* Matchday Meal Timeline */}
            <div className="space-y-3 pt-2">
              <h4 className="font-extrabold text-sm text-[var(--text-main)] uppercase tracking-wider">
                ⏰ CRONOGRAMA DE ALIMENTACIÓN DÍA DE PARTIDO (KICKOFF 18:00)
              </h4>

              <div className="space-y-2.5">
                <div className="bg-[var(--bg-card-solid)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
                    14:30
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[var(--text-main)]">Comida Principal Pre-Partido (3.5h antes)</h5>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Pechuga de pavo/pollo a la plancha con 180g de arroz blanco o pasta, 1 cucharada de aceite de oliva y manzana asada. Evitar fibra pesada y grasas saturadas.
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--bg-card-solid)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
                    17:00
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[var(--text-main)]">Snack de Carga Rápida (60 min antes)</h5>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      1 Plátano maduro + 300ml de bebida isotónica con sodio. Opcional: Gel energético de glucosa-fructosa (ratio 2:1).
                    </p>
                  </div>
                </div>

                <div className="bg-[var(--bg-card-solid)] p-4 rounded-2xl border border-[var(--border-subtle)] flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-mono font-extrabold text-xs flex items-center justify-center shrink-0">
                    19:50
                  </div>
                  <div>
                    <h5 className="font-bold text-xs text-[var(--text-main)]">Ventana Anabólica Post-Partido (0-45 min)</h5>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Batido de proteína de suero aislada (25g) + 50g amilopectina/maltodextrina o yogurt griego con miel y arándanos. Restablece el glucógeno muscular inmediatamente.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
