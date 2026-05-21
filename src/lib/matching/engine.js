/**
 * Job–worker matching engine (client-side, deterministic).
 *
 * Pipeline:
 * 1. Weighted Sum Model (WSM) — score each factor 0–100, combine with weights.
 * 2. Greedy Best-First — keep top candidates by score for search efficiency.
 * 3. A* — pick 1–5 workers maximizing total shortlist score (subset selection).
 */

import { collectDeclinedWorkerIds } from './matchDeclines.js';
import { filterRealWorkerProfiles } from './seedFilters.js';

export const MATCH_LIMITS = Object.freeze({ min: 1, max: 5 });

/** Greedy pool size before A* (best-first narrowing). */
export const GREEDY_POOL_SIZE = 18;

const WEIGHTS = Object.freeze({
  skills: 0.4,
  location: 0.2,
  category: 0.15,
  availability: 0.15,
  reputation: 0.1,
});

const DAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/**
 * Map a Date or ISO string to worker availability slot key (`Mon-AM`).
 */
export function availabilitySlotForInstant(value) {
  if (!value) return null;
  const dt = typeof value === 'string' ? new Date(value) : value;
  if (!(dt instanceof Date) || Number.isNaN(dt.getTime())) return null;
  const day = DAY_KEYS[dt.getDay()];
  const slot = dt.getHours() < 12 ? 'AM' : 'PM';
  return `${day}-${slot}`;
}

function clamp100(n) {
  return Math.max(0, Math.min(100, n));
}

function haversineKm(a, b) {
  if (
    !a ||
    !b ||
    typeof a.lat !== 'number' ||
    typeof a.lng !== 'number' ||
    typeof b.lat !== 'number' ||
    typeof b.lng !== 'number'
  ) {
    return null;
  }
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
}

/**
 * WSM factor scores for one worker against one job.
 */
export function scoreWorkerFactors(job, profile) {
  const reasons = [];
  const skills = profile.skills || [];
  const required = job.requiredSkills || [];
  const matchedSkills = required.filter((s) => skills.includes(s));

  if (matchedSkills.length === 0) {
    return {
      eligible: false,
      total: 0,
      reasons: [],
      matchedSkills: [],
      factors: {},
    };
  }

  reasons.push(`Skills: ${matchedSkills.join(', ')}`);
  const skillRatio = matchedSkills.length / Math.max(required.length, 1);
  const skillsScore = clamp100(skillRatio * 100);

  let locationScore = 40;
  if (job.location?.barangay && profile.location?.barangay) {
    if (job.location.barangay === profile.location.barangay) {
      locationScore = 100;
      reasons.push('Same barangay in Olongapo');
    } else {
      const km = haversineKm(job.location, profile.location);
      if (km != null) {
        locationScore = clamp100(100 - km * 8);
        if (km < 3) reasons.push('Nearby in Olongapo');
      }
    }
  }

  let categoryScore = 0;
  if (
    profile.preferredCategories?.length &&
    profile.preferredCategories.includes(job.category)
  ) {
    categoryScore = 100;
    reasons.push(`Preferred category: ${job.category}`);
  }

  const slot = availabilitySlotForInstant(job.scheduledStartAt);
  const workerSlots = profile.availability || [];
  let availabilityScore = 50;
  if (!slot) {
    availabilityScore = 70;
  } else if (!workerSlots.length) {
    availabilityScore = 55;
    reasons.push('Availability not set on profile');
  } else if (workerSlots.includes(slot)) {
    availabilityScore = 100;
    reasons.push(`Available ${slot.replace('-', ' ')}`);
  } else {
    availabilityScore = 0;
  }

  const rating = typeof profile.rating === 'number' ? profile.rating : null;
  const jobsCompleted =
    typeof profile.jobsCompleted === 'number' ? profile.jobsCompleted : 0;
  let reputationScore = 30;
  if (rating != null) {
    reputationScore = clamp100((rating / 5) * 100);
    if (rating >= 4) reasons.push(`Rating ${rating.toFixed(1)}`);
  } else if (jobsCompleted > 0) {
    reputationScore = clamp100(40 + Math.min(jobsCompleted, 20) * 3);
  }

  const factors = {
    skills: skillsScore,
    location: locationScore,
    category: categoryScore,
    availability: availabilityScore,
    reputation: reputationScore,
  };

  const total = clamp100(
    factors.skills * WEIGHTS.skills +
      factors.location * WEIGHTS.location +
      factors.category * WEIGHTS.category +
      factors.availability * WEIGHTS.availability +
      factors.reputation * WEIGHTS.reputation,
  );

  const eligible =
    matchedSkills.length > 0 &&
    (profile.moderationStatus || 'active') === 'active' &&
    availabilityScore > 0;

  return {
    eligible,
    total,
    reasons,
    matchedSkills,
    factors,
  };
}

/**
 * Greedy best-first: sort by WSM total descending, take top `limit`.
 */
export function greedyBestFirstNarrow(scored, limit = GREEDY_POOL_SIZE) {
  return [...scored]
    .filter((e) => e.eligible)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

/**
 * A* subset selection: up to `maxCount` workers maximizing sum of scores.
 * Requires at least `minCount` when enough eligible candidates exist.
 */
export function astarSelectShortlist(scored, { minCount = 1, maxCount = 5 } = {}) {
  const pool = scored.filter((e) => e.eligible);
  if (!pool.length) return [];

  const cap = Math.min(maxCount, pool.length);
  const need = Math.min(minCount, cap);

  if (pool.length <= cap) {
    return pool.slice(0, cap).map((e, i) => ({ ...e, rank: i + 1 }));
  }

  const sorted = [...pool].sort((a, b) => b.total - a.total);

  const start = { picked: [], nextIdx: 0 };
  const open = [{ state: start, f: -heuristicUpper(sorted, start, cap) }];
  let best = null;
  let bestScore = -Infinity;

  const key = (picked) =>
    picked
      .map((p) => p.profile.docId || p.profile.uid)
      .sort()
      .join('|');

  const visited = new Set();

  while (open.length) {
    open.sort((a, b) => a.f - b.f);
    const { state } = open.shift();
    const { picked, nextIdx } = state;
    const k = key(picked);
    if (visited.has(k)) continue;
    visited.add(k);

    const sum = picked.reduce((s, p) => s + p.total, 0);

    if (picked.length >= need && picked.length <= cap && sum > bestScore) {
      bestScore = sum;
      best = picked;
    }

    if (picked.length === cap) continue;

    for (let i = nextIdx; i < sorted.length; i += 1) {
      const candidate = sorted[i];
      const id = candidate.profile.docId || candidate.profile.uid;
      if (picked.some((p) => (p.profile.docId || p.profile.uid) === id)) continue;

      const nextPicked = [...picked, candidate];
      const nextState = { picked: nextPicked, nextIdx: i + 1 };
      const g = -nextPicked.reduce((s, p) => s + p.total, 0);
      const h = -heuristicUpper(sorted, nextState, cap);
      open.push({ state: nextState, f: g + h });
    }
  }

  const result = (best || sorted.slice(0, cap)).slice(0, cap);
  return result.map((e, i) => ({ ...e, rank: i + 1 }));
}

function heuristicUpper(sorted, state, maxCount) {
  const { picked, nextIdx } = state;
  const remaining = maxCount - picked.length;
  if (remaining <= 0) return 0;
  let sum = 0;
  let taken = 0;
  const used = new Set(
    picked.map((p) => p.profile.docId || p.profile.uid),
  );
  for (let i = nextIdx; i < sorted.length && taken < remaining; i += 1) {
    const id = sorted[i].profile.docId || sorted[i].profile.uid;
    if (used.has(id)) continue;
    sum += sorted[i].total;
    taken += 1;
  }
  return sum;
}

/**
 * Full pipeline: score all → greedy pool → A* shortlist (1–5).
 */
export function runMatchingEngine(job, workerProfiles = []) {
  if (!job?.requiredSkills?.length) {
    return { matches: [], scoredCount: 0, poolSize: 0 };
  }

  const scored = filterRealWorkerProfiles(workerProfiles).map((profile) => {
    const result = scoreWorkerFactors(job, profile);
    return {
      profile,
      ...result,
      score: result.total,
    };
  });

  const narrowed = greedyBestFirstNarrow(scored, GREEDY_POOL_SIZE);
  const matches = astarSelectShortlist(narrowed, {
    minCount: MATCH_LIMITS.min,
    maxCount: MATCH_LIMITS.max,
  });

  return {
    matches,
    scoredCount: scored.filter((s) => s.eligible).length,
    poolSize: narrowed.length,
  };
}

/**
 * Serialize engine output for Firestore on the job document.
 */
export function serializeEngineMatches(matches) {
  return matches.map((entry) => ({
    workerId: entry.profile.docId || entry.profile.uid,
    workerName: entry.profile.name || 'Worker',
    score: Math.round(entry.score * 10) / 10,
    reasons: entry.reasons || [],
    matchedSkills: entry.matchedSkills || [],
    rank: entry.rank,
  }));
}

/**
 * Hydrate stored engine matches with live worker profiles for UI cards.
 */
export function hydrateEngineMatches(
  job,
  workerProfiles = [],
  declinedWorkerIds = null,
) {
  const stored = job?.engineMatches;
  if (!Array.isArray(stored) || !stored.length) return [];

  const jobId = job?.docId || job?.id;
  let declined;
  if (declinedWorkerIds instanceof Set) {
    declined = declinedWorkerIds;
  } else if (declinedWorkerIds != null) {
    declined = new Set(
      Array.isArray(declinedWorkerIds)
        ? declinedWorkerIds
        : job?.engineDeclinedWorkerIds || [],
    );
  } else {
    declined = collectDeclinedWorkerIds(jobId, workerProfiles, []);
  }

  const byId = new Map(
    filterRealWorkerProfiles(workerProfiles).map((p) => [
      p.docId || p.uid,
      p,
    ]),
  );

  return stored
    .filter((row) => !declined.has(row.workerId))
    .map((row) => {
      const profile = byId.get(row.workerId);
      if (!profile) return null;
      return {
        profile,
        score: row.score,
        reasons: row.reasons || [],
        matchedSkills: row.matchedSkills || [],
        rank: row.rank,
      };
    })
    .filter(Boolean)
    .sort((a, b) => (a.rank || 99) - (b.rank || 99));
}
