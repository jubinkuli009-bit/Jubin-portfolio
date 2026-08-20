import React, { useState } from 'react';
import { Milestone, Plus, Edit2, Trash2, ArrowUp, ArrowDown, X, Save } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PortfolioData, JourneyMilestone } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

interface AdminJourneyProps {
  draftData: PortfolioData | null;
  onUpdateDraft: (updated: PortfolioData) => void;
}

export const AdminJourney: React.FC<AdminJourneyProps> = ({ draftData, onUpdateDraft }) => {
  const [journey, setJourney] = useState<JourneyMilestone[]>(draftData?.journey || []);
  const [editingItem, setEditingItem] = useState<JourneyMilestone | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [highlightsInput, setHighlightsInput] = useState('');

  const phases = ['Abyssal', 'Bioluminescent', 'Epipelagic', 'Quantum'] as const;

  const handleSaveList = async (updatedList: JourneyMilestone[]) => {
    if (!draftData) return;
    setSaving(true);
    try {
      const updatedDraft = { ...draftData, journey: updatedList };
      await api.updateDraft({ journey: updatedList });
      onUpdateDraft(updatedDraft);
      soundFx.success();
    } catch (err: any) {
      alert(err.message || 'Failed to save journey.');
      soundFx.error();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateNew = () => {
    const newItem: JourneyMilestone = {
      id: `m-${Date.now()}`,
      year: '2026',
      title: '',
      role: '',
      companyOrContext: '',
      description: '',
      highlights: ['Key Technical Achievement'],
      environmentPhase: 'Quantum',
      order: journey.length + 1
    };
    setEditingItem(newItem);
    setIsNew(true);
    setHighlightsInput(newItem.highlights.join(', '));
  };

  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    const hlArray = highlightsInput
      .split(',')
      .map(h => h.trim())
      .filter(h => h.length > 0);

    const itemToSave: JourneyMilestone = {
      ...editingItem,
      highlights: hlArray
    };

    let updated: JourneyMilestone[];
    if (isNew) {
      updated = [...journey, itemToSave];
    } else {
      updated = journey.map(j => j.id === itemToSave.id ? itemToSave : j);
    }

    setJourney(updated);
    await handleSaveList(updated);
    setEditingItem(null);
    setIsNew(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this journey milestone?')) return;
    const updated = journey.filter(j => j.id !== id);
    setJourney(updated);
    await handleSaveList(updated);
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= journey.length) return;

    const updated = [...journey];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;

    setJourney(updated);
    await handleSaveList(updated);
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <Milestone className="w-4 h-4" />
            <span>EXPEDITION & CAREER TIMELINE MANAGER</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">JOURNEY MILESTONES</h2>
          <p className="text-xs text-slate-400">
            Define milestones, organizational roles, and environmental phases.
          </p>
        </div>

        <button
          onClick={handleCreateNew}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:bg-amber-300 transition"
        >
          <Plus className="w-4 h-4" />
          <span>ADD MILESTONE</span>
        </button>
      </div>

      {/* Milestones List */}
      <div className="space-y-4">
        {journey.map((item, idx) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-amber-500/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-base">{item.title}</span>
                <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                  {item.year}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-900 text-cyan-300 text-[10px]">
                  {item.environmentPhase} Phase
                </span>
              </div>
              <p className="text-xs text-cyan-300">
                {item.role} — <span className="text-slate-400">{item.companyOrContext}</span>
              </p>
              <p className="text-xs text-slate-400 line-clamp-1">{item.description}</p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
              <button
                onClick={() => handleMove(idx, 'up')}
                disabled={idx === 0}
                className="p-2 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ArrowUp className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleMove(idx, 'down')}
                disabled={idx === journey.length - 1}
                className="p-2 rounded bg-slate-900 text-slate-400 hover:text-white disabled:opacity-30"
              >
                <ArrowDown className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setEditingItem(item);
                  setIsNew(false);
                  setHighlightsInput(item.highlights.join(', '));
                }}
                className="p-2 rounded bg-slate-800 text-cyan-300 hover:bg-slate-700"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(item.id)}
                className="p-2 rounded bg-red-950/60 text-red-400 hover:bg-red-900"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <form onSubmit={handleSaveModal} className="relative max-w-xl w-full rounded-3xl bg-slate-900 border border-amber-500/40 p-6 space-y-4 shadow-[0_0_50px_rgba(245,158,11,0.2)]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-amber-300 uppercase">
                {isNew ? 'ADD JOURNEY MILESTONE' : 'EDIT JOURNEY MILESTONE'}
              </h3>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">MILESTONE TITLE *</label>
                <input
                  type="text"
                  required
                  value={editingItem.title}
                  onChange={e => setEditingItem({ ...editingItem, title: e.target.value })}
                  placeholder="e.g. Lead Spatial Architect"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">YEAR / TIMEFRAME *</label>
                <input
                  type="text"
                  required
                  value={editingItem.year}
                  onChange={e => setEditingItem({ ...editingItem, year: e.target.value })}
                  placeholder="2025 - Present"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">ROLE</label>
                <input
                  type="text"
                  value={editingItem.role}
                  onChange={e => setEditingItem({ ...editingItem, role: e.target.value })}
                  placeholder="e.g. Principal Engineer"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs text-slate-300 mb-1 font-bold">ORGANIZATION / CONTEXT</label>
                <input
                  type="text"
                  value={editingItem.companyOrContext}
                  onChange={e => setEditingItem({ ...editingItem, companyOrContext: e.target.value })}
                  placeholder="e.g. Quantum Studio"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">ENVIRONMENT PHASE</label>
              <select
                value={editingItem.environmentPhase}
                onChange={e => setEditingItem({ ...editingItem, environmentPhase: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              >
                {phases.map(p => <option key={p} value={p}>{p} Phase</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">DESCRIPTION</label>
              <textarea
                rows={3}
                value={editingItem.description}
                onChange={e => setEditingItem({ ...editingItem, description: e.target.value })}
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">HIGHLIGHTS (Comma-Separated)</label>
              <input
                type="text"
                value={highlightsInput}
                onChange={e => setHighlightsInput(e.target.value)}
                placeholder="High FPS WebGL Engine, Scaled to 100k users, Published Research"
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
                SAVE MILESTONE
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
