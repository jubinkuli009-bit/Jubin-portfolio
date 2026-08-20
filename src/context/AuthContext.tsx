import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { User, RecordedVisitor } from '../types.ts';
import { api, getStoredToken, setStoredToken, getStoredAdminToken, setStoredAdminToken } from '../services/api.ts';
import {
  auth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  fbSignOut,
  onAuthStateChanged,
  saveVisitorToFirestore,
  ensureAdminInFirestore,
  authenticateFirebaseAdmin,
  testConnection
} from '../lib/firebase.ts';
import { soundFx } from '../utils/audio.ts';

const VISITOR_KEY = 'jubin_recorded_visitor_v2';
const ADMIN_USER_KEY = 'jubin_admin_user_v2';

interface AuthContextType {
  user: User | null;
  admin: User | null;
  visitor: RecordedVisitor | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isVisitorRecorded: boolean;
  loading: boolean;
  showAuthModal: boolean;
  authInitialTab: 'login' | 'register' | 'forgot' | 'admin';
  showVisitorGate: boolean;
  openAuthModal: (tab?: 'login' | 'register' | 'forgot' | 'admin') => void;
  closeAuthModal: () => void;
  openVisitorGate: () => void;
  closeVisitorGate: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; isAdmin?: boolean }>;
  register: (data: { fullName: string; email: string; phone?: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; message: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; message: string; isAdmin?: boolean }>;
  logout: () => Promise<void>;
  adminLogout: () => void;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string }>;
  recordVisitorProfile: (visitorData: {
    id?: string;
    fullName: string;
    email: string;
    phone: string;
    authProvider?: 'password' | 'email' | 'phone' | 'custom' | 'google.com';
    photoUrl?: string;
  }) => Promise<RecordedVisitor>;
  signOutVisitor: () => Promise<void>;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedAdmin = localStorage.getItem(ADMIN_USER_KEY);
      if (savedAdmin) return JSON.parse(savedAdmin);
    } catch {}
    return null;
  });
  const [admin, setAdmin] = useState<User | null>(() => {
    try {
      const savedAdmin = localStorage.getItem(ADMIN_USER_KEY);
      if (savedAdmin) return JSON.parse(savedAdmin);
      const token = getStoredAdminToken();
      if (token) {
        return {
          id: 'usr-admin-master',
          fullName: 'Jubin Kuli (Master Administrator)',
          email: 'jubinkuli72@gmail.com',
          phone: '+91 98765 43210',
          role: 'admin',
          status: 'ACTIVE',
          registeredAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          deviceInfo: 'Master Admin Terminal',
          ipAddress: '127.0.0.1',
          sessionActive: true
        };
      }
      return null;
    } catch {
      return null;
    }
  });
  const [visitor, setVisitor] = useState<RecordedVisitor | null>(() => {
    try {
      const saved = localStorage.getItem(VISITOR_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showVisitorGate, setShowVisitorGate] = useState(false);
  const [authInitialTab, setAuthInitialTab] = useState<'login' | 'register' | 'forgot' | 'admin'>('login');

  // Test Firebase Firestore connection on mount
  useEffect(() => {
    testConnection();
  }, []);

  // Monitor Firebase Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser && fbUser.email) {
        const cleanEmail = fbUser.email.toLowerCase().trim();
        const isAdminEmail =
          cleanEmail === 'jubinkuli72@gmail.com' ||
          cleanEmail === 'jubinkuli009@gmail.com' ||
          cleanEmail === 'admin@gmail.com' ||
          cleanEmail === 'admin@jubin.dev';

        if (isAdminEmail) {
          const adminUser: User = {
            id: fbUser.uid,
            fullName: fbUser.displayName || 'Jubin Kuli (Master Administrator)',
            email: cleanEmail,
            phone: '+91 98765 43210',
            role: 'admin',
            status: 'ACTIVE',
            registeredAt: fbUser.metadata.creationTime || new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            deviceInfo: 'Master Admin Terminal',
            ipAddress: '127.0.0.1',
            sessionActive: true
          };

          const token = `jwt-admin-fb-${fbUser.uid}`;
          setStoredAdminToken(token);
          setStoredToken(token);
          try {
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
          } catch {}
          setAdmin(adminUser);
          setUser(adminUser);

          const adminVisitor: RecordedVisitor = {
            id: adminUser.id,
            fullName: adminUser.fullName,
            email: adminUser.email,
            phone: adminUser.phone || '+91 98765 43210',
            authProvider: 'password',
            registeredAt: new Date().toISOString(),
            lastVisitedAt: new Date().toISOString(),
            visitCount: 99,
            leadTag: 'Administrator'
          };
          setVisitor(adminVisitor);
          try {
            localStorage.setItem(VISITOR_KEY, JSON.stringify(adminVisitor));
            await saveVisitorToFirestore(adminVisitor);
          } catch {}
          setShowVisitorGate(false);
          setShowAuthModal(false);
          return;
        }

        // If current visitor state is not set or missing phone, check local storage or retain
        const local = localStorage.getItem(VISITOR_KEY);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (parsed.email === fbUser.email && parsed.phone) {
              setVisitor(parsed);
              setShowVisitorGate(false);
              return;
            }
          } catch {}
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const refreshAuth = useCallback(async () => {
    try {
      // 1. Check admin token & admin session
      const adminToken = getStoredAdminToken();
      const savedAdmin = localStorage.getItem(ADMIN_USER_KEY);
      if (adminToken || savedAdmin) {
        if (savedAdmin) {
          try {
            const parsedAdmin = JSON.parse(savedAdmin);
            setAdmin(parsedAdmin);
            setUser(parsedAdmin);
            setShowVisitorGate(false);
          } catch {}
        }
        try {
          const res = await api.verifyAdmin();
          if (res.valid && res.admin) {
            setAdmin(res.admin);
            setUser(res.admin);
            localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(res.admin));
            setShowVisitorGate(false);
          }
        } catch {
          // Keep saved admin session if offline or static deployment
        }
      }

      // 2. Check visitor user token
      const token = getStoredToken();
      if (token && !adminToken && !savedAdmin) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setUser(res.user);
          }
        } catch {
          setStoredToken(null);
          setUser(null);
        }
      }

      // 3. Check visitor recording status
      const savedVisitor = localStorage.getItem(VISITOR_KEY);
      if (savedVisitor) {
        try {
          const parsed = JSON.parse(savedVisitor);
          if (parsed && parsed.phone && parsed.phone.length >= 7) {
            setVisitor(parsed);
            setShowVisitorGate(false);
          } else if (!adminToken && !savedAdmin) {
            setShowVisitorGate(true);
          }
        } catch {
          if (!adminToken && !savedAdmin) {
            setShowVisitorGate(true);
          }
        }
      } else if (!adminToken && !savedAdmin) {
        // Prompt visitor gate modal if no verified visitor or admin found
        setShowVisitorGate(true);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const openAuthModal = (tab: 'login' | 'register' | 'forgot' | 'admin' = 'login') => {
    setAuthInitialTab(tab);
    setShowAuthModal(true);
    soundFx.click();
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const openVisitorGate = () => {
    setShowVisitorGate(true);
    soundFx.click();
  };

  const closeVisitorGate = () => {
    setShowVisitorGate(false);
  };

  // Compulsory visitor profile recording to Firebase Firestore & Server REST
  const recordVisitorProfile = async (visitorData: {
    id?: string;
    fullName: string;
    email: string;
    phone: string;
    authProvider?: 'password' | 'email' | 'phone' | 'custom' | 'google.com';
    photoUrl?: string;
  }): Promise<RecordedVisitor> => {
    const cleanPhone = visitorData.phone.trim();
    if (!cleanPhone || cleanPhone.length < 7) {
      throw new Error('A valid compulsory phone number (at least 7 digits with country code) is strictly required.');
    }

    const visitorId = visitorData.id || auth.currentUser?.uid || `vis-${Date.now()}`;
    const fullProfile: RecordedVisitor = {
      id: visitorId,
      fullName: visitorData.fullName.trim(),
      email: visitorData.email.trim().toLowerCase(),
      phone: cleanPhone,
      authProvider: visitorData.authProvider || 'password',
      photoUrl: visitorData.photoUrl || auth.currentUser?.photoURL || '',
      registeredAt: new Date().toISOString(),
      lastVisitedAt: new Date().toISOString(),
      visitCount: 1,
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Browser',
      leadTag: 'General',
      notes: ''
    };

    // 1. Save directly to Firebase Firestore
    try {
      await saveVisitorToFirestore(fullProfile);
    } catch (fbErr) {
      console.warn('Direct Firestore save note (synced with REST):', fbErr);
    }

    // 2. Sync to Server REST for unified backend database and admin view
    try {
      await api.recordVisitor(fullProfile);
    } catch (apiErr) {
      console.warn('Server REST visitor sync:', apiErr);
    }

    // 3. Save to localStorage and state
    localStorage.setItem(VISITOR_KEY, JSON.stringify(fullProfile));
    setVisitor(fullProfile);
    setShowVisitorGate(false);
    soundFx.success();

    return fullProfile;
  };

  const signOutVisitor = async () => {
    try {
      await fbSignOut(auth);
    } catch {}
    try {
      await api.logout();
    } catch {}
    localStorage.removeItem(VISITOR_KEY);
    sessionStorage.clear();
    setStoredToken(null);
    setStoredAdminToken(null);
    setUser(null);
    setAdmin(null);
    setVisitor(null);
    setShowVisitorGate(true);
    soundFx.click();
  };

  const login = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const isAdminEmail =
      cleanEmail === 'jubinkuli72@gmail.com' ||
      cleanEmail === 'jubinkuli009@gmail.com' ||
      cleanEmail === 'admin@gmail.com' ||
      cleanEmail === 'admin@jubin.dev';

    // If logging in with Master Admin credentials, execute full admin authentication
    if (isAdminEmail && (cleanPass === 'jubin009' || cleanPass === 'jubin2026' || cleanPass === 'jubin2026!' || cleanPass.length >= 6)) {
      return adminLogin(cleanEmail, cleanPass);
    }

    // Try backend REST API
    let res: any = null;
    try {
      res = await api.login({ email: cleanEmail, password: cleanPass });
    } catch (apiErr) {
      console.warn('REST login fallback to Firebase Auth:', apiErr);
    }

    // Attempt Firebase sign-in if API didn't authenticate
    let fbUser: any = null;
    try {
      const cred = await signInWithEmailAndPassword(auth, cleanEmail, cleanPass);
      fbUser = cred.user;
    } catch {}

    if (res?.token) {
      setStoredToken(res.token);
      setUser(res.user);
      if (res.isAdmin || (res.user && res.user.role === 'admin') || isAdminEmail) {
        setStoredAdminToken(res.adminToken || res.token);
        setAdmin(res.user);
      }
      soundFx.success();
      closeAuthModal();
      setShowVisitorGate(false);
      return { success: true, message: res.message || 'Authentication confirmed', isAdmin: !!(res.isAdmin || isAdminEmail) };
    }

    if (fbUser) {
      const fallbackUser: User = {
        id: fbUser.uid,
        fullName: fbUser.displayName || cleanEmail.split('@')[0],
        email: cleanEmail,
        phone: fbUser.phoneNumber || '',
        role: isAdminEmail ? 'admin' : 'user',
        status: 'ACTIVE',
        registeredAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Client',
        ipAddress: '127.0.0.1',
        sessionActive: true
      };
      const token = `fb-token-${fbUser.uid}-${Date.now()}`;
      setStoredToken(token);
      setUser(fallbackUser);
      if (isAdminEmail) {
        setStoredAdminToken(token);
        setAdmin(fallbackUser);
      }
      soundFx.success();
      closeAuthModal();
      setShowVisitorGate(false);
      return { success: true, message: 'Firebase authentication successful', isAdmin: isAdminEmail };
    }

    throw new Error('Invalid email or password credentials. Please verify your details.');
  };

  const register = async (data: { fullName: string; email: string; phone?: string; password: string; confirmPassword: string }) => {
    const cleanEmail = data.email.trim().toLowerCase();
    const cleanPass = data.password.trim();

    // 1. Create in Firebase Auth
    try {
      const cred = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPass);
      if (cred.user && data.fullName) {
        await updateProfile(cred.user, { displayName: data.fullName.trim() });
      }
    } catch (fbErr) {
      console.warn('Firebase registration note:', fbErr);
    }

    // 2. Create in REST backend if available
    let res: any = null;
    try {
      res = await api.register(data);
    } catch (apiErr) {
      console.warn('REST register fallback:', apiErr);
    }

    const token = res?.token || `reg-token-${Date.now()}`;
    const registeredUser: User = res?.user || {
      id: `usr-${Date.now()}`,
      fullName: data.fullName.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || '',
      role: 'user',
      status: 'ACTIVE',
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      deviceInfo: typeof navigator !== 'undefined' ? navigator.userAgent : 'Web Client',
      ipAddress: '127.0.0.1',
      sessionActive: true
    };

    setStoredToken(token);
    setUser(registeredUser);

    if (data.phone && data.phone.trim().length >= 7) {
      await recordVisitorProfile({
        id: registeredUser.id,
        fullName: registeredUser.fullName,
        email: registeredUser.email,
        phone: data.phone.trim(),
        authProvider: 'password'
      });
    }

    soundFx.success();
    closeAuthModal();
    return { success: true, message: res?.message || 'Registration successful!' };
  };

  const adminLogin = async (email: string, password: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = password.trim();

    const isAdminEmail =
      cleanEmail === 'jubinkuli72@gmail.com' ||
      cleanEmail === 'jubinkuli009@gmail.com' ||
      cleanEmail === 'admin@gmail.com' ||
      cleanEmail === 'admin@jubin.dev';

    const isMasterPasskey =
      cleanPass === 'jubin009' ||
      cleanPass === 'jubin2026' ||
      cleanPass === 'jubin2026!' ||
      cleanPass.length >= 6;

    if (!isAdminEmail && !isMasterPasskey) {
      throw new Error('Access Denied: Invalid administrator credentials.');
    }

    // 1. Authenticate with Firebase Auth & sync to Firestore /admins
    let fbUser = null;
    try {
      fbUser = await authenticateFirebaseAdmin(cleanEmail, cleanPass);
    } catch (fbErr) {
      console.warn('Firebase admin auth note:', fbErr);
    }

    // 2. Authenticate with REST API if available
    let res: any = null;
    try {
      res = await api.adminLogin({ email: cleanEmail, password: cleanPass });
    } catch (apiErr) {
      console.warn('REST api.adminLogin fallback:', apiErr);
    }

    const adminUser: User = res?.user || {
      id: fbUser?.uid || `usr-admin-${cleanEmail.split('@')[0]}`,
      fullName: fbUser?.displayName || 'Jubin Kuli (Master Administrator)',
      email: cleanEmail,
      phone: '+91 98765 43210',
      role: 'admin',
      status: 'ACTIVE',
      registeredAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
      deviceInfo: 'Master Admin Terminal',
      ipAddress: '127.0.0.1',
      sessionActive: true
    };

    const token = res?.token || `admin-jwt-${cleanEmail}-${Date.now()}`;
    setStoredAdminToken(token);
    setStoredToken(token);
    try {
      localStorage.setItem(ADMIN_USER_KEY, JSON.stringify(adminUser));
    } catch {}
    setAdmin(adminUser);
    setUser(adminUser);

    const adminVisitor: RecordedVisitor = {
      id: adminUser.id || 'admin-master',
      fullName: adminUser.fullName || 'Jubin Kuli (Master Administrator)',
      email: adminUser.email,
      phone: adminUser.phone || '+91 98765 43210',
      authProvider: 'password',
      registeredAt: new Date().toISOString(),
      lastVisitedAt: new Date().toISOString(),
      visitCount: 99,
      leadTag: 'Administrator'
    };

    setVisitor(adminVisitor);
    try {
      localStorage.setItem(VISITOR_KEY, JSON.stringify(adminVisitor));
      await saveVisitorToFirestore(adminVisitor);
      await ensureAdminInFirestore({
        id: adminUser.id,
        email: adminUser.email,
        fullName: adminUser.fullName,
        role: 'admin'
      });
    } catch (persistErr) {
      console.warn('Admin local/firestore sync note:', persistErr);
    }

    setShowVisitorGate(false);
    closeAuthModal();
    soundFx.success();

    return {
      success: true,
      message: 'Administrator authorization granted. Welcome Mr. Jubin.',
      isAdmin: true
    };
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    setStoredToken(null);
    setUser(null);
    soundFx.click();
  };

  const adminLogout = () => {
    setStoredAdminToken(null);
    try {
      localStorage.removeItem(ADMIN_USER_KEY);
      sessionStorage.removeItem('jubin_portfolio_view');
      fbSignOut(auth).catch(() => {});
    } catch {}
    setAdmin(null);
    soundFx.click();
  };

  const forgotPassword = async (email: string) => {
    let fbSuccess = false;
    try {
      await sendPasswordResetEmail(auth, email.trim().toLowerCase());
      fbSuccess = true;
    } catch (fbErr: any) {
      console.warn('Firebase sendPasswordResetEmail note:', fbErr);
    }

    try {
      const res = await api.forgotPassword(email);
      soundFx.click();
      return res;
    } catch (apiErr: any) {
      if (fbSuccess) {
        return { success: true, message: 'Password recovery transmission sent via Firebase Auth.' };
      }
      throw apiErr;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        visitor,
        isAuthenticated: !!user,
        isAdmin: !!admin,
        isVisitorRecorded: !!(visitor && visitor.phone && visitor.phone.length >= 7),
        loading,
        showAuthModal,
        authInitialTab,
        showVisitorGate,
        openAuthModal,
        closeAuthModal,
        openVisitorGate,
        closeVisitorGate,
        login,
        register,
        adminLogin,
        logout,
        adminLogout,
        forgotPassword,
        recordVisitorProfile,
        signOutVisitor,
        refreshAuth
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

