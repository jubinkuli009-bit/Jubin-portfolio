import React, { useState, useEffect } from 'react';
import { Box, Save, Check, Sparkles, Activity, Layers, Sun } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PortfolioData, Studio3DConfig } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

interface AdminStudio3DProps {
  draftData: PortfolioData | null;
  onUpdateDraft: (updated: PortfolioData) => void;
}

export const AdminStudio3D: React.FC<AdminStudio3DProps> = ({ draftData, onUpdateDraft }) => {
  const [studio3D, setStudio3D] = useState<Studio3DConfig>(
    draftData?.studio3D || {
      environmentType: 'underwater_cyber',
      particleDensity: 650,
      particleSpeed: 1.0,
      fogDensity: 0.02,
      fogColor: '#001018',
      lightPrimaryColor: '#00f0ff',
      lightSecondaryColor: '#0d9488',
      coreShape: 'quantum_sphere',
      objectSize: 1.2,
      rotationSpeed: 0.8,
      glowIntensity: 1.2,
      mouseSensitivity: 1.0,
      touchSensitivity: 1.2,
      qualityPreset: 'HIGH'
    }
  );

  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (draftData?.studio3D) {
      setStudio3D(draftData.studio3D);
    }
  }, [draftData?.studio3D]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!draftData) return;

    setSaving(true);
    try {
      const updatedDraft: PortfolioData = { ...draftData, studio3D };
      await api.updateDraft({ studio3D });
      onUpdateDraft(updatedDraft);
      soundFx.success();
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Failed to save 3D Studio settings.');
      soundFx.error();
    } finally {
      setSaving(false);
    }
  };

  const setPreset = (preset: 'LOW' | 'BALANCED' | 'HIGH' | 'ULTRA') => {
    switch (preset) {
      case 'LOW':
        setStudio3D(prev => ({
          ...prev,
          qualityPreset: 'LOW',
          particleDensity: 200,
          fogDensity: 0.015
        }));
        break;
      case 'BALANCED':
        setStudio3D(prev => ({
          ...prev,
          qualityPreset: 'BALANCED',
          particleDensity: 500,
          fogDensity: 0.02
        }));
        break;
      case 'HIGH':
        setStudio3D(prev => ({
          ...prev,
          qualityPreset: 'HIGH',
          particleDensity: 900,
          fogDensity: 0.025
        }));
        break;
      case 'ULTRA':
        setStudio3D(prev => ({
          ...prev,
          qualityPreset: 'ULTRA',
          particleDensity: 1500,
          fogDensity: 0.03
        }));
        break;
    }
  };

  return (
    <form onSubmit={handleSave} className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <Box className="w-4 h-4" />
            <span>WEBGL 3D SPATIAL & PARTICLE ENGINE HUD</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">3D STUDIO CONTROLS</h2>
          <p className="text-xs text-slate-400">
            Real-time shader parameters, particle density, underwater fog, lighting, and performance presets.
          </p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:opacity-90 transition disabled:opacity-50"
        >
          {savedSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          <span>{saving ? 'SAVING...' : savedSuccess ? 'CONFIG SAVED' : 'SAVE 3D DRAFT'}</span>
        </button>
      </div>

      {/* Preset Selector */}
      <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <span className="text-xs font-bold text-slate-300">GPU PROFILE PRESETS:</span>
        <div className="flex items-center gap-2">
          {(['LOW', 'BALANCED', 'HIGH', 'ULTRA'] as const).map(p => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                studio3D.qualityPreset === p
                  ? 'bg-amber-400 text-slate-950 shadow-[0_0_12px_rgba(245,158,11,0.4)]'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Particle System & Physics */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
            <Sparkles className="w-4 h-4" />
            <span>PARTICLE FIELD & ATMOSPHERE</span>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
              <span>PARTICLE DENSITY</span>
              <span className="text-amber-400">{studio3D.particleDensity} NODES</span>
            </div>
            <input
              type="range"
              min="50"
              max="2000"
              step="50"
              value={studio3D.particleDensity}
              onChange={e => setStudio3D({ ...studio3D, particleDensity: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
              <span>SIMULATION SPEED</span>
              <span className="text-amber-400">{studio3D.particleSpeed}x</span>
            </div>
            <input
              type="range"
              min="0.2"
              max="3.0"
              step="0.1"
              value={studio3D.particleSpeed}
              onChange={e => setStudio3D({ ...studio3D, particleSpeed: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
              <span>UNDERWATER VOLUMETRIC FOG</span>
              <span className="text-amber-400">{studio3D.fogDensity}</span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.08"
              step="0.005"
              value={studio3D.fogDensity}
              onChange={e => setStudio3D({ ...studio3D, fogDensity: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>
        </div>

        {/* Core Geometry & Lights */}
        <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
            <Sun className="w-4 h-4" />
            <span>CENTRAL SHAPE & LIGHTING</span>
          </div>

          <div>
            <label className="block text-xs text-slate-300 mb-1 font-bold">CORE SHAPE GEOMETRY</label>
            <select
              value={studio3D.coreShape}
              onChange={e => setStudio3D({ ...studio3D, coreShape: e.target.value as any })}
              className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
            >
              <option value="quantum_sphere">Quantum Sphere (Icosahedron)</option>
              <option value="hyper_crystal">Hyper Crystal (Octahedron)</option>
              <option value="cyber_torus">Cyber Torus (Knot Topology)</option>
              <option value="abyssal_ring">Abyssal Ring (Torus Standard)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">KEY LIGHT</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={studio3D.lightPrimaryColor}
                  onChange={e => setStudio3D({ ...studio3D, lightPrimaryColor: e.target.value })}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={studio3D.lightPrimaryColor}
                  onChange={e => setStudio3D({ ...studio3D, lightPrimaryColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">RIM LIGHT</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={studio3D.lightSecondaryColor}
                  onChange={e => setStudio3D({ ...studio3D, lightSecondaryColor: e.target.value })}
                  className="w-9 h-9 rounded-lg bg-transparent cursor-pointer border border-slate-700"
                />
                <input
                  type="text"
                  value={studio3D.lightSecondaryColor}
                  onChange={e => setStudio3D({ ...studio3D, lightSecondaryColor: e.target.value })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white uppercase"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs text-slate-300 font-bold mb-1">
              <span>CORE ORB SCALE</span>
              <span className="text-amber-400">{studio3D.objectSize}x</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={studio3D.objectSize}
              onChange={e => setStudio3D({ ...studio3D, objectSize: Number(e.target.value) })}
              className="w-full accent-amber-400"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
