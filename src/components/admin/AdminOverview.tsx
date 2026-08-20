import React, { useState, useEffect } from 'react';
import { Users, Mail, Layers, Sparkles, Activity, UploadCloud, Shield, CheckCircle, Clock, Phone } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { PortfolioData, User, ContactMessage, RecordedVisitor } from '../../types.ts';

interface AdminOverviewProps {
  draftData: PortfolioData | null;
  setActiveTab: (tab: string) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ draftData, setActiveTab }) => {
  const [userCount, setUserCount] = useState<number>(0);
  const [visitorCount, setVisitorCount] = useState<number>(0);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [recentVisitors, setRecentVisitors] = useState<RecordedVisitor[]>([]);
  const [recentUsers, setRecentUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, msgsRes, visitorsRes] = await Promise.all([
          api.getUsers({ limit: 5 }),
          api.getMessages(),
          api.getVisitors()
        ]);
        setUserCount(usersRes.pagination.total);
        setRecentUsers(usersRes.users);
        setMessages(msgsRes.messages);
        setVisitorCount(visitorsRes.total || (visitorsRes.visitors ? visitorsRes.visitors.length : 0));
        setRecentVisitors(visitorsRes.visitors ? visitorsRes.visitors.slice(0, 5) : []);
      } catch (err) {
        console.error('Failed to load overview data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const unreadMessagesCount = messages.filter(m => m.status === 'UNREAD').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-300 font-mono mb-1">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>COMMAND STATUS: OPERATIONAL</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-mono text-white">
              WELCOME, {draftData?.profile?.name ? draftData.profile.name.toUpperCase() : 'MR. JUBIN'}
            </h1>
            <p className="text-xs text-slate-300 font-mono mt-1">
              {draftData?.profile?.brandName || 'Jubin'} Digital Universe Control Center is synchronized and operational.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('profile')}
              className="px-4 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition shadow-[0_0_15px_rgba(245,158,11,0.3)] cursor-pointer"
            >
              EDIT BRAND & LOGO
            </button>
            <button
              onClick={() => setActiveTab('visitors')}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition shadow-[0_0_15px_rgba(16,185,129,0.3)] cursor-pointer"
            >
              VIEW VISITORS ({visitorCount})
            </button>
          </div>
        </div>
      </div>

      {/* Brand & Profile Status Card */}
      <div
        onClick={() => setActiveTab('profile')}
        className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 hover:border-amber-400 transition cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 font-mono shadow-[0_0_25px_rgba(245,158,11,0.1)]"
      >
        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Logo / Monogram Thumbnail */}
          <div className="w-14 h-14 rounded-2xl bg-cyan-950 border-2 border-cyan-400/60 flex items-center justify-center overflow-hidden shrink-0 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            {draftData?.profile?.logoUrl ? (
              <img src={draftData.profile.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-cyan-300 font-black text-2xl font-mono">
                {draftData?.profile?.brandLetter || (draftData?.profile?.brandName || 'Jubin')[0] || 'J'}
              </span>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-amber-300 font-bold uppercase">ACTIVE BRAND:</span>
              <span className="text-base font-black text-white">{draftData?.profile?.brandName || 'Jubin'}</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300">
                {draftData?.profile?.logoUrl ? 'Custom Logo Active' : 'Monogram Mark'}
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Profile Photo: {draftData?.profile?.avatarUrl ? 'Configured' : 'Default'} • Tap to customize Brand Name, Logo & Profile Pic from phone gallery
            </div>
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            setActiveTab('profile');
          }}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 hover:bg-amber-400 hover:text-slate-950 font-bold text-xs transition shrink-0"
        >
          Change Brand / Logo / Photo →
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div
          onClick={() => setActiveTab('visitors')}
          className="p-5 rounded-2xl bg-slate-950/80 border border-emerald-500/40 hover:border-emerald-400 cursor-pointer transition shadow-[0_0_20px_rgba(16,185,129,0.1)]"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase font-bold text-emerald-300">RECORDED VISITORS</span>
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-white">{visitorCount}</div>
          <p className="text-[11px] text-emerald-400 mt-1">Firebase & Compulsory Phones</p>
        </div>

        <div
          onClick={() => setActiveTab('messages')}
          className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase">TRANSMISSIONS</span>
            <Mail className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-bold text-white">{messages.length}</div>
          <p className="text-[11px] text-amber-300 mt-1">{unreadMessagesCount} Unread Dispatches</p>
        </div>

        <div
          onClick={() => setActiveTab('projects')}
          className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase">PROJECTS CMS</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-bold text-white">{draftData?.projects.length || 0}</div>
          <p className="text-[11px] text-indigo-300 mt-1">
            {draftData?.projects.filter(p => p.featured).length || 0} Featured on Home
          </p>
        </div>

        <div
          onClick={() => setActiveTab('studio3d')}
          className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/50 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs uppercase">3D / 4D PARTICLES</span>
            <Sparkles className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-3xl font-bold text-white">
            {draftData?.studio3D.particleDensity || 650}
          </div>
          <p className="text-[11px] text-teal-300 mt-1">
            {draftData?.studio3D.qualityPreset} Profile Preset
          </p>
        </div>
      </div>

      {/* Two Columns: Recent Users & Recent Messages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-mono">
        {/* Recent Registered Visitors */}
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400" />
              <span>RECENT REGISTERED VISITORS</span>
            </h3>
            <button
              onClick={() => setActiveTab('users')}
              className="text-xs text-amber-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No users registered yet.</p>
            ) : (
              recentUsers.map(u => (
                <div
                  key={u.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-white">{u.fullName}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        u.status === 'ACTIVE'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-red-950 text-red-300 border border-red-500/30'
                      }`}
                    >
                      {u.status}
                    </span>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(u.registeredAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Contact Inquiries */}
        <div className="p-6 rounded-3xl bg-slate-950/80 border border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white uppercase flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>LATEST INCOMING TRANSMISSIONS</span>
            </h3>
            <button
              onClick={() => setActiveTab('messages')}
              className="text-xs text-amber-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-xs text-slate-500 py-4">No incoming transmissions.</p>
            ) : (
              messages.slice(0, 3).map(m => (
                <div
                  key={m.id}
                  className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300">{m.name}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full ${
                        m.status === 'UNREAD'
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {m.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-300 line-clamp-1">{m.subject || m.message}</div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(m.createdAt).toLocaleString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
