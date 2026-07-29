import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Plus, Trash2, Disc, X, ChevronUp, ListMusic } from 'lucide-react';
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
  const [isMinimized, setIsMinimized] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [progress, setProgress] = useState(0);   // 0–1
  const [duration, setDuration] = useState(0);   // seconds
  const [currentTime, setCurrentTime] = useState(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('apex_music_playlist', JSON.stringify(playlist));
  }, [playlist]);

  // Sync volume to audio element
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  // Auto-play when index changes
  useEffect(() => {
    if (audioRef.current && isPlaying) {
      audioRef.current.load();
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentIdx]);

  // ESC to close
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
    if (isCurrentTrack) setCurrentIdx(0);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || !progressRef.current) return;
    const rect = progressRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * duration;
    setProgress(pct);
  };

  const formatTime = (sec: number) => {
    if (isNaN(sec)) return '0:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${String(s).padStart(2, '0')}`;
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={currentTrack?.url}
        onEnded={handleNext}
        onTimeUpdate={e => {
          const el = e.currentTarget;
          setCurrentTime(el.currentTime);
          setDuration(el.duration || 0);
          setProgress(el.duration ? el.currentTime / el.duration : 0);
        }}
        onLoadedMetadata={e => setDuration(e.currentTarget.duration)}
        volume={isMuted ? 0 : volume}
      />

      {/* ── Floating Widget ── */}
      <div className="fixed bottom-20 right-4 z-40">
        {isMinimized ? (
          /* Floating icon only */
          <button
            onClick={() => { sounds.playClick(); setIsMinimized(false); }}
            className="w-11 h-11 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 relative"
            style={{ background: 'rgba(11,19,38,0.92)', border: '1.5px solid var(--accent-color)', boxShadow: '0 0 18px var(--accent-glow)' }}
            title="Abrir Reproductor"
          >
            <Disc className={`w-5 h-5 text-[var(--accent-color)] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '4s' }} />
            {isPlaying && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[var(--accent-color)] animate-ping" />}
          </button>
        ) : (
          /* Expanded pill widget */
          <div
            className="glass-panel border border-[var(--border-card)] rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl transition-all duration-300"
            style={{ minWidth: '200px' }}
          >
            {/* Track info row */}
            <div
              className="flex items-center gap-2 px-3 pt-2.5 pb-1 cursor-pointer"
              onClick={() => { sounds.playClick(); setIsOpen(true); }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center theme-accent-bg shrink-0">
                <Disc className={`w-4 h-4 text-[#0b1326] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-[var(--text-main)] truncate leading-tight">{currentTrack.title}</p>
                <p className="text-[9px] text-[var(--text-muted)] truncate">{currentTrack.artist}</p>
              </div>
            </div>

            {/* Progress bar */}
            <div
              ref={progressRef}
              className="mx-3 mb-1 h-1 rounded-full bg-white/10 cursor-pointer overflow-hidden"
              onClick={handleProgressClick}
            >
              <div
                className="h-full rounded-full theme-accent-bg transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <div className="flex justify-between px-3 mb-1.5">
              <span className="text-[8px] font-mono text-[var(--text-muted)]">{formatTime(currentTime)}</span>
              <span className="text-[8px] font-mono text-[var(--text-muted)]">{formatTime(duration)}</span>
            </div>

            {/* Controls row */}
            <div className="flex items-center justify-between px-3 pb-2.5">
              <button onClick={handlePrev} className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors">
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={togglePlay}
                className="w-7 h-7 rounded-full theme-accent-bg flex items-center justify-center active:scale-95 transition-transform"
              >
                {isPlaying ? <Pause className="w-3.5 h-3.5 text-[#0b1326]" /> : <Play className="w-3.5 h-3.5 text-[#0b1326] ml-0.5" />}
              </button>

              <button onClick={handleNext} className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors">
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => { sounds.playClick(); setIsOpen(true); }}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors"
                title="Playlist"
              >
                <ListMusic className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => { sounds.playClick(); setIsMinimized(true); }}
                className="p-1 text-[var(--text-muted)] hover:text-white transition-colors"
                title="Minimizar"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Full Music Drawer Modal ── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-md animate-welcome-fade-in">
          <div className="glass-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl border border-[var(--border-card)] shadow-2xl overflow-hidden">
            
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2 theme-accent-text">
                <Music className="w-4 h-4" />
                <h3 className="font-black text-base uppercase tracking-wider text-[var(--text-main)]">Reproductor &amp; Playlist</h3>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[var(--text-muted)] hover:text-white font-bold p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Now Playing */}
            <div className="p-5 space-y-3 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl theme-accent-bg flex items-center justify-center shrink-0 theme-accent-glow">
                  <Disc className={`w-7 h-7 text-[#0b1326] ${isPlaying ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-extrabold text-sm text-[var(--text-main)] truncate">{currentTrack.title}</h4>
                  <p className="text-xs text-[var(--text-muted)] truncate">{currentTrack.artist}</p>
                </div>
              </div>

              {/* Progress bar clickable */}
              <div>
                <div
                  ref={progressRef}
                  className="w-full h-2 rounded-full bg-white/10 cursor-pointer overflow-hidden"
                  onClick={handleProgressClick}
                >
                  <div
                    className="h-full rounded-full theme-accent-bg transition-all duration-300"
                    style={{ width: `${progress * 100}%` }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">{formatTime(currentTime)}</span>
                  <span className="text-[9px] font-mono text-[var(--text-muted)]">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Playback controls */}
              <div className="flex items-center justify-center gap-4">
                <button onClick={handlePrev} className="text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors p-2">
                  <SkipBack className="w-5 h-5" />
                </button>
                <button
                  onClick={togglePlay}
                  className="w-12 h-12 rounded-full theme-accent-bg flex items-center justify-center theme-accent-glow active:scale-95 transition-transform"
                >
                  {isPlaying ? <Pause className="w-5 h-5 text-[#0b1326]" /> : <Play className="w-5 h-5 text-[#0b1326] ml-0.5" />}
                </button>
                <button onClick={handleNext} className="text-[var(--text-muted)] hover:text-[var(--accent-color)] transition-colors p-2">
                  <SkipForward className="w-5 h-5" />
                </button>
              </div>

              {/* Volume */}
              <div className="flex items-center gap-3">
                <button onClick={() => handleVolumeChange(isMuted || volume === 0 ? 0.5 : 0)} className="text-[var(--text-muted)]">
                  {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </button>
                <input
                  type="range"
                  min="0" max="1" step="0.02"
                  value={isMuted ? 0 : volume}
                  onChange={e => handleVolumeChange(parseFloat(e.target.value))}
                  className="flex-1 accent-[var(--accent-color)] h-1"
                />
                <span className="text-[9px] font-mono text-[var(--text-muted)] w-8 text-right">
                  {Math.round((isMuted ? 0 : volume) * 100)}%
                </span>
              </div>
            </div>

            {/* Playlist */}
            <div className="px-5 py-3 max-h-52 overflow-y-auto">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                Lista — {playlist.length} canciones
              </p>
              {playlist.map((track, i) => (
                <div
                  key={track.id}
                  onClick={() => { setCurrentIdx(i); setIsPlaying(true); sounds.playClick(); }}
                  className={`flex items-center justify-between py-2 px-2 rounded-xl cursor-pointer transition-all mb-0.5 ${
                    i === currentIdx
                      ? 'bg-[var(--accent-color)]/15 border border-[var(--accent-color)]/40'
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-[9px] font-bold theme-accent-text w-4 shrink-0">{i + 1}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[var(--text-main)] truncate">{track.title}</p>
                      <p className="text-[9px] text-[var(--text-muted)] truncate">{track.artist}</p>
                    </div>
                  </div>
                  {track.isCustom && (
                    <button
                      onClick={e => { e.stopPropagation(); handleDeleteTrack(track.id); sounds.playClick(); }}
                      className="p-1 text-red-400/70 hover:text-red-400 shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Import section */}
            <div className="px-5 pt-2 pb-5 border-t border-[var(--border-subtle)] space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--text-muted)]">Importar Música</p>
              
              <label className="w-full py-2.5 rounded-xl border border-dashed border-[var(--accent-color)]/50 theme-accent-text text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-[var(--accent-color)]/10 transition-colors">
                <Plus className="w-4 h-4" />
                Subir MP3 / WAV / OGG desde tu dispositivo
                <input type="file" accept="audio/*" multiple onChange={handleFileUpload} className="hidden" />
              </label>

              <form onSubmit={handleAddLink} className="flex gap-2">
                <input
                  type="text"
                  placeholder="URL de audio directo (.mp3)"
                  value={newUrl}
                  onChange={e => setNewUrl(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl text-xs bg-[var(--bg-input)] border border-[var(--border-subtle)] text-[var(--text-main)] outline-none focus:border-[var(--accent-color)] transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded-xl theme-accent-bg text-[#0b1326] font-bold text-xs shrink-0"
                >
                  Añadir
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
