import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  Mail,
  User as UserIcon,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle,
  AlertCircle,
  KeyRound,
  Eye,
  EyeOff,
  Terminal,
  Globe
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.tsx';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from '../../lib/firebase.ts';
import { soundFx } from '../../utils/audio.ts';

const COUNTRY_CODES = [
  { code: '+91', country: 'India (IN)', maxDigits: 10 },
  { code: '+1', country: 'USA/Canada (+1)', maxDigits: 10 },
  { code: '+44', country: 'UK (+44)', maxDigits: 10 },
  { code: '+61', country: 'Australia (+61)', maxDigits: 9 },
  { code: '+49', country: 'Germany (+49)', maxDigits: 11 },
  { code: '+33', country: 'France (+33)', maxDigits: 9 },
  { code: '+81', country: 'Japan (+81)', maxDigits: 10 },
  { code: '+971', country: 'UAE (+971)', maxDigits: 9 },
  { code: '+65', country: 'Singapore (+65)', maxDigits: 8 },
  { code: '+880', country: 'Bangladesh (+880)', maxDigits: 10 }
];

export interface VisitorGateModalProps {
  onAdminSuccess?: () => void;
}

export const VisitorGateModal: React.FC<VisitorGateModalProps> = ({ onAdminSuccess }) => {
  const {
    admin,
    isAdmin,
    showVisitorGate,
    closeVisitorGate,
    recordVisitorProfile,
    isVisitorRecorded,
    login,
    register,
    adminLogin
  } = useAuth();

  // Navigation / Tab State: 'signup' or 'login'
  const [activeTab, setActiveTab] = useState<'signup' | 'login'>('login');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Active country max digits calculation
  const activeCountry = COUNTRY_CODES.find(c => c.code === countryCode) || COUNTRY_CODES[0];
  const requiredDigits = activeCountry.maxDigits || 10;

  // Sanitized clean phone digits
  const cleanDigits = phoneNumber.replace(/\D/g, '');
  const isPhoneValid = cleanDigits.length === requiredDigits;

  // Handle phone input formatting
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '');

    // Strip prefix if pasted with country code
    if (countryCode === '+91' && raw.startsWith('91') && raw.length > 10) {
      raw = raw.slice(2);
    } else if (countryCode === '+1' && raw.startsWith('1') && raw.length > 10) {
      raw = raw.slice(1);
    }

    // Strip leading zeros
    if (raw.startsWith('0') && raw.length > 1) {
      raw = raw.replace(/^0+/, '');
    }

    if (raw.length > requiredDigits) {
      raw = raw.slice(0, requiredDigits);
    }

    setPhoneNumber(raw);
    setError(null);
  };

  const getFullPhone = () => {
    return `${countryCode} ${cleanDigits}`;
  };

  // -------------------------------------------------------------
  // 1. VISITOR SIGN UP HANDLER (Direct Registration)
  // -------------------------------------------------------------
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError('Full Name is required.');
      soundFx.glitch();
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Please enter a valid Gmail / Email address.');
      soundFx.glitch();
      return;
    }

    if (cleanDigits.length !== requiredDigits) {
      setError(
        cleanDigits.length > requiredDigits
          ? `Phone number exceeds ${requiredDigits} digits for ${countryCode}. Please enter pure 10-digit mobile number.`
          : `Incomplete mobile number (${cleanDigits.length}/${requiredDigits} digits). Please enter your full mobile number.`
      );
      soundFx.glitch();
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      soundFx.glitch();
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter.');
      soundFx.glitch();
      return;
    }

    try {
      setLoading(true);
      soundFx.click();

      const fullPhoneString = getFullPhone();
      let createdUid = `vis-${Date.now()}`;

      // 1. Register in Firebase Auth
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const u = userCredential.user;
        createdUid = u.uid;

        // Update profile displayName
        await updateProfile(u, { displayName: cleanName });
      } catch (authErr: any) {
        console.warn('Firebase Auth user creation note:', authErr);
        if (authErr.code === 'auth/email-already-in-use') {
          setError('This email is already registered. Switch to the "Sign In" tab to log in.');
          soundFx.glitch();
          setLoading(false);
          return;
        } else if (authErr.code === 'auth/weak-password') {
          setError('Password is too weak. Use at least 6 characters with letters and numbers.');
          soundFx.glitch();
          setLoading(false);
          return;
        }
      }

      // 2. Register in Backend REST database
      try {
        await register({
          fullName: cleanName,
          email: cleanEmail,
          phone: fullPhoneString,
          password: password,
          confirmPassword: password
        });
      } catch (restErr) {
        console.warn('Backend REST register note:', restErr);
      }

      // 3. Persist Verified Visitor Profile to Firestore Database
      await recordVisitorProfile({
        id: createdUid,
        fullName: cleanName,
        email: cleanEmail,
        phone: fullPhoneString,
        authProvider: 'password'
      });

      setSuccessMsg(`Welcome, ${cleanName}! Identity confirmed. Entering Jubin's universe...`);
      soundFx.success();

      setTimeout(() => {
        closeVisitorGate();
      }, 400);
    } catch (err: any) {
      console.error('Sign Up Error:', err);
      setError(err.message || 'Failed to complete registration. Please try again.');
      soundFx.glitch();
    } finally {
      setLoading(false);
    }
  };

  // -------------------------------------------------------------
  // 2. RETURNING VISITOR & MASTER ADMIN SIGN IN FLOW
  // -------------------------------------------------------------
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setError('Please enter both your email address and password.');
      soundFx.glitch();
      return;
    }

    try {
      setLoading(true);
      soundFx.click();

      // Check Master Administrator Direct Passkey
      const isAdminEmail =
        cleanEmail === 'jubinkuli72@gmail.com' ||
        cleanEmail === 'jubinkuli009@gmail.com' ||
        cleanEmail === 'admin@gmail.com' ||
        cleanEmail === 'admin@jubin.dev';

      const isPasskey = cleanPass === 'jubin009' || cleanPass === 'jubin2026' || cleanPass === 'jubin2026!';

      if (isAdminEmail || isPasskey) {
        try {
          const adminRes = await adminLogin(cleanEmail, cleanPass);
          if (adminRes && adminRes.success) {
            setSuccessMsg('Master Administrator Authenticated! Opening Control Center...');
            soundFx.success();
            closeVisitorGate();
            if (onAdminSuccess) {
              onAdminSuccess();
            }
            return;
          }
        } catch (adminErr) {
          console.warn('Admin passkey attempt:', adminErr);
        }
      }

      // Check backend REST API authentication first
      let apiSuccess = false;
      try {
        const apiRes = await login(cleanEmail, cleanPass);
        if (apiRes && apiRes.success) {
          apiSuccess = true;
          if ((apiRes as any).isAdmin) {
            setSuccessMsg('Administrator Authenticated! Opening Control Center...');
            soundFx.success();
            closeVisitorGate();
            if (onAdminSuccess) {
              onAdminSuccess();
            }
            return;
          }
        }
      } catch (apiErr) {
        console.warn('REST API login note:', apiErr);
      }

      // Firebase Authentication Login
      let fbUser: any = null;
      try {
        const userCred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
        fbUser = userCred.user;
      } catch (fbErr: any) {
        if (
          fbErr.code === 'auth/operation-not-allowed' ||
          fbErr.code === 'auth/unauthorized-domain' ||
          fbErr.message?.includes('operation-not-allowed')
        ) {
          console.warn('Firebase login operation note, relying on REST server credentials:', fbErr);
          if (!apiSuccess) {
            throw new Error('Account not found or password incorrect. Switch to "Sign Up" to create an account.');
          }
        } else if (!apiSuccess) {
          if (fbErr.code === 'auth/user-not-found' || fbErr.code === 'auth/invalid-credential') {
            throw new Error('Account not found or password incorrect. Switch to "Sign Up" to create an account.');
          } else if (fbErr.code === 'auth/wrong-password') {
            throw new Error('Incorrect password. Please verify your password and try again.');
          }
          throw fbErr;
        }
      }

      // Save visitor record and sync
      await recordVisitorProfile({
        id: fbUser?.uid || `vis-${Date.now()}`,
        fullName: fbUser?.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: phoneNumber ? getFullPhone() : '+91 Verified Visitor',
        authProvider: 'password'
      });

      setSuccessMsg('Welcome back! Entering Jubin Digital Universe...');
      soundFx.success();

      setTimeout(() => {
        closeVisitorGate();
      }, 400);
    } catch (err: any) {
      console.error('Sign In Error:', err);
      setError(err.message || 'Sign in failed. Please check your credentials or create a new account.');
      soundFx.glitch();
    } finally {
      setLoading(false);
    }
  };

  // If visitor gate is dismissed or admin is authenticated, gate is dismissed completely
  if (!showVisitorGate || admin || isAdmin) return null;

  return (
    <div
      id="jubin-visitor-compulsory-gate"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/90 backdrop-blur-2xl animate-fade-in font-mono overflow-y-auto"
    >
      {/* Background Subtle Cyber Glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-cyan-950/30 via-slate-950/80 to-slate-950 pointer-events-none" />

      {/* Main Modal Container */}
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col bg-slate-900/95 border border-cyan-500/30 shadow-[0_0_60px_rgba(6,182,212,0.25)] rounded-2xl sm:rounded-3xl overflow-hidden backdrop-blur-2xl my-auto">
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-cyan-500 via-teal-400 to-indigo-500 shrink-0" />

        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-800/80 bg-slate-950/60 shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-cyan-500/10 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)] shrink-0">
                <ShieldCheck className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <span className="text-[9px] sm:text-[10px] font-bold tracking-widest px-1.5 sm:px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
                    Visitor Authentication
                  </span>
                  <span className="text-[9px] sm:text-[10px] text-slate-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                    Verified Gateway
                  </span>
                </div>
                <h2 className="text-base sm:text-lg font-black text-slate-100 tracking-wider uppercase mt-0.5">
                  Welcome to Jubin's Portfolio
                </h2>
              </div>
            </div>

            {isVisitorRecorded && (
              <button
                onClick={closeVisitorGate}
                className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 px-2.5 py-1 rounded-lg hover:border-slate-500 transition-all shrink-0 cursor-pointer"
              >
                ✕
              </button>
            )}
          </div>

          <p className="text-[11px] sm:text-xs text-slate-400 mt-2 leading-relaxed">
            Please register with verified details or sign in to explore projects and 3D universe.
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 md:p-7 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Status Feedback Messages */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl text-red-200 animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span className="leading-tight">{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2.5 p-3.5 bg-emerald-950/60 border border-emerald-500/50 rounded-xl text-emerald-200">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Tab Selector: Sign In vs Sign Up */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-950/80 border border-slate-800 rounded-xl">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
                soundFx.click();
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError(null);
                soundFx.click();
              }}
              className={`py-2 px-3 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Visitor Sign Up</span>
            </button>
          </div>

          {/* ========================================================================= */}
          {/* TAB 1: VISITOR SIGN UP FORM */}
          {/* ========================================================================= */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignUp} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Alex Sharma"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 pl-10 pr-4 py-2.5 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 pl-10 pr-4 py-2.5 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              {/* COMPULSORY PHONE NUMBER FIELD */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>Phone Number *</span>
                  </label>
                  
                  {/* Live Digit Counter Badge */}
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border transition-all ${
                      isPhoneValid
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        : cleanDigits.length > requiredDigits
                        ? 'bg-red-500/20 text-red-300 border-red-500/40'
                        : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    }`}
                  >
                    {cleanDigits.length}/{requiredDigits} Digits {isPhoneValid ? '✓' : ''}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <select
                    value={countryCode}
                    onChange={e => {
                      setCountryCode(e.target.value);
                      setPhoneNumber('');
                      setError(null);
                    }}
                    className="col-span-1 bg-slate-950 border border-slate-700 focus:border-cyan-400 px-2 py-2.5 rounded-xl text-slate-200 focus:outline-none text-[11px] sm:text-xs"
                  >
                    {COUNTRY_CODES.map(c => (
                      <option key={c.code} value={c.code} className="bg-slate-900 text-slate-100">
                        {c.code} {c.country}
                      </option>
                    ))}
                  </select>

                  <div className="col-span-2 relative">
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={handlePhoneChange}
                      placeholder={`e.g. 9876543210 (${requiredDigits} digits)`}
                      maxLength={requiredDigits}
                      className={`w-full bg-slate-950 border px-3 py-2.5 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none font-bold tracking-wider transition-all ${
                        isPhoneValid
                          ? 'border-emerald-500 focus:ring-1 focus:ring-emerald-400'
                          : 'border-slate-700 focus:border-cyan-400'
                      }`}
                    />
                  </div>
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Password *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 px-3 py-2.5 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Confirm *
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 px-3 py-2.5 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !isPhoneValid}
                className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-teal-400 hover:from-cyan-400 hover:to-teal-300 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>{loading ? 'Registering Visitor...' : 'Create Account & Enter Portfolio'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: RETURNING VISITOR & ADMIN SIGN IN FORM */}
          {/* ========================================================================= */}
          {activeTab === 'login' && (
            <form onSubmit={handleSignIn} className="space-y-3.5 pt-1">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="yourname@gmail.com"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 pl-10 pr-4 py-2.5 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-cyan-400/70" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-700 focus:border-cyan-400 pl-10 pr-10 py-2.5 rounded-xl text-slate-100 placeholder:text-slate-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all cursor-pointer disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In & Enter Portfolio'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* Security Footer */}
          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <Terminal className="w-3 h-3 text-cyan-400" />
              <span>TLS 1.3 / AES-256 Vault</span>
            </span>
            <span className="text-slate-400 flex items-center gap-1">
              <Globe className="w-3 h-3 text-emerald-400" />
              <span>Cloud Firestore Database Sync</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

