import React, { useState } from 'react';
import { GraduationCap, Plus, Edit2, Trash2, ArrowUp, ArrowDown, Save, Award, Check, X } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PortfolioData, EducationItem } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

interface AdminEducationProps {
  draftData: PortfolioData | null;
  onUpdateDraft: (updated: PortfolioData) => void;
}

export const AdminEducation: React.FC<AdminEducationProps> = ({ draftData, onUpdateDraft }) => {
  const [educationList, setEducationList] = useState<EducationItem[]>(draftData?.education || []);
  const [editingItem, setEditingItem] = useState<EducationItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveList = async (updatedList: EducationItem[]) => {
    if (!draftData) return;
    setSaving(true);
    try {
      const updatedDraft = { ...draftData, education: updatedList };
      await api.updateDraft({ education: updatedList });
      onUpdateDraft(updatedDraft);
      soundFx.success();
    } catch (err: any) {
      alert(err.message || 'Failed to save education items.');
      soundFx.error();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    const newItem: EducationItem = {
      id: `edu-${Date.now()}`,
      institution: '',
      qualification: '',
      field: '',
      year: '2024 - 2026',
      description: '',
      grade: 'First Class Honors',
      certificateUrl: '',
      order: educationList.length + 1
    };
    setEditingItem(newItem);
    setIsNew(true);
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    let updated: EducationItem[];
    if (isNew) {
      updated = [...educationList, editingItem];
    } else {
      updated = educationList.map(item => item.id === editingItem.id ? editingItem : item);
    }

    setEducationList(updated);
    await handleSaveList(updated);
    setEditingItem(null);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education entry?')) return;
    const updated = educationList.filter(e => e.id !== id);
    setEducationList(updated);
    await handleSaveList(updated);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= educationList.length) return;

    const updated = [...educationList];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setEducationList(updated);
    await handleSaveList(updated);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <GraduationCap className="w-4 h-4" />
            <span>ACADEMIC FOUNDATION & CERTIFICATION REGISTRY</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">EDUCATION & CREDENTIALS</h2>
          <p className="text-xs text-slate-400">
            Add degrees, verified diplomas, honors, and certificates.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-300 transition"
        >
          <Plus className="w-4 h-4" />
          <span>ADD EDUCATION NODE</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-4">
        {educationList.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-slate-950 border border-slate-800 text-slate-500 text-xs">
            No education credentials currently listed. Click &quot;ADD EDUCATION NODE&quot; above.
          </div>
        ) : (
          educationList.map((edu, idx) => (
            <div
              key={edu.id}
              className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{edu.qualification}</span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    {edu.year}
                  </span>
                </div>
                <p className="text-xs text-cyan-300">
                  {edu.institution} — <span className="text-slate-400">{edu.field}</span>
                </p>
                <p className="text-xs text-slate-400 line-clamp-1">{edu.description}</p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => handleMove(idx, 'up')}
                  disabled={idx === 0}
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Up"
                >
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleMove(idx, 'down')}
                  disabled={idx === educationList.length - 1}
                  className="p-2 rounded-lg bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
                  title="Move Down"
                >
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => { setEditingItem(edu); setIsNew(false); }}
                  className="p-2 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700"
                  title="Edit"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(edu.id)}
                  className="p-2 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-500/30"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <form onSubmit={handleSaveModal} className="relative max-w-xl w-full rounded-3xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-amber-300 uppercase">
                {isNew ? 'ADD EDUCATION CREDENTIAL' : 'EDIT EDUCATION CREDENTIAL'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">DEGREE / QUALIFICATION *</label>
              <input
                type="text"
                required
                value={editingItem.qualification}
                onChange={e => setEditingItem({ ...editingItem, qualification: e.target.value })}
                placeholder="e.g. Master of Science in Computer Graphics"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">INSTITUTION / UNIVERSITY *</label>
                <input
                  type="text"
                  required
                  value={editingItem.institution}
                  onChange={e => setEditingItem({ ...editingItem, institution: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">FIELD / SPECIALIZATION</label>
                <input
                  type="text"
                  value={editingItem.field}
                  onChange={e => setEditingItem({ ...editingItem, field: e.target.value })}
                  placeholder="e.g. Real-Time Graphics & AI"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">YEARS / TIMEFRAME *</label>
                <input
                  type="text"
                  required
                  value={editingItem.year}
                  onChange={e => setEditingItem({ ...editingItem, year: e.target.value })}
                  placeholder="2022 - 2026"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">GRADE / HONORS</label>
                <input
                  type="text"
                  value={editingItem.grade || ''}
                  onChange={e => setEditingItem({ ...editingItem, grade: e.target.value })}
                  placeholder="e.g. 4.0 GPA / Summa Cum Laude"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">DESCRIPTION & HIGHLIGHTS</label>
              <textarea
                rows={3}
                value={editingItem.description}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                placeholder="Curriculum focus, thesis topics, leadership..."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">VERIFIED CERTIFICATE URL / IMAGE</label>
              <input
                type="url"
                value={editingItem.certificateUrl || ''}
                onChange={e => setEditingItem({ ...editingItem, certificateUrl: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300"
              >
                SAVE ENTRY
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
