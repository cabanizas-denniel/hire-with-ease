import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from './firebase.js';

function clampStars(value) {
  const n = Math.round(Number(value) || 0);
  return Math.max(1, Math.min(5, n));
}

/**
 * Save one homeowner rating for a completed job and refresh the worker's average.
 * Doc id is jobId_clientId so the same hire cannot be rated twice.
 */
export async function submitWorkerRating({
  jobId,
  workerId,
  clientId,
  clientName,
  stars,
}) {
  if (!db || !jobId || !workerId || !clientId) {
    throw new Error('Missing rating details.');
  }

  const id = `${jobId}_${clientId}`;
  const ratingRef = doc(db, 'ratings', id);
  const existing = await getDoc(ratingRef);
  if (!existing.exists()) {
    await setDoc(ratingRef, {
      id,
      jobId,
      workerId,
      clientId,
      clientName: clientName || 'Homeowner',
      stars: clampStars(stars),
      submittedAt: serverTimestamp(),
    });
  }

  const snap = await getDocs(
    query(collection(db, 'ratings'), where('workerId', '==', workerId)),
  );
  const list = snap.docs.map((d) => d.data());
  const ratingCount = list.length;
  if (!ratingCount) return id;

  const average =
    list.reduce((sum, row) => sum + (Number(row.stars) || 0), 0) / ratingCount;

  await updateDoc(doc(db, 'worker_profiles', workerId), {
    rating: Number(average.toFixed(2)),
    ratingCount,
    updatedAt: serverTimestamp(),
  });

  return id;
}
