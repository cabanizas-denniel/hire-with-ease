import { collection, doc, getDocs, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { notifyEmployerJobMatches } from '../notifications.js';
import {
  runMatchingEngine,
  serializeEngineMatches,
} from './engine.js';
import { filterRealWorkerProfiles } from './seedFilters.js';

/**
 * Load worker profiles, run the engine, persist shortlist on the job,
 * and notify the homeowner (bell) when 1–5 matches are found.
 * Excludes workers who declined (or were declined) for this job.
 */
export async function runJobMatching(job, { notify = true } = {}) {
  if (!db || (!job?.id && !job?.docId)) {
    return { matches: [], notified: false };
  }

  const jobId = job.docId || job.id;
  const snap = await getDocs(collection(db, 'worker_profiles'));
  const profiles = snap.docs.map((d) => ({ docId: d.id, ...d.data() }));
  const realProfiles = filterRealWorkerProfiles(profiles);

  let declinedIds = new Set();
  try {
    const declinedSnap = await getDocs(collection(db, 'jobs', jobId, 'match_declines'));
    declinedIds = new Set(declinedSnap.docs.map((d) => d.id));
  } catch (err) {
    console.warn('Could not load match declines for rematch', err);
  }

  const dismissedByJob = new Set(
    (realProfiles || [])
      .filter((p) => (p.dismissedJobIds || []).includes(jobId))
      .map((p) => p.docId || p.uid),
  );

  const excluded = new Set([...declinedIds, ...dismissedByJob]);

  const { matches, scoredCount, poolSize } = runMatchingEngine(
    job,
    realProfiles.filter((p) => !excluded.has(p.docId || p.uid)),
  );
  const engineMatches = serializeEngineMatches(matches);
  const engineRanAt = new Date().toISOString();

  await updateDoc(doc(db, 'jobs', jobId), {
    engineMatches,
    engineMatchedWorkerIds: engineMatches.map((m) => m.workerId),
    engineRanAt,
    engineMeta: {
      scoredEligible: scoredCount,
      greedyPoolSize: poolSize,
      shortlistSize: engineMatches.length,
    },
    matchedWorkers: engineMatches.length,
    updatedAt: serverTimestamp(),
  });

  let notified = false;
  if (notify && engineMatches.length >= 1 && job.postedBy) {
    try {
      await notifyEmployerJobMatches(job.postedBy, {
        jobId,
        jobTitle: job.title || 'your request',
        matchCount: engineMatches.length,
      });
      notified = true;
    } catch (err) {
      console.warn('Could not notify homeowner of job matches', err);
    }
  }

  return { matches: engineMatches, notified };
}
