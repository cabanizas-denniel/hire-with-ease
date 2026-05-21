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
 * Render-friendly home address for a job or profile location object.
 */
export function formatHomeAddress(location) {
  if (!location) return '';
  if (typeof location === 'string') return location;
  const parts = [];
  if (location.label) parts.push(location.label);
  if (location.barangay) parts.push(`${location.barangay}, Olongapo City`);
  return parts.join(' · ') || '';
}

/** @deprecated use formatHomeAddress — kept for existing imports */
export function locationLabel(job) {
  return formatHomeAddress(job?.location);
}
