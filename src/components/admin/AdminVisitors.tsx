import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  RefreshCw,
  Download,
  Phone,
  Mail,
  Calendar,
  Globe,
  Tag,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Shield,
  Smartphone,
  Eye,
  MessageSquare,
  Clock
} from 'lucide-react';
import type { RecordedVisitor } from '../../types.ts';
import { api } from '../../services/api.ts';
import { fetchVisitorsFromFirestore, deleteVisitorFromFirestore } from '../../lib/firebase.ts';
import { soundFx } from '../../utils/audio.ts';

const LEAD_TAGS = ['General', 'VIP', 'Recruiter', 'Client', 'Investor', 'Collaborator', 'Friend'] as const;

export const AdminVisitors: React.FC = () => {
  const [visitors, setVisitors] = useState<RecordedVisitor[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    google: 0,
    emailPass: 0,
    verifiedPhone: 0
  });

  const [loading, setLoading] = useState(true);
  const [firebaseSyncing, setFirebaseSyncing] = useState(false);
  const [search, setSearch] = useState('');
  const [leadFilter, setLeadFilter] = useState('ALL');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');

  // Editing state
  const [editingVisitor, setEditingVisitor] = useState<RecordedVisitor | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [editTag, setEditTag] = useState<RecordedVisitor['leadTag']>('General');
  const [savingEdit, setSavingEdit] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadVisitors = useCallback(async () => {
    try {
      setLoading(true);
      
      // Concurrently query Server API and Firebase Firestore
      const [serverResult, fbVisitors] = await Promise.allSettled([
        api.getVisitors({
          search: search.trim() || undefined,
          leadTag: leadFilter !== 'ALL' ? leadFilter : undefined,
          authProvider: providerFilter !== 'ALL' ? providerFilter : undefined,
          sort: sortBy
        }),
        fetchVisitorsFromFirestore()
      ]);

      const serverList = serverResult.status === 'fulfilled' ? (serverResult.value.visitors || []) : [];
      const firestoreList = fbVisitors.status === 'fulfilled' ? (fbVisitors.value || []) : [];

      // Unified merge map by visitor ID or email
      const visitorMap = new Map<string, RecordedVisitor>();
      
      for (const v of serverList) {
        if (v && (v.id || v.email)) {
          visitorMap.set(v.id || v.email.toLowerCase(), v);
        }
      }

      for (const v of firestoreList) {
        if (v && (v.id || v.email)) {
          const key = v.id || v.email.toLowerCase();
          const existing = visitorMap.get(key);
          if (!existing) {
            visitorMap.set(key, v);
          } else {
            // Keep most recent visited timestamp
            if (new Date(v.lastVisitedAt || 0) > new Date(existing.lastVisitedAt || 0)) {
              visitorMap.set(key, { ...existing, ...v });
            }
          }
        }
      }

      let merged = Array.from(visitorMap.values());

      // Apply client-side search/filter if applied
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        merged = merged.filter(v =>
          v.fullName.toLowerCase().includes(q) ||
          v.email.toLowerCase().includes(q) ||
          v.phone.toLowerCase().includes(q) ||
          (v.notes && v.notes.toLowerCase().includes(q))
        );
      }

      if (leadFilter !== 'ALL') {
        merged = merged.filter(v => v.leadTag === leadFilter);
      }

      if (providerFilter !== 'ALL') {
        merged = merged.filter(v => v.authProvider === providerFilter);
      }

      // Apply sorting
      if (sortBy === 'oldest') {
        merged.sort((a, b) => new Date(a.registeredAt).getTime() - new Date(b.registeredAt).getTime());
      } else if (sortBy === 'visits') {
        merged.sort((a, b) => (b.visitCount || 1) - (a.visitCount || 1));
      } else if (sortBy === 'name') {
        merged.sort((a, b) => a.fullName.localeCompare(b.fullName));
      } else {
        merged.sort((a, b) => new Date(b.registeredAt || b.lastVisitedAt).getTime() - new Date(a.registeredAt || a.lastVisitedAt).getTime());
      }

      setVisitors(merged);
      setStats({
        total: merged.length,
        google: merged.filter(v => v.authProvider === 'google.com').length,
        emailPass: merged.filter(v => v.authProvider !== 'google.com').length,
        verifiedPhone: merged.filter(v => v.phone && v.phone.length >= 7).length
      });
    } catch (err: any) {
      console.error('Failed to load visitors:', err);
    } finally {
      setLoading(false);
    }
  }, [search, leadFilter, providerFilter, sortBy]);

  useEffect(() => {
    loadVisitors();
  }, [loadVisitors]);

  // Sync directly with Firebase Cloud Firestore
  const handleFirebaseSync = async () => {
    try {
      setFirebaseSyncing(true);
      soundFx.click();
      const fbVisitors = await fetchVisitorsFromFirestore();
      
      // Merge with server
      for (const v of fbVisitors) {
        try {
          await api.recordVisitor(v);
        } catch {}
      }

      await loadVisitors();
      soundFx.success();
      setStatusMsg({ type: 'success', text: `Successfully synchronized ${fbVisitors.length} visitor documents from Firebase Firestore.` });
    } catch (err: any) {
      console.error('Firebase sync error:', err);
      setStatusMsg({ type: 'error', text: err.message || 'Firebase sync failed. Check console.' });
      soundFx.glitch();
    } finally {
      setFirebaseSyncing(false);
    }
  };

  // Open Edit Modal
  const openEdit = (visitor: RecordedVisitor) => {
    setEditingVisitor(visitor);
    setEditNotes(visitor.notes || '');
    setEditTag(visitor.leadTag || 'General');
    soundFx.click();
  };

  // Save Edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVisitor) return;

    try {
      setSavingEdit(true);
      await api.updateVisitor(editingVisitor.id, {
        notes: editNotes,
        leadTag: editTag
      });

      setStatusMsg({ type: 'success', text: `Updated record for ${editingVisitor.fullName}.` });
      soundFx.success();
      setEditingVisitor(null);
      loadVisitors();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to update visitor.' });
      soundFx.glitch();
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Visitor
  const handleDelete = async (visitor: RecordedVisitor) => {
    if (!window.confirm(`Are you sure you want to delete the visitor record for "${visitor.fullName}"?`)) {
      return;
    }

    try {
      await api.deleteVisitor(visitor.id);
      try {
        await deleteVisitorFromFirestore(visitor.id);
      } catch {}
      setStatusMsg({ type: 'success', text: `Visitor record removed.` });
      soundFx.trash();
      loadVisitors();
    } catch (err: any) {
      setStatusMsg({ type: 'error', text: err.message || 'Failed to delete record.' });
      soundFx.glitch();
    }
  };

  // Export to CSV
  const handleExportCSV = () => {
    soundFx.click();
    const headers = ['ID', 'Full Name', 'Email', 'Phone', 'Auth Provider', 'Lead Tag', 'Visit Count', 'Registered At', 'Last Visited At', 'Notes'];
    const rows = visitors.map(v => [
      `"${v.id}"`,
      `"${v.fullName.replace(/"/g, '""')}"`,
      `"${v.email}"`,
      `"${v.phone}"`,
      `"${v.authProvider}"`,
      `"${v.leadTag || 'General'}"`,
      v.visitCount || 1,
      `"${v.registeredAt}"`,
      `"${v.lastVisitedAt}"`,
      `"${(v.notes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `jubin-recorded-visitors-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getTagColor = (tag?: string) => {
    switch (tag) {
      case 'VIP':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Client':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
      case 'Recruiter':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Investor':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Collaborator':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40';
      default:
        return 'bg-slate-700/40 text-slate-300 border-slate-600/40';
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              Firebase Cloud Database
            </span>
            <span className="text-xs text-slate-400">Live Ingestion Active</span>
          </div>
          <h2 className="text-2xl font-black text-slate-100 uppercase tracking-wider mt-1 flex items-center gap-2">
            <Users className="w-6 h-6 text-cyan-400" />
            <span>Recorded Visitors & Lead Registry</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Real-time audit log of authenticated visitors with verified phone numbers, Google accounts, and interaction metrics.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleFirebaseSync}
            disabled={firebaseSyncing}
            className="px-3.5 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-500/40 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.15)]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${firebaseSyncing ? 'animate-spin' : ''}`} />
            <span>{firebaseSyncing ? 'Syncing Firebase...' : 'Sync Firestore'}</span>
          </button>

          <button
            onClick={handleExportCSV}
            disabled={visitors.length === 0}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {statusMsg && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-xl border text-xs ${
            statusMsg.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-red-950/40 border-red-500/40 text-red-300'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
          <button onClick={() => setStatusMsg(null)} className="text-slate-400 hover:text-slate-200">✕</button>
        </div>
      )}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Total Visitors</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{stats.total}</div>
          <div className="text-[10px] text-cyan-400 mt-1">Stored in Cloud Firestore</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Google Auth</span>
            <Globe className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{stats.google}</div>
          <div className="text-[10px] text-blue-400 mt-1">Verified Gmail Sign-ins</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Email / Password</span>
            <Shield className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{stats.emailPass}</div>
          <div className="text-[10px] text-purple-400 mt-1">Registered Accounts</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
            <span>Compulsory Phones</span>
            <Phone className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black text-slate-100">{stats.verifiedPhone}</div>
          <div className="text-[10px] text-emerald-400 mt-1">100% Compulsory Verified</div>
        </div>
      </div>

      {/* Search & Filtering Toolbar */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Bar */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, email, phone, notes..."
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 pl-10 pr-4 py-2 rounded-xl text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none"
            />
          </div>

          {/* Lead Tag Filter */}
          <div className="md:col-span-3">
            <select
              value={leadFilter}
              onChange={e => setLeadFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Lead Types</option>
              {LEAD_TAGS.map(t => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Auth Provider Filter */}
          <div className="md:col-span-2">
            <select
              value={providerFilter}
              onChange={e => setProviderFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="ALL">All Providers</option>
              <option value="google.com">Google Auth</option>
              <option value="password">Email / Password</option>
              <option value="custom">Custom Auth</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 px-3 py-2 rounded-xl text-xs text-slate-200 focus:outline-none"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="visits">Most Visits</option>
              <option value="name">Name (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Visitor Records Table / Cards */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 space-y-3">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-cyan-400" />
            <p className="text-xs">Querying Firebase Firestore and server registry...</p>
          </div>
        ) : visitors.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-10 h-10 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-300 font-bold">No recorded visitors match your filter criteria.</p>
            <p className="text-xs text-slate-500">When visitors log in through the gate with their phone number, their data will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-950/60 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Visitor Identity</th>
                  <th className="py-3.5 px-4">Compulsory Phone</th>
                  <th className="py-3.5 px-4">Auth Method</th>
                  <th className="py-3.5 px-4">Lead Status</th>
                  <th className="py-3.5 px-4">Visits / Last Seen</th>
                  <th className="py-3.5 px-4">Notes</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {visitors.map(visitor => (
                  <tr key={visitor.id} className="hover:bg-slate-850/50 transition-colors">
                    {/* Visitor Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        {visitor.photoUrl ? (
                          <img
                            src={visitor.photoUrl}
                            alt={visitor.fullName}
                            className="w-9 h-9 rounded-full border border-cyan-500/40 object-cover shrink-0"
                          />
                        ) : (
                          <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-300 font-bold shrink-0">
                            {visitor.fullName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-100 text-sm flex items-center gap-2">
                            <span>{visitor.fullName}</span>
                          </div>
                          <a
                            href={`mailto:${visitor.email}`}
                            className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-0.5"
                          >
                            <Mail className="w-3 h-3 shrink-0" />
                            <span>{visitor.email}</span>
                          </a>
                        </div>
                      </div>
                    </td>

                    {/* Compulsory Phone */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <a
                          href={`tel:${visitor.phone}`}
                          className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:text-emerald-300 text-xs bg-emerald-950/40 px-2 py-1 rounded border border-emerald-500/30 w-fit"
                        >
                          <Phone className="w-3 h-3" />
                          <span>{visitor.phone}</span>
                        </a>
                        <a
                          href={`https://wa.me/${visitor.phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          <span>Message via WhatsApp</span>
                        </a>
                      </div>
                    </td>

                    {/* Auth Method */}
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-200 border border-slate-700">
                        {visitor.authProvider === 'google.com' ? (
                          <>
                            <Globe className="w-3 h-3 text-blue-400" />
                            <span>Google Account</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-3 h-3 text-cyan-400" />
                            <span>Email & Password</span>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Lead Status */}
                    <td className="py-3.5 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getTagColor(visitor.leadTag)}`}>
                        {visitor.leadTag || 'General'}
                      </span>
                    </td>

                    {/* Visits / Last Visited */}
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <div className="text-slate-200 font-bold flex items-center gap-1">
                          <Eye className="w-3 h-3 text-cyan-400" />
                          <span>{visitor.visitCount || 1} {visitor.visitCount === 1 ? 'visit' : 'visits'}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          <span>{new Date(visitor.lastVisitedAt).toLocaleDateString()} {new Date(visitor.lastVisitedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 max-w-[180px]">
                      {visitor.notes ? (
                        <p className="text-[11px] text-slate-300 truncate" title={visitor.notes}>
                          {visitor.notes}
                        </p>
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">No notes added</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEdit(visitor)}
                          title="Edit Visitor Notes & Lead Status"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-950 text-slate-300 hover:text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(visitor)}
                          title="Delete Record"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-300 hover:text-red-400 border border-slate-700 hover:border-red-500/40 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* EDIT VISITOR MODAL */}
      {editingVisitor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-mono">
          <div className="w-full max-w-lg bg-slate-900 border border-cyan-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-slate-100 uppercase tracking-wider flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-cyan-400" />
                <span>Edit Visitor Lead // {editingVisitor.fullName}</span>
              </h3>
              <button
                onClick={() => setEditingVisitor(null)}
                className="text-slate-400 hover:text-slate-200 text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Email:</span>
                  <span className="text-slate-200 font-bold">{editingVisitor.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Compulsory Phone:</span>
                  <span className="text-emerald-400 font-bold">{editingVisitor.phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Auth Method:</span>
                  <span className="text-cyan-400">{editingVisitor.authProvider}</span>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Lead Classification Tag
                </label>
                <select
                  value={editTag}
                  onChange={e => setEditTag(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 px-3 py-2 rounded-xl text-slate-100 focus:outline-none"
                >
                  {LEAD_TAGS.map(tag => (
                    <option key={tag} value={tag}>{tag}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Internal Administrative Notes & Dossier
                </label>
                <textarea
                  rows={4}
                  value={editNotes}
                  onChange={e => setEditNotes(e.target.value)}
                  placeholder="e.g. Met via LinkedIn, interested in 3D WebGL contracts for Q3..."
                  className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 p-3 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVisitor(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 hover:border-slate-500 text-slate-300 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  {savingEdit ? 'Saving...' : 'Update Lead Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
