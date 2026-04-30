/**
 * Worker profile helpers.
 *
 * /worker_profiles/{uid} is keyed by the worker's auth UID. The
 * profile carries the data the matching engine reads:
 *   skills, availability, location, preferredCategories, ratings, etc.
 *
 * Workers have to have a profile for jobs to ever surface to them on
 * the matched-jobs screen. We bootstrap a minimal one on first login.
 */

import {
  doc,
  getDoc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

const DEFAULT_PROFILE = {
  skills: [],
  certifications: [],
  availability: [],
  preferredCategories: [],
  experienceLevel: 'Junior',
  yearsExperience: 0,
  rating: null,
  jobsCompleted: 0,
  completionRate: 0,
  verified: false,
  moderationStatus: 'active',
};

export async function getWorkerProfile(uid) {
  if (!uid) return null;
  const snap = await getDoc(doc(db, 'worker_profiles', uid));
  if (!snap.exists()) return null;
  return { docId: snap.id, ...snap.data() };
}

/**
 * Create a minimal worker profile if one doesn't exist yet. Safe to
 * call on every login. Honours `merge: true` so we never clobber data
 * the worker has already filled in.
 */
export async function ensureWorkerProfile({ uid, name, email, location }) {
  if (!uid) return null;
  const ref = doc(db, 'worker_profiles', uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return { docId: snap.id, ...snap.data() };

  const fresh = {
    id: uid,
    uid,
    name: name || email || 'New worker',
    email: email || null,
    ...DEFAULT_PROFILE,
    location: location || { lat: null, lng: null, barangay: null, label: null },
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
  await setDoc(ref, fresh, { merge: true });
  return fresh;
}

export function subscribeWorkerProfile(uid, onData, onError) {
  if (!uid) {
    onData(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, 'worker_profiles', uid),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ docId: snap.id, ...snap.data() });
    },
    (err) => onError?.(err)
  );
}

export async function saveWorkerProfile(uid, partial) {
  if (!uid) throw new Error('saveWorkerProfile: uid required');
  await updateDoc(doc(db, 'worker_profiles', uid), {
    ...partial,
    updatedAt: serverTimestamp(),
  });
}
