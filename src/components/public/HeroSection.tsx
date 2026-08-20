import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles, Terminal, Code2, Globe, Cpu, ChevronDown, Radio, Activity } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import { soundFx } from '../../utils/audio.ts';

export const HeroSection: React.FC = () => {
  const { data, triggerPortal } = useTheme();
  const profile = data?.profile;

  const handleEnterWorld = () => {
    soundFx.portalWarp();
    triggerPortal(() => {
      const aboutEl = document.querySelector('#about');
      if (aboutEl) aboutEl.scrollIntoView({ behavior: 'smooth' });
    });
  };

  const handleExploreProjects = () => {
    soundFx.click();
    const projEl = document.querySelector('#projects');
    if (projEl) projEl.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex flex-col justify-center items-center px-4 pt-28 pb-16 overflow-hidden"
    >
      {/* Background Animated Cyber Orbs & Rotating Hologram Rings */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center -z-0">
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.15, 0.3, 0.15],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          className="w-[500px] h-[500px] sm:w-[700px] sm:h-[700px] rounded-full border border-cyan-500/20 border-dashed"
        />
        <motion.div
          animate={{
            scale: [1.1, 0.95, 1.1],
            opacity: [0.1, 0.25, 0.1],
            rotate: [360, 180, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          className="absolute w-[350px] h-[350px] sm:w-[500px] sm:h-[500px] rounded-full border border-teal-400/20"
        />
        <div className="absolute w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute w-80 h-80 bg-teal-500/10 rounded-full blur-3xl -bottom-10 right-10" />
      </div>

      <div className="max-w-5xl mx-auto w-full text-center relative z-10">
        {/* Futuristic Status Pill */}
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 text-xs font-mono mb-6 shadow-[0_0_25px_rgba(0,240,255,0.3)] backdrop-blur-md"
        >
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="tracking-widest font-bold">ENTER THE DIGITAL WORLD OF JUBIN</span>
        </motion.div>

        {/* Hero Title with Cyber Motion */}
        <motion.h1
          initial={{ opacity: 0, scale: 0.9, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-cyan-100 to-cyan-500/90 drop-shadow-[0_0_40px_rgba(0,240,255,0.45)]"
        >
          {profile?.name || 'JUBIN'}
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-4 text-base sm:text-lg md:text-xl font-mono text-cyan-200/95 max-w-3xl mx-auto tracking-wide"
        >
          {profile?.subtitle || 'Creative Developer • Full-Stack Web Developer • Digital Experience Builder'}
        </motion.p>

        {/* Introduction Text */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed"
        >
          {profile?.introduction ||
            'Architecting next-generation 3D spatial user interfaces, quantum-grade full-stack architectures, and high-performance WebGL ecosystems.'}
        </motion.p>

        {/* Primary Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleEnterWorld}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-400 to-sky-400 text-slate-950 font-bold font-mono text-sm tracking-widest uppercase flex items-center justify-center gap-3 shadow-[0_0_35px_rgba(0,240,255,0.55)] transition-all duration-300"
          >
            <span>ENTER MY WORLD</span>
            <ArrowRight className="w-5 h-5" />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleExploreProjects}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-slate-900/80 border border-cyan-500/40 text-cyan-300 font-mono text-sm tracking-widest uppercase flex items-center justify-center gap-2 hover:bg-cyan-950/40 hover:border-cyan-400 transition-all duration-300 backdrop-blur-md shadow-[0_0_20px_rgba(0,240,255,0.1)]"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>EXPLORE WORK</span>
          </motion.button>
        </motion.div>

        {/* Live Telemetry Stats HUD */}
        {profile?.stats && profile.stats.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto"
          >
            {profile.stats.map((stat, idx) => (
              <motion.div
                key={idx}
                whileHover={{ y: -4, scale: 1.03 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-slate-900/70 backdrop-blur-md border border-cyan-500/25 shadow-[0_0_25px_rgba(0,240,255,0.1)] hover:border-cyan-400/70 transition duration-300"
              >
                <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-300">
                  {stat.value}
                </div>
                <div className="text-[11px] font-mono tracking-wider text-slate-400 uppercase mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Scroll Down Indicator */}
        <div className="mt-12 flex justify-center">
          <motion.button
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => {
              const el = document.querySelector('#about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
            className="text-cyan-400/70 hover:text-cyan-300 transition"
          >
            <ChevronDown className="w-6 h-6" />
          </motion.button>
        </div>
      </div>
    </section>
  );
};

