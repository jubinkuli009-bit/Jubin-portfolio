import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  User,
  Users,
  GraduationCap,
  Cpu,
  Layers,
  Milestone,
  Sliders,
  Box,
  Sparkles,
  Image,
  Mail,
  Shield,
  UploadCloud,
  LogOut,
  Eye,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Menu,
  X,
  Radio
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { api } from '../../services/api.ts';
import { soundFx } from '../../utils/audio.ts';
import type { PortfolioData } from '../../types.ts';

interface AdminLayoutProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onExitToPublic: () => void;
  draftData: PortfolioData | null;
  setDraftData: React.Dispatch<React.SetStateAction<PortfolioData | null>>;
  onPublishSuccess: (updated: PortfolioData) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  activeTab,
  setActiveTab,
  onExitToPublic,
  draftData,
  setDraftData,
  onPublishSuccess,
  children
}) => {
  const { admin, adminLogout } = useAuth();
  const { triggerPortal, refreshPortfolio } = useTheme();
  const [publishing, setPublishing] = useState(false);
  const [hasPendingChanges, setHasPendingChanges] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'visitors', label: 'Recorded Visitors', icon: <Users className="w-4 h-4 text-emerald-400" /> },
    { id: 'profile', label: 'Brand & Profile', icon: <User className="w-4 h-4 text-amber-400" /> },
    { id: 'users', label: 'User Accounts', icon: <Shield className="w-4 h-4" /> },
    { id: 'education', label: 'Education', icon: <GraduationCap className="w-4 h-4" /> },
    { id: 'skills', label: 'Skills Matrix', icon: <Cpu className="w-4 h-4" /> },
    { id: 'projects', label: 'Projects CMS', icon: <Layers className="w-4 h-4" /> },
    { id: 'journey', label: 'Journey Milestones', icon: <Milestone className="w-4 h-4" /> },
    { id: 'music', label: 'Audio & Music', icon: <Radio className="w-4 h-4 text-cyan-400" /> },
    { id: 'studio2d', label: '2D Studio', icon: <Sliders className="w-4 h-4" /> },
    { id: 'studio3d', label: '3D World Studio', icon: <Box className="w-4 h-4" /> },
    { id: 'media', label: 'Media Library', icon: <Image className="w-4 h-4" /> },
    { id: 'messages', label: 'Transmissions', icon: <Mail className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Audit', icon: <Shield className="w-4 h-4" /> },
    { id: 'publish', label: 'Publish & Versions', icon: <UploadCloud className="w-4 h-4" /> }
  ];

  const handlePublishNow = async () => {
    setPublishing(true);
    try {
      const res = await api.publish(changeSummary || 'Production Update via Jubin Control Center');
      soundFx.success();
      setPublishModalOpen(false);
      setChangeSummary('');
      onPublishSuccess(res.published);
      await refreshPortfolio();
      alert(`Website published successfully as Version ${res.publishedVersion.versionId}!`);
    } catch (err: any) {
      alert(err.message || 'Publishing failed.');
      soundFx.error();
    } finally {
      setPublishing(false);
    }
  };

  const brandName = draftData?.profile?.brandName || draftData?.profile?.name || 'JUBIN';
  const brandLetter = draftData?.profile?.brandLetter || (brandName ? brandName[0]?.toUpperCase() : 'J');
  const logoUrl = draftData?.profile?.logoUrl || '';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-mono">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900 border-b border-amber-500/30">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-300 font-bold text-xs overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              brandLetter
            )}
          </div>
          <span className="text-sm font-bold text-amber-300 uppercase truncate max-w-[140px]">{brandName} CONTROL</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPublishModalOpen(true)}
            className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-400 text-slate-950"
          >
            PUBLISH
          </button>
          <button
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300"
          >
            {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation (Desktop + Mobile Drawer) */}
      <aside
        className={`w-full md:w-64 bg-slate-950 border-r border-slate-800/80 p-4 flex flex-col justify-between shrink-0 ${
          mobileNavOpen ? 'block' : 'hidden md:flex'
        }`}
      >
        <div>
          {/* Admin Header Branding */}
          <div className="hidden md:flex items-center gap-3 p-2.5 mb-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-400/60 flex items-center justify-center text-amber-300 font-black text-base shadow-[0_0_12px_#f59e0b] overflow-hidden shrink-0">
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-full h-full object-cover" />
              ) : (
                brandLetter
              )}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-amber-300 tracking-wider uppercase truncate">{brandName} CONTROL</div>
              <div className="text-[10px] text-amber-200/70">MASTER COMMAND HUD</div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {menuItems.map(item => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileNavOpen(false);
                    soundFx.click();
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition ${
                    active
                      ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_15px_rgba(245,158,11,0.35)]'
                      : 'text-slate-400 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2 mt-4">
          <button
            onClick={() => setPublishModalOpen(true)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs tracking-wider shadow-[0_0_20px_rgba(245,158,11,0.3)] hover:opacity-90 transition"
          >
            <UploadCloud className="w-4 h-4" />
            <span>PUBLISH CHANGES</span>
          </button>

          <button
            onClick={onExitToPublic}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 text-xs transition"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>VIEW PUBLIC SITE</span>
          </button>

          <button
            onClick={adminLogout}
            className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-red-400 hover:bg-red-950/40 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>TERMINATE SESSION</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Workspace View */}
      <main className="flex-1 min-w-0 bg-slate-900/50 p-4 sm:p-6 lg:p-8 overflow-y-auto max-h-screen">
        {children}
      </main>

      {/* Instant Publish Dialog Modal */}
      {publishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative max-w-lg w-full rounded-3xl bg-slate-900 border border-amber-500/50 shadow-[0_0_50px_rgba(245,158,11,0.3)] p-6 font-mono">
            <div className="flex items-center gap-2 text-amber-300 text-sm font-bold mb-3">
              <UploadCloud className="w-5 h-5" />
              <span>DEPLOY DRAFT TO PRODUCTION</span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed mb-4">
              This will create a permanent versioned snapshot and push all profile, education, skills, projects, and 2D/3D/4D settings live to all visitors.
            </p>

            <label className="block text-xs text-slate-400 mb-1">RELEASE SUMMARY / CHANGELOG</label>
            <input
              type="text"
              value={changeSummary}
              onChange={e => setChangeSummary(e.target.value)}
              placeholder="e.g. Updated 3D particles, refined hero headline and added CKAD certificate"
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 mb-6"
            />

            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setPublishModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs text-slate-400 hover:text-white"
              >
                CANCEL
              </button>
              <button
                onClick={handlePublishNow}
                disabled={publishing}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:opacity-90 disabled:opacity-50"
              >
                {publishing ? 'DEPLOYING SNAPSHOT...' : 'PUBLISH LIVE NOW'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
