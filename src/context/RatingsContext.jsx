/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import seedRatings from '../data/ratings.js';
import { safeGetItem, safeSetItem } from '../lib/safeStorage.js';
import {
  getAvgRating,
  getCategoryAverages,
  getRatingBreakdown,
  getReviewStats,
} from '../utils/trust.js';

const STORAGE_KEY = 'hwe-ratings';

const RatingsContext = createContext(null);

function loadRatings() {
  try {
    const raw = safeGetItem(STORAGE_KEY);
    if (!raw) return [...seedRatings];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...seedRatings];
    return parsed;
  } catch {
    return [...seedRatings];
  }
}

function persistRatings(ratings) {
  try {
    safeSetItem(STORAGE_KEY, JSON.stringify(ratings));
  } catch {
    /* noop */
  }
}

function clampStars(value) {
  const n = Math.round(Number(value) || 0);
  return Math.max(1, Math.min(5, n));
}

function generateId(existing) {
  const existingNums = existing
    .map((r) => Number((r.id || '').replace(/^rat-/, '')))
    .filter(Number.isFinite);
  const next = (existingNums.length ? Math.max(...existingNums) : 0) + 1;
  return `rat-${String(next).padStart(4, '0')}`;
}

export function RatingsProvider({ children }) {
  const [ratings, setRatings] = useState(loadRatings);

  const indexByWorker = useMemo(() => {
    const map = new Map();
    for (const r of ratings) {
      if (!r?.workerId) continue;
      if (!map.has(r.workerId)) map.set(r.workerId, []);
      map.get(r.workerId).push(r);
    }
    return map;
  }, [ratings]);

  const getRatingsFor = useCallback(
    (workerId) => indexByWorker.get(workerId) ?? [],
    [indexByWorker]
  );

  const getStatsFor = useCallback(
    (workerId) => getReviewStats(indexByWorker.get(workerId) ?? []),
    [indexByWorker]
  );

  const getAvgFor = useCallback(
    (workerId) => getAvgRating(indexByWorker.get(workerId) ?? []),
    [indexByWorker]
  );

  const getBreakdownFor = useCallback(
    (workerId) => getRatingBreakdown(indexByWorker.get(workerId) ?? []),
    [indexByWorker]
  );

  const getCategoryAveragesFor = useCallback(
    (workerId) => getCategoryAverages(indexByWorker.get(workerId) ?? []),
    [indexByWorker]
  );

  const addRating = useCallback(
    ({
      workerId,
      jobId = null,
      clientName,
      stars,
      comment = '',
      categories = null,
      flags = null,
    }) => {
      if (!workerId || !clientName) return null;
      const record = {
        id: generateId(ratings),
        workerId,
        jobId,
        clientName,
        stars: clampStars(stars),
        comment,
        categories: categories || {
          punctuality: clampStars(stars),
          quality: clampStars(stars),
          communication: clampStars(stars),
        },
        flags,
        submittedAt: new Date().toISOString(),
      };
      setRatings((prev) => {
        const next = [...prev, record];
        persistRatings(next);
        return next;
      });
      return record;
    },
    [ratings]
  );

  const updateRating = useCallback((ratingId, patch) => {
    setRatings((prev) => {
      const next = prev.map((r) =>
        r.id === ratingId
          ? {
              ...r,
              ...patch,
              stars: patch.stars != null ? clampStars(patch.stars) : r.stars,
            }
          : r
      );
      persistRatings(next);
      return next;
    });
  }, []);

  const removeRating = useCallback((ratingId) => {
    setRatings((prev) => {
      const next = prev.filter((r) => r.id !== ratingId);
      persistRatings(next);
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    persistRatings(seedRatings);
    setRatings([...seedRatings]);
  }, []);

  const value = useMemo(
    () => ({
      ratings,
      getRatingsFor,
      getStatsFor,
      getAvgFor,
      getBreakdownFor,
      getCategoryAveragesFor,
      addRating,
      updateRating,
      removeRating,
      resetAll,
    }),
    [
      ratings,
      getRatingsFor,
      getStatsFor,
      getAvgFor,
      getBreakdownFor,
      getCategoryAveragesFor,
      addRating,
      updateRating,
      removeRating,
      resetAll,
    ]
  );

  return <RatingsContext.Provider value={value}>{children}</RatingsContext.Provider>;
}

export function useRatings() {
  const ctx = useContext(RatingsContext);
  if (!ctx) {
    throw new Error('useRatings must be used inside RatingsProvider');
  }
  return ctx;
}
