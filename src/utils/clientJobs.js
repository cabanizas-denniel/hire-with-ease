import clientsSeed from '../data/clients.js';
import jobs from '../data/jobs.js';

/**
 * Client-job lookups enforcing the business rule:
 *   a single client may only have ONE active job at a time.
 *
 * "Active" = status ∈ { Matching, Matched, In Progress }
 * Everything else (Completed / Cancelled) is history.
 *
 * Because jobs.js cross-references clients by `clientName`, these helpers
 * take a client id, resolve the name from the clients seed, and filter
 * against jobs.js. When the app moves to a real backend this becomes a
 * simple "WHERE clientId = ?" query.
 */

const ACTIVE_STATUSES = new Set(['Matching', 'Matched', 'In Progress']);

export function getClientName(clientId) {
  if (!clientId) return null;
  const c = clientsSeed.find((x) => x.id === clientId);
  return c?.name || null;
}

export function getClientJobs(clientId) {
  const name = getClientName(clientId);
  if (!name) return [];
  return jobs.filter((j) => j.clientName === name);
}

export function getActiveJob(clientId) {
  return getClientJobs(clientId).find((j) => ACTIVE_STATUSES.has(j.status)) || null;
}

export function getCompletedJobs(clientId) {
  return getClientJobs(clientId).filter((j) => !ACTIVE_STATUSES.has(j.status));
}

export function hasActiveJob(clientId) {
  return Boolean(getActiveJob(clientId));
}

/** Ordered list of statuses used by the active-job stepper UI. */
export const JOB_STATUS_FLOW = ['Matching', 'Matched', 'In Progress', 'Completed'];

export function getStatusStepIndex(status) {
  const idx = JOB_STATUS_FLOW.indexOf(status);
  return idx === -1 ? 0 : idx;
}
