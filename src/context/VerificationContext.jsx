/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import seedRecords from '../data/verification.js';
import { safeGetItem, safeSetItem } from '../lib/safeStorage.js';
import { getStageProgress, getTrustTier, isFullyVerified } from '../utils/trust.js';

const STORAGE_KEY = 'hwe-verification';

/**
 * PROTOTYPE NOTE — uploads are not yet implemented in M1. Once the upload
 * UI is wired (M4), ID / selfie / document files are expected to be stored
 * as base64 data URIs on the per-user record (e.g. stage2.idImage).
 * TODO: migrate base64 payloads to real backend file storage before prod.
 */

const VerificationContext = createContext(null);

function loadRecords() {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return { ...seedRecords };
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return { ...seedRecords };
    // Merge: seed is the baseline; stored overrides win. Ensures new seed
    // entries (e.g. freshly-added demo workers) appear even if storage is stale.
    return { ...seedRecords, ...parsed };
  } catch {
    return { ...seedRecords };
  }
}

function persistRecords(records) {
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(records));
  } catch {
    /* noop — safeSetItem already falls back to memory */
  }
}

export function VerificationProvider({ children }) {
  const [records, setRecords] = useState(loadRecords);

  const update = useCallback((userId, updater) => {
    setRecords((prev) => {
      const current = prev[userId] ?? {
        role: userId.startsWith('clt-') ? 'client' : 'service-provider',
        stage1: { mobile: null, email: null, otpVerifiedAt: null },
        stage2: {
          idSubmittedAt: null,
          selfieSubmittedAt: null,
          reviewStatus: 'not-started',
          reviewedBy: null,
          reviewedAt: null,
          reviewNote: '',
        },
        stage3: { documents: [], documentBacked: false },
        stage4: { activatedAt: null, activatedBy: null },
      };
      const next = { ...prev, [userId]: updater(current) };
      persistRecords(next);
      return next;
    });
  }, []);

  const confirmOtp = useCallback(
    (userId, { mobile, email } = {}) => {
      update(userId, (rec) => ({
        ...rec,
        stage1: {
          ...rec.stage1,
          mobile: mobile ?? rec.stage1.mobile,
          email: email ?? rec.stage1.email,
          otpVerifiedAt: new Date().toISOString(),
        },
      }));
    },
    [update]
  );

  const submitIdentity = useCallback(
    (userId, { idImage = null, selfieImage = null } = {}) => {
      const nowIso = new Date().toISOString();
      update(userId, (rec) => ({
        ...rec,
        stage2: {
          ...rec.stage2,
          idSubmittedAt: nowIso,
          selfieSubmittedAt: nowIso,
          idImage: idImage ?? rec.stage2.idImage ?? null,
          selfieImage: selfieImage ?? rec.stage2.selfieImage ?? null,
          reviewStatus: 'pending',
          reviewedBy: null,
          reviewedAt: null,
          reviewNote: '',
        },
      }));
    },
    [update]
  );

  const reviewIdentity = useCallback(
    (userId, { approve, reviewer, note = '' }) => {
      update(userId, (rec) => ({
        ...rec,
        stage2: {
          ...rec.stage2,
          reviewStatus: approve ? 'reviewed' : 'rejected',
          reviewedBy: reviewer,
          reviewedAt: new Date().toISOString(),
          reviewNote: note,
        },
      }));
    },
    [update]
  );

  const addDocument = useCallback(
    (userId, { type, label, fileData = null }) => {
      update(userId, (rec) => ({
        ...rec,
        stage3: {
          ...rec.stage3,
          documents: [
            ...(rec.stage3.documents || []),
            {
              type,
              label,
              submittedAt: new Date().toISOString(),
              reviewed: false,
              note: '',
              fileData, // base64 data URI when M4 upload is wired
            },
          ],
        },
      }));
    },
    [update]
  );

  const reviewDocument = useCallback(
    (userId, { docIndex, approve, note = '' }) => {
      update(userId, (rec) => {
        const documents = (rec.stage3.documents || []).map((d, i) =>
          i === docIndex ? { ...d, reviewed: approve, note } : d
        );
        const documentBacked = documents.some((d) => d.reviewed);
        return {
          ...rec,
          stage3: { ...rec.stage3, documents, documentBacked },
        };
      });
    },
    [update]
  );

  const setActivation = useCallback(
    (userId, { active, by }) => {
      update(userId, (rec) => ({
        ...rec,
        stage4: {
          activatedAt: active ? new Date().toISOString() : null,
          activatedBy: active ? by : null,
        },
      }));
    },
    [update]
  );

  const resetUser = useCallback(
    (userId) => {
      setRecords((prev) => {
        if (!prev[userId]) return prev;
        const { [userId]: _removed, ...rest } = prev;
        void _removed;
        persistRecords(rest);
        return rest;
      });
    },
    []
  );

  const resetAll = useCallback(() => {
    persistRecords(seedRecords);
    setRecords({ ...seedRecords });
  }, []);

  const getRecord = useCallback(
    (userId) => records[userId] ?? null,
    [records]
  );

  const getTier = useCallback(
    (userId) => {
      const rec = records[userId];
      return getTrustTier(rec, rec?.role);
    },
    [records]
  );

  const getProgress = useCallback(
    (userId) => {
      const rec = records[userId];
      return getStageProgress(rec, rec?.role);
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
              !d.reviewed ? { id, record: rec, document: d, docIndex: index } : null
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
