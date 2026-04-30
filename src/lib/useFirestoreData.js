import { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';

/**
 * Subscribe to a Firestore collection and return its docs as
 * `{ data, loading, error }`. Real-time via onSnapshot.
 *
 * Generic on purpose: callers (useJobs, useWorkerProfiles, etc.) just
 * pass the collection path. Filtering and sorting happen on the client
 * for the cold-start dataset (small, < a few hundred docs).
 */
export function useCollection(path) {
  // Keyed by `path` so a path swap resets the loading flag without
  // requiring a setState during the effect body (which React 19's
  // hooks plugin flags as a cascading-render risk).
  const [state, setState] = useState({
    path: null,
    data: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, path),
      (snap) => {
        const data = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
        setState({ path, data, loading: false, error: null });
      },
      (error) => {
        setState({ path, data: [], loading: false, error });
      }
    );

    return unsubscribe;
  }, [path]);

  // While the path differs from the most recently emitted snapshot we
  // surface `loading: true`. This keeps callers honest about staleness
  // when the path changes without us having to call setState in-effect.
  const stale = state.path !== path;
  return {
    data: stale ? [] : state.data,
    loading: stale ? true : state.loading,
    error: stale ? null : state.error,
  };
}

export function useJobs() {
  return useCollection('jobs');
}

export function useWorkerProfiles() {
  return useCollection('worker_profiles');
}

export function useApplications() {
  return useCollection('applications');
}
