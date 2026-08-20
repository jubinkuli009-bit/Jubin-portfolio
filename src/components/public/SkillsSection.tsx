import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Cpu, Atom, Box, Code, Server, Sparkles, Brain, Database, Layers, Palette, Terminal, Zap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import type { SkillItem } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

export const SkillsSection: React.FC = () => {
  const { data } = useTheme();
  const skills = data?.skills || [];
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [hoveredSkill, setHoveredSkill] = useState<SkillItem | null>(null);

  if (!data?.studio2D.sectionsVisible.skills || skills.length === 0) return null;

  const categories = ['ALL', 'Frontend', '3D & Creative', 'Backend', 'Database', 'DevOps', 'AI & Tools'];

  const filteredSkills = selectedCategory === 'ALL'
    ? skills
    : skills.filter(s => s.category === selectedCategory);

  const getIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case 'atom': return <Atom className="w-5 h-5 text-cyan-400" />;
      case 'box': return <Box className="w-5 h-5 text-teal-400" />;
      case 'code': return <Code className="w-5 h-5 text-sky-400" />;
      case 'server': return <Server className="w-5 h-5 text-indigo-400" />;
      case 'sparkles': return <Sparkles className="w-5 h-5 text-fuchsia-400" />;
      case 'brain': return <Brain className="w-5 h-5 text-emerald-400" />;
      case 'database': return <Database className="w-5 h-5 text-cyan-300" />;
      case 'layers': return <Layers className="w-5 h-5 text-amber-400" />;
      case 'palette': return <Palette className="w-5 h-5 text-rose-400" />;
      default: return <Cpu className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <section id="skills" className="relative py-24 px-4 max-w-6xl mx-auto">
      {/* Section Title */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-3">
          <Cpu className="w-3.5 h-3.5" />
          <span>TECHNOLOGY STACK & MATRIX</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black font-mono tracking-tight text-white uppercase">
          SKILLS ECOSYSTEM
        </h2>
        <p className="text-sm font-mono text-cyan-200/70 mt-2 max-w-xl mx-auto">
          Interactive technology nodes optimized for high-performance spatial and full-stack engineering.
        </p>
      </motion.div>

      {/* Category Filter Pills */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex flex-wrap items-center justify-center gap-2 mb-12"
      >
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => {
              setSelectedCategory(cat);
              soundFx.click();
            }}
            className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition ${
              selectedCategory === cat
                ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </motion.div>

      {/* Interactive Tech Nodes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSkills.map((skill, idx) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.05 }}
            whileHover={{ y: -6, scale: 1.02 }}
            onMouseEnter={() => {
              setHoveredSkill(skill);
              soundFx.hover();
            }}
            onMouseLeave={() => setHoveredSkill(null)}
            className="interactive-node p-5 rounded-2xl bg-slate-900/60 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/80 hover:bg-slate-900/90 shadow-[0_0_20px_rgba(0,240,255,0.06)] hover:shadow-[0_0_30px_rgba(0,240,255,0.2)] transition-all duration-300 group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-cyan-500/50 transition">
                {getIcon(skill.iconName)}
              </div>
              <span className="text-xs font-mono font-bold text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded-lg border border-cyan-500/30">
                {skill.level}%
              </span>
            </div>

            <h3 className="text-base font-bold font-mono text-white group-hover:text-cyan-300 transition">
              {skill.name}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5 mb-3">{skill.category}</p>

            {/* Proficiency Meter Gauge with smooth animation */}
            <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden mb-3">
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${skill.level}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
                className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-sky-400 group-hover:shadow-[0_0_10px_#00f0ff]"
              />
            </div>

            <p className="text-[11px] text-slate-300 leading-relaxed">
              {skill.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

