/**
 * When a worker declines a matched job, we record it under the job so the
 * homeowner shortlist updates (worker profile dismiss only hides it locally).
 */

import {
  collection,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

export function subscribeMatchDeclines(jobId, onData, onError) {
  if (!db || !jobId) {
    onData([]);
    return () => {};
  }
  return onSnapshot(
    collection(db, 'jobs', jobId, 'match_declines'),
    (snap) => {
      onData(snap.docs.map((d) => ({ docId: d.id, ...d.data() })));
    },
    (err) => onError?.(err),
  );
}

export async function recordMatchDecline({ jobId, workerId }) {
  if (!db || !jobId || !workerId) return;
  await setDoc(
    doc(db, 'jobs', jobId, 'match_declines', workerId),
    {
      workerId,
      jobId,
      declinedAt: serverTimestamp(),
    },
    { merge: true },
  );
}

/**
 * Workers who declined this job — from match_declines docs and/or profile.dismissedJobIds.
 * Homeowners can read worker_profiles, so profile dismiss always counts even if
 * match_declines write failed (e.g. rules not deployed yet).
 */
export function collectDeclinedWorkerIds(
  jobId,
  workerProfiles = [],
  matchDeclineDocs = [],
) {
  const declined = new Set();
  for (const d of matchDeclineDocs) {
    const id = d.workerId || d.docId;
    if (id) declined.add(id);
  }
  if (!jobId) return declined;
  for (const profile of workerProfiles) {
    const id = profile.docId || profile.uid || profile.id;
    if (!id) continue;
    if ((profile.dismissedJobIds || []).includes(jobId)) {
      declined.add(id);
    }
  }
  return declined;
}
