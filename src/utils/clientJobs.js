import { ACTIVE_JOB_STATUSES, JOB_STATUS } from '../lib/matching/statuses.js';

export { ACTIVE_JOB_STATUSES };

/** Ordered list of statuses used by the active-job stepper UI. */
export const JOB_STATUS_FLOW = [
  JOB_STATUS.MATCHING,
  JOB_STATUS.MATCHED,
  JOB_STATUS.CONFIRMED,
  JOB_STATUS.IN_PROGRESS,
  JOB_STATUS.COMPLETED,
];

export function getStatusStepIndex(status) {
  const idx = JOB_STATUS_FLOW.indexOf(status);
  return idx === -1 ? 0 : idx;
}

/**
 * Render-friendly label for a job's location, which is now stored as
 * { lat, lng, barangay, label } instead of a plain string.
 */
export function locationLabel(job) {
  if (!job?.location) return '';
  if (typeof job.location === 'string') return job.location;
  return job.location.label || job.location.barangay || '';
}
