/**
 * Per-application chat threads.
 *
 * Each (job, worker) pair gets a deterministic thread id so both
 * homeowner and worker subscribe to the same Firestore document.
 *
 *   thread id = `${jobId}__${workerId}`
 *
 * Documents live under /threads/{threadId} and messages under
 * /threads/{threadId}/messages/{messageId}.
 */

import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
} from 'firebase/firestore';
import { db } from '../firebase.js';

export function buildThreadId(jobId, workerId) {
  if (!jobId || !workerId) return null;
  return `${jobId}__${workerId}`;
}

/**
 * Create the parent thread doc if it doesn't exist yet. Idempotent
 * via setDoc({ merge: true }) so callers can call this every time
 * the negotiation page mounts.
 */
export async function ensureThread({
  jobId,
  workerId,
  clientId,
  clientName,
  clientEmail,
  clientMobile,
  jobTitle,
}) {
  const threadId = buildThreadId(jobId, workerId);
  if (!threadId) throw new Error('ensureThread: jobId and workerId are required');
  const ref = doc(db, 'threads', threadId);
  const patch = {
    jobId,
    workerId,
    clientId: clientId || null,
    jobTitle: jobTitle || null,
    participants: [clientId, workerId].filter(Boolean),
    updatedAt: serverTimestamp(),
  };
  if (clientName) patch.clientName = clientName;
  if (clientEmail) patch.clientEmail = clientEmail;
  if (clientMobile) patch.clientMobile = clientMobile;
  await setDoc(ref, patch, { merge: true });
  return threadId;
}

export function subscribeThread(threadId, onData, onError) {
  if (!threadId) {
    onData(null);
    return () => {};
  }
  return onSnapshot(
    doc(db, 'threads', threadId),
    (snap) => {
      if (!snap.exists()) {
        onData(null);
        return;
      }
      onData({ id: snap.id, ...snap.data() });
    },
    (err) => onError?.(err)
  );
}

export async function sendMessage({
  jobId,
  workerId,
  clientId,
  jobTitle,
  authorId,
  authorName,
  authorRole,
  text,
}) {
  const trimmed = (text || '').trim();
  if (!trimmed) return null;
  const threadId = await ensureThread({ jobId, workerId, clientId, jobTitle });
  const messagesRef = collection(db, 'threads', threadId, 'messages');
  const created = await addDoc(messagesRef, {
    authorId,
    authorName: authorName || null,
    authorRole: authorRole || null,
    text: trimmed,
    createdAt: serverTimestamp(),
  });
  // Touch thread so list views can sort by latest activity.
  await setDoc(
    doc(db, 'threads', threadId),
    {
      lastMessage: trimmed,
      lastAuthorId: authorId,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
  return created.id;
}

export function subscribeMessages(threadId, onData, onError) {
  if (!threadId) {
    onData([]);
    return () => {};
  }
  const q = query(
    collection(db, 'threads', threadId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(
    q,
    (snap) => onData(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
    (err) => onError?.(err)
  );
}
