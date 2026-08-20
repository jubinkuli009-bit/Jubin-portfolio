import React, { useState, useEffect } from 'react';
import { UploadCloud, History, RotateCcw } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PortfolioData, PublishedVersion } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';
import { useTheme } from '../../context/ThemeContext.tsx';

interface AdminPublishProps {
  draftData: PortfolioData | null;
  onPublishSuccess: (updated: PortfolioData) => void;
}

export const AdminPublish: React.FC<AdminPublishProps> = ({ draftData, onPublishSuccess }) => {
  const { data: publishedData, refreshPortfolio } = useTheme();
  const [history, setHistory] = useState<Omit<PublishedVersion, 'snapshot'>[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [summary, setSummary] = useState('');
  const [rollbackLoading, setRollbackLoading] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.getVersions();
      setHistory(res.versions);
    } catch (err) {
      console.error('Failed to load version history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    setPublishing(true);
    try {
      const res = await api.publish(summary || 'Routine update from Jubin Control Center');
      soundFx.success();
      onPublishSuccess(res.published);
      await refreshPortfolio();
      setSummary('');
      fetchHistory();
      alert(`Version ${res.publishedVersion.versionNumber} published live to all visitors!`);
    } catch (err: any) {
      alert(err.message || 'Publishing failed.');
      soundFx.error();
    } finally {
      setPublishing(false);
    }
  };

  const handleRollback = async (versionId: string) => {
    if (!confirm(`Are you sure you want to rollback the published website to Version ${versionId}?`)) return;

    setRollbackLoading(versionId);
    try {
      const res = await api.restoreVersion(versionId);
      soundFx.success();
      onPublishSuccess(res.published);
      await refreshPortfolio();
      fetchHistory();
      alert(`Successfully rolled back to Version ${versionId}!`);
    } catch (err: any) {
      alert(err.message || 'Rollback failed.');
      soundFx.error();
    } finally {
      setRollbackLoading(null);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <UploadCloud className="w-4 h-4" />
            <span>PRODUCTION RELEASE & HISTORICAL TIME VAULT</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">PUBLISH & VERSION HISTORY</h2>
          <p className="text-xs text-slate-400">
            Publish draft changes to live visitors or instantly rollback to previous architectural snapshots.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Publish Form & Live Inspector */}
        <div className="lg:col-span-6 space-y-6">
          <form onSubmit={handlePublish} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
              <UploadCloud className="w-4 h-4" />
              <span>DEPLOY DRAFT TO PRODUCTION</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Every publish operation saves an immutable snapshot of all profile fields, 3D particles, 4D configurations, skills, and projects.
            </p>

            <div>
              <label className="block text-xs text-slate-400 mb-1 font-bold">RELEASE NOTES / SUMMARY</label>
              <textarea
                rows={2}
                value={summary}
                onChange={e => setSummary(e.target.value)}
                placeholder="e.g. Updated WebGL particle speeds and added new 4D caustics shader"
                className="w-full p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={publishing}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>{publishing ? 'COMPILING & DEPLOYING SNAPSHOT...' : 'PUBLISH DRAFT TO LIVE WEBSITE'}</span>
            </button>
          </form>

          {/* Quick Comparison Card */}
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase">STATE TELEMETRY</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase text-[10px]">DRAFT PROJECTS</span>
                <div className="text-base font-bold text-amber-400">{draftData?.projects.length || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase text-[10px]">PUBLISHED PROJECTS</span>
                <div className="text-base font-bold text-cyan-400">{publishedData?.projects.length || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase text-[10px]">DRAFT 3D PARTICLES</span>
                <div className="text-base font-bold text-amber-400">{draftData?.studio3D.particleDensity || 0}</div>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-500 uppercase text-[10px]">LIVE 3D PARTICLES</span>
                <div className="text-base font-bold text-cyan-400">{publishedData?.studio3D.particleDensity || 0}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Version History & Rollback */}
        <div className="lg:col-span-6 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
              <History className="w-4 h-4" />
              <span>VERSION HISTORY & ROLLBACK ARCHIVE</span>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {history.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No snapshots published yet.
                </div>
              ) : (
                history.map((ver, idx) => (
                  <div
                    key={ver.versionId}
                    className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">v{ver.versionNumber}</span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 text-[10px] font-bold border border-emerald-500/40">
                            CURRENT LIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {new Date(ver.publishedAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 font-sans">{ver.changeSummary}</p>
                    <div className="text-[10px] text-slate-500">Published by: {ver.publishedBy}</div>

                    {idx > 0 && (
                      <div className="pt-2 border-t border-slate-800/80 flex justify-end">
                        <button
                          onClick={() => handleRollback(ver.versionId)}
                          disabled={rollbackLoading === ver.versionId}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 text-cyan-300 hover:bg-slate-700 text-xs font-bold transition disabled:opacity-50"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>ROLLBACK TO THIS VERSION</span>
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
