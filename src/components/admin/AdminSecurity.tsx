import React, { useState, useEffect } from 'react';
import { Shield, Key, Lock, Activity, RefreshCw, CheckCircle, AlertCircle, Clock, FileText } from 'lucide-react';
import { api } from '../../services/api.ts';
import type { AuditLog } from '../../types.ts';
import { soundFx } from '../../utils/audio.ts';

export const AdminSecurity: React.FC = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [logsLoading, setLogsLoading] = useState(true);

  const fetchLogs = async () => {
    setLogsLoading(true);
    try {
      const res = await api.getAuditLogs();
      setAuditLogs(res.auditLogs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      soundFx.error();
      return;
    }

    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      soundFx.error();
      return;
    }

    setLoading(true);
    try {
      await api.changeAdminPassword({ currentPassword, newPassword, confirmPassword });
      soundFx.success();
      setSuccess(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      fetchLogs();
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || 'Password update failed.');
      soundFx.error();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 font-mono">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-amber-300 mb-1">
            <Shield className="w-4 h-4" />
            <span>CRYPTOGRAPHIC VAULT & AUDIT TRAIL</span>
          </div>
          <h2 className="text-2xl font-black text-white uppercase">SECURITY & AUDIT LOGS</h2>
          <p className="text-xs text-slate-400">
            Master credential rotation, session isolation, and tamper-evident event log stream.
          </p>
        </div>
      </div>

      {/* Security Architecture Status Box */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold mb-1">
            <Lock className="w-4 h-4" />
            <span>HASHING STANDARD</span>
          </div>
          <div className="text-sm font-bold text-white">PBKDF2-SHA512</div>
          <p className="text-[10px] text-slate-400 mt-1">100,000 Key Derivation Iterations + Dynamic Salt</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
            <Key className="w-4 h-4" />
            <span>AUTHENTICATION TOKENS</span>
          </div>
          <div className="text-sm font-bold text-white">HMAC-SHA256 JWT</div>
          <p className="text-[10px] text-slate-400 mt-1">Stateless Encrypted Bearer Token</p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
            <Activity className="w-4 h-4" />
            <span>PASSWORD PROTECTION</span>
          </div>
          <div className="text-sm font-bold text-white">Zero Plaintext</div>
          <p className="text-[10px] text-slate-400 mt-1">Never displayed or stored in plaintext anywhere</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Change Password */}
        <div className="lg:col-span-5">
          <form onSubmit={handleChangePassword} className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
              <Key className="w-4 h-4" />
              <span>ROTATE ADMIN CREDENTIALS</span>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Admin master credentials updated securely!</span>
              </div>
            )}

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">CURRENT PASSWORD *</label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">NEW MASTER PASSWORD *</label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder="Min 8 characters"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs text-slate-300 mb-1 font-bold">CONFIRM NEW PASSWORD *</label>
              <input
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold text-xs tracking-wider shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'UPDATING CREDENTIALS...' : 'UPDATE ADMIN PASSWORD'}
            </button>
          </form>
        </div>

        {/* Right Column: Audit Logs */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-6 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-300 uppercase">
                <FileText className="w-4 h-4" />
                <span>AUDIT LOG STREAM</span>
              </div>
              <button
                onClick={fetchLogs}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${logsLoading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  No security events recorded.
                </div>
              ) : (
                auditLogs.map(log => (
                  <div
                    key={log.id}
                    className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-amber-300">{log.action}</span>
                      <span className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(log.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'medium' })}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-300">{log.details}</div>
                    <div className="text-[10px] text-slate-500">
                      Performed By: {log.performedBy || 'System'}
                    </div>
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
