import React, { useState } from 'react';
import {
  Music,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit2,
  Check,
  Radio,
  Volume2,
  Sparkles,
  Save,
  Disc3,
  ExternalLink,
  Layers
} from 'lucide-react';
import type { SongTrack, MusicConfig, PortfolioData } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';
import { useMusic } from '../../context/MusicContext.tsx';

interface AdminMusicProps {
  draftData: PortfolioData | null;
  onUpdateDraft: (updatedMusic: MusicConfig) => void;
}

export const AdminMusic: React.FC<AdminMusicProps> = ({ draftData, onUpdateDraft }) => {
  const currentMusic: MusicConfig = draftData?.music || {
    autoPlay: false,
    defaultVolume: 0.6,
    activeTrackId: 'track-1',
    playlist: []
  };

  const [playlist, setPlaylist] = useState<SongTrack[]>(currentMusic.playlist || []);
  const [activeTrackId, setActiveTrackId] = useState<string>(currentMusic.activeTrackId || '');
  const [autoPlay, setAutoPlay] = useState<boolean>(currentMusic.autoPlay ?? false);
  const [defaultVolume, setDefaultVolume] = useState<number>(currentMusic.defaultVolume ?? 0.6);

  // Form Modal for Adding / Editing Song
  const [isEditing, setIsEditing] = useState(false);
  const [editingTrack, setEditingTrack] = useState<Partial<SongTrack>>({
    title: '',
    artist: '',
    url: '',
    mood: 'Cyber Synthwave',
    duration: '3:00',
    coverArt: ''
  });

  // Local Preview State
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [savedBanner, setSavedBanner] = useState(false);

  const handleTogglePreview = (track: SongTrack) => {
    if (previewingId === track.id) {
      previewAudio?.pause();
      setPreviewingId(null);
    } else {
      if (previewAudio) previewAudio.pause();
      const audio = new Audio(track.url);
      audio.volume = defaultVolume;
      audio.play().then(() => {
        setPreviewAudio(audio);
        setPreviewingId(track.id);
        soundFx.success();
      }).catch(err => {
        alert('Could not stream preview audio: ' + err.message);
      });
      audio.onended = () => setPreviewingId(null);
    }
  };

  const handleSaveTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrack.title || !editingTrack.url) {
      alert('Track Title and Audio URL are required.');
      return;
    }

    let updatedList: SongTrack[];
    if (editingTrack.id) {
      // Edit existing
      updatedList = playlist.map(t => (t.id === editingTrack.id ? (editingTrack as SongTrack) : t));
    } else {
      // Add new
      const newTrack: SongTrack = {
        id: `track-${Date.now()}`,
        title: editingTrack.title || 'Untitled Cyber Track',
        artist: editingTrack.artist || 'Jubin Sound Studio',
        url: editingTrack.url || '',
        mood: editingTrack.mood || 'Ambient Electronic',
        duration: editingTrack.duration || '3:15',
        coverArt: editingTrack.coverArt || 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80'
      };
      updatedList = [...playlist, newTrack];
      if (!activeTrackId) setActiveTrackId(newTrack.id);
    }

    setPlaylist(updatedList);
    setIsEditing(false);
    setEditingTrack({ title: '', artist: '', url: '', mood: 'Cyber Synthwave', duration: '3:00' });
    soundFx.success();

    // Propagate to draft
    propagateDraft(updatedList, activeTrackId, autoPlay, defaultVolume);
  };

  const handleDeleteTrack = (id: string) => {
    if (!confirm('Are you sure you want to remove this song from the playlist?')) return;
    const updated = playlist.filter(t => t.id !== id);
    setPlaylist(updated);
    if (activeTrackId === id && updated.length > 0) {
      setActiveTrackId(updated[0].id);
    }
    soundFx.click();
    propagateDraft(updated, activeTrackId === id && updated.length > 0 ? updated[0].id : activeTrackId, autoPlay, defaultVolume);
  };

  const handleSetActive = (id: string) => {
    setActiveTrackId(id);
    soundFx.success();
    propagateDraft(playlist, id, autoPlay, defaultVolume);
  };

  const propagateDraft = (
    currentList: SongTrack[],
    activeId: string,
    ap: boolean,
    vol: number
  ) => {
    const updatedConfig: MusicConfig = {
      playlist: currentList,
      activeTrackId: activeId,
      autoPlay: ap,
      defaultVolume: vol
    };
    onUpdateDraft(updatedConfig);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 2000);
  };

  const presetSongs: Omit<SongTrack, 'id'>[] = [
    {
      title: 'Cyberpunk Odyssey 2099',
      artist: 'Jubin Sound Lab',
      url: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=cyberpunk-2099-10701.mp3',
      mood: 'Cyber Futuristic Synth',
      duration: '3:24',
      coverArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Deep Space Bioluminescence',
      artist: 'Quantum Spatial Sound',
      url: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=ambient-space-10940.mp3',
      mood: 'Deep Sea Ambient',
      duration: '2:48',
      coverArt: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Neon Horizon Continuum',
      artist: 'Jubin Matrix',
      url: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77724.mp3?filename=space-ambient-124003.mp3',
      mood: 'Future Electronic Synth',
      duration: '4:10',
      coverArt: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80'
    },
    {
      title: 'Retro Wave Quantum Driver',
      artist: 'Cyber Synthworks',
      url: 'https://cdn.pixabay.com/download/audio/2021/08/04/audio_0625c1539c.mp3?filename=cyberpunk-city-118831.mp3',
      mood: 'Fast Cyber Beats',
      duration: '2:15',
      coverArt: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=400&q=80'
    }
  ];

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1">
            <Music className="w-4 h-4" />
            <span>ATMOSPHERIC SOUNDTRACK & AUDIO CMS</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">AUDIO & MUSIC ENGINE</h2>
          <p className="text-xs text-slate-400">
            Control the background soundtrack for visitors. Add custom audio URLs, manage playlists, and select the default active track.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingTrack({
              title: '',
              artist: 'Mr. Jubin',
              url: '',
              mood: 'Cyber Futuristic Synth',
              duration: '3:00',
              coverArt: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&w=400&q=80'
            });
            setIsEditing(true);
            soundFx.click();
          }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(0,240,255,0.3)] shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW SONG</span>
        </button>
      </div>

      {savedBanner && (
        <div className="p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500 text-cyan-300 text-xs flex items-center gap-2 animate-bounce">
          <Check className="w-4 h-4" />
          <span>Audio draft configurations updated in memory! Publish to push live to visitors.</span>
        </div>
      )}

      {/* Global Music Preferences Tray */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
        <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
          <Volume2 className="w-4 h-4" />
          <span>GLOBAL AUDIO PREFERENCES</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-slate-300 font-bold">DEFAULT VISITOR VOLUME</span>
              <span className="text-cyan-400 font-bold">{Math.round(defaultVolume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={defaultVolume}
              onChange={e => {
                const vol = parseFloat(e.target.value);
                setDefaultVolume(vol);
                propagateDraft(playlist, activeTrackId, autoPlay, vol);
              }}
              className="w-full accent-cyan-400 h-2 rounded-lg bg-slate-800"
            />
          </div>

          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-slate-300 font-bold block">AUTOPLAY ON FIRST GESTURE</span>
              <span className="text-[10px] text-slate-500">Starts music when visitor interacts</span>
            </div>
            <button
              onClick={() => {
                const next = !autoPlay;
                setAutoPlay(next);
                propagateDraft(playlist, activeTrackId, next, defaultVolume);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                autoPlay
                  ? 'bg-cyan-400 text-slate-950 font-black shadow-[0_0_12px_rgba(0,240,255,0.3)]'
                  : 'bg-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {autoPlay ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>
        </div>
      </div>

      {/* Playlist Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            PLAYLIST TRACKS ({playlist.length})
          </h3>
          <span className="text-[11px] text-slate-400">
            Selected active track will be the primary theme song
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {playlist.map((track, idx) => {
            const isActive = track.id === activeTrackId;
            const isPreviewing = previewingId === track.id;

            return (
              <div
                key={track.id}
                className={`p-5 rounded-3xl border transition space-y-3 ${
                  isActive
                    ? 'bg-slate-950 border-cyan-500/80 shadow-[0_0_30px_rgba(0,240,255,0.2)]'
                    : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      onClick={() => handleTogglePreview(track)}
                      className="relative w-12 h-12 rounded-2xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center cursor-pointer hover:border-cyan-400 shrink-0 group overflow-hidden"
                    >
                      {isPreviewing ? (
                        <Pause className="w-5 h-5 text-cyan-300 fill-current" />
                      ) : (
                        <Play className="w-5 h-5 text-cyan-400 fill-current ml-0.5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{track.title}</span>
                        {isActive && (
                          <span className="px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 text-[10px] font-bold border border-cyan-500/50">
                            ACTIVE THEME
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{track.artist}</div>
                      <div className="text-[10px] text-cyan-400/80 font-mono mt-0.5">{track.mood} • {track.duration}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => {
                        setEditingTrack(track);
                        setIsEditing(true);
                      }}
                      className="p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
                      title="Edit Song"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTrack(track.id)}
                      className="p-2 rounded-xl bg-slate-900 text-red-400 hover:bg-red-950/50 transition"
                      title="Delete Song"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 truncate max-w-[200px]">{track.url}</span>
                  <button
                    onClick={() => handleSetActive(track.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1 ${
                      isActive
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 cursor-default'
                        : 'bg-slate-800 text-slate-300 hover:bg-cyan-950 hover:text-cyan-300'
                    }`}
                  >
                    {isActive ? <Check className="w-3 h-3" /> : <Radio className="w-3 h-3" />}
                    <span>{isActive ? 'CURRENT THEME' : 'SET AS DEFAULT THEME'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Preset Soundtracks Loader */}
      <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>CYBERNETIC PRESET SOUNDTRACKS (1-CLICK IMPORT)</span>
        </h4>
        <p className="text-xs text-slate-400">
          Click any preset to instantly add it to Mr. Jubin's portfolio soundtrack library:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {presetSongs.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                const newTrack: SongTrack = {
                  id: `track-preset-${Date.now()}-${idx}`,
                  ...preset
                };
                const updated = [...playlist, newTrack];
                setPlaylist(updated);
                soundFx.success();
                propagateDraft(updated, activeTrackId || newTrack.id, autoPlay, defaultVolume);
              }}
              className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-cyan-500 text-left space-y-1 transition group"
            >
              <div className="font-bold text-white text-xs group-hover:text-cyan-300 transition truncate">
                + {preset.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate">{preset.artist}</div>
              <div className="text-[9px] text-cyan-400/70">{preset.mood}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Add / Edit Song Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveTrack}
            className="w-full max-w-lg p-6 rounded-3xl bg-slate-950 border border-cyan-500/50 shadow-[0_0_50px_rgba(0,240,255,0.25)] space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white uppercase flex items-center gap-2">
                <Music className="w-4 h-4 text-cyan-400" />
                <span>{editingTrack.id ? 'EDIT SOUNDTRACK' : 'ADD NEW SOUNDTRACK'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">SONG TITLE</label>
              <input
                type="text"
                required
                value={editingTrack.title || ''}
                onChange={e => setEditingTrack({ ...editingTrack, title: e.target.value })}
                placeholder="e.g. Cyberpunk Odyssey"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">ARTIST / CREATOR</label>
                <input
                  type="text"
                  value={editingTrack.artist || ''}
                  onChange={e => setEditingTrack({ ...editingTrack, artist: e.target.value })}
                  placeholder="e.g. Jubin Sound Lab"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1 font-bold">DURATION</label>
                <input
                  type="text"
                  value={editingTrack.duration || ''}
                  onChange={e => setEditingTrack({ ...editingTrack, duration: e.target.value })}
                  placeholder="e.g. 3:24"
                  className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">AUDIO STREAM / MP3 URL</label>
              <input
                type="url"
                required
                value={editingTrack.url || ''}
                onChange={e => setEditingTrack({ ...editingTrack, url: e.target.value })}
                placeholder="https://... / mp3 stream link"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                Direct MP3, AAC, or audio stream link (Pixabay, CDN, or uploaded audio)
              </span>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">MOOD / GENRE</label>
              <input
                type="text"
                value={editingTrack.mood || ''}
                onChange={e => setEditingTrack({ ...editingTrack, mood: e.target.value })}
                placeholder="e.g. Cyber Futuristic Synth"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-slate-300 text-xs font-bold hover:bg-slate-800"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs hover:bg-cyan-300 transition shadow-[0_0_15px_rgba(0,240,255,0.3)] flex items-center gap-2"
              >
                <Save className="w-3.5 h-3.5" />
                <span>SAVE TRACK TO PLAYLIST</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
