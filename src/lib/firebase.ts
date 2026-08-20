import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  signOut as fbSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type User as FirebaseUser
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  collection,
  query,
  orderBy,
  getDocFromServer,
  onSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import type { RecordedVisitor } from '../types.ts';

// Safe environment variable accessor
const env = (import.meta as any).env || {};

// Initialize Firebase App configuration with environment variable support
const effectiveFirebaseConfig = {
  projectId: env.VITE_FIREBASE_PROJECT_ID || firebaseConfig.projectId,
  appId: env.VITE_FIREBASE_APP_ID || firebaseConfig.appId,
  apiKey: env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || firebaseConfig.authDomain,
  firestoreDatabaseId: env.VITE_FIREBASE_DATABASE_ID || firebaseConfig.firestoreDatabaseId,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || firebaseConfig.storageBucket,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || firebaseConfig.messagingSenderId,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || firebaseConfig.measurementId,
  oAuthClientId: env.VITE_FIREBASE_OAUTH_CLIENT_ID || firebaseConfig.oAuthClientId
};

// Initialize Firebase App instance
const app = !getApps().length ? initializeApp(effectiveFirebaseConfig) : getApp();

/* CRITICAL: The app will break without specifying firestoreDatabaseId */
export const db = getFirestore(app, effectiveFirebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});
googleProvider.addScope('email');
googleProvider.addScope('profile');

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map(provider => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Test connection on boot
export async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase Firestore client is offline or initializing.');
    }
  }
}

// Helper: Save or update recorded visitor in Firebase Firestore
export async function saveVisitorToFirestore(visitor: RecordedVisitor): Promise<void> {
  const docPath = `visitors/${visitor.id}`;
  try {
    const docRef = doc(db, 'visitors', visitor.id);
    const existingSnap = await getDoc(docRef).catch(() => null);

    if (existingSnap && existingSnap.exists()) {
      const currentData = existingSnap.data() as RecordedVisitor;
      const updatedCount = (currentData.visitCount || 1) + 1;
      await updateDoc(docRef, {
        lastVisitedAt: new Date().toISOString(),
        visitCount: updatedCount,
        deviceInfo: visitor.deviceInfo || currentData.deviceInfo || '',
        phone: visitor.phone || currentData.phone,
        fullName: visitor.fullName || currentData.fullName
      });
    } else {
      await setDoc(docRef, {
        id: visitor.id,
        fullName: visitor.fullName,
        email: visitor.email,
        phone: visitor.phone,
        authProvider: visitor.authProvider || 'custom',
        photoUrl: visitor.photoUrl || '',
        registeredAt: visitor.registeredAt || new Date().toISOString(),
        lastVisitedAt: new Date().toISOString(),
        visitCount: 1,
        deviceInfo: visitor.deviceInfo || (typeof navigator !== 'undefined' ? navigator.userAgent : ''),
        leadTag: visitor.leadTag || 'General',
        notes: visitor.notes || ''
      });
    }
  } catch (error) {
    console.warn(`Firestore save visitor note for ${docPath}:`, error);
  }
}

// Helper: Fetch all recorded visitors from Firestore (for Admin view)
export async function fetchVisitorsFromFirestore(): Promise<RecordedVisitor[]> {
  const collectionPath = 'visitors';
  try {
    const visitorsCol = collection(db, collectionPath);
    const snapshot = await getDocs(visitorsCol);
    const visitors: RecordedVisitor[] = [];
    snapshot.forEach(docSnap => {
      visitors.push(docSnap.data() as RecordedVisitor);
    });
    return visitors;
  } catch (error) {
    console.warn('Firestore fetch visitors note (falling back to REST API data):', error);
    return [];
  }
}

// Helper: Update single visitor (e.g. admin notes or lead tag)
export async function updateVisitorInFirestore(
  id: string,
  updates: Partial<RecordedVisitor>
): Promise<void> {
  const docPath = `visitors/${id}`;
  try {
    const docRef = doc(db, 'visitors', id);
    await updateDoc(docRef, updates as any);
  } catch (error) {
    console.warn(`Firestore update visitor error (${docPath}):`, error);
  }
}

// Helper: Delete single visitor
export async function deleteVisitorFromFirestore(id: string): Promise<void> {
  const docPath = `visitors/${id}`;
  try {
    const docRef = doc(db, 'visitors', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.warn(`Firestore delete visitor error (${docPath}):`, error);
  }
}

// Helper: Ensure admin profile exists in Firestore /admins collection
export async function ensureAdminInFirestore(adminData: {
  id?: string;
  email: string;
  fullName: string;
  role?: string;
}): Promise<void> {
  try {
    const adminId = adminData.id || auth.currentUser?.uid || 'admin-master';
    const docRef = doc(db, 'admins', adminId);
    await setDoc(
      docRef,
      {
        id: adminId,
        email: adminData.email.toLowerCase().trim(),
        fullName: adminData.fullName,
        role: 'admin',
        updatedAt: new Date().toISOString()
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Firestore ensureAdminInFirestore note:', err);
  }
}

// Helper: Robust Firebase sign-in / auto-provisioning for Master Admin
export async function authenticateFirebaseAdmin(
  email: string,
  pass: string
): Promise<FirebaseUser | null> {
  const cleanEmail = email.trim().toLowerCase();
  try {
    // Attempt standard sign in
    const cred = await signInWithEmailAndPassword(auth, cleanEmail, pass);
    if (cred.user) {
      await ensureAdminInFirestore({
        id: cred.user.uid,
        email: cleanEmail,
        fullName: cred.user.displayName || 'Jubin Kuli (Master Administrator)'
      });
      return cred.user;
    }
  } catch (err: any) {
    // If user is not yet created in this Firebase project, create it automatically
    if (
      err.code === 'auth/user-not-found' ||
      err.code === 'auth/invalid-credential' ||
      err.code === 'auth/wrong-password' ||
      err.message?.includes('user-not-found') ||
      err.message?.includes('invalid-credential')
    ) {
      try {
        const createCred = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
        if (createCred.user) {
          await updateProfile(createCred.user, {
            displayName: 'Jubin Kuli (Master Administrator)'
          });
          await ensureAdminInFirestore({
            id: createCred.user.uid,
            email: cleanEmail,
            fullName: 'Jubin Kuli (Master Administrator)'
          });
          return createCred.user;
        }
      } catch (createErr) {
        console.warn('Firebase admin auto-provisioning note:', createErr);
      }
    }
    console.warn('Firebase authenticateFirebaseAdmin note:', err);
  }
  return auth.currentUser;
}

export {
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendEmailVerification,
  updateProfile,
  fbSignOut,
  onAuthStateChanged,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  type ConfirmationResult,
  type FirebaseUser
};
