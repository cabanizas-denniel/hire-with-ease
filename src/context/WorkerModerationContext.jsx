/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import baseWorkers from '../data/applicants.js';
import { safeGetItem, safeSetItem } from '../lib/safeStorage.js';

const WorkerModerationContext = createContext(null);

const STORAGE_KEY = 'hwe-worker-moderation';

function loadOverrides() {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? parsed : {};
  } catch {
    return {};
  }
}

function saveOverrides(overrides) {
  safeSetItem(STORAGE_KEY, JSON.stringify(overrides));
}

function mergeWorkers(overrides) {
  return baseWorkers.map((w) => ({
    ...w,
    moderationStatus: overrides[w.id] ?? w.moderationStatus ?? 'active',
  }));
}

export function WorkerModerationProvider({ children }) {
  const [overrides, setOverrides] = useState(loadOverrides);

  const workers = useMemo(() => mergeWorkers(overrides), [overrides]);

  const setModerationStatus = useCallback((workerId, status) => {
    setOverrides((prev) => {
      const base = baseWorkers.find((w) => w.id === workerId);
      const defaultStatus = base?.moderationStatus ?? 'active';
      const next = { ...prev };
      if (status === defaultStatus) {
        delete next[workerId];
      } else {
        next[workerId] = status;
      }
      saveOverrides(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({
      workers,
      setModerationStatus,
    }),
    [workers, setModerationStatus]
  );

  return <WorkerModerationContext.Provider value={value}>{children}</WorkerModerationContext.Provider>;
}

export function useWorkerModeration() {
  const ctx = useContext(WorkerModerationContext);
  if (!ctx) {
    throw new Error('useWorkerModeration must be used inside WorkerModerationProvider');
  }
  return ctx;
}
