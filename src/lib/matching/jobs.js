/**
 * Job lifecycle helpers backed by Firestore.
 *
 * The frontend treats jobs as the homeowner's "request". A homeowner
 * may only have ONE active (non-terminal) job at a time. Workers see
 * jobs whose status is `Matching` or `Matched` and whose required
 * skills overlap with their own.
 */

import {
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { collectDeclinedWorkerIds } from './matchDeclines.js';
import { db } from '../firebase.js';
import {
  resolveLocation,
  nearestBarangay,
  OLONGAPO_CENTER,
} from '../olongapoBarangays.js';
import { ACTIVE_JOB_STATUSES, JOB_STATUS } from './statuses.js';
import { CATEGORY_REQUIRED_SKILLS } from '../../data/jobs.js';

export function newJobId() {
  return `job-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

/**
 * Coerce whatever shape the form passes in into a complete location
 * record `{ lat, lng, barangay, label }`. The post-job form gives us
 * structured coordinates from the map picker; the seed script (and
 * legacy callers) may still pass a string barangay name.
 */
function resolveJobLocation(input) {
  if (!input) {
    return { ...OLONGAPO_CENTER, barangay: null, label: null };
  }
  if (typeof input === 'string') {
    const point = resolveLocation(input) || {
      ...OLONGAPO_CENTER,
      barangay: null,
    };
    return {
      lat: point.lat,
      lng: point.lng,
      barangay: point.barangay,
      label: input,
    };
  }
  const lat = typeof input.lat === 'number' ? input.lat : OLONGAPO_CENTER.lat;
  const lng = typeof input.lng === 'number' ? input.lng : OLONGAPO_CENTER.lng;
  const barangay =
    input.barangay ||
    (typeof input.lat === 'number' && typeof input.lng === 'number'
      ? nearestBarangay(lat, lng)?.name || null
      : null);
  return {
    lat,
    lng,
    barangay,
    label: input.label || null,
  };
}

/**
 * Build a Firestore-shaped job document from a posting form payload.
 * Centralises the location resolution + default fields so callers don't
 * have to think about coords / fallbacks.
 */
export function buildJobDoc({
  id: presetId,
  title,
  category,
  description,
  requiredSkills = [],
  budget,
  schedule,
  scheduledStartAt = null,
  type = 'Scheduled',
  urgency = 'Normal',
  location,
  postedBy,
  postedByName,
  postedByEmail = null,
  postedByMobile = null,
  postedByTrustTier = null,
  photo = null,
  media = null,
}) {
  const id = presetId || newJobId();
  const mediaList = Array.isArray(media) && media.length ? media : null;
  const derivedRequiredSkills =
    requiredSkills?.length
      ? requiredSkills
      : (CATEGORY_REQUIRED_SKILLS[category] || []);
  return {
    id,
    title: title || '',
    category: category || '',
    description: description || '',
    requiredSkills: derivedRequiredSkills,
    status: JOB_STATUS.MATCHING,
    type,
    urgency,
    budget: budget || null,
    schedule: schedule || (type === 'Rush' ? 'ASAP · Dispatch now' : ''),
    scheduledStartAt: scheduledStartAt || null,
    clientName: postedByName || null,
    matchedWorkers: 0,
    engineMatches: [],
    engineMatchedWorkerIds: [],
    engineRanAt: null,
    engineMeta: null,
    postedAt: new Date().toISOString().slice(0, 10),
    location: resolveJobLocation(location),
    photo: photo ?? null,
    media: mediaList,
    postedBy: postedBy || null,
    postedByName: postedByName || null,
    postedByEmail: postedByEmail || null,
    postedByMobile: postedByMobile || null,
    postedByTrustTier:
      typeof postedByTrustTier === 'number' ? postedByTrustTier : null,
    confirmedWorkerId: null,
    confirmedWorkerName: null,
    agreement: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };
}

/**
 * Create a new job in /jobs. Returns the created doc id.
 */
export async function createJob(payload, { runEngine = true } = {}) {
  const data = buildJobDoc(payload);
  await setDoc(doc(db, 'jobs', data.id), data);
  if (runEngine) {
    try {
      const { runJobMatching } = await import('./runJobMatching.js');
      await runJobMatching({ ...data, docId: data.id });
    } catch (err) {
      console.warn('Matching engine could not run after job create', err);
    }
  }
  return data.id;
}

/**
 * Subscribe to all jobs posted by a specific homeowner.
 * Sorted client-side by createdAt desc.
 */
export function subscribeJobsByOwner(uid, onData, onError) {
  if (!uid) {
    onData([]);
    return () => {};
  }
  const q = query(collection(db, 'jobs'), where('postedBy', '==', uid));
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onData(docs);
    },
    (err) => onError?.(err)
  );
}

/**
 * Subscribe to all open jobs (status Matching or Matched).
 * The worker side filters further by skill overlap on the client.
 */
export function subscribeOpenJobs(onData, onError) {
  const q = query(
    collection(db, 'jobs'),
    where('status', 'in', [JOB_STATUS.MATCHING, JOB_STATUS.MATCHED])
  );
  return onSnapshot(
    q,
    (snap) => {
      const docs = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
      docs.sort((a, b) => {
        const ta = a.createdAt?.toMillis?.() ?? 0;
        const tb = b.createdAt?.toMillis?.() ?? 0;
        return tb - ta;
      });
      onData(docs);
    },
    (err) => onError?.(err)
  );
}

/**
 * Subscribe to a single job document by id.
 * Resolves with `null` while the doc is still loading.
 */
export function subscribeJob(jobId, onData, onError) {
  if (!jobId) {
    onData(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, 'jobs', jobId),
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

export async function setJobStatus(jobId, status, extra = {}) {
  await updateDoc(doc(db, 'jobs', jobId), {
    status,
    ...extra,
    updatedAt: serverTimestamp(),
  });
}

/** Bumps a counter on the job doc so the dashboard summary stays current. */
export async function setMatchedWorkers(jobId, count) {
  await updateDoc(doc(db, 'jobs', jobId), {
    matchedWorkers: count,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Remove declined workers from persisted engineMatches (homeowner-owned job doc).
 */
export async function pruneDeclinedEngineMatches(
  jobId,
  job,
  workerProfiles = [],
  matchDeclineDocs = [],
) {
  if (!db || !jobId || !job?.engineMatches?.length) return;

  const declined = collectDeclinedWorkerIds(
    jobId,
    workerProfiles,
    matchDeclineDocs,
  );
  if (!declined.size) return;

  const engineMatches = job.engineMatches.filter(
    (row) => !declined.has(row.workerId),
  );
  if (engineMatches.length === job.engineMatches.length) return;

  await updateDoc(doc(db, 'jobs', jobId), {
    engineMatches,
    engineMatchedWorkerIds: engineMatches.map((m) => m.workerId),
    matchedWorkers: engineMatches.length,
    updatedAt: serverTimestamp(),
  });
}

/** True when the homeowner has a non-terminal job in flight. */
export function hasActiveJob(jobs) {
  return (jobs || []).some((j) => ACTIVE_JOB_STATUSES.has(j.status));
}

export function findActiveJob(jobs) {
  return (jobs || []).find((j) => ACTIVE_JOB_STATUSES.has(j.status)) || null;
}
