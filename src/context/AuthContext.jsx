/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db, isFirebaseConfigured } from '../lib/firebase.js';
import { ensureWorkerProfile } from '../lib/matching/workerProfile.js';
import {
  FIRESTORE_ROLES,
  isValidFirestoreRole,
  toAppRole,
  toFirestoreRole,
} from '../lib/roleMap.js';

const AuthContext = createContext(null);

const DASHBOARD_BY_ROLE = {
  applicant: '/applicant/dashboard',
  employer: '/employer/dashboard',
  admin: '/admin/dashboard',
};

const INITIAL_STATE = {
  isAuthenticated: false,
  role: null,
  user: null,
  profile: null,
  loading: true,
};

async function loadUserProfile(firebaseUser) {
  if (!db) {
    return { firestoreRole: null, fullName: firebaseUser.displayName || '', profile: null };
  }
  const ref = doc(db, 'users', firebaseUser.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    return { firestoreRole: null, fullName: firebaseUser.displayName || '', profile: null };
  }
  const data = snap.data();
  return {
    firestoreRole: data.role ?? null,
    fullName: data.fullName || firebaseUser.displayName || '',
    profile: data,
  };
}

export function AuthProvider({ children }) {
  const [authState, setAuthState] = useState(INITIAL_STATE);

  useEffect(() => {
    if (!auth) {
      setAuthState({ ...INITIAL_STATE, loading: false });
      return undefined;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthState({ ...INITIAL_STATE, loading: false });
        return;
      }
      // Treat unverified accounts as "not signed in" in the app. This prevents
      // a brief authenticated render between sign-in and the forced sign-out
      // we do for unverified users.
      if (!firebaseUser.emailVerified) {
        setAuthState({ ...INITIAL_STATE, loading: false });
        try {
          void signOut(auth);
        } catch {
          /* ignore */
        }
        return;
      }
      try {
        const { firestoreRole, fullName, profile } = await loadUserProfile(firebaseUser);

        // Workers need a /worker_profiles doc for the matching engine to
        // surface jobs to them. Bootstrap a minimal one if missing.
        if (firestoreRole === FIRESTORE_ROLES.INFORMAL_WORKER) {
          try {
            // Don't block login/registration UI on this; it's best-effort.
            void ensureWorkerProfile({
              uid: firebaseUser.uid,
              name: fullName || firebaseUser.email,
              email: firebaseUser.email,
              location: profile?.coords
                ? {
                    lat: profile.coords.lat,
                    lng: profile.coords.lng,
                    barangay: profile.barangay || null,
                    label: profile.location || null,
                  }
                : null,
            }).catch((err) => {
              console.warn('Worker profile bootstrap failed', err);
            });
          } catch (err) {
             
            console.warn('Worker profile bootstrap failed', err);
          }
        }

        setAuthState({
          isAuthenticated: true,
          role: toAppRole(firestoreRole),
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: fullName || 'User',
          },
          profile,
          loading: false,
        });
      } catch (err) {
         
        console.error('Failed to load user profile from Firestore', err);
        setAuthState({
          isAuthenticated: true,
          role: null,
          user: {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            fullName: firebaseUser.displayName || 'User',
          },
          profile: null,
          loading: false,
        });
      }
    });
    return unsubscribe;
  }, []);

  const login = useCallback(async ({ email, password }) => {
    if (!auth) {
      throw new Error('Firebase is not configured; auth is unavailable.');
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (cred?.user && !cred.user.emailVerified) {
      await signOut(auth);
      const err = new Error('Email address not verified.');
      err.code = 'auth/email-not-verified';
      throw err;
    }
    const { firestoreRole } = await loadUserProfile(cred.user);
    return toAppRole(firestoreRole);
  }, []);

  const resendVerificationEmail = useCallback(async ({ email, password }) => {
    if (!auth) {
      throw new Error('Firebase is not configured; auth is unavailable.');
    }
    const cred = await signInWithEmailAndPassword(auth, email, password);
    if (!cred?.user) {
      const err = new Error('Could not sign in to resend verification email.');
      err.code = 'auth/resend-failed';
      throw err;
    }

    if (cred.user.emailVerified) {
      await signOut(auth);
      const err = new Error('Email is already verified. You can sign in now.');
      err.code = 'auth/already-verified';
      throw err;
    }

    try {
      await sendEmailVerification(cred.user);
    } catch (e) {
      const err = new Error(e?.message || 'Could not resend verification email. Please try again.');
      err.code = e?.code || 'auth/resend-failed';
      throw err;
    } finally {
      await signOut(auth);
    }

    return true;
  }, []);

  const sendPasswordReset = useCallback(async ({ email } = {}) => {
    if (!auth) {
      throw new Error('Firebase is not configured; auth is unavailable.');
    }
    const trimmed = typeof email === 'string' ? email.trim() : '';
    if (!trimmed) {
      const err = new Error('Please enter your email address.');
      err.code = 'auth/missing-email';
      throw err;
    }
    await sendPasswordResetEmail(auth, trimmed);
    return true;
  }, []);

  const register = useCallback(async ({ email, password, fullName, role }) => {
    if (!auth || !db) {
      throw new Error('Firebase is not configured; registration is unavailable.');
    }
    const firestoreRole = toFirestoreRole(role);
    if (!isValidFirestoreRole(firestoreRole) || firestoreRole === 'admin') {
      // Admin role can never be self-assigned. Frontend guard mirrors Firestore Rules.
      throw new Error('Invalid role for self-registration.');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);

    // Don't block the registration flow on these writes. The user will be
    // logged in and the onAuthStateChanged handler will eventually reconcile
    // the profile information. This makes the UI feel much faster.
    const profilePromise = fullName ? updateProfile(cred.user, { displayName: fullName }) : Promise.resolve();
    const verifyPromise = sendEmailVerification(cred.user).catch(() => null);
    const firestorePromise = setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email,
      fullName: fullName || '',
      role: firestoreRole,
      verification: {
        // Keep a stable shape so rules + UI can rely on it.
        role: firestoreRole === FIRESTORE_ROLES.HOMEOWNER ? 'client' : 'service-provider',
        stage1: { mobile: null, email: email || null, otpVerifiedAt: null },
        stage2: {
          idSubmittedAt: null,
          selfieSubmittedAt: null,
          reviewStatus: 'not-started',
          reviewedBy: null,
          reviewedAt: null,
          reviewNote: '',
          idImage: null,
          idBackImage: null,
          selfieImage: null,
        },
        stage3: { documents: [], documentBacked: false },
        stage4: { activatedAt: null, activatedBy: null },
      },
      createdAt: serverTimestamp(),
    });

    void verifyPromise;

    // Option A: account is not usable until email is verified.
    // Create the profile, send the verification email, then sign out.
    await signOut(auth);
    const err = new Error('Please verify your email to activate your account.');
    err.code = 'auth/email-verification-required';
    throw err;
  }, []);

  const logout = useCallback(async () => {
    if (!auth) return;
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      isFirebaseConfigured,
      login,
      resendVerificationEmail,
      sendPasswordReset,
      register,
      logout,
      getDefaultRoute: (role = authState.role) => DASHBOARD_BY_ROLE[role] || '/login',
    }),
    [authState, login, resendVerificationEmail, sendPasswordReset, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return context;
}
