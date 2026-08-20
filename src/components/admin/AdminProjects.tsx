import React, { useState } from 'react';
import { Layers, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Star, ExternalLink, Github, X, Check } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PortfolioData, ProjectItem } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

interface AdminProjectsProps {
  draftData: PortfolioData | null;
  onUpdateDraft: (updated: PortfolioData) => void;
}

export const AdminProjects: React.FC<AdminProjectsProps> = ({ draftData, onUpdateDraft }) => {
  const [projects, setProjects] = useState<ProjectItem[]>(draftData?.projects || []);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [techInput, setTechInput] = useState('');

  const handleSaveList = async (updatedList: ProjectItem[]) => {
    if (!draftData) return;
    setSaving(true);
    try {
      const updatedDraft = { ...draftData, projects: updatedList };
      await api.updateDraft({ projects: updatedList });
      onUpdateDraft(updatedDraft);
      soundFx.success();
    } catch (err: any) {
      alert(err.message || 'Failed to save projects.');
      soundFx.error();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    const newProj: ProjectItem = {
      id: `proj-${Date.now()}`,
      title: '',
      tagline: '',
      description: '',
      fullDescription: '',
      category: 'WebGL & 3D',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=1200&q=80',
      technologies: ['React', 'TypeScript', 'Three.js', 'Tailwind CSS'],
      featured: true,
      order: projects.length + 1,
      demoUrl: 'https://example.com',
      githubUrl: 'https://github.com/jubinkuli',
      metrics: [{ label: 'Performance', value: '60 FPS' }]
    };
    setEditingProject(newProj);
    setIsNew(true);
    setTechInput(newProj.technologies.join(', '));
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;

    const techArray = techInput
      .split(',')
      .map(t => t.trim())
      .filter(t => t.length > 0);

    const projectToSave: ProjectItem = {
      ...editingProject,
      technologies: techArray
    };

    let updated: ProjectItem[];
    if (isNew) {
      updated = [...projects, projectToSave];
    } else {
      updated = projects.map(p => p.id === projectToSave.id ? projectToSave : p);
    }

    setProjects(updated);
    await handleSaveList(updated);
    setEditingProject(null);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project dossier?')) return;
    const updated = projects.filter(p => p.id !== id);
    setProjects(updated);
    await handleSaveList(updated);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= projects.length) return;

    const updated = [...projects];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setProjects(updated);
    await handleSaveList(updated);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <Layers className="w-4 h-4" />
            <span>PORTFOLIO SHOWCASE & DOSSIER CMS</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">PROJECTS CMS</h2>
          <p className="text-xs text-slate-400">
            Publish interactive 3D demos, GitHub repositories, and tech stacks.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-300 transition"
        >
          <Plus className="w-4 h-4" />
          <span>NEW PROJECT DOSSIER</span>
        </button>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map((proj, idx) => (
          <div
            key={proj.id}
            className="p-5 rounded-3xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="relative h-44 rounded-2xl overflow-hidden mb-4 bg-slate-900 border border-slate-800">
                <img
                  src={proj.imageUrl}
                  alt={proj.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 left-2 flex gap-1.5">
                  <span className="px-2 py-0.5 rounded bg-slate-950/90 text-[10px] text-cyan-300 font-bold">
                    {proj.category}
                  </span>
                  {proj.featured && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-950/90 text-[10px] text-amber-300 font-bold">
                      <Star className="w-2.5 h-2.5 fill-amber-400" />
                      FEATURED
                    </span>
                  )}
                </div>
              </div>

              <h3 className="text-lg font-bold text-white">{proj.title}</h3>
              <p className="text-xs text-cyan-300 mt-0.5">{proj.tagline}</p>
              <p className="text-xs text-slate-400 mt-2 line-clamp-2">{proj.description}</p>

              <div className="flex flex-wrap gap-1 mt-3">
                {proj.technologies.slice(0, 4).map((t, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-slate-900 text-[10px] text-slate-300">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === projects.length - 1}
                  className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    setEditingProject(proj);
                    setIsNew(false);
                    setTechInput(proj.technologies.join(', '));
                  }}
                  className="p-2 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(proj.id)}
                  className="p-2 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {editingProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
          <form onSubmit={handleSaveModal} className="relative max-w-2xl w-full my-8 rounded-3xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-amber-300 uppercase">
                {isNew ? 'NEW PROJECT DOSSIER' : 'EDIT PROJECT DOSSIER'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">PROJECT TITLE *</label>
                <input
                  type="text"
                  required
                  value={editingProject.title}
                  onChange={e => setEditingProject({ ...editingProject, title: e.target.value })}
                  placeholder="e.g. HyperGrid 3D"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">CATEGORY</label>
                <input
                  type="text"
                  value={editingProject.category}
                  onChange={e => setEditingProject({ ...editingProject, category: e.target.value })}
                  placeholder="e.g. WebGL & Spatial"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">ONE-LINE TAGLINE</label>
              <input
                type="text"
                value={editingProject.tagline}
                onChange={e => setEditingProject({ ...editingProject, tagline: e.target.value })}
                placeholder="Next-generation WebGL compute engine..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">COVER IMAGE URL</label>
                <input
                  type="url"
                  value={editingProject.imageUrl}
                  onChange={e => setEditingProject({ ...editingProject, imageUrl: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">OPTIONAL VIDEO URL (MP4)</label>
                <input
                  type="url"
                  value={editingProject.videoUrl || ''}
                  onChange={e => setEditingProject({ ...editingProject, videoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">SUMMARY DESCRIPTION</label>
              <textarea
                rows={2}
                value={editingProject.description}
                onChange={e => setEditingProject({ ...editingProject, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">FULL ARCHITECTURAL SPECIFICATION</label>
              <textarea
                rows={3}
                value={editingProject.fullDescription}
                onChange={e => setEditingProject({ ...editingProject, fullDescription: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">TECHNOLOGIES (Comma-Separated)</label>
              <input
                type="text"
                value={techInput}
                onChange={e => setTechInput(e.target.value)}
                placeholder="React, TypeScript, Three.js, Node.js, WebGL"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">LIVE DEMO URL</label>
                <input
                  type="url"
                  value={editingProject.demoUrl || ''}
                  onChange={e => setEditingProject({ ...editingProject, demoUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">GITHUB REPO URL</label>
                <input
                  type="url"
                  value={editingProject.githubUrl || ''}
                  onChange={e => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                  placeholder="https://github.com/..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <input
                type="checkbox"
                id="featured-proj"
                checked={editingProject.featured}
                onChange={e => setEditingProject({ ...editingProject, featured: e.target.checked })}
                className="rounded accent-amber-400"
              />
              <label htmlFor="featured-proj" className="text-xs text-slate-300 font-bold">
                Feature on Public Home and Spotlight
              </label>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300"
              >
                SAVE DOSSIER
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
