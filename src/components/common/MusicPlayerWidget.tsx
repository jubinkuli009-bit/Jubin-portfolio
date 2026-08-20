import React, { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Volume2, VolumeX, Music, Disc3, ListMusic, ChevronDown, ChevronUp } from 'lucide-react';
import { useMusic } from '../../context/MusicContext.tsx';
import { soundFx } from '../../utils/audio.ts';

export const MusicPlayerWidget: React.FC = () => {
  const { isPlaying, currentTrack, volume, playlist, togglePlay, playTrack, nextTrack, prevTrack, setVolume } = useMusic();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);

  if (!currentTrack) return null;

  return (
    <div className="fixed bottom-5 left-5 z-40 font-mono">
      {/* Floating Compact Audio Capsule */}
      <div className="relative rounded-2xl bg-slate-950/90 border border-cyan-500/40 p-2.5 backdrop-blur-xl shadow-[0_0_25px_rgba(0,240,255,0.2)] text-xs text-white flex items-center gap-3 transition-all duration-300">
        {/* Animated Spinning Vinyl / Visualizer Icon */}
        <div
          onClick={togglePlay}
          className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-950 to-slate-900 border border-cyan-500/50 flex items-center justify-center cursor-pointer hover:border-cyan-400 group overflow-hidden shrink-0"
        >
          {isPlaying ? (
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_100ms] h-3"></span>
              <span className="w-1 bg-cyan-300 rounded-full animate-[bounce_1s_infinite_300ms] h-4"></span>
              <span className="w-1 bg-teal-400 rounded-full animate-[bounce_1s_infinite_200ms] h-2"></span>
              <span className="w-1 bg-cyan-400 rounded-full animate-[bounce_1s_infinite_400ms] h-3.5"></span>
            </div>
          ) : (
            <Disc3 className="w-5 h-5 text-cyan-400 group-hover:rotate-45 transition duration-300" />
          )}
        </div>

        {/* Track Details & Quick Controls */}
        <div className="max-w-[170px] sm:max-w-[210px] space-y-0.5">
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
              SOUNDTRACK
            </span>
          </div>
          <div className="font-bold text-slate-100 truncate text-xs">
            {currentTrack.title}
          </div>
          <div className="text-[10px] text-slate-400 truncate">
            {currentTrack.artist}
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={prevTrack}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Previous Track"
          >
            <SkipBack className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={togglePlay}
            className="p-2 rounded-xl bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition shadow-[0_0_12px_rgba(0,240,255,0.4)]"
            title={isPlaying ? 'Pause Track' : 'Play Track'}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
          </button>

          <button
            onClick={nextTrack}
            className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800 transition"
            title="Next Track"
          >
            <SkipForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setShowPlaylist(!showPlaylist)}
            className={`p-1.5 rounded-lg transition ${showPlaylist ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50' : 'bg-slate-900 text-slate-400 hover:text-white'}`}
            title="Toggle Playlist"
          >
            <ListMusic className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 text-slate-500 hover:text-slate-300"
          >
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Volume Slider Tray */}
      {isExpanded && (
        <div className="mt-2 p-3 rounded-2xl bg-slate-950/90 border border-slate-800 backdrop-blur-xl flex items-center gap-3">
          <button
            onClick={() => setVolume(volume === 0 ? 0.6 : 0)}
            className="text-slate-400 hover:text-white"
          >
            {volume === 0 ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
          </button>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className="w-28 accent-cyan-400 h-1.5 rounded-lg bg-slate-800"
          />
          <span className="text-[10px] text-cyan-400 font-bold w-7 text-right">
            {Math.round(volume * 100)}%
          </span>
        </div>
      )}

      {/* Playlist Drawer */}
      {showPlaylist && (
        <div className="absolute bottom-16 left-0 w-72 rounded-3xl bg-slate-950/95 border border-cyan-500/40 p-4 backdrop-blur-2xl shadow-[0_0_35px_rgba(0,240,255,0.25)] space-y-2">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-300">
              <Music className="w-3.5 h-3.5" />
              <span>SOUNDTRACK MATRIX</span>
            </div>
            <span className="text-[10px] text-slate-500">{playlist.length} TRACKS</span>
          </div>

          <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
            {playlist.map((track, idx) => {
              const isCurrent = track.id === currentTrack.id;
              return (
                <div
                  key={track.id}
                  onClick={() => playTrack(track)}
                  className={`p-2.5 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                    isCurrent
                      ? 'bg-cyan-950/60 border-cyan-500/50 text-white'
                      : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2 overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-500 w-3.5">{idx + 1}</span>
                    <div className="truncate">
                      <div className={`text-xs font-bold truncate ${isCurrent ? 'text-cyan-300' : 'text-slate-200'}`}>
                        {track.title}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{track.artist}</div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 shrink-0 flex items-center gap-1">
                    {isCurrent && isPlaying && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping mr-1"></span>
                    )}
                    <span>{track.duration || '3:00'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
