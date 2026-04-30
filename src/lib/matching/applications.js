/**
 * Worker -> Job applications.
 *
 * `apply` is interest, NOT acceptance. The actual hiring decision is
 * made when both parties confirm an Agreement (see ./agreements.js).
 *
 * Each application carries denormalised worker info so list views
 * don't need to re-fetch /worker_profiles for every row.
 */

import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { APPLICATION_STATUS } from './statuses.js';

export function buildApplicationId(jobId, workerId) {
  return `app-${jobId}-${workerId}`;
}

/**
 * Worker applies to a job. Idempotent: re-applying just refreshes the
 * timestamp and bumps any declined application back to pending.
 */
export async function applyToJob({
  jobId,
  workerId,
  workerName,
  workerSkills = [],
  clientId,
  clientName,
  jobTitle,
  message,
}) {
  const id = buildApplicationId(jobId, workerId);
  const ref = doc(db, 'applications', id);
  await setDoc(
    ref,
    {
      id,
      jobId,
      workerId,
      workerName: workerName || null,
      workerSkills,
      clientId: clientId || null,
      clientName: clientName || null,
      jobTitle: jobTitle || null,
      status: APPLICATION_STATUS.PENDING,
      message: message || null,
      proposedAgreement: null,
      proposedBy: null,
      confirmedByClient: false,
      confirmedByWorker: false,
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return id;
}

export function subscribeApplicationsForJob(jobId, onData, onError) {
  if (!jobId) {
    onData([]);
    return () => {};
  }
  const q = query(collection(db, 'applications'), where('jobId', '==', jobId));
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const ta = a.appliedAt?.toMillis?.() ?? 0;
        const tb = b.appliedAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onData(docs);
    },
    (err) => onError?.(err)
  );
}

export function subscribeApplicationsByWorker(workerId, onData, onError) {
  if (!workerId) {
    onData([]);
    return () => {};
  }
  const q = query(collection(db, 'applications'), where('workerId', '==', workerId));
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const ta = a.appliedAt?.toMillis?.() ?? 0;
        const tb = b.appliedAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onData(docs);
    },
    (err) => onError?.(err)
  );
}

export function subscribeApplication(appId, onData, onError) {
  if (!appId) {
    onData(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, 'applications', appId),
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

/**
 * Mark an application as engaged in negotiation. Either side can move
 * the status off `pending` once they start chatting.
 */
export async function moveToNegotiating(appId) {
  await updateDoc(doc(db, 'applications', appId), {
    status: APPLICATION_STATUS.NEGOTIATING,
    updatedAt: serverTimestamp(),
  });
}

/** Client declines a specific applicant; their card disappears from the list. */
export async function declineApplication(appId) {
  await updateDoc(doc(db, 'applications', appId), {
    status: APPLICATION_STATUS.DECLINED,
    updatedAt: serverTimestamp(),
  });
}

/** Worker withdraws their own application. */
export async function withdrawApplication(appId) {
  await updateDoc(doc(db, 'applications', appId), {
    status: APPLICATION_STATUS.DECLINED,
    updatedAt: serverTimestamp(),
  });
}

/** Mark an application as completed once the underlying job is finished. */
export async function markApplicationCompleted(appId) {
  await updateDoc(doc(db, 'applications', appId), {
    status: APPLICATION_STATUS.COMPLETED,
    updatedAt: serverTimestamp(),
  });
}

/**
 * One-shot "decline all other applicants once one is confirmed". Used by
 * the agreement flow so the chosen worker is the only one left active.
 */
export async function declineOtherApplicants(jobId, keepWorkerId) {
  const q = query(collection(db, 'applications'), where('jobId', '==', jobId));
  const snap = await getDocs(q);
  await Promise.all(
    snap.docs
      .filter((d) => d.data().workerId !== keepWorkerId)
      .filter((d) => d.data().status !== APPLICATION_STATUS.DECLINED)
      .map((d) =>
        updateDoc(d.ref, {
          status: APPLICATION_STATUS.DECLINED,
          updatedAt: serverTimestamp(),
        })
      )
  );
}

/** Employer withdrew the request — close out every non-terminal application. */
export async function declineAllApplicationsForJob(jobId) {
  if (!jobId) return;
  const q = query(collection(db, 'applications'), where('jobId', '==', jobId));
  const snap = await getDocs(q);
  await Promise.all(
    snap.docs
      .filter((d) => {
        const s = d.data().status;
        return s !== APPLICATION_STATUS.DECLINED && s !== APPLICATION_STATUS.COMPLETED;
      })
      .map((d) =>
        updateDoc(d.ref, {
          status: APPLICATION_STATUS.DECLINED,
          updatedAt: serverTimestamp(),
        })
      )
  );
}
