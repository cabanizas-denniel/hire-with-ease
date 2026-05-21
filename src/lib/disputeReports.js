import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, orderBy } from 'firebase/firestore';
import { db } from './firebase.js';

export function buildReportId(jobId, reporterId) {
  return `report-${jobId}-${reporterId}-${Date.now().toString(36)}`;
}

export async function submitDisputeReport({
  jobId,
  threadId,
  reporterId,
  reporterRole,
  reportedUserId,
  reason,
  details = '',
}) {
  if (!db || !jobId || !reporterId || !reason?.trim()) {
    throw new Error('Missing report details.');
  }
  const id = buildReportId(jobId, reporterId);
  await setDoc(doc(db, 'dispute_reports', id), {
    id,
    jobId,
    threadId: threadId || null,
    reporterId,
    reporterRole: reporterRole || null,
    reportedUserId: reportedUserId || null,
    reason: reason.trim(),
    details: (details || '').trim(),
    status: 'open',
    createdAt: serverTimestamp(),
  });
  return id;
}

export function subscribeDisputeReports(onData, onError) {
  if (!db) {
    onData([]);
    return () => {};
  }
  const q = query(collection(db, 'dispute_reports'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ docId: d.id, ...d.data() }))),
    (err) => onError?.(err),
  );
}
