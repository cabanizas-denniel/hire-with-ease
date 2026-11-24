const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { initializeApp } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { FieldValue, getFirestore } = require('firebase-admin/firestore');
const { getStorage } = require('firebase-admin/storage');

initializeApp();

const ACTIVE_JOB = new Set(['Matching', 'Matched', 'Confirmed', 'In Progress']);

async function commitDeletes(refs) {
  const db = getFirestore();
  for (let i = 0; i < refs.length; i += 400) {
    const batch = db.batch();
    refs.slice(i, i + 400).forEach((ref) => batch.delete(ref));
    await batch.commit();
  }
}

async function deleteQuery(queryRef) {
  const snap = await queryRef.get();
  await commitDeletes(snap.docs.map((doc) => doc.ref));
  return snap.docs;
}

async function purgeAccount(uid) {
  const db = getFirestore();

  const notes = await db.collection(`users/${uid}/notifications`).get();
  await commitDeletes(notes.docs.map((doc) => doc.ref));
  await db.doc(`users/${uid}`).delete();
  await db.doc(`worker_profiles/${uid}`).delete();

  await deleteQuery(db.collection('applications').where('workerId', '==', uid));
  await deleteQuery(db.collection('ratings').where('workerId', '==', uid));
  await deleteQuery(db.collection('ratings').where('clientId', '==', uid));

  const ownedJobs = await db.collection('jobs').where('postedBy', '==', uid).get();
  for (const job of ownedJobs.docs) {
    if (ACTIVE_JOB.has(job.data().status)) {
      await job.ref.set(
        {
          status: 'Cancelled',
          cancelledAt: new Date().toISOString(),
          updatedAt: FieldValue.serverTimestamp(),
        },
        { merge: true },
      );
    }
  }

  const hiredJobs = await db.collection('jobs').where('confirmedWorkerId', '==', uid).get();
  for (const job of hiredJobs.docs) {
    if (!ACTIVE_JOB.has(job.data().status)) continue;
    await job.ref.set(
      {
        status: 'Matching',
        confirmedWorkerId: null,
        confirmedWorkerName: null,
        updatedAt: FieldValue.serverTimestamp(),
      },
      { merge: true },
    );
  }

  const threads = await db.collection('threads').where('participants', 'array-contains', uid).get();
  for (const thread of threads.docs) {
    const messages = await thread.ref.collection('messages').get();
    await commitDeletes(messages.docs.map((doc) => doc.ref));
    await thread.ref.delete();
  }

  try {
    await getStorage().bucket().deleteFiles({ prefix: `verification-uploads/${uid}/` });
  } catch (err) {
    if (err?.code !== 404) throw err;
  }
}

exports.deletePersonAccount = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError('unauthenticated', 'Sign in required.');
  }

  const targetId = typeof request.data?.uid === 'string' ? request.data.uid.trim() : '';
  if (!targetId) {
    throw new HttpsError('invalid-argument', 'Missing account id.');
  }
  if (targetId === request.auth.uid) {
    throw new HttpsError('failed-precondition', 'You cannot delete your own admin account here.');
  }

  const db = getFirestore();
  const caller = await db.doc(`users/${request.auth.uid}`).get();
  if (caller.data()?.role !== 'admin') {
    throw new HttpsError('permission-denied', 'Only an admin can delete accounts.');
  }

  const target = await db.doc(`users/${targetId}`).get();
  if (target.exists && target.data()?.role === 'admin') {
    throw new HttpsError('permission-denied', 'Admin accounts cannot be deleted here.');
  }

  await purgeAccount(targetId);

  try {
    await getAuth().deleteUser(targetId);
  } catch (err) {
    if (err?.code !== 'auth/user-not-found') {
      throw new HttpsError('internal', err?.message || 'Could not delete the login.');
    }
  }

  return { ok: true };
});
