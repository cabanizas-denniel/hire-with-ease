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
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
  deleteField,
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { APPLICATION_STATUS, JOB_STATUS } from './statuses.js';
import { recordMatchDecline } from './matchDeclines.js';
import { sendMessage } from './threads.js';
import { notifyHireDeclined } from '../notifications.js';

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
  clientEmail = null,
  clientMobile = null,
  clientTrustTier = null,
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
      clientEmail: clientEmail || null,
      clientMobile: clientMobile || null,
      clientTrustTier:
        typeof clientTrustTier === 'number' ? clientTrustTier : null,
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

/** Clear hire lock so the job can match / negotiate again. */
export async function unlockConfirmedHire(jobId) {
  if (!jobId) return;
  await updateDoc(doc(db, 'jobs', jobId), {
    confirmedWorkerId: deleteField(),
    confirmedWorkerName: deleteField(),
    agreement: deleteField(),
    status: JOB_STATUS.MATCHED,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Decline / withdraw a hire for either party.
 * If this worker was the locked hire, clears the job lock for both sides.
 */
export async function declineApplication(appId, { byRole = 'client' } = {}) {
  if (!appId) throw new Error('declineApplication: appId required');
  if (byRole !== 'client' && byRole !== 'worker') {
    throw new Error('declineApplication: byRole must be client or worker');
  }

  const appRef = doc(db, 'applications', appId);
  const appSnap = await getDoc(appRef);
  if (!appSnap.exists()) throw new Error('Application no longer exists.');
  const app = appSnap.data();
  const jobId = app.jobId;
  const workerId = app.workerId;
  const clientId = app.clientId;

  await updateDoc(appRef, {
    status: APPLICATION_STATUS.DECLINED,
    proposedAgreement: null,
    proposedBy: null,
    confirmedByClient: false,
    confirmedByWorker: false,
    declinedBy: byRole,
    declinedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });

  let unlocked = false;
  if (jobId) {
    const jobSnap = await getDoc(doc(db, 'jobs', jobId));
    const job = jobSnap.exists() ? jobSnap.data() : null;
    const wasLockedToThisWorker =
      Boolean(job?.confirmedWorkerId) && job.confirmedWorkerId === workerId;
    if (wasLockedToThisWorker) {
      await unlockConfirmedHire(jobId);
      unlocked = true;
    }
  }

  if (jobId && workerId) {
    try {
      await recordMatchDecline({ jobId, workerId });
    } catch (err) {
      console.warn('Could not record match decline', err);
    }
    try {
      const { removeWorkerFromJobShortlist } = await import('./jobs.js');
      await removeWorkerFromJobShortlist(jobId, workerId);
    } catch (err) {
      console.warn('Could not prune worker from shortlist', err);
    }
  }

  const eventAt = new Date().toISOString();
  try {
    await notifyHireDeclined({
      workerId,
      clientId,
      jobId,
      jobTitle: app.jobTitle,
      byRole,
      unlocked,
      eventAt,
    });
  } catch (err) {
    console.warn('Could not create decline notifications', err);
  }

  if (jobId && workerId && clientId) {
    try {
      const text =
        byRole === 'client'
          ? unlocked
            ? 'Homeowner declined this hire — booking unlocked.'
            : 'Homeowner declined this worker.'
          : unlocked
            ? 'Worker declined this hire — booking unlocked.'
            : 'Worker withdrew from this job.';
      await sendMessage({
        jobId,
        workerId,
        clientId,
        jobTitle: app.jobTitle,
        authorId: byRole === 'client' ? clientId : workerId,
        authorName: byRole === 'client' ? app.clientName || 'Homeowner' : app.workerName || 'Worker',
        authorRole: byRole,
        text,
        messageType: 'hire_declined',
        replaceMessageTypes: ['schedule', 'agreement_confirmed', 'hire_declined'],
      });
    } catch (err) {
      console.warn('Could not post decline message to chat', err);
    }
  }

  return { unlocked };
}

/** Worker withdraws their own application (same unlock rules as client decline). */
export async function withdrawApplication(appId) {
  return declineApplication(appId, { byRole: 'worker' });
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
  const others = snap.docs.filter((d) => d.data().workerId !== keepWorkerId);

  await Promise.all(
    others
      .filter((d) => d.data().status !== APPLICATION_STATUS.DECLINED)
      .map((d) =>
        updateDoc(d.ref, {
          status: APPLICATION_STATUS.DECLINED,
          declinedBy: 'system',
          declinedAt: new Date().toISOString(),
          updatedAt: serverTimestamp(),
        })
      )
  );

  // Keep them off rematch / shortlist permanently for this job.
  await Promise.all(
    others.map(async (d) => {
      const workerId = d.data().workerId;
      if (!workerId) return;
      try {
        await recordMatchDecline({ jobId, workerId });
      } catch {
        /* ignore */
      }
    }),
  );

  try {
    const { keepOnlyWorkerOnJobShortlist } = await import('./jobs.js');
    await keepOnlyWorkerOnJobShortlist(jobId, keepWorkerId);
  } catch (err) {
    console.warn('Could not prune shortlist to confirmed worker', err);
  }
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
