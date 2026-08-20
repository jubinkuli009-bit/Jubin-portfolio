import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Trash2,
  Ban,
  CheckCircle,
  Eye,
  RefreshCw,
  Clock,
  Phone,
  Mail,
  Smartphone,
  X,
  Radio
} from 'lucide-react';
import { api } from '../../services/api.ts';
import type { User } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

export const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.getUsers({
        search,
        status: statusFilter,
        sort: sortBy,
        page,
        limit: 10
      });
      setUsers(res.users);
      setTotalPages(res.pagination.totalPages);
      setTotalCount(res.pagination.total);
    } catch (err: any) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, statusFilter, sortBy, page]);

  const handleStatusChange = async (userId: string, newStatus: 'ACTIVE' | 'SUSPENDED') => {
    setActionLoading(userId);
    try {
      await api.updateUserStatus(userId, newStatus);
      soundFx.success();
      fetchUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, status: newStatus } : null);
      }
    } catch (err: any) {
      alert(err.message || 'Status change failed');
      soundFx.error();
    } finally {
      setActionLoading(null);
    }
  };

  const handleRevokeSession = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.revokeUserSession(userId);
      soundFx.success();
      fetchUsers();
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser(prev => prev ? { ...prev, sessionActive: false } : null);
      }
      alert('Active user sessions revoked.');
    } catch (err: any) {
      alert(err.message || 'Revoke failed');
      soundFx.error();
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteUser = async (userId: string, name: string) => {
    if (!confirm(`Are you sure you want to permanently delete account for ${name}? This action cannot be undone.`)) {
      return;
    }
    setActionLoading(userId);
    try {
      await api.deleteUser(userId);
      soundFx.success();
      if (selectedUser?.id === userId) setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.message || 'Deletion failed');
      soundFx.error();
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-cyan-400 mb-1">
            <Shield className="w-4 h-4" />
            <span>AUTHENTICATED DIRECTORY // ROBUST HASHING ENFORCED</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">USER MANAGEMENT</h2>
          <p className="text-xs text-slate-400">
            Total {totalCount} registered visitor identities. Zero plaintext password storage.
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs border border-slate-700 self-start sm:self-auto transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>REFRESH</span>
        </button>
      </div>

      {/* Security Banner Note */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs flex items-center gap-2.5">
        <Shield className="w-5 h-5 text-cyan-400 shrink-0" />
        <span>
          <strong>Cryptographic Protection Standard:</strong> All visitor passwords are securely hashed using salted PBKDF2. Passwords are never stored or transmitted.
        </span>
      </div>

      {/* Controls Bar: Search, Filter, Sort */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
        {/* Search */}
        <div className="sm:col-span-6 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 transition"
          />
        </div>

        {/* Status Filter */}
        <div className="sm:col-span-3">
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-400 transition"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE Only</option>
            <option value="SUSPENDED">SUSPENDED Only</option>
          </select>
        </div>

        {/* Sort */}
        <div className="sm:col-span-3">
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 focus:outline-none focus:border-amber-400 transition"
          >
            <option value="newest">Sort: Newest First</option>
            <option value="oldest">Sort: Oldest First</option>
            <option value="name">Sort: Name (A-Z)</option>
            <option value="lastLogin">Sort: Last Login</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="px-4 py-3.5">User / Contact</th>
                <th className="px-4 py-3.5">Registration</th>
                <th className="px-4 py-3.5">Last Login</th>
                <th className="px-4 py-3.5">Device Info</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading && users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading visitor directory...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No users matching criteria found.
                  </td>
                </tr>
              ) : (
                users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-900/50 transition">
                    {/* Name / Email / Phone */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <span>{u.fullName}</span>
                        {u.role === 'admin' && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-500/20 text-amber-300 border border-amber-500/40">
                            ADMIN
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-cyan-400">{u.email}</div>
                      {u.phone && <div className="text-[10px] text-slate-400">{u.phone}</div>}
                    </td>

                    {/* Registration Date */}
                    <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                      {new Date(u.registeredAt).toLocaleDateString()}
                      <div className="text-[10px] text-slate-500">
                        {new Date(u.registeredAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Last Login */}
                    <td className="px-4 py-3.5 text-slate-300 whitespace-nowrap">
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString() : 'Never'}
                      <div className="text-[10px] text-slate-500">
                        {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                      </div>
                    </td>

                    {/* Device / Session */}
                    <td className="px-4 py-3.5 text-slate-400 max-w-[150px] truncate text-[11px]">
                      <div className="truncate" title={u.deviceInfo}>{u.deviceInfo || 'Desktop Browser'}</div>
                      <div className="flex items-center gap-1 text-[10px] mt-0.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${u.sessionActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                        <span>{u.sessionActive ? 'Session Active' : 'Offline'}</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                            : 'bg-red-950 text-red-300 border border-red-500/40'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3.5 text-right whitespace-nowrap space-x-1">
                      <button
                        onClick={() => setSelectedUser(u)}
                        title="View Full Profile Dossier"
                        className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-cyan-300 hover:bg-slate-700 transition"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>

                      {u.role !== 'admin' && (
                        <>
                          {u.status === 'ACTIVE' ? (
                            <button
                              onClick={() => handleStatusChange(u.id, 'SUSPENDED')}
                              disabled={actionLoading === u.id}
                              title="Suspend User Account"
                              className="p-1.5 rounded-lg bg-amber-950/60 text-amber-400 hover:bg-amber-900 border border-amber-500/30 transition disabled:opacity-50"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStatusChange(u.id, 'ACTIVE')}
                              disabled={actionLoading === u.id}
                              title="Activate User Account"
                              className="p-1.5 rounded-lg bg-emerald-950/60 text-emerald-400 hover:bg-emerald-900 border border-emerald-500/30 transition disabled:opacity-50"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteUser(u.id, u.fullName)}
                            disabled={actionLoading === u.id}
                            title="Delete User Permanently"
                            className="p-1.5 rounded-lg bg-red-950/60 text-red-400 hover:bg-red-900 border border-red-500/30 transition disabled:opacity-50"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-4 py-3 bg-slate-900/60 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Page {page} of {Math.max(1, totalPages)} ({totalCount} total)</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition"
            >
              PREVIOUS
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-white disabled:opacity-40 transition"
            >
              NEXT
            </button>
          </div>
        </div>
      </div>

      {/* User Details Dossier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
          <div className="relative max-w-lg w-full rounded-3xl bg-slate-900 border border-cyan-500/40 shadow-[0_0_50px_rgba(0,240,255,0.2)] p-6 font-mono">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 text-xs">
                <Users className="w-4 h-4" />
                <span>VISITOR TELEMETRY DOSSIER</span>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-full text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="text-[10px] text-slate-500 uppercase">FULL NAME</label>
                <div className="text-base font-bold text-white">{selectedUser.fullName}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">EMAIL / GMAIL</label>
                  <div className="text-cyan-300 font-mono truncate">{selectedUser.email}</div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">PHONE NUMBER</label>
                  <div className="text-slate-300">{selectedUser.phone || 'Not Provided'}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">REGISTRATION DATE</label>
                  <div className="text-slate-300">{new Date(selectedUser.registeredAt).toLocaleString()}</div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase">LAST LOGIN</label>
                  <div className="text-slate-300">{new Date(selectedUser.lastLoginAt).toLocaleString()}</div>
                </div>
              </div>

              <div>
                <label className="text-[10px] text-slate-500 uppercase">DEVICE TELEMETRY</label>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 break-all">
                  {selectedUser.deviceInfo || 'Standard Web Browser'}
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span>Account Status:</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold ${selectedUser.status === 'ACTIVE' ? 'bg-emerald-950 text-emerald-300' : 'bg-red-950 text-red-300'}`}>
                  {selectedUser.status}
                </span>
              </div>
            </div>

            {/* Modal Actions */}
            {selectedUser.role !== 'admin' && (
              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleRevokeSession(selectedUser.id)}
                  className="px-3 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs"
                >
                  Revoke Session
                </button>
                {selectedUser.status === 'ACTIVE' ? (
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'SUSPENDED')}
                    className="px-3 py-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold"
                  >
                    Suspend User
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange(selectedUser.id, 'ACTIVE')}
                    className="px-3 py-2 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold"
                  >
                    Activate User
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
