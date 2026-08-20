import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Shield, Lock, Mail, User as UserIcon, Phone, KeyRound, ArrowRight, X, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import { useTheme } from '../../context/ThemeContext.tsx';
import { soundFx } from '../../utils/audio.ts';

export interface AuthModalProps {
  onAdminSuccess?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ onAdminSuccess }) => {
  const { showAuthModal, closeAuthModal, authInitialTab, login, register, adminLogin, forgotPassword, openVisitorGate } = useAuth();
  const { triggerPortal } = useTheme();

  const [activeTab, setActiveTab] = useState<'login' | 'register' | 'forgot' | 'admin'>(authInitialTab);

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Sync tab on open
  React.useEffect(() => {
    setActiveTab(authInitialTab);
    setError(null);
    setSuccessMsg(null);
  }, [authInitialTab, showAuthModal]);

  const handleVisitorLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res?.isAdmin) {
        if (onAdminSuccess) onAdminSuccess();
      } else {
        triggerPortal();
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please check credentials.');
      soundFx.error();
    } finally {
      setLoading(false);
    }
  };

  const handleVisitorRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register({
        fullName,
        email,
        phone,
        password,
        confirmPassword
      });
      triggerPortal();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
      soundFx.error();
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await adminLogin(adminEmail, adminPassword);
      soundFx.success();
      closeAuthModal();
      if (onAdminSuccess) {
        onAdminSuccess();
      }
    } catch (err: any) {
      setError(err.message || 'Access Denied: Invalid administrator authorization.');
      soundFx.error();
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await forgotPassword(email);
      setSuccessMsg(res.message);
    } catch (err: any) {
      setError(err.message || 'Failed to dispatch reset transmission.');
      soundFx.error();
    } finally {
      setLoading(false);
    }
  };

  if (!showAuthModal) return null;

  return (
    <div
      id="jubin-auth-portal-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl overflow-y-auto"
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="relative w-full max-w-md my-8 rounded-3xl bg-slate-900/95 border border-cyan-500/40 shadow-[0_0_60px_rgba(0,240,255,0.25)] overflow-hidden"
      >
        {/* Glowing Top Cyber Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-sky-400" />

        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 md:p-8">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex p-3 rounded-2xl bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 shadow-[0_0_20px_rgba(0,240,255,0.3)] mb-3">
              {activeTab === 'admin' ? <Lock className="w-6 h-6 text-amber-400" /> : <Shield className="w-6 h-6" />}
            </div>
            <h2 className="text-2xl font-bold tracking-wider text-white uppercase font-mono">
              {activeTab === 'admin'
                ? 'JUBIN CONTROL CENTER'
                : activeTab === 'register'
                ? 'INITIALIZE VISITOR ID'
                : activeTab === 'forgot'
                ? 'RECOVER ACCESS'
                : 'BIOMETRIC SIGN IN'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              {activeTab === 'admin'
                ? 'ADMINISTRATOR PRIVILEGED ACCESS'
                : 'AUTHENTICATE TO ACCESS JUBIN DIGITAL UNIVERSE'}
            </p>
          </div>

          {/* Tab Selector */}
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-950 rounded-xl border border-slate-800 mb-6 text-xs font-mono">
            <button
              onClick={() => { setActiveTab('login'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg transition ${activeTab === 'login' ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#00f0ff]' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setActiveTab('register'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg transition ${activeTab === 'register' ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#00f0ff]' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Sign Up
            </button>
            <button
              onClick={() => { setActiveTab('forgot'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg transition ${activeTab === 'forgot' ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_10px_#00f0ff]' : 'text-slate-400 hover:text-slate-200'}`}
            >
              Reset
            </button>
            <button
              onClick={() => { setActiveTab('admin'); setError(null); setSuccessMsg(null); }}
              className={`py-2 rounded-lg transition flex items-center justify-center gap-1 ${activeTab === 'admin' ? 'bg-amber-400 text-slate-950 font-bold shadow-[0_0_10px_#f59e0b]' : 'text-amber-400/80 hover:text-amber-300'}`}
            >
              <KeyRound className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: VISITOR LOGIN */}
          {activeTab === 'login' && (
            <form onSubmit={handleVisitorLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">GMAIL / EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="visitor@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-xs font-mono text-slate-300">SECURITY PASSWORD</label>
                  <button
                    type="button"
                    onClick={() => setActiveTab('forgot')}
                    className="text-[11px] text-cyan-400 hover:underline font-mono"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold font-mono tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50"
              >
                {loading ? 'AUTHENTICATING...' : 'ENTER PORTFOLIO'}
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('register')}
                  className="text-xs text-slate-400 hover:text-cyan-300 font-mono"
                >
                  Need an account? <span className="text-cyan-400 underline font-semibold">Sign Up Free</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: VISITOR REGISTER */}
          {activeTab === 'register' && (
            <form onSubmit={handleVisitorRegister} className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">FULL NAME *</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="Jubin Example"
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">GMAIL / EMAIL *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="example@gmail.com"
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1">COMPULSORY PHONE NUMBER *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">PASSWORD *</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-mono text-slate-300 mb-1">CONFIRM *</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold font-mono tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50"
              >
                {loading ? 'REGISTERING ID...' : 'CREATE ACCOUNT'}
                <Sparkles className="w-4 h-4" />
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-slate-400 hover:text-cyan-300 font-mono"
                >
                  Already have an account? <span className="text-cyan-400 underline font-semibold">Sign In</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {activeTab === 'forgot' && (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-slate-300 mb-1.5">ACCOUNT EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="your-email@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-slate-700 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-500 text-slate-950 font-bold font-mono tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition shadow-[0_0_20px_rgba(0,240,255,0.4)] disabled:opacity-50"
              >
                {loading ? 'DISPATCHING...' : 'SEND RESET TRANSMISSION'}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs text-cyan-400 hover:underline font-mono"
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: SEPARATE ADMIN ACCESS */}
          {activeTab === 'admin' && (
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-amber-200 text-xs font-mono">
                <div className="flex items-center gap-1.5 font-bold">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span>JUBIN CONTROL CENTER SECURE LOGIN</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-200 mb-1.5">ADMINISTRATOR EMAIL</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
                  <input
                    type="email"
                    required
                    value={adminEmail}
                    onChange={e => setAdminEmail(e.target.value)}
                    placeholder="jubinkuli72@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-amber-200 mb-1.5">ADMINISTRATOR MASTER KEY</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
                  <input
                    type="password"
                    required
                    value={adminPassword}
                    onChange={e => setAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950/90 border border-amber-500/40 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-400 font-mono transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-bold font-mono tracking-wider flex items-center justify-center gap-2 hover:opacity-90 transition shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50"
              >
                {loading ? 'VERIFYING CREDENTIALS...' : 'ACCESS CONTROL CENTER'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};
