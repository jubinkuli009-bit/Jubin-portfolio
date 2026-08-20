import React, { useState } from 'react';
import { Cpu, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Save, X } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PortfolioData, SkillItem } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

interface AdminSkillsProps {
  draftData: PortfolioData | null;
  onUpdateDraft: (updated: PortfolioData) => void;
}

export const AdminSkills: React.FC<AdminSkillsProps> = ({ draftData, onUpdateDraft }) => {
  const [skills, setSkills] = useState<SkillItem[]>(draftData?.skills || []);
  const [editingSkill, setEditingSkill] = useState<SkillItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const categories = ['Frontend', '3D & Creative', 'Backend', 'Database', 'DevOps', 'AI & Tools'];
  const iconOptions = ['atom', 'box', 'code', 'server', 'sparkles', 'brain', 'database', 'layers', 'palette'];

  const handleSaveList = async (updatedList: SkillItem[]) => {
    if (!draftData) return;
    setSaving(true);
    try {
      const updatedDraft = { ...draftData, skills: updatedList };
      await api.updateDraft({ skills: updatedList });
      onUpdateDraft(updatedDraft);
      soundFx.success();
    } catch (err: any) {
      alert(err.message || 'Failed to save skills.');
      soundFx.error();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    const newSkill: SkillItem = {
      id: `skill-${Date.now()}`,
      name: '',
      category: 'Frontend',
      level: 90,
      iconName: 'code',
      description: '',
      order: skills.length + 1
    };
    setEditingSkill(newSkill);
    setIsNew(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSkill) return;

    let updated: SkillItem[];
    if (isNew) {
      updated = [...skills, editingSkill];
    } else {
      updated = skills.map(item => item.id === editingSkill.id ? editingSkill : item);
    }

    setSkills(updated);
    await handleSaveList(updated);
    setEditingSkill(null);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this skill node?')) return;
    const updated = skills.filter(s => s.id !== id);
    setSkills(updated);
    await handleSaveList(updated);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= skills.length) return;

    const updated = [...skills];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setSkills(updated);
    await handleSaveList(updated);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <Cpu className="w-4 h-4" />
            <span>TECHNOLOGY STACK & MATRIX MANAGER</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">SKILLS ECOSYSTEM</h2>
          <p className="text-xs text-slate-400">
            Configure proficiency levels, descriptions, categories, and icons.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-300 transition"
        >
          <Plus className="w-4 h-4" />
          <span>ADD SKILL NODE</span>
        </button>
      </div>

      {/* Grid of Skills */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill, idx) => (
          <div
            key={skill.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] bg-slate-900 text-cyan-300 border border-slate-800">
                  {skill.category}
                </span>
                <span className="text-xs font-bold text-amber-400 font-mono">
                  {skill.level}%
                </span>
              </div>
              <h3 className="text-base font-bold text-white">{skill.name}</h3>
              <p className="text-xs text-slate-400 mt-1 line-clamp-2">{skill.description}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
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
                  disabled={idx === skills.length - 1}
                  className="p-1.5 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditingSkill(skill); setIsNew(false); }}
                  className="p-1.5 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700"
                >
                  <Edit2 className="w-3 h-3" />
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
                  className="p-1.5 rounded bg-red-950/60 text-red-400 hover:bg-red-900"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {editingSkill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <form onSubmit={handleSaveModal} className="relative max-w-lg w-full rounded-3xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-amber-300 uppercase">
                {isNew ? 'ADD SKILL NODE' : 'EDIT SKILL NODE'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">SKILL NAME *</label>
              <input
                type="text"
                required
                value={editingSkill.name}
                onChange={e => setEditingSkill({ ...editingSkill, name: e.target.value })}
                placeholder="e.g. Three.js / WebGL Shaders"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">CATEGORY</label>
                <select
                  value={editingSkill.category}
                  onChange={e => setEditingSkill({ ...editingSkill, category: e.target.value as any })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">ICON</label>
                <select
                  value={editingSkill.iconName}
                  onChange={e => setEditingSkill({ ...editingSkill, iconName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                >
                  {iconOptions.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-slate-300 font-bold">PROFICIENCY LEVEL</label>
                <span className="text-xs font-bold text-amber-400">{editingSkill.level}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={editingSkill.level}
                onChange={e => setEditingSkill({ ...editingSkill, level: Number(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">DESCRIPTION</label>
              <textarea
                rows={2}
                value={editingSkill.description}
                onChange={e => setEditingSkill({ ...editingSkill, description: e.target.value })}
                placeholder="Architectural role, optimization, practical use..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingSkill(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300"
              >
                SAVE SKILL
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
