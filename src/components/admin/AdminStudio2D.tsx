import React, { useState, useEffect } from 'react';
import { Sliders, Save, Check, Eye, Palette, Type, Layout } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PortfolioData, Studio2DConfig } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

interface AdminStudio2DProps {
  draftData: PortfolioData | null;
  onUpdateDraft: (updated: PortfolioData) => void;
}

export const AdminStudio2D: React.FC<AdminStudio2DProps> = ({ draftData, onUpdateDraft }) => {
  const [studio2D, setStudio2D] = useState<Studio2DConfig>(
    draftData?.studio2D || {
      primaryColor: '#00f0ff',
      secondaryColor: '#0d9488',
      accentColor: '#38bdf8',
      bgColor: '#020617',
      textColor: '#f8fafc',
      fontFamily: 'Orbitron',
      borderRadius: 16,
      glassOpacity: 70,
      cardGlow: true,
      animationIntensity: 'normal',
      sectionsVisible: {
        hero: true,
        about: true,
        education: true,
        skills: true,
        projects: true,
        journey: true,
        contact: true
      }
    }
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (draftData?.studio2D) {
      setStudio2D(draftData.studio2D);
    }
  }, [draftData?.studio2D]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftData) return;

    setSaving(true);
    try {
      const updatedDraft: PortfolioData = { ...draftData, studio2D };
      await api.updateDraft({ studio2D });
      onUpdateDraft(updatedDraft);
      soundFx.success();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save 2D Studio settings.');
      soundFx.error();
    } finally {
      setSaving(false);
    }
  };

  const toggleSection = (section: keyof Studio2DConfig['sectionsVisible']) => {
    setStudio2D(prev => ({
      ...prev,
      sectionsVisible: {
        ...prev.sectionsVisible,
        [section]: !prev.sectionsVisible[section]
      }
    }));
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <Sliders className="w-4 h-4" />
            <span>2D STUDIO & DESIGN SYSTEM HUD</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">2D STUDIO CONTROLS</h2>
          <p className="text-xs text-slate-400">
            Fine-tune color matrices, typography hierarchy, card geometry, and public section visibility.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:opacity-90 transition disabled:opacity-50"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'SAVING...' : savedSuccess ? 'CONFIG SAVED' : 'SAVE 2D DRAFT'}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Colors & Visual Tokens */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
            <Palette className="w-4 h-4" />
            <span>CHROMATIC PALETTE & THEME</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">PRIMARY COLOR</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={studio2D.primaryColor}
                  onChange={e => setStudio2D({ ...studio2D, primaryColor: e.target.value })}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={studio2D.primaryColor}
                  onChange={e => setStudio2D({ ...studio2D, primaryColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">SECONDARY COLOR</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={studio2D.secondaryColor}
                  onChange={e => setStudio2D({ ...studio2D, secondaryColor: e.target.value })}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={studio2D.secondaryColor}
                  onChange={e => setStudio2D({ ...studio2D, secondaryColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">ACCENT COLOR</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={studio2D.accentColor}
                  onChange={e => setStudio2D({ ...studio2D, accentColor: e.target.value })}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={studio2D.accentColor}
                  onChange={e => setStudio2D({ ...studio2D, accentColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">BACKGROUND BASE</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={studio2D.bgColor}
                  onChange={e => setStudio2D({ ...studio2D, bgColor: e.target.value })}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={studio2D.bgColor}
                  onChange={e => setStudio2D({ ...studio2D, bgColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase"
                />
              </div>
            </div>
          </div>

          {/* Border Radius & Glass Opacity */}
          <div>
            <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
              <span>CORNER RADIUS</span>
              <span className="text-amber-400">{studio2D.borderRadius}px</span>
            </div>
            <input
              type="range"
              min="4"
              max="32"
              value={studio2D.borderRadius}
              onChange={e => setStudio2D({ ...studio2D, borderRadius: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
              <span>GLASSMORPHIC BACKDROP OPACITY</span>
              <span className="text-amber-400">{Math.round(studio2D.glassOpacity * 100)}%</span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.05"
              value={studio2D.glassOpacity}
              onChange={e => setStudio2D({ ...studio2D, glassOpacity: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>
        </div>

        {/* Section Visibility & Typography */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
            <Layout className="w-4 h-4" />
            <span>PUBLIC SECTION VISIBILITY & LAYOUT</span>
          </div>

          <div className="space-y-2.5">
            {Object.entries(studio2D.sectionsVisible).map(([sec, isVisible]) => (
              <div
                key={sec}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800"
              >
                <span className="text-xs font-bold text-white uppercase">{sec} SECTION</span>
                <button
                  type="button"
                  onClick={() => toggleSection(sec as any)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                    isVisible
                      ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                      : 'bg-red-950 text-red-300 border border-red-500/40'
                  }`}
                >
                  {isVisible ? 'SHOWN' : 'HIDDEN'}
                </button>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800">
            <label className="block text-xs text-slate-300 mb-1 font-bold">ANIMATION INTENSITY</label>
            <select
              value={studio2D.animationIntensity}
              onChange={e => setStudio2D({ ...studio2D, animationIntensity: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="Subtle">Subtle (Ultra Battery Saver)</option>
              <option value="Balanced">Balanced (Standard)</option>
              <option value="High">High (Cinematic Motion)</option>
            </select>
          </div>
        </div>
      </div>
    </form>
  );
};
