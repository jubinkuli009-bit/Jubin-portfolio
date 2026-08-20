import React from 'react';
import { motion } from 'motion/react';
import { Box, Sparkles, ArrowRight, Eye, Layers, Compass, Radio, Bot, ShieldCheck } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { soundFx } from '../../utils/audio.ts';

interface ThreeDUniverseSectionProps {
  onEnterInfinityWorld: () => void;
}

export const ThreeDUniverseSection: React.FC<ThreeDUniverseSectionProps> = ({ onEnterInfinityWorld }) => {
  const { data, triggerPortal } = useTheme();

  const handleLaunch = () => {
    soundFx.portalWarp();
    triggerPortal(() => {
      onEnterInfinityWorld();
    });
  };

  return (
    <section id="3d-world" className="relative py-24 px-4 overflow-hidden font-mono">
      <div className="max-w-6xl mx-auto relative z-10">
        {/* Section Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 space-y-2"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            <span>DIMENSIONAL EXPEDITION MATRIX</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-white uppercase tracking-tight">
            INFINITY 3D UNIVERSE
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl mx-auto">
            Step through the quantum portal into an infinite, real-time WebGL cyber world with interactive customer interfaces, floating project dossiers, and AI assistance.
          </p>
        </motion.div>

        {/* Feature Interactive Showcase Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl bg-gradient-to-b from-slate-900/90 to-slate-950/95 border border-cyan-500/50 p-6 sm:p-10 backdrop-blur-2xl shadow-[0_0_50px_rgba(0,240,255,0.25)] overflow-hidden"
        >
          {/* Ambient Cyber Mesh Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-cyan-500/20 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/20 blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* Left: Teaser Details */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-xl bg-cyan-950 border border-cyan-500/40 text-cyan-300 text-xs font-bold flex items-center gap-1.5">
                  <Box className="w-3.5 h-3.5" />
                  <span>Real-Time WebGL 2.0</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Jubin-AI Custodian</span>
                </span>
                <span className="px-3 py-1 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 text-xs flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Customer Interaction Console</span>
                </span>
              </div>

              <h3 className="text-2xl sm:text-3xl font-black text-white leading-tight">
                AN UNBOUNDED SPATIAL ECOSYSTEM BUILT SPECIFICALLY FOR DISCOVERY
              </h3>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-sans">
                Explore Mr. Jubin's work through an infinite 3D camera lens. Orbit around floating interactive nexus hubs, examine live project dossiers with raycasting selection, and converse in real-time with the JUBIN-AI digital twin.
              </p>

              {/* 3D Capabilities List */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-cyan-400" />
                  <span>Interactive Raycasting Hubs</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                  <span>Live Client Inquiry Terminal</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-sky-400" />
                  <span>Infinite Starfield & Audio Waves</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span>Zero-Lag Mobile Touch Controls</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleLaunch}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-300 to-sky-400 text-slate-950 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(0,240,255,0.6)] transition duration-300"
                >
                  <Compass className="w-5 h-5" />
                  <span>ENTER INFINITY 3D UNIVERSE</span>
                  <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            </div>

            {/* Right: Holographic Simulation Visual Box */}
            <div className="lg:col-span-5">
              <motion.div
                whileHover={{ scale: 1.03 }}
                onClick={handleLaunch}
                className="relative group rounded-3xl bg-slate-950 border border-cyan-500/40 p-6 overflow-hidden cursor-pointer shadow-[0_0_30px_rgba(0,240,255,0.2)] hover:border-cyan-400 transition duration-300"
              >
                <div className="aspect-video w-full rounded-2xl bg-gradient-to-tr from-cyan-950/80 via-slate-900 to-slate-950 flex flex-col items-center justify-center relative overflow-hidden border border-slate-800">
                  {/* Glowing Orbital Rings */}
                  <div className="w-28 h-28 rounded-full border border-cyan-400/40 animate-[spin_8s_linear_infinite] flex items-center justify-center">
                    <div className="w-20 h-20 rounded-full border border-teal-300/60 animate-[spin_4s_linear_infinite_reverse] flex items-center justify-center">
                      <Box className="w-10 h-10 text-cyan-300 group-hover:scale-110 transition duration-300 drop-shadow-[0_0_15px_#00f0ff]" />
                    </div>
                  </div>

                  <div className="absolute inset-0 bg-cyan-500/10 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <span className="px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(0,240,255,0.8)]">
                      CLICK TO LAUNCH WORLD
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-cyan-300 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <span>LAUNCH PORTAL</span>
                  </div>
                  <span className="text-[10px] text-slate-500">60 FPS WebGL Engine</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

