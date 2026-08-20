import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Layers, ExternalLink, Github, ArrowRight, Eye, Star } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext.tsx';
import type { ProjectItem } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

export const ProjectsSection: React.FC = () => {
  const { data, setSelectedProject } = useTheme();
  const projects = data?.projects || [];
  const [filter, setFilter] = useState<'ALL' | 'FEATURED'>('ALL');

  if (!data?.studio2D.sectionsVisible.projects || projects.length === 0) return null;

  const displayProjects = filter === 'FEATURED'
    ? projects.filter(p => p.featured)
    : projects;

  const handleOpenDetail = (project: ProjectItem) => {
    soundFx.click();
    setSelectedProject(project);
  };

  return (
    <section id="projects" className="relative py-24 px-4 max-w-6xl mx-auto">
      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-500/40 text-cyan-300 text-xs font-mono mb-3">
          <Layers className="w-3.5 h-3.5" />
          <span>PRODUCTION SYSTEMS & EXPERIMENTS</span>
        </div>
        <h2 className="text-3xl md:text-5xl font-black font-mono tracking-tight text-white uppercase">
          FEATURED PROJECTS
        </h2>
        <p className="text-sm font-mono text-cyan-200/70 mt-2 max-w-xl mx-auto">
          High-performance 3D spatial platforms, cryptographic cloud services, and GPU shaders.
        </p>
      </motion.div>

      {/* Filter Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex justify-center gap-2 mb-12"
      >
        <button
          onClick={() => { setFilter('ALL'); soundFx.click(); }}
          className={`px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition ${
            filter === 'ALL'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          All Engineering ({projects.length})
        </button>
        <button
          onClick={() => { setFilter('FEATURED'); soundFx.click(); }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-mono tracking-wider uppercase transition ${
            filter === 'FEATURED'
              ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(0,240,255,0.4)]'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Star className="w-3.5 h-3.5 text-amber-400" />
          <span>Featured Only</span>
        </button>
      </motion.div>

      {/* Futuristic Project Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {displayProjects.map((project, idx) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: idx * 0.1 }}
            whileHover={{ y: -8, scale: 1.015 }}
            onClick={() => handleOpenDetail(project)}
            className="hologram-card group cursor-pointer rounded-3xl bg-slate-900/70 backdrop-blur-xl border border-cyan-500/20 hover:border-cyan-400/80 shadow-[0_0_30px_rgba(0,240,255,0.08)] hover:shadow-[0_0_40px_rgba(0,240,255,0.25)] transition-all duration-500 overflow-hidden flex flex-col"
          >
            {/* Card Media Preview Header */}
            <div className="relative h-56 w-full overflow-hidden bg-slate-950">
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 opacity-85 group-hover:opacity-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-950/85 backdrop-blur-md text-[11px] font-mono text-cyan-300 border border-cyan-500/40">
                  {project.category}
                </span>
                {project.featured && (
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-950/85 backdrop-blur-md text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40">
                    <Star className="w-3 h-3 fill-amber-400" />
                    FEATURED
                  </span>
                )}
              </div>

              {/* View Overlay Button */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition duration-300">
                <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500 text-slate-950 text-xs font-mono font-bold shadow-[0_0_15px_#00f0ff]">
                  <Eye className="w-3.5 h-3.5" />
                  <span>INSPECT</span>
                </span>
              </div>
            </div>

            {/* Card Content */}
            <div className="p-6 flex-1 flex flex-col justify-between font-mono">
              <div>
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition">
                  {project.title}
                </h3>
                <p className="text-xs text-cyan-200/80 mt-1 line-clamp-1">{project.tagline}</p>
                <p className="text-xs text-slate-300 font-sans mt-3 line-clamp-2 leading-relaxed">
                  {project.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800">
                {/* Tech Pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {project.technologies.slice(0, 4).map((tech, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-slate-950 text-[11px] text-slate-300 border border-slate-800"
                    >
                      {tech}
                    </span>
                  ))}
                  {project.technologies.length > 4 && (
                    <span className="px-2 py-0.5 rounded-lg bg-slate-950 text-[11px] text-cyan-400 border border-slate-800">
                      +{project.technologies.length - 4}
                    </span>
                  )}
                </div>

                {/* Card Footer Actions */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-cyan-400 group-hover:translate-x-1 transition flex items-center gap-1 font-semibold">
                    <span>Explore Dossier</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition"
                        title="Source Code"
                      >
                        <Github className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {project.demoUrl && (
                      <a
                        href={project.demoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2 rounded-lg bg-cyan-950 text-cyan-300 hover:text-white hover:bg-cyan-900 border border-cyan-500/30 transition"
                        title="Live Demo"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

