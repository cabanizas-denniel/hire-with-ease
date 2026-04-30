/**
 * Canonical status values for the matching/booking flow.
 *
 * Job lifecycle (homeowner-owned):
 *   Matching     -> open and accepting applicants
 *   Matched      -> client engaged with one or more applicants but not committed yet
 *   Confirmed    -> mutual agreement reached, worker is locked, job not yet started
 *   In Progress  -> worker arrived/started
 *   Completed    -> client marked as done
 *   Cancelled    -> client withdrew
 *   Expired      -> auto-expired with no agreement
 *
 * Application lifecycle (worker-owned):
 *   pending      -> applied, waiting for client to engage
 *   negotiating  -> client opened thread / chat ongoing
 *   proposed     -> someone proposed an agreement (see proposedBy)
 *   confirmed    -> both parties signed off, this is the chosen worker
 *   declined     -> client declined, or worker withdrew
 *   completed    -> the underlying job has been completed for this worker
 */

export const JOB_STATUS = Object.freeze({
  MATCHING: 'Matching',
  MATCHED: 'Matched',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  EXPIRED: 'Expired',
});

export const ACTIVE_JOB_STATUSES = new Set([
  JOB_STATUS.MATCHING,
  JOB_STATUS.MATCHED,
  JOB_STATUS.CONFIRMED,
  JOB_STATUS.IN_PROGRESS,
]);

export const TERMINAL_JOB_STATUSES = new Set([
  JOB_STATUS.COMPLETED,
  JOB_STATUS.CANCELLED,
  JOB_STATUS.EXPIRED,
]);

export const APPLICATION_STATUS = Object.freeze({
  PENDING: 'pending',
  NEGOTIATING: 'negotiating',
  PROPOSED: 'proposed',
  CONFIRMED: 'confirmed',
  DECLINED: 'declined',
  COMPLETED: 'completed',
});

export const ACTIVE_APPLICATION_STATUSES = new Set([
  APPLICATION_STATUS.PENDING,
  APPLICATION_STATUS.NEGOTIATING,
  APPLICATION_STATUS.PROPOSED,
  APPLICATION_STATUS.CONFIRMED,
]);
