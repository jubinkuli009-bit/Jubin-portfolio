import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import type { SongTrack, MusicConfig } from '../types.ts';
import { useTheme } from './ThemeContext.tsx';
import { soundFx } from '../utils/audio.ts';

interface MusicContextType {
  isPlaying: boolean;
  currentTrack: SongTrack | null;
  volume: number;
  playlist: SongTrack[];
  togglePlay: () => void;
  playTrack: (track: SongTrack) => void;
  nextTrack: () => void;
  prevTrack: () => void;
  setVolume: (vol: number) => void;
  updatePlaylist: (tracks: SongTrack[], activeTrackId?: string) => void;
}

const MusicContext = createContext<MusicContextType | undefined>(undefined);

export const MusicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data } = useTheme();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const defaultPlaylist: SongTrack[] = data?.music?.playlist || [
    {
      id: 'track-1',
      title: 'Cyberpunk Odyssey',
      artist: 'Jubin Sound Studio',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-2099-10701.mp3',
      mood: 'Cyber Futuristic Synth',
      duration: '3:24',
      coverArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'track-2',
      title: 'Deep Space Nebula',
      artist: 'Quantum Spatial Sound',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-space-10940.mp3',
      mood: 'Bioluminescent Ambient',
      duration: '2:48',
      coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'
    },
    {
      id: 'track-3',
      title: 'Neon Horizon Continuum',
      artist: 'Jubin Matrix',
      url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77724.mp3?filename=space-ambient-124003.mp3',
      mood: 'Electronic Waveform',
      duration: '4:10',
      coverArt: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80'
    }
  ];

  const [playlist, setPlaylist] = useState<SongTrack[]>(defaultPlaylist);
  const [currentTrack, setCurrentTrack] = useState<SongTrack | null>(defaultPlaylist[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolumeState] = useState(data?.music?.defaultVolume ?? 0.6);

  // Sync with portfolio data when loaded/updated from Admin CMS
  useEffect(() => {
    if (data?.music?.playlist && data.music.playlist.length > 0) {
      setPlaylist(data.music.playlist);
      const active = data.music.playlist.find(t => t.id === data.music.activeTrackId) || data.music.playlist[0];
      setCurrentTrack(active);
      if (data.music.defaultVolume !== undefined) {
        setVolumeState(data.music.defaultVolume);
      }
    }
  }, [data?.music]);

  // Initialize and handle HTML5 Audio instance
  useEffect(() => {
    const audio = new Audio();
    audio.loop = false;
    audio.volume = volume;
    audioRef.current = audio;

    const handleEnded = () => {
      nextTrack();
    };

    const handleError = () => {
      console.warn('Audio stream error or network blocked, falling back to next available stream.');
    };

    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.pause();
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audioRef.current = null;
    };
  }, []);

  // Update track source when currentTrack changes
  useEffect(() => {
    if (!audioRef.current || !currentTrack) return;

    audioRef.current.src = currentTrack.url;
    audioRef.current.volume = volume;

    if (isPlaying) {
      audioRef.current.play().catch(err => {
        console.log('Autoplay restriction or audio pause:', err);
        setIsPlaying(false);
      });
    }
  }, [currentTrack]);

  const togglePlay = () => {
    if (!audioRef.current || !currentTrack) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      soundFx.click();
    } else {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        soundFx.success();
      }).catch(err => {
        console.warn('Play error:', err);
      });
    }
  };

  const playTrack = (track: SongTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
    soundFx.click();
    if (audioRef.current) {
      audioRef.current.src = track.url;
      audioRef.current.play().catch(err => console.warn('Play error:', err));
    }
  };

  const nextTrack = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    const nextIndex = (currentIndex + 1) % playlist.length;
    playTrack(playlist[nextIndex]);
  };

  const prevTrack = () => {
    if (playlist.length === 0) return;
    const currentIndex = playlist.findIndex(t => t.id === currentTrack?.id);
    const prevIndex = (currentIndex - 1 + playlist.length) % playlist.length;
    playTrack(playlist[prevIndex]);
  };

  const setVolume = (vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    if (audioRef.current) {
      audioRef.current.volume = clamped;
    }
  };

  const updatePlaylist = (newTracks: SongTrack[], activeTrackId?: string) => {
    setPlaylist(newTracks);
    if (activeTrackId) {
      const active = newTracks.find(t => t.id === activeTrackId);
      if (active) setCurrentTrack(active);
    } else if (newTracks.length > 0 && !newTracks.find(t => t.id === currentTrack?.id)) {
      setCurrentTrack(newTracks[0]);
    }
  };

  return (
    <MusicContext.Provider
      value={{
        isPlaying,
        currentTrack,
        volume,
        playlist,
        togglePlay,
        playTrack,
        nextTrack,
        prevTrack,
        setVolume,
        updatePlaylist
      }}
    >
      {children}
    </MusicContext.Provider>
  );
};

export function useMusic() {
  const context = useContext(MusicContext);
  if (!context) {
    throw new Error('useMusic must be used within a MusicProvider');
  }
  return context;
}
