/**
 * Final-agreement workflow. This is the commitment point of the booking
 * lifecycle described in the spec:
 *
 *   1. Either side proposes price + schedule + scope.
 *   2. The other side confirms (or counter-proposes by re-calling propose).
 *   3. When BOTH sides have confirmed, the job locks:
 *        application.status = 'confirmed'
 *        job.status         = 'Confirmed'
 *        job.confirmedWorkerId is recorded
 *        all other applications for the job are auto-declined
 *
 * Worker then transitions the job to "In Progress" on arrival and the
 * client closes it with "Completed". Those are simple status pokes
 * defined on jobs.js.
 */

import { doc, getDoc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import {
  declineOtherApplicants,
  buildApplicationId,
} from './applications.js';
import { setJobStatus } from './jobs.js';
import { APPLICATION_STATUS, JOB_STATUS } from './statuses.js';

/**
 * Propose (or counter-propose) the final agreement for a single
 * applicant. Resets confirmations because we're back to a one-sided
 * offer until the other party accepts.
 *
 * @param {object} params
 * @param {string} params.appId
 * @param {'client'|'worker'} params.proposerRole
 * @param {object} params.agreement  - { price, schedule, scope }
 */
export async function proposeAgreement({ appId, proposerRole, agreement }) {
  if (!appId) throw new Error('proposeAgreement: appId required');
  if (proposerRole !== 'client' && proposerRole !== 'worker') {
    throw new Error('proposeAgreement: proposerRole must be client or worker');
  }
  if (!agreement || typeof agreement !== 'object') {
    throw new Error('proposeAgreement: agreement object required');
  }
  const { price, schedule, scope } = agreement;
  await updateDoc(doc(db, 'applications', appId), {
    status: APPLICATION_STATUS.PROPOSED,
    proposedAgreement: {
      price: price || null,
      schedule: schedule || null,
      scope: scope || null,
      proposedAt: new Date().toISOString(),
    },
    proposedBy: proposerRole,
    confirmedByClient: proposerRole === 'client',
    confirmedByWorker: proposerRole === 'worker',
    updatedAt: serverTimestamp(),
  });
}

/**
 * The other party accepts the proposed agreement. If both flags become
 * true the job is locked.
 */
export async function confirmAgreement({ appId, role }) {
  if (!appId) throw new Error('confirmAgreement: appId required');
  if (role !== 'client' && role !== 'worker') {
    throw new Error('confirmAgreement: role must be client or worker');
  }

  const appRef = doc(db, 'applications', appId);
  const appSnap = await getDoc(appRef);
  if (!appSnap.exists()) throw new Error('Application no longer exists.');
  const app = appSnap.data();

  if (!app.proposedAgreement) {
    throw new Error('Nothing to confirm — no agreement has been proposed yet.');
  }

  const confirmedByClient = role === 'client' ? true : !!app.confirmedByClient;
  const confirmedByWorker = role === 'worker' ? true : !!app.confirmedByWorker;
  const bothAgree = confirmedByClient && confirmedByWorker;

  await updateDoc(appRef, {
    confirmedByClient,
    confirmedByWorker,
    status: bothAgree ? APPLICATION_STATUS.CONFIRMED : APPLICATION_STATUS.PROPOSED,
    updatedAt: serverTimestamp(),
  });

  if (bothAgree) {
    await setJobStatus(app.jobId, JOB_STATUS.CONFIRMED, {
      confirmedWorkerId: app.workerId,
      confirmedWorkerName: app.workerName || null,
      agreement: app.proposedAgreement,
    });
    // Auto-decline any other applicants for this job; only one worker
    // can hold the booking once mutual agreement is reached.
    await declineOtherApplicants(app.jobId, app.workerId);
  }

  return { bothAgree };
}

/** Convenience: build the canonical app id without importing applications.js */
export const appIdFor = buildApplicationId;
