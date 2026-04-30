/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase.js';
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setAuthState({ ...INITIAL_STATE, loading: false });
        return;
      }
      try {
        const { firestoreRole, fullName, profile } = await loadUserProfile(firebaseUser);

        // Workers need a /worker_profiles doc for the matching engine to
        // surface jobs to them. Bootstrap a minimal one if missing.
        if (firestoreRole === FIRESTORE_ROLES.INFORMAL_WORKER) {
          try {
            await ensureWorkerProfile({
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
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const { firestoreRole } = await loadUserProfile(cred.user);
    return toAppRole(firestoreRole);
  }, []);

  const register = useCallback(async ({ email, password, fullName, role }) => {
    const firestoreRole = toFirestoreRole(role);
    if (!isValidFirestoreRole(firestoreRole) || firestoreRole === 'admin') {
      // Admin role can never be self-assigned. Frontend guard mirrors Firestore Rules.
      throw new Error('Invalid role for self-registration.');
    }
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName) {
      await updateProfile(cred.user, { displayName: fullName });
    }
    await setDoc(doc(db, 'users', cred.user.uid), {
      uid: cred.user.uid,
      email,
      fullName: fullName || '',
      role: firestoreRole,
      createdAt: serverTimestamp(),
    });
    return toAppRole(firestoreRole);
  }, []);

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({
      ...authState,
      login,
      register,
      logout,
      getDefaultRoute: (role = authState.role) => DASHBOARD_BY_ROLE[role] || '/login',
    }),
    [authState, login, register, logout]
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
