import React, { useState } from 'react';
import { FemaleMentor, PlayerProfile } from '../types';
import { FEMALE_MENTORS, POSITIONS_LIST, COUNTRIES_LIST } from '../data/initialData';
import { 
  Award, 
  Star, 
  Quote, 
  Check, 
  MessageSquare, 
  Plus, 
  Upload, 
  Download, 
  X, 
  ShieldCheck, 
  Camera, 
  User, 
  Sparkles,
  FileJson,
  HeartPulse,
  Activity,
  Zap,
  Shield,
  Apple,
  AlertTriangle,
  ChevronRight
} from 'lucide-react';

interface FemaleMentorsViewProps {
  playerProfile: PlayerProfile;
  onSelectMentor: (mentorId: string) => void;
  onAskMentorQuestion: (mentorName: string, mentorRole: string) => void;
}

const CYCLE_PHASES = [
  {
    phase: 'Fase Folicular (Días 1-14)',
    icon: '🌸',
    color: 'border-emerald-500 bg-emerald-500/10 text-emerald-400',
    intensity: 'ALTA INTENSIDAD & FUERZA',
    desc: 'Los niveles de estrógeno suben. Máxima tolerancia al dolor, mejor construcción muscular y capacidad glucolítica elevada.',
    trainingFocus: ['Fuerza Pesada / 1RM', 'Sprints Reactivos y Aceleración', 'Entrenamiento de Alta Intensidad (HIIT)'],
    nutritionTip: 'Incrementar hidratos de carbono complejos antes de sesiones exigentes y asegurar 1.8-2.2g de proteína/kg.'
  },
  {
    phase: 'Fase Ovulatoria (Días 14-16)',
    icon: '⚡',
    color: 'border-amber-500 bg-amber-500/10 text-amber-400',
    intensity: 'PICO DE POTENCIA & CUIDADO ARTICULAR',
    desc: 'Pico de estrógeno y hormona luteinizante. Máxima energía y explosividad, pero ligera laxitud ligamentosa (riesgo LCA).',
    trainingFocus: ['Potencia Pliométrica', 'Estabilidad Pélvica y Calentamiento Neumático', 'Técnica Individual'],
    nutritionTip: 'Enfocar en antioxidantes (arándanos, frutos rojos) y propiciar hidratación rica en sodio/potasio.'
  },
  {
    phase: 'Fase Lútea (Días 17-28)',
    icon: '🌙',
    color: 'border-purple-500 bg-purple-500/10 text-purple-400',
    intensity: 'RESISTENCIA AERÓBICA & CONTROL',
    desc: 'Predomina la progesterona. Aumenta la temperatura corporal y el gasto calórico en reposo. Mayor utilización de grasas como combustible.',
    trainingFocus: ['Resistencia Aeróbica Continuada', 'Táctica Colectiva en Campo', 'Movilidad y Flexibilidad'],
    nutritionTip: 'Aumentar ingesta de grasas saludables (palta, frutos secos, salmón) y magnesio antes de dormir.'
  },
  {
    phase: 'Fase Menstrual (Días 1-5)',
    icon: '💧',
    color: 'border-rose-500 bg-rose-500/10 text-rose-400',
    intensity: 'RECUPERACIÓN ACTIVA',
    desc: 'Hormonas en niveles mínimos. El foco debe estar en reducir la inflamación, favorecer el retorno venoso y prevenir fatiga acumulada.',
    trainingFocus: ['Movilidad Articular y Foam Roller', 'Pases Suaves y Regate en Espacio Reducido', 'Yoga/Pilates Deportivo'],
    nutritionTip: 'Priorizar alimentos ricos en hierro (espinacas, carnes magras, legumbres) combinados con Vitamina C.'
  }
];

const ACL_PREVENTION_DRILLS = [
  { title: 'Curl Nórdico Excéntrico', sets: '3 series × 6 reps', desc: 'Refuerza la musculatura isquiotibial para estabilizar la tibia respecto al fémur.', tag: 'Isquios' },
  { title: 'Aterrizaje Monopodal Guiado', sets: '3 series × 8 por pierna', desc: 'Entrena la mecánica de desaceleración evitando el valgo dinámico de rodilla.', tag: 'Rodilla & Control' },
  { title: 'Estabilidad de Cadera con Mini-Band', sets: '3 series × 15 reps', desc: 'Fortalece glúteo medio para prevenir colapso de rodilla al cambiar de dirección.', tag: 'Glúteo Medio' }
];

export const FemaleMentorsView: React.FC<FemaleMentorsViewProps> = ({
  playerProfile,
  onSelectMentor,
  onAskMentorQuestion,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'health' | 'mentors'>('health');

  const [mentorsList, setMentorsList] = useState<FemaleMentor[]>(() => {
    try {
      const saved = localStorage.getItem('APEX_FEMME_MENTORS');
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return FEMALE_MENTORS;
  });

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Mentor Form State
  const [newMentor, setNewMentor] = useState<Partial<FemaleMentor>>({
    name: '',
    country: 'España',
    flag: '🇪🇸',
    club: '',
    position: 'Mediocentro / MC',
    OVR: 88,
    photoUrl: 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=800',
    quote: 'El trabajo diario y la convicción táctica marcan la diferencia.',
    specialty: 'Control Táctico y Visión de Juego',
    height: '1.70 m',
    weight: '62 kg',
    preferredFoot: 'Derecha',
    highlights: ['Especialista de Equipo', 'Liderazgo en el Campo']
  });

  const saveMentorsToStorage = (updatedList: FemaleMentor[]) => {
    setMentorsList(updatedList);
    try {
      localStorage.setItem('APEX_FEMME_MENTORS', JSON.stringify(updatedList));
    } catch (e) {
      console.error('Error saving mentors', e);
    }
  };

  const filteredMentors = mentorsList.filter((m) => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'midfield') return m.position.includes('MC') || m.position.includes('MCO') || m.position.includes('Volante');
    if (selectedCategory === 'attack') return m.position.includes('ST') || m.position.includes('LW') || m.position.includes('RW') || m.position.includes('SS') || m.position.includes('Delantera') || m.position.includes('Extrema');
    if (selectedCategory === 'defense') return m.position.includes('CB') || m.position.includes('LB') || m.position.includes('RB') || m.position.includes('Defensa') || m.position.includes('Lateral');
    if (selectedCategory === 'gk') return m.position.includes('GK') || m.position.includes('Portera');
    if (selectedCategory === 'custom') return m.isCustom;
    return true;
  });

  const activeMentor = mentorsList.find((m) => m.id === playerProfile.mentorId) || mentorsList[0];

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          setNewMentor(prev => ({ ...prev, photoUrl: reader.result as string }));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditMentorPhoto = (mentorId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          const updated = mentorsList.map(m => m.id === mentorId ? { ...m, photoUrl: reader.result as string } : m);
          saveMentorsToStorage(updated);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMentor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMentor.name || !newMentor.club) {
      alert('Por favor, ingresa al menos el Nombre y Club de la referente.');
      return;
    }

    const created: FemaleMentor = {
      id: `mentor-custom-${Date.now()}`,
      name: newMentor.name || 'Referente Crack',
      country: newMentor.country || 'España',
      flag: newMentor.flag || '🇪🇸',
      club: newMentor.club || 'Club Pro',
      position: newMentor.position || 'Mediocentro / MC',
      OVR: newMentor.OVR || 88,
      photoUrl: newMentor.photoUrl || 'https://images.unsplash.com/photo-1543326727-cf6c39e8f84c?auto=format&fit=crop&q=80&w=800',
      quote: newMentor.quote || 'El esfuerzo de hoy determina la victoria de mañana.',
      specialty: newMentor.specialty || 'Visión Táctica y Liderazgo',
      highlights: newMentor.highlights || ['Referente Creada', 'Carta de Élite'],
      height: newMentor.height || '1.70 m',
      weight: newMentor.weight || '62 kg',
      preferredFoot: newMentor.preferredFoot || 'Derecha',
      isCustom: true
    };

    const updated = [created, ...mentorsList];
    saveMentorsToStorage(updated);
    setIsModalOpen(false);
    onSelectMentor(created.id);
  };

  const handleExportMentors = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mentorsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `referentes_femeninas_apex_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportMentorsFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target?.result as string);
          if (Array.isArray(imported)) {
            saveMentorsToStorage([...imported, ...mentorsList]);
            alert(`¡Se importaron ${imported.length} referentes exitosamente!`);
          } else if (imported.name && imported.OVR) {
            saveMentorsToStorage([imported, ...mentorsList]);
            alert(`¡Referente ${imported.name} importada con éxito!`);
          }
        } catch (err) {
          alert('El archivo JSON no tiene un formato válido de referentes.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-32 animate-fade-in pt-2">
      
      {/* Sub-Navigation Controls */}
      <nav className="glass-card p-1.5 rounded-2xl flex items-center gap-2 border border-[var(--border-card)]">
        <button
          onClick={() => setActiveSubTab('health')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'health'
              ? 'theme-accent-bg theme-accent-glow text-black'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <HeartPulse className="w-4 h-4 text-rose-400" />
          Salud Femenina & Fisiología
        </button>

        <button
          onClick={() => setActiveSubTab('mentors')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 ${
            activeSubTab === 'mentors'
              ? 'theme-accent-bg theme-accent-glow text-black'
              : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
          }`}
        >
          <Star className="w-4 h-4 text-amber-400" />
          Referentes & Leyendas
        </button>
      </nav>

      {/* Sub-Tab 1: Salud Femenina & Fisiología */}
      {activeSubTab === 'health' && (
        <div className="space-y-6 animate-fade-in">
          <section className="glass-card p-6 rounded-3xl border border-[var(--accent-color)]/40 relative overflow-hidden space-y-4">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="text-[10px] font-mono font-bold theme-accent-text uppercase tracking-widest block mb-1">
                  CIENCIA DE RENDIMIENTO FEMENINO APEX
                </span>
                <h2 className="font-extrabold text-2xl text-[var(--text-main)]">
                  Sincronización por Fase Menstrual
                </h2>
                <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xl">
                  Adapta la intensidad de tus cargas de gimnasio y campo según tus variaciones hormonales fisiológicas para maximizar hipertrofia y prevenir fatiga del SNC.
                </p>
              </div>
              <div className="bg-rose-500/20 text-rose-400 border border-rose-500/30 p-3 rounded-2xl flex items-center gap-2 font-mono font-bold text-xs shrink-0">
                <HeartPulse className="w-5 h-5 animate-pulse" />
                <span>Salud Óptima</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              {CYCLE_PHASES.map((cp, idx) => (
                <div key={idx} className={`p-4 rounded-2xl border ${cp.color} space-y-2 bg-[var(--bg-input)]`}>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-extrabold flex items-center gap-2">
                      <span className="text-base">{cp.icon}</span> {cp.phase}
                    </span>
                    <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 uppercase">
                      {cp.intensity}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    {cp.desc}
                  </p>
                  <div className="space-y-1 pt-1 border-t border-[var(--border-subtle)]">
                    <p className="text-[10px] font-bold text-[var(--text-main)] uppercase tracking-wider">
                      Foco de Entrenamiento:
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {cp.trainingFocus.map((tf, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-0.5 rounded bg-[var(--bg-card-solid)] text-[var(--text-main)] border border-[var(--border-subtle)]">
                          • {tf}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="glass-card p-6 rounded-3xl border border-[var(--border-card)] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-lg text-[var(--text-main)]">
                    Protocolo de Prevención LCA (Ligamento Cruzado Anterior)
                  </h3>
                  <p className="text-xs text-[var(--text-muted)]">
                    Ejercicios biomecánicos obligatorios para futbolistas para reforzar isquiotibiales y cadera.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ACL_PREVENTION_DRILLS.map((drill, idx) => (
                <div key={idx} className="bg-[var(--bg-input)] p-4 rounded-2xl border border-[var(--border-subtle)] space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold theme-accent-text uppercase font-mono">{drill.tag}</span>
                      <span className="text-[10px] font-bold text-[var(--text-muted)]">{drill.sets}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-[var(--text-main)]">{drill.title}</h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{drill.desc}</p>
                  </div>
                  <button 
                    onClick={() => onAskMentorQuestion('Coach LCA', `Quiero realizar la rutina de prevención de LCA: ${drill.title}`)}
                    className="w-full mt-2 py-1.5 px-3 rounded-xl bg-[var(--bg-card-solid)] hover:bg-[var(--bg-input)] text-xs font-bold theme-accent-text border border-[var(--border-subtle)] transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Ver Técnica en IA</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {/* Sub-Tab 2: Referentes & Leyendas */}
      {activeSubTab === 'mentors' && (
        <div className="space-y-6 animate-fade-in">
          {/* Active Mentor Featured Hero (FIFA Style) */}
          <section className="glass-card rounded-3xl p-6 bg-gradient-to-r from-[#171f33] via-[#131b2e] to-[#0f172a] border border-[#84cc16]/50 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#84cc16]/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
              <div className="relative shrink-0">
                <div className="w-32 h-44 rounded-2xl p-1 bg-gradient-to-b from-[#eab308] via-[#84cc16] to-[#131b2e] border-2 border-[#eab308] shadow-2xl flex flex-col items-center justify-between text-center relative overflow-hidden group">
                  <div className="absolute top-2 left-2 text-left">
                    <span className="font-mono font-extrabold text-xl text-white block leading-none">{activeMentor.OVR}</span>
                    <span className="font-mono text-[9px] font-bold text-[#eab308] uppercase block">{activeMentor.position.split('/')[1] || activeMentor.position.substring(0,3)}</span>
                    <span className="text-xs">{activeMentor.flag}</span>
                  </div>

                  <img
                    src={activeMentor.photoUrl}
                    alt={activeMentor.name}
                    className="w-full h-28 object-cover rounded-xl mt-1 shadow-md"
                  />

                  <div className="bg-[#0b1326]/90 w-full rounded-b-xl py-1 px-1 border-t border-[#eab308]/40">
                    <p className="font-extrabold text-[11px] text-white truncate">{activeMentor.name.split(' ')[0]}</p>
                    <div className="flex justify-center gap-1 text-[8px] font-mono text-[#c1cab0]">
                      <span>{activeMentor.height || '1.70m'}</span> • <span>{activeMentor.weight || '62kg'}</span>
                    </div>
                  </div>
                </div>

                <label className="absolute -bottom-2 -right-2 bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] p-2 rounded-full shadow-lg active:scale-90 cursor-pointer transition-transform" title="Cambiar Foto de Referente">
                  <Camera className="w-3.5 h-3.5" />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleEditMentorPhoto(activeMentor.id, e)}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-[#84cc16]/20 text-[#9ee939] px-2.5 py-0.5 rounded border border-[#84cc16]/40 flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> TU REFERENTE INSPIRACIONAL
                  </span>
                  <span className="text-xs font-bold text-[#7bd0ff]">
                    {activeMentor.flag} {activeMentor.country} • {activeMentor.club}
                  </span>
                </div>

                <h2 className="font-extrabold text-2xl md:text-3xl text-white">
                  {activeMentor.name}
                </h2>

                <div className="flex flex-wrap justify-center md:justify-start gap-3 text-xs font-mono text-[#dae2fd] bg-[#131b2e] px-3 py-1.5 rounded-xl border border-[#424936]/40 w-fit">
                  <span><b>Pos:</b> {activeMentor.position}</span>
                  <span>•</span>
                  <span><b>Alt:</b> {activeMentor.height || '1.70 m'}</span>
                  <span>•</span>
                  <span><b>Peso:</b> {activeMentor.weight || '62 kg'}</span>
                  <span>•</span>
                  <span><b>Pie:</b> {activeMentor.preferredFoot || 'Derecha'}</span>
                </div>

                <p className="text-xs text-[#c1cab0] italic leading-relaxed flex items-center justify-center md:justify-start gap-1 pt-1">
                  <Quote className="w-4 h-4 text-[#84cc16] shrink-0 inline" />
                  <span>"{activeMentor.quote}"</span>
                </p>

                <div className="pt-2 flex flex-wrap gap-2 justify-center md:justify-start">
                  <button
                    onClick={() => onAskMentorQuestion(activeMentor.name, activeMentor.specialty)}
                    className="bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] px-4 py-2 rounded-xl font-extrabold text-xs shadow-lg shadow-[#84cc16]/25 active:scale-95 transition-all flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Consultar a {activeMentor.name.split(' ')[0]}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Controls Bar: Category Filter & Create/Export/Import Mentors */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-[var(--bg-input)] p-3.5 rounded-2xl border border-[var(--border-subtle)]">
            <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'midfield', label: 'Centrocampistas' },
                { id: 'attack', label: 'Delanteras' },
                { id: 'defense', label: 'Defensas' },
                { id: 'gk', label: 'Porteras' },
                { id: 'custom', label: 'Mis Referentes' },
              ].map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                    selectedCategory === cat.id
                      ? 'theme-accent-bg text-black font-extrabold'
                      : 'bg-[var(--bg-card-solid)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-emerald-500 hover:bg-emerald-400 text-black px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1 active:scale-95 transition-transform"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva</span>
              </button>

              <button
                onClick={handleExportMentors}
                className="bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)] p-2 rounded-xl text-xs font-bold transition-colors"
                title="Exportar Referentes (JSON)"
              >
                <Download className="w-4 h-4" />
              </button>

              <label className="bg-[var(--bg-card-solid)] border border-[var(--border-subtle)] text-[var(--text-main)] hover:border-[var(--accent-color)] p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer" title="Importar Referentes (JSON)">
                <Upload className="w-4 h-4" />
                <input type="file" accept=".json" onChange={handleImportMentorsFile} className="hidden" />
              </label>
            </div>
          </div>

          {/* Mentors Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredMentors.map((mentor) => {
              const isSelected = playerProfile.mentorId === mentor.id;

              return (
                <div
                  key={mentor.id}
                  className={`glass-card p-5 rounded-2xl transition-all relative overflow-hidden flex flex-col justify-between border ${
                    isSelected
                      ? 'border-[#84cc16] bg-[#84cc16]/10 shadow-lg shadow-[#84cc16]/15'
                      : 'border-[#424936]/60 hover:border-[#7bd0ff]'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="relative shrink-0 group">
                      <img
                        src={mentor.photoUrl}
                        alt={mentor.name}
                        className="w-20 h-24 rounded-xl object-cover border border-[#eab308]/50 shadow-md"
                      />
                      <label className="absolute bottom-1 right-1 bg-black/80 hover:bg-[#84cc16] hover:text-black text-white p-1 rounded-md cursor-pointer transition-colors" title="Cambiar foto de referente">
                        <Camera className="w-3 h-3" />
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleEditMentorPhoto(mentor.id, e)}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-base text-white flex items-center gap-1.5">
                            {mentor.name}
                            <span className="text-xs">{mentor.flag}</span>
                          </h4>
                          <p className="text-[11px] text-[#7bd0ff] font-bold">
                            {mentor.club} • {mentor.position}
                          </p>
                        </div>
                        <span className="font-mono text-sm font-black text-[#eab308] bg-[#eab308]/10 px-2 py-0.5 rounded border border-[#eab308]/30">
                          {mentor.OVR} OVR
                        </span>
                      </div>

                      <p className="text-[11px] text-[#c1cab0] italic line-clamp-2 mt-1">
                        "{mentor.quote}"
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#424936]/40">
                    <span className="text-[10px] font-mono text-[#94a3b8]">
                      Especialidad: {mentor.specialty}
                    </span>

                    <button
                      onClick={() => onSelectMentor(mentor.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#84cc16] text-[#102000] font-black'
                          : 'bg-[#131b2e] border border-[#424936] text-white hover:border-[#84cc16]'
                      }`}
                    >
                      {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                      <span>{isSelected ? 'Seleccionada' : 'Elegir Referente'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Create New Mentor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-[#84cc16]/50 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-[#424936] pb-3">
              <h3 className="font-extrabold text-lg text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#84cc16]" />
                Crear Ficha de Referente Personalizada
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-[#c1cab0] hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMentor} className="space-y-3 text-xs">
              <div className="space-y-3">
                <div>
                  <label className="font-bold text-[#c1cab0] block mb-1">Nombre Completo de la Jugadora *</label>
                  <input
                    type="text"
                    placeholder="Ej. Alexia Putellas"
                    value={newMentor.name}
                    onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                    className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-white focus:border-[#84cc16] outline-none"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#c1cab0] block mb-1">Club o Selección *</label>
                    <input
                      type="text"
                      placeholder="Ej. FC Barcelona / España"
                      value={newMentor.club}
                      onChange={(e) => setNewMentor({ ...newMentor, club: e.target.value })}
                      className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-white focus:border-[#84cc16] outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#c1cab0] block mb-1">País</label>
                    <select
                      value={newMentor.country}
                      onChange={(e) => {
                        const selectedC = COUNTRIES_LIST.find(c => c.name === e.target.value);
                        setNewMentor({ 
                          ...newMentor, 
                          country: e.target.value,
                          flag: selectedC ? selectedC.flag : '🌐'
                        });
                      }}
                      className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-white focus:border-[#84cc16] outline-none"
                    >
                      {COUNTRIES_LIST.map((c) => (
                        <option key={c.code} value={c.name}>
                          {c.flag} {c.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#c1cab0] block mb-1">Posición Táctica</label>
                    <select
                      value={newMentor.position}
                      onChange={(e) => setNewMentor({ ...newMentor, position: e.target.value })}
                      className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-white focus:border-[#84cc16] outline-none"
                    >
                      {POSITIONS_LIST.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-[#c1cab0] block mb-1">Puntuación OVR ({newMentor.OVR})</label>
                    <input
                      type="range"
                      min="60"
                      max="99"
                      value={newMentor.OVR}
                      onChange={(e) => setNewMentor({ ...newMentor, OVR: parseInt(e.target.value) })}
                      className="w-full accent-[#84cc16]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="font-bold text-[#c1cab0] block mb-1">Altura</label>
                    <input
                      type="text"
                      placeholder="1.72 m"
                      value={newMentor.height}
                      onChange={(e) => setNewMentor({ ...newMentor, height: e.target.value })}
                      className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-2 py-1.5 text-center text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#c1cab0] block mb-1">Peso</label>
                    <input
                      type="text"
                      placeholder="64 kg"
                      value={newMentor.weight}
                      onChange={(e) => setNewMentor({ ...newMentor, weight: e.target.value })}
                      className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-2 py-1.5 text-center text-white outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#c1cab0] block mb-1">Pierna Hábil</label>
                    <select
                      value={newMentor.preferredFoot}
                      onChange={(e) => setNewMentor({ ...newMentor, preferredFoot: e.target.value })}
                      className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-2 py-1.5 text-white outline-none"
                    >
                      <option value="Derecha">Derecha</option>
                      <option value="Izquierda">Izquierda</option>
                      <option value="Ambidiestra">Ambidiestra</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#c1cab0] block mb-1">Foto de la Jugadora (Subir / URL)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="https://..."
                      value={newMentor.photoUrl}
                      onChange={(e) => setNewMentor({ ...newMentor, photoUrl: e.target.value })}
                      className="flex-1 bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-1.5 text-white outline-none"
                    />
                    <label className="bg-[#84cc16] text-[#102000] px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                    </label>
                  </div>
                </div>

                <div>
                  <label className="font-bold text-[#c1cab0] block mb-1">Frase / Filosofía Táctica</label>
                  <input
                    type="text"
                    placeholder="Consejo inspirador para tus partidos"
                    value={newMentor.quote}
                    onChange={(e) => setNewMentor({ ...newMentor, quote: e.target.value })}
                    className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-white focus:border-[#84cc16] outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] py-3 rounded-xl font-extrabold text-xs shadow-lg shadow-[#84cc16]/25 active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Guardar y Seleccionar Carta de Referente
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
