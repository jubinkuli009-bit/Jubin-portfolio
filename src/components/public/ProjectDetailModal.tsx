import React from 'react';
import { X, ExternalLink, Github, Sparkles, Layers, Activity, CheckCircle2 } from 'lucide-react';
import type { ProjectItem } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

interface ProjectDetailModalProps {
  project: ProjectItem | null;
  onClose: () => void;
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div
      id="jubin-project-detail-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl my-8 rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden font-mono">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-2 text-xs text-cyan-400">
            <Sparkles className="w-4 h-4" />
            <span className="uppercase">PROJECT DOSSIER // {project.category}</span>
          </div>
          <button
            onClick={() => {
              onClose();
              soundFx.click();
            }}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Media Preview (Video or Image) */}
        <div className="relative w-full h-72 sm:h-96 bg-slate-950 overflow-hidden border-b border-slate-800">
          {project.videoUrl ? (
            <video
              src={project.videoUrl}
              autoPlay
              loop
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={project.imageUrl}
              alt={project.title}
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        </div>

        {/* Body Content */}
        <div className="p-6 sm:p-8 space-y-6">
          <div>
            <span className="px-3 py-1 rounded-full text-xs bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-semibold">
              {project.category}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white mt-3">
              {project.title}
            </h3>
            <p className="text-sm text-cyan-200/80 mt-1">{project.tagline}</p>
          </div>

          {/* Metrics Row */}
          {project.metrics && project.metrics.length > 0 && (
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
              {project.metrics.map((m, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-lg font-bold text-cyan-300">{m.value}</div>
                  <div className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* Full Technical Overview */}
          <div>
            <h4 className="text-xs font-bold text-teal-300 uppercase tracking-wider mb-2">
              ARCHITECTURE & SPECIFICATION
            </h4>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {project.fullDescription || project.description}
            </p>
          </div>

          {/* Tech Stack Pills */}
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              TECHNOLOGIES EMPLOYED
            </h4>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-xl bg-slate-800 text-xs text-cyan-200 border border-slate-700"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>

          {/* Action Links */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition"
              >
                <Github className="w-4 h-4" />
                <span>SOURCE CODE</span>
              </a>
            )}
            {project.demoUrl && (
              <a
                href={project.demoUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 text-xs font-bold shadow-[0_0_20px_rgba(0,240,255,0.4)] hover:opacity-90 transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span>LAUNCH LIVE DEMO</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
