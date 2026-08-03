import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Plus, Trash2, Disc, X, ChevronUp, Move } from 'lucide-react';
import { sounds } from '../services/soundEffects';

interface Track {
  id: string;
  title: string;
  artist: string;
  url: string;
  isCustom?: boolean;
}

const BUILT_IN_TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Matchday Energy & Warmup',
    artist: 'APEX Sound System',
    url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a7051b.mp3?filename=energetic-hip-hop-110034.mp3',
  },
  {
    id: 'track-2',
    title: 'High Tempo Gym Sprints',
    artist: 'APEX Synthwave',
    url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-2099-10701.mp3',
  },
  {
    id: 'track-3',
    title: 'Deep Focus & Tactical',
    artist: 'APEX Chill Beats',
    url: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=lofi-study-112191.mp3',
  },
];

export const BackgroundMusicPlayer: React.FC = () => {
  const [playlist, setPlaylist] = useState<Track[]>(() => {
    try {
      const saved = localStorage.getItem('apex_music_playlist');
      return saved ? JSON.parse(saved) : BUILT_IN_TRACKS;
    } catch {
      return BUILT_IN_TRACKS;
    }
  });
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.45);
  const [isMuted, setIsMuted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);

  // ─── DRAGGABLE POSITION STATE ───────────────────────────────────────
  const [pos, setPos] = useState<{ x: number; y: number }>(() => {
    try {
      const savedPos = localStorage.getItem('apex_music_player_pos');
      if (savedPos) return JSON.parse(savedPos);
    } catch (e) {}
    // Default position at bottom right
    return { x: window.innerWidth - 340, y: window.innerHeight - 180 };
  });

  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; posX: number; posY: number }>({ x: 0, y: 0, posX: 0, posY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag from header or drag handle, not interactive controls
    if ((e.target as HTMLElement).closest('button, input, a')) return;
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      posX: pos.x,
      posY: pos.y,
    };
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if ((e.target as HTMLElement).closest('button, input, a')) return;
    if (e.touches.length === 1) {
      setIsDragging(true);
      dragStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
        posX: pos.x,
        posY: pos.y,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - dragStartRef.current.x;
      const dy = e.clientY - dragStartRef.current.y;
      const newX = Math.max(10, Math.min(window.innerWidth - 100, dragStartRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 100, dragStartRef.current.posY + dy));
      setPos({ x: newX, y: newY });
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - dragStartRef.current.x;
      const dy = e.touches[0].clientY - dragStartRef.current.y;
      const newX = Math.max(10, Math.min(window.innerWidth - 100, dragStartRef.current.posX + dx));
      const newY = Math.max(10, Math.min(window.innerHeight - 100, dragStartRef.current.posY + dy));
      setPos({ x: newX, y: newY });
    };

    const handleMouseUp = () => {
      if (isDragging) {
        setIsDragging(false);
        try {
          localStorage.setItem('apex_music_player_pos', JSON.stringify(pos));
        } catch (e) {}
      }
    };

    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, pos]);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('apex_music_playlist', JSON.stringify(playlist));
  }, [playlist]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentIdx]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentTrack = playlist[currentIdx] || BUILT_IN_TRACKS[0];

  const togglePlay = () => {
    sounds.playClick();
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.warn('Audio play blocked', e));
    }
  };

  const handleNext = useCallback(() => {
    sounds.playClick();
    setCurrentIdx(i => (i + 1) % playlist.length);
  }, [playlist.length]);

  const handlePrev = () => {
    sounds.playClick();
    setCurrentIdx(i => (i - 1 + playlist.length) % playlist.length);
  };

  const handleVolumeChange = (v: number) => {
    setVolume(v);
    setIsMuted(v === 0);
    if (audioRef.current) audioRef.current.volume = v;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const fileArray: File[] = Array.from(files) as File[];
    const newTracks: Track[] = fileArray.map((file: File, idx: number) => ({
      id: `custom-${Date.now()}-${idx}`,
      title: file.name.replace(/\.[^/.]+$/, ''),
      artist: 'Archivo Local',
      url: URL.createObjectURL(file),
      isCustom: true,
    }));
    setPlaylist(prev => [...prev, ...newTracks]);
    sounds.playSuccess();
  };

  const handleAddLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;
    const track: Track = {
      id: `link-${Date.now()}`,
      title: newTitle.trim() || 'Enlace Personalizado',
      artist: newUrl.includes('spotify') ? 'Spotify' : newUrl.includes('youtube') ? 'YouTube' : 'Web Audio',
      url: newUrl.trim(),
      isCustom: true,
    };
    setPlaylist(prev => [...prev, track]);
    setNewTitle('');
    setNewUrl('');
    sounds.playSuccess();
  };

  const handleDeleteTrack = (id: string) => {
    const isCurrentTrack = playlist[currentIdx]?.id === id;
    setPlaylist(prev => prev.filter(t => t.id !== id));
    if (isCurrentTrack && playlist.length > 1) {
      setCurrentIdx(0);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const cur = audioRef.current.currentTime;
      const dur = audioRef.current.duration || 1;
      setCurrentTime(cur);
      setDuration(dur);
      setProgress(cur / dur);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || !audioRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const pct = Math.max(0, Math.min(1, clickX / rect.width));
    audioRef.current.currentTime = pct * (audioRef.current.duration || 0);
    setProgress(pct);
  };

  const formatTime = (s: number) => {
    if (isNaN(s) || s === 0) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec < 10 ? '0' : ''}${sec}`;
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack.url}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleNext}
        onError={() => console.warn('Audio source failed to load:', currentTrack.url)}
      />

      {/* DRAGGABLE FLOATING CONTAINER */}
      <div
        style={{
          position: 'fixed',
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          zIndex: 9999,
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        className="select-none transition-shadow"
      >
        {/* COLLAPSED WIDGET — ONLY FLOATING DRAGGABLE ICON */}
        {!isOpen && (
          <button
            onClick={() => { sounds.playClick(); setIsOpen(true); }}
            title="Abrir Reproductor de Música (Arrastra para mover)"
            aria-label="Abrir Reproductor de Música"
            className={`w-12 h-12 rounded-full glass-panel bg-black/90 border flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all group cursor-pointer relative ${
              isPlaying 
                ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.5)]' 
                : 'border-cyan-500/40 hover:border-cyan-400'
            }`}
          >
            <div className={`w-6 h-6 text-cyan-400 flex items-center justify-center ${isPlaying ? 'animate-spin-slow' : ''}`}>
              <Disc className="w-5 h-5" />
            </div>

            {/* Glowing active indicator dot when playing */}
            {isPlaying && (
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black animate-pulse" />
            )}
          </button>
        )}

        {/* FULL EXPANDED PLAYER WINDOW */}
        {isOpen && (
          <div className="w-80 sm:w-96 rounded-3xl glass-panel bg-black/90 border border-cyan-500/40 shadow-2xl space-y-3 p-4 animate-fade-in">
            {/* Header / Drag Handle */}
            <div className="flex justify-between items-center border-b border-white/10 pb-2.5 cursor-grab">
              <div className="flex items-center gap-2">
                <Move className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-cyan-400">
                  REPRODUCTOR APEX SOUNDS
                </span>
              </div>
              <button
                onClick={() => { sounds.playClick(); setIsOpen(false); }}
                className="text-[var(--text-muted)] hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Track Display */}
            <div className="p-3 rounded-2xl bg-black/60 border border-white/10 space-y-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center shrink-0 ${isPlaying ? 'animate-spin-slow' : ''}`}>
                  <Disc className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-extrabold text-xs text-white truncate">{currentTrack.title}</h4>
                  <p className="text-[10px] text-[var(--text-muted)] font-mono truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Progress Bar */}
              <div>
                <div
                  ref={progressRef}
                  className="w-full h-2 rounded-full bg-white/10 cursor-pointer overflow-hidden"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-200"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[9px] font-mono text-[var(--text-muted)]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback Controls */}
              <div className="flex items-center justify-center gap-4">
                <button onClick={handlePrev} className="text-[var(--text-muted)] hover:text-white p-1.5 cursor-pointer">
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl bg-cyan-500 text-black flex items-center justify-center shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
                </button>
                <button onClick={handleNext} className="text-[var(--text-muted)] hover:text-white p-1.5 cursor-pointer">
                  <SkipForward className="w-4 h-4" />
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-2 pt-1">
                <button onClick={() => handleVolumeChange(isMuted || volume === 0 ? 0.5 : 0)} className="text-[var(--text-muted)] cursor-pointer">
                  {isMuted || volume === 0 ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
                <input
                  type="range"
                  min="0" max="1" step="0.02"
                  value={isMuted ? 0 : volume}
                  onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 accent-cyan-400 h-1 cursor-pointer"
                />
              </div>
            </div>

            {/* Track List */}
            <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
              <span className="text-[9px] font-mono font-bold text-[var(--text-muted)] uppercase block">
                PLAYLIST ({playlist.length})
              </span>
              {playlist.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => { setCurrentIdx(i); setIsPlaying(true); sounds.playClick(); }}
                  className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                    i === currentIdx
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold'
                      : 'bg-black/40 text-[var(--text-muted)] border border-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{track.title}</span>
                  {track.isCustom && (
                    <button onClick={e => { e.stopPropagation(); handleDeleteTrack(track.id); }} className="text-red-400 p-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Custom Import */}
            <div className="pt-2 border-t border-white/10">
              <label className="w-full py-2 rounded-xl border border-dashed border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:bg-cyan-500/10 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Subir MP3 desde tu Dispositivo
                <input type="file" accept="audio/*" multiple onChange={handleFileUpload} className="hidden" />
              </label>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
