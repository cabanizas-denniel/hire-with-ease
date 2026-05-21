/**
 * Thin React hooks around the Firestore subscriptions in this folder.
 * Pages should reach for these instead of calling onSnapshot directly,
 * so cleanup, loading, and error handling stay consistent.
 */

import { useEffect, useState } from 'react';
import {
  subscribeApplication,
  subscribeApplicationsByWorker,
  subscribeApplicationsForJob,
} from './applications.js';
import {
  subscribeJob,
  subscribeJobsByOwner,
  subscribeOpenJobs,
} from './jobs.js';
import { subscribeMessages, subscribeThread } from './threads.js';
import { subscribeWorkerProfile } from './workerProfile.js';

/**
 * Generic Firestore subscription hook.
 *
 * `key` should change whenever the underlying query should restart.
 * We track the most recently emitted key alongside the data so we can
 * report `loading: true` for stale snapshots WITHOUT setting state from
 * inside the effect body (React 19's hooks plugin flags that as a
 * cascading-render risk).
 */
function useSubscription(subscribe, deps, initial, key) {
  const [snapshot, setSnapshot] = useState({
    key: null,
    data: initial,
    error: null,
  });

  useEffect(() => {
    const unsub = subscribe(
      (data) => setSnapshot({ key, data, error: null }),
      (error) => setSnapshot({ key, data: initial, error })
    );
    return unsub;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const stale = snapshot.key !== key;
  return {
    data: stale ? initial : snapshot.data,
    loading: stale,
    error: stale ? null : snapshot.error,
  };
}

export function useJobsByOwner(uid) {
  return useSubscription(
    (onData, onError) => subscribeJobsByOwner(uid, onData, onError),
    [uid],
    [],
    `jobs-by-owner:${uid || ''}`
  );
}

export function useOpenJobs() {
  return useSubscription(
    (onData, onError) => subscribeOpenJobs(onData, onError),
    [],
    [],
    'open-jobs'
  );
}

export function useJob(jobId) {
  return useSubscription(
    (onData, onError) => subscribeJob(jobId, onData, onError),
    [jobId],
    null,
    `job:${jobId || ''}`
  );
}

export function useApplicationsForJob(jobId) {
  return useSubscription(
    (onData, onError) => subscribeApplicationsForJob(jobId, onData, onError),
    [jobId],
    [],
    `apps-for-job:${jobId || ''}`
  );
}

export function useApplicationsByWorker(workerId) {
  return useSubscription(
    (onData, onError) => subscribeApplicationsByWorker(workerId, onData, onError),
    [workerId],
    [],
    `apps-by-worker:${workerId || ''}`
  );
}

export function useApplication(appId) {
  return useSubscription(
    (onData, onError) => subscribeApplication(appId, onData, onError),
    [appId],
    null,
    `app:${appId || ''}`
  );
}

export function useMessages(threadId) {
  return useSubscription(
    (onData, onError) => subscribeMessages(threadId, onData, onError),
    [threadId],
    [],
    `messages:${threadId || ''}`
  );
}

export function useThread(threadId) {
  return useSubscription(
    (onData, onError) => subscribeThread(threadId, onData, onError),
    [threadId],
    null,
    `thread:${threadId || ''}`
  );
}

export function useWorkerProfile(uid) {
  return useSubscription(
    (onData, onError) => subscribeWorkerProfile(uid, onData, onError),
    [uid],
    null,
    `worker-profile:${uid || ''}`
  );
}
