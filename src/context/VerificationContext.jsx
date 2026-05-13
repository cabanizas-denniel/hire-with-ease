/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { collection, doc, onSnapshot, query, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from './AuthContext.jsx';
import { db } from '../lib/firebase.js';
import { getStageProgress, getTrustTier, isFullyVerified } from '../utils/trust.js';
import { compressImageForUpload } from '../lib/imageUtils.js';

const VerificationContext = createContext(null);

const MAX_VERIFICATION_IMAGE_BYTES = 300 * 1024; // 300 KB per image after compression

function withTimeout(promise, ms, message) {
  if (!ms || ms <= 0) return promise;
  let timeoutId = null;
  const timeoutPromise = new Promise((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => {
    if (timeoutId) clearTimeout(timeoutId);
  });
}

function approxBytesFromDataUrl(dataUrl) {
  const comma = dataUrl.indexOf(',');
  const base64 = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl;
  return Math.ceil((base64.length * 3) / 4);
}

async function fileToDataUrl(file) {
  if (!file) return null;
  const blob = file instanceof Blob ? file : null;
  if (!blob) return null;

  // Firestore-only mode: PDFs are not viable inside a 1 MiB document limit.
  // Enforce images only (compressed) for verification artifacts.
  const type = (file.type || '').toLowerCase();
  if (type.includes('pdf') || (file.name || '').toLowerCase().endsWith('.pdf')) {
    throw new Error('PDF uploads are not supported without Firebase Storage. Use a photo instead.');
  }

  if (type.startsWith('image/')) {
    const compressed = await compressImageForUpload(file, {
      maxWidth: 900,
      maxHeight: 900,
      quality: 0.72,
    });
    if (!compressed?.dataUrl) throw new Error('Could not process that image.');
    if ((compressed.bytes ?? approxBytesFromDataUrl(compressed.dataUrl)) > MAX_VERIFICATION_IMAGE_BYTES) {
      throw new Error('That image is still too large. Please take a lower-resolution photo and try again.');
    }
    return compressed.dataUrl;
  }

  throw new Error('Unsupported file type. Please upload a JPG or PNG image.');
}

function sanitizeForFirestore(value, path = 'verification') {
  if (value === null) return null;
  if (value === undefined) return null;
  const t = typeof value;
  if (t === 'string' || t === 'boolean') return value;
  if (t === 'number') {
    if (!Number.isFinite(value)) {
      throw new Error(`Invalid number at ${path}.`);
    }
    return value;
  }
  if (value instanceof Date) return value.toISOString();
  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    throw new Error(`Invalid file/blob value at ${path}.`);
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => sanitizeForFirestore(v, `${path}[${i}]`));
  }
  if (t === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = sanitizeForFirestore(v, `${path}.${k}`);
    }
    return out;
  }
  throw new Error(`Invalid value at ${path}.`);
}

function isDocumentPendingForReview(doc) {
  if (!doc) return false;
  if (doc.reviewStatus) return doc.reviewStatus === 'pending';
  if (typeof doc.reviewed === 'boolean') return doc.reviewed === false;
  return false;
}

function defaultRecordForRole(role) {
  return {
    role: role === 'client' ? 'client' : 'service-provider',
    stage1: { mobile: null, email: null, otpVerifiedAt: null },
    stage2: {
      idSubmittedAt: null,
      selfieSubmittedAt: null,
      reviewStatus: 'not-started',
      reviewedBy: null,
      reviewedAt: null,
      reviewNote: '',
      idImage: null,
      idBackImage: null,
      selfieImage: null,
    },
    stage3: { documents: [], documentBacked: false },
    stage4: { activatedAt: null, activatedBy: null },
  };
}

export function VerificationProvider({ children }) {
  const [records, setRecords] = useState({});
  const { user, role: appRole } = useAuth();

  // Subscribe to Firestore-backed verification state.
  useEffect(() => {
    if (!db) {
      setRecords({});
      return () => {};
    }

    // Admin needs queues across users; others only need their own record.
    if (appRole === 'admin') {
      const q = query(collection(db, 'users'));
      return onSnapshot(
        q,
        (snap) => {
          const next = {};
          snap.docs.forEach((d) => {
            const data = d.data() || {};
            const rec = data.verification || null;
            const firestoreRole = data.role || null;
            const inferredRole = firestoreRole === 'homeowner' ? 'client' : 'service-provider';
            next[d.id] = rec || defaultRecordForRole(inferredRole);
          });
          setRecords(next);
        },
        () => setRecords({})
      );
    }

    const uid = user?.uid || null;
    if (!uid) {
      setRecords({});
      return () => {};
    }
    const ref = doc(db, 'users', uid);
    return onSnapshot(
      ref,
      (snap) => {
        const data = snap.exists() ? snap.data() : null;
        const rec = data?.verification || null;
        const inferredRole = appRole === 'employer' ? 'client' : 'service-provider';
        setRecords({ [uid]: rec || defaultRecordForRole(inferredRole) });
      },
      () => setRecords({})
    );
  }, [user?.uid, appRole]);

  const persistToFirestore = useCallback(async (userId, nextRecord) => {
    if (!db || !userId) return;
    const ref = doc(db, 'users', userId);
    const sanitized = sanitizeForFirestore(nextRecord);
    // merge=true keeps existing profile fields intact.
    await withTimeout(
      setDoc(ref, { verification: sanitized }, { merge: true }),
      20_000,
      'Saving verification data timed out. Check your connection and try again.'
    );
  }, []);

  const update = useCallback(
    (userId, updater, { awaitPersist = false } = {}) => {
      let nextRecord = null;
      setRecords((prev) => {
        const inferredRole =
          userId === user?.uid
            ? appRole === 'employer'
              ? 'client'
              : 'service-provider'
            : prev[userId]?.role || 'service-provider';
        const current = prev[userId] ?? defaultRecordForRole(inferredRole);
        const updated = updater(current);
        nextRecord = updated;
        return { ...prev, [userId]: updated };
      });
      if (!nextRecord) return Promise.resolve();
      const p = persistToFirestore(userId, nextRecord);
      return awaitPersist ? p : (void p, Promise.resolve());
    },
    [persistToFirestore, user?.uid, appRole]
  );

  const confirmOtp = useCallback(
    (userId, { email } = {}) => {
      const trimmed = typeof email === 'string' ? email.trim() : '';
      update(userId, (rec) => ({
        ...rec,
        stage1: {
          ...rec.stage1,
          // Email OTP replaces phone-based Stage 1; keep mobile unset for newly verified rows.
          mobile: null,
          email: trimmed || rec.stage1?.email || null,
          otpVerifiedAt: new Date().toISOString(),
        },
      }));
    },
    [update]
  );

  const submitIdentity = useCallback(
    async (
      userId,
      {
        idImage = null,
        idBackImage = null,
        selfieImage = null,
        idFile = null,
        idBackFile = null,
        selfieFile = null,
        onProgress,
      } = {}
    ) => {
      const nowIso = new Date().toISOString();
      if (typeof onProgress === 'function') {
        try {
          onProgress({ bytesTransferred: 0, totalBytes: 0, percent: 0 });
        } catch {
          // ignore
        }
      }

      const [idDataUrl, idBackDataUrl, selfieDataUrl] = await Promise.all([
        idFile ? fileToDataUrl(idFile) : Promise.resolve(null),
        idBackFile ? fileToDataUrl(idBackFile) : Promise.resolve(null),
        selfieFile ? fileToDataUrl(selfieFile) : Promise.resolve(null),
      ]);

      if (!idDataUrl && !idImage) {
        throw new Error('Please upload a readable photo/PDF of your government ID.');
      }
      if (!idBackDataUrl && !idBackImage) {
        throw new Error('Please upload a readable photo of the BACK of your government ID.');
      }
      if (!selfieDataUrl && !selfieImage) {
        throw new Error('Please upload a clear selfie holding your ID.');
      }

      await update(
        userId,
        (rec) => ({
          ...rec,
          stage2: {
            ...rec.stage2,
            idSubmittedAt: nowIso,
            selfieSubmittedAt: nowIso,
            idImage: idDataUrl || idImage || rec.stage2.idImage || null,
            idBackImage: idBackDataUrl || idBackImage || rec.stage2.idBackImage || null,
            selfieImage: selfieDataUrl || selfieImage || rec.stage2.selfieImage || null,
            reviewStatus: 'pending',
            reviewedBy: null,
            reviewedAt: null,
            reviewNote: '',
          },
        }),
        { awaitPersist: true }
      );

      if (typeof onProgress === 'function') {
        try {
          onProgress({ bytesTransferred: 1, totalBytes: 1, percent: 100 });
        } catch {
          // ignore
        }
      }
    },
    [update]
  );

  const reviewIdentity = useCallback(
    async (userId, { approve, reviewer, note = '' }) => {
      await update(
        userId,
        (rec) => ({
          ...rec,
          stage2: {
            ...rec.stage2,
            reviewStatus: approve ? 'reviewed' : 'rejected',
            reviewedBy: reviewer,
            reviewedAt: new Date().toISOString(),
            reviewNote: note,
          },
        }),
        { awaitPersist: true }
      );
    },
    [update]
  );

  const addDocument = useCallback(
    async (userId, { type, label, fileData = null, file = null, onProgress } = {}) => {
      const nowIso = new Date().toISOString();
      if (typeof onProgress === 'function') {
        try {
          onProgress({ bytesTransferred: 0, totalBytes: 0, percent: 0 });
        } catch {
          // ignore
        }
      }

      const docDataUrl = file ? await fileToDataUrl(file) : null;

      if (!docDataUrl && !fileData) {
        throw new Error('Please upload a JPG or PNG image for your document.');
      }
      const payload = {
        type,
        label,
        submittedAt: nowIso,
        reviewStatus: 'pending',
        reviewedBy: null,
        reviewedAt: null,
        reviewNote: '',
        // Backwards-compatible field used by existing UI renderers.
        fileData: docDataUrl || fileData,
        fileMeta: file
          ? {
              contentType: file.type || '',
              originalName: file.name || '',
              bytes: file.size ?? null,
              uploadedAt: nowIso,
            }
          : null,
      };

      await update(
        userId,
        (rec) => ({
          ...rec,
          stage3: {
            ...rec.stage3,
            documents: [...(rec.stage3.documents || []), payload],
          },
        }),
        { awaitPersist: true }
      );

      if (typeof onProgress === 'function') {
        try {
          onProgress({ bytesTransferred: 1, totalBytes: 1, percent: 100 });
        } catch {
          // ignore
        }
      }
    },
    [update]
  );

  const reviewDocument = useCallback(
    async (userId, { docIndex, approve, note = '', reviewer = 'PESO' }) => {
      await update(
        userId,
        (rec) => {
          const documents = (rec.stage3.documents || []).map((d, i) =>
            i === docIndex
              ? {
                  ...d,
                  reviewed: approve,
                  reviewStatus: approve ? 'reviewed' : 'rejected',
                  reviewedBy: reviewer,
                  reviewedAt: new Date().toISOString(),
                  reviewNote: note,
                }
              : d
          );
          const documentBacked = documents.some(
            (d) => d?.reviewStatus === 'reviewed' || d?.reviewed === true
          );
          return {
            ...rec,
            stage3: { ...rec.stage3, documents, documentBacked },
          };
        },
        { awaitPersist: true }
      );
    },
    [update]
  );

  /** One write: reject pending identity and every pending document with the same note (avoids lost updates from sequential reviewDocument calls). */
  const rejectApplication = useCallback(
    async (userId, { reviewer, note = '' }) => {
      const rejectionNote = (typeof note === 'string' ? note.trim() : '') || 'Needs resubmission.';
      const nowIso = new Date().toISOString();
      await update(
        userId,
        (rec) => {
          const hasPendingIdentity = rec.stage2?.reviewStatus === 'pending';
          const hasPendingDoc = (rec.stage3?.documents || []).some(isDocumentPendingForReview);
          if (!hasPendingIdentity && !hasPendingDoc) return rec;

          const stage2 =
            hasPendingIdentity
              ? {
                  ...rec.stage2,
                  reviewStatus: 'rejected',
                  reviewedBy: reviewer,
                  reviewedAt: nowIso,
                  reviewNote: rejectionNote,
                }
              : rec.stage2;

          const documents = (rec.stage3?.documents || []).map((d) =>
            isDocumentPendingForReview(d)
              ? {
                  ...d,
                  reviewed: false,
                  reviewStatus: 'rejected',
                  reviewedBy: reviewer,
                  reviewedAt: nowIso,
                  reviewNote: rejectionNote,
                }
              : d
          );
          const documentBacked = documents.some(
            (d) => d?.reviewStatus === 'reviewed' || d?.reviewed === true
          );

          return {
            ...rec,
            stage2,
            stage3: { ...rec.stage3, documents, documentBacked },
          };
        },
        { awaitPersist: true }
      );
    },
    [update]
  );

  const removeDocument = useCallback(
    (userId, { docIndex }) => {
      update(
        userId,
        (rec) => {
          const documents = (rec.stage3?.documents || []).filter((_, i) => i !== docIndex);
          const documentBacked = documents.some(
            (d) => d?.reviewStatus === 'reviewed' || d?.reviewed === true
          );
          return {
            ...rec,
            stage3: { ...rec.stage3, documents, documentBacked },
          };
        },
        { awaitPersist: true }
      );
    },
    [update]
  );

  const setActivation = useCallback(
    async (userId, { active, by }) => {
      await update(
        userId,
        (rec) => ({
          ...rec,
          stage4: {
            activatedAt: active ? new Date().toISOString() : null,
            activatedBy: active ? by : null,
          },
        }),
        { awaitPersist: true }
      );
    },
    [update]
  );

  const resetUser = useCallback(
    (userId) => {
      // For Firestore-backed state, "reset" means writing a blank record shape.
      const inferredRole =
        userId === user?.uid && appRole === 'employer' ? 'client' : 'service-provider';
      const blank = defaultRecordForRole(inferredRole);
      void persistToFirestore(userId, blank);
    },
    [persistToFirestore, user?.uid, appRole]
  );

  const resetAll = useCallback(() => {
    // No-op in Firestore mode; admin tooling can do bulk ops if needed.
  }, []);

  const getRecord = useCallback(
    (userId) => records[userId] ?? null,
    [records]
  );

  const getTier = useCallback(
    (userId, roleOverride = null) => {
      const rec = records[userId];
      const role = roleOverride ?? rec?.role ?? 'service-provider';
      return getTrustTier(rec, role);
    },
    [records]
  );

  const getProgress = useCallback(
    (userId, roleOverride = null) => {
      const rec = records[userId];
      const role = roleOverride ?? rec?.role ?? 'service-provider';
      return getStageProgress(rec, role);
    },
    [records]
  );

  const isVerified = useCallback(
    (userId) => {
      const rec = records[userId];
      return isFullyVerified(rec, rec?.role);
    },
    [records]
  );

  const pendingIdentityReviews = useMemo(
    () =>
      Object.entries(records)
        .filter(([, rec]) => rec.stage2?.reviewStatus === 'pending')
        .map(([id, rec]) => ({ id, record: rec })),
    [records]
  );

  const pendingDocumentReviews = useMemo(
    () =>
      Object.entries(records)
        .flatMap(([id, rec]) =>
          (rec.stage3?.documents || [])
            .map((d, index) =>
              d?.reviewStatus === 'pending' || (d?.reviewStatus == null && d?.reviewed === false)
                ? { id, record: rec, document: d, docIndex: index }
                : null
            )
            .filter(Boolean)
        ),
    [records]
  );

  const pendingActivations = useMemo(
    () =>
      Object.entries(records)
        .filter(
          ([, rec]) =>
            rec.role === 'service-provider' &&
            rec.stage2?.reviewStatus === 'reviewed' &&
            !rec.stage4?.activatedAt
        )
        .map(([id, rec]) => ({ id, record: rec })),
    [records]
  );

  const value = useMemo(
    () => ({
      records,
      getRecord,
      getTier,
      getProgress,
      isVerified,
      pendingIdentityReviews,
      pendingDocumentReviews,
      pendingActivations,
      confirmOtp,
      submitIdentity,
      reviewIdentity,
      addDocument,
      reviewDocument,
      rejectApplication,
      removeDocument,
      setActivation,
      resetUser,
      resetAll,
    }),
    [
      records,
      getRecord,
      getTier,
      getProgress,
      isVerified,
      pendingIdentityReviews,
      pendingDocumentReviews,
      pendingActivations,
      confirmOtp,
      submitIdentity,
      reviewIdentity,
      addDocument,
      reviewDocument,
      rejectApplication,
      removeDocument,
      setActivation,
      resetUser,
      resetAll,
    ]
  );

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>;
}

export function useVerification() {
  const ctx = useContext(VerificationContext);
  if (!ctx) {
    throw new Error('useVerification must be used inside VerificationProvider');
  }
  return ctx;
}
