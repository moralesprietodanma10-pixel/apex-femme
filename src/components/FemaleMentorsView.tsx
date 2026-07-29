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
  FileJson
} from 'lucide-react';

interface FemaleMentorsViewProps {
  playerProfile: PlayerProfile;
  onSelectMentor: (mentorId: string) => void;
  onAskMentorQuestion: (mentorName: string, mentorRole: string) => void;
}

export const FemaleMentorsView: React.FC<FemaleMentorsViewProps> = ({
  playerProfile,
  onSelectMentor,
  onAskMentorQuestion,
}) => {
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

  // Filter Mentors
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

  // Photo Upload Handler for New Mentor Form
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

  // Photo Upload Handler for existing mentor
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

  // Create Mentor
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

  // Export Mentors as JSON
  const handleExportMentors = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(mentorsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `referentes_femeninas_apex_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import Mentors from JSON
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
    <div className="space-y-6 max-w-4xl mx-auto pb-32 animate-fade-in">
      {/* Active Mentor Featured Hero (FIFA Style) */}
      <section className="glass-card rounded-3xl p-6 bg-gradient-to-r from-[#171f33] via-[#131b2e] to-[#0f172a] border border-[#84cc16]/50 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#84cc16]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-center gap-6 relative z-10">
          {/* Active Card FIFA Badge */}
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

            {/* FIFA Technical Specs Bar */}
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
              {activeMentor.highlights.map((h, i) => (
                <span
                  key={i}
                  className="text-[11px] font-bold bg-[#131b2e] border border-[#424936] text-[#dae2fd] px-2.5 py-1 rounded-lg"
                >
                  🏆 {h}
                </span>
              ))}
            </div>

            <div className="pt-3">
              <button
                onClick={() => onAskMentorQuestion(activeMentor.name, activeMentor.position)}
                className="bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] px-4 py-2 rounded-xl font-bold text-xs shadow-lg shadow-[#84cc16]/25 active:scale-95 transition-all inline-flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                Pedir Consejo Táctico Estilo {activeMentor.name.split(' ')[0]}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Action Header: Create & Import/Export */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[#131b2e] p-4 rounded-2xl border border-[#424936]/60">
        <div>
          <h3 className="font-extrabold text-base text-[#dae2fd] flex items-center gap-2">
            <Award className="w-5 h-5 text-[#84cc16]" /> GALERÍA DE REFERENTES FEMENINAS
          </h3>
          <p className="text-xs text-[#c1cab0]">Mediocampistas, Delanteras, Defensas, Porteras y Tus Creadas</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#84cc16] hover:bg-[#9ee939] text-[#102000] px-3 py-2 rounded-xl font-bold text-xs shadow flex items-center gap-1.5 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" /> Agregar Referente
          </button>

          <label className="bg-[#171f33] hover:bg-[#1e293b] border border-[#7bd0ff]/40 text-[#7bd0ff] px-3 py-2 rounded-xl font-bold text-xs shadow flex items-center gap-1.5 cursor-pointer active:scale-95 transition-all">
            <Upload className="w-3.5 h-3.5" /> Importar JSON
            <input
              type="file"
              accept=".json"
              onChange={handleImportMentorsFile}
              className="hidden"
            />
          </label>

          <button
            onClick={handleExportMentors}
            className="bg-[#171f33] hover:bg-[#1e293b] border border-[#424936] text-[#dae2fd] px-3 py-2 rounded-xl font-bold text-xs shadow flex items-center gap-1.5 active:scale-95 transition-all"
            title="Exportar referentes en formato JSON"
          >
            <Download className="w-3.5 h-3.5" /> Exportar
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1.5 overflow-x-auto pb-2 no-scrollbar">
        {[
          { id: 'all', label: 'Todas' },
          { id: 'midfield', label: 'Mediocampo' },
          { id: 'attack', label: 'Ataque' },
          { id: 'defense', label: 'Defensa' },
          { id: 'gk', label: 'Portería' },
          { id: 'custom', label: 'Mis Creadas' },
        ].map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              selectedCategory === cat.id
                ? 'bg-[#84cc16] text-[#102000] shadow-md'
                : 'bg-[#131b2e] text-[#c1cab0] border border-[#424936]/60 hover:border-[#84cc16]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Mentor Cards Grid (FIFA Style Layout) */}
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
                {/* Mentor Photo Container with Upload Trigger */}
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
                        {mentor.position} • {mentor.club}
                      </p>
                    </div>
                    <span className="font-mono text-xs font-extrabold text-[#9ee939] bg-[#84cc16]/20 px-2 py-0.5 rounded border border-[#84cc16]/40">
                      {mentor.OVR} OVR
                    </span>
                  </div>

                  {/* FIFA Specs Mini Bar */}
                  <div className="flex items-center gap-2 text-[10px] font-mono text-[#c1cab0]">
                    <span>Alt: {mentor.height || '1.70m'}</span>
                    <span>•</span>
                    <span>Peso: {mentor.weight || '62kg'}</span>
                    <span>•</span>
                    <span>{mentor.preferredFoot || 'Derecha'}</span>
                  </div>

                  <p className="text-[11px] text-[#c1cab0] line-clamp-2 italic pt-1">
                    "{mentor.quote}"
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#424936]/40 flex items-center justify-between">
                <span className="text-[10px] text-[#9ee939] font-bold bg-[#84cc16]/10 px-2 py-0.5 rounded truncate max-w-[200px]">
                  ✨ {mentor.specialty}
                </span>

                {isSelected ? (
                  <span className="text-xs font-bold text-[#84cc16] flex items-center gap-1 shrink-0">
                    <Check className="w-4 h-4" /> Seleccionada
                  </span>
                ) : (
                  <button
                    onClick={() => onSelectMentor(mentor.id)}
                    className="bg-[#2d3449] hover:bg-[#84cc16] hover:text-[#102000] text-[#dae2fd] px-3 py-1.5 rounded-xl font-bold text-xs transition-all active:scale-95 shrink-0"
                  >
                    Elegir Referente
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* CREATE NEW REFERENTE MODAL (FIFA CARD STYLE) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 border border-[#84cc16]/50 space-y-5 my-8 shadow-2xl relative">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-4 right-4 text-[#c1cab0] hover:text-white bg-[#131b2e] p-2 rounded-full border border-[#424936]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#84cc16]" />
              <h3 className="font-extrabold text-xl text-white">
                Crear Nueva Carta de Referente FIFA
              </h3>
            </div>

            <form onSubmit={handleCreateMentor} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* FIFA Card Live Preview */}
              <div className="flex flex-col items-center justify-center bg-[#0b1326] p-4 rounded-2xl border border-[#424936]/60">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[#84cc16] mb-3">Vista Previa Carta de FIFA</p>
                <div className="w-44 h-64 rounded-2xl p-2 bg-gradient-to-b from-[#eab308] via-[#84cc16] to-[#131b2e] border-2 border-[#eab308] shadow-2xl flex flex-col items-center justify-between text-center relative overflow-hidden">
                  <div className="absolute top-2 left-2 text-left">
                    <span className="font-mono font-extrabold text-2xl text-white block leading-none">{newMentor.OVR}</span>
                    <span className="font-mono text-[10px] font-bold text-[#eab308] uppercase block">{newMentor.position?.split('/')[1] || 'MC'}</span>
                    <span className="text-sm">{newMentor.flag}</span>
                  </div>

                  <img
                    src={newMentor.photoUrl}
                    alt={newMentor.name || 'Preview'}
                    className="w-full h-36 object-cover rounded-xl mt-1 shadow"
                  />

                  <div className="bg-[#0b1326]/90 w-full rounded-b-xl py-1.5 px-1 border-t border-[#eab308]/40">
                    <p className="font-extrabold text-xs text-white truncate">{newMentor.name || 'Nombre Jugadora'}</p>
                    <p className="text-[9px] text-[#7bd0ff] font-bold truncate">{newMentor.club || 'Club Pro'}</p>
                    <div className="flex justify-center gap-1 text-[8px] font-mono text-[#c1cab0] mt-0.5">
                      <span>{newMentor.height}</span> • <span>{newMentor.weight}</span> • <span>{newMentor.preferredFoot}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Fields */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-[#c1cab0] block mb-1">Nombre Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Wendie Renard / Jenni Hermoso"
                    value={newMentor.name}
                    onChange={(e) => setNewMentor({ ...newMentor, name: e.target.value })}
                    className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-white focus:border-[#84cc16] outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-bold text-[#c1cab0] block mb-1">Club / Equipo</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. FC Barcelona / Lyon"
                      value={newMentor.club}
                      onChange={(e) => setNewMentor({ ...newMentor, club: e.target.value })}
                      className="w-full bg-[#131b2e] border border-[#424936] rounded-xl px-3 py-2 text-white focus:border-[#84cc16] outline-none"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-[#c1cab0] block mb-1">País / Nacionalidad</label>
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

                {/* FIFA Physical Specs */}
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

                {/* Photo Upload or URL */}
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
