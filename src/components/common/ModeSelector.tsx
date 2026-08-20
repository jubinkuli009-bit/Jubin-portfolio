import React from 'react';
import { Volume2, VolumeX, Sparkles, Layers, Box, Compass } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import type { ExperienceMode } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

interface ModeSelectorProps {
  onEnterInfinityWorld?: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({ onEnterInfinityWorld }) => {
  const { experienceMode, setExperienceMode, soundEnabled, toggleSound } = useTheme();

  return (
    <div
      id="jubin-hud-mode-selector"
      className="fixed bottom-5 right-5 z-40 hidden sm:flex items-center gap-2 p-1.5 rounded-full bg-slate-950/85 backdrop-blur-xl border border-cyan-500/30 shadow-[0_0_30px_rgba(0,240,255,0.2)] font-mono"
    >
      {/* 2D vs 3D Switches */}
      <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-full border border-slate-800">
        <button
          onClick={() => setExperienceMode('2D')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs tracking-wider transition-all ${
            experienceMode === '2D'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.6)]'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>2D LITE</span>
        </button>

        <button
          onClick={() => setExperienceMode('3D')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs tracking-wider transition-all ${
            experienceMode === '3D'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-[0_0_12px_rgba(0,240,255,0.6)]'
              : 'text-slate-400 hover:text-cyan-300 hover:bg-slate-800/60'
          }`}
        >
          <Box className="w-3.5 h-3.5" />
          <span>3D SPATIAL</span>
        </button>
      </div>

      {/* Infinity 3D World Direct Portal Launch Button */}
      {onEnterInfinityWorld && (
        <button
          onClick={() => {
            soundFx.portalWarp();
            onEnterInfinityWorld();
          }}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-400/60 hover:bg-cyan-900 text-xs font-bold shadow-[0_0_15px_rgba(0,240,255,0.3)] transition"
        >
          <Compass className="w-3.5 h-3.5 animate-spin" />
          <span>INFINITY 3D</span>
        </button>
      )}

      {/* Sound FX Toggle */}
      <button
        onClick={toggleSound}
        title={soundEnabled ? 'Mute Interface Sound Effects' : 'Enable Interface Sound Effects'}
        className={`p-2 rounded-full transition-all ${
          soundEnabled
            ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
        }`}
      >
        {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
      </button>
    </div>
  );
};
