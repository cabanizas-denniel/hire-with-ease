/**
 * Job–worker matching engine (client-side, deterministic).
 *
 * Pipeline:
 * 1. Weighted Sum Model (WSM) — score each factor 0–100, combine with weights.
 * 2. Greedy Best-First — keep top candidates by score for search efficiency.
 * 3. A* — pick 1–5 workers maximizing total shortlist score (subset selection).
 *
 * Skills: primary skill outranks secondary skills when scoring.
 * Availability is not used — schedule is negotiated in chat after accept.
 */

import { normalizeWorkerSkills } from '../../data/skills.js';
import { collectDeclinedWorkerIds } from './matchDeclines.js';
import { filterRealWorkerProfiles } from './seedFilters.js';

export const MATCH_LIMITS = Object.freeze({ min: 1, max: 5 });

/** Greedy pool size before A* (best-first narrowing). */
export const GREEDY_POOL_SIZE = 18;

export const WEIGHTS = Object.freeze({
  skills: 0.45,
  location: 0.25,
  category: 0.15,
  reputation: 0.15,
});

function clamp100(n) {
  return Math.max(0, Math.min(100, n));
}

function contributionPercent(factorScore, weight) {
  return Math.max(0, Math.round((Number(factorScore) || 0) * weight));
}

function locationBreakdownLabel(locationScore, audience = 'employer') {
  const forWorker = audience === 'worker';
  if (locationScore >= 95) {
    return forWorker ? 'Same barangay as the job' : 'Lives in your barangay';
  }
  if (locationScore >= 70) {
    return forWorker ? 'Close to the job site' : 'Close to your place';
  }
  if (locationScore >= 45) {
    return forWorker ? 'Somewhat near the job site' : 'Somewhat near your place';
  }
  if (locationScore >= 25) {
    return forWorker ? 'A bit farther from the job' : 'A bit farther from your place';
  }
  return forWorker ? 'Farther from the job site' : 'Farther from your place';
}

function reputationBreakdownLabel(reputationScore, rating) {
  if (typeof rating === 'number' && rating >= 4.5) return 'Excellent rating';
  if (typeof rating === 'number' && rating >= 4) return 'Strong rating';
  if (reputationScore >= 70) return 'Solid work history';
  if (reputationScore >= 40) return 'Some job experience';
  return 'New on the platform';
}

/**
 * Plain-language breakdown of how much each factor added to the match %.
 * Example: "Primary skill matches — 41%"
 *
 * @param {'employer'|'worker'} audience — tweaks location wording
 */
export function buildMatchBreakdown({
  factors = {},
  primaryMatches = false,
  rating = null,
  audience = 'employer',
} = {}) {
  const skillsPts = contributionPercent(factors.skills, WEIGHTS.skills);
  const locationPts = contributionPercent(factors.location, WEIGHTS.location);
  const categoryPts = contributionPercent(factors.category, WEIGHTS.category);
  const reputationPts = contributionPercent(factors.reputation, WEIGHTS.reputation);

  const items = [
    {
      key: 'skills',
      label: primaryMatches ? 'Primary skill matches' : 'Additional skills match',
      percent: skillsPts,
    },
    {
      key: 'location',
      label: locationBreakdownLabel(factors.location ?? 0, audience),
      percent: locationPts,
    },
    {
      key: 'category',
      label: 'Fits this job category',
      percent: categoryPts,
    },
    {
      key: 'reputation',
      label: reputationBreakdownLabel(factors.reputation ?? 0, rating),
      percent: reputationPts,
    },
  ];

  return items
    .filter((item) => item.percent > 0)
    .sort((a, b) => b.percent - a.percent);
}

/** Format breakdown rows for UI lists. */
export function formatMatchBreakdownLines(breakdown = []) {
  return breakdown.map((item) => `${item.label} — ${item.percent}%`);
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
 *
 * Primary skill match ranks above secondary-only overlap so a plumber
 * with HVAC as secondary loses to an HVAC primary on HVAC jobs.
 */
export function scoreWorkerFactors(job, profile) {
  const reasons = [];
  const { primarySkill, secondarySkills, skills } = normalizeWorkerSkills(profile);
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

  const primaryMatches = Boolean(primarySkill && required.includes(primarySkill));
  const secondaryMatched = required.filter((s) => secondarySkills.includes(s));
  const skillRatio = matchedSkills.length / Math.max(required.length, 1);

  let skillsScore;
  if (primaryMatches) {
    // Primary specialty for this job — strong base, slight boost for overlap.
    skillsScore = clamp100(82 + skillRatio * 18);
    reasons.push(`Primary skill: ${primarySkill}`);
  } else {
    // Qualifies via secondary skills only — eligible but lower weight.
    skillsScore = clamp100(38 + skillRatio * 32);
    reasons.push(
      secondaryMatched.length
        ? `Additional skills: ${secondaryMatched.join(', ')}`
        : `Skills: ${matchedSkills.join(', ')}`,
    );
  }
  if (matchedSkills.length > 1 || (primaryMatches && secondaryMatched.length)) {
    const extras = matchedSkills.filter((s) => s !== primarySkill);
    if (extras.length) reasons.push(`Also: ${extras.join(', ')}`);
  }

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

  // Optional job-level certification requirements (forward-compatible).
  const requiredCerts = [
    ...(job.requiredCertifications || []),
    ...(job.requiredLicenses || []),
  ].filter((c) => typeof c === 'string' && c.trim());
  if (requiredCerts.length) {
    const workerCertLabels = (profile.certifications || [])
      .map((c) => (typeof c === 'string' ? c : c?.label || c?.name || ''))
      .filter(Boolean)
      .map((s) => s.toLowerCase());
    const certHits = requiredCerts.filter((req) =>
      workerCertLabels.some((label) => label.includes(req.toLowerCase())),
    );
    if (certHits.length) {
      skillsScore = clamp100(skillsScore + Math.min(12, certHits.length * 6));
      reasons.push(`Certification match: ${certHits.join(', ')}`);
    }
  }

  const factors = {
    skills: skillsScore,
    location: locationScore,
    category: categoryScore,
    reputation: reputationScore,
  };

  const total = clamp100(
    factors.skills * WEIGHTS.skills +
      factors.location * WEIGHTS.location +
      factors.category * WEIGHTS.category +
      factors.reputation * WEIGHTS.reputation,
  );

  const breakdown = buildMatchBreakdown({
    factors,
    primaryMatches,
    rating,
    audience: 'employer',
  });

  const eligible =
    matchedSkills.length > 0 &&
    (profile.moderationStatus || 'active') === 'active';

  return {
    eligible,
    total,
    reasons,
    matchedSkills,
    factors,
    breakdown,
    primaryMatches,
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
 * Requires at least `minCount` when enough eligible candidates exist.
 */
export function astarSelectShortlist(scored, options = {}) {
  const minCount = options.minCount ?? MATCH_LIMITS.min;
  const maxCount = options.maxCount ?? MATCH_LIMITS.max;
  const pool = scored.filter((e) => e.eligible);
  if (!pool.length) return [];

  const sorted = [...pool].sort((a, b) => b.total - a.total);
  const n = Math.min(Math.max(minCount, Math.min(maxCount, sorted.length)), sorted.length);
  return sorted.slice(0, n).map((entry, i) => ({
    ...entry,
    rank: i + 1,
  }));
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
  return matches.map((entry) => {
    const breakdown =
      entry.breakdown ||
      buildMatchBreakdown({
        factors: entry.factors,
        primaryMatches: entry.primaryMatches,
        rating: entry.profile?.rating,
      });
    return {
      workerId: entry.profile.docId || entry.profile.uid,
      workerName: entry.profile.name || 'Worker',
      score: Math.round(entry.score * 10) / 10,
      reasons: entry.reasons || [],
      matchedSkills: entry.matchedSkills || [],
      factors: entry.factors || null,
      breakdown,
      rank: entry.rank,
    };
  });
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
    declined = new Set(declinedWorkerIds);
  } else {
    declined = collectDeclinedWorkerIds(jobId, workerProfiles, []);
  }

  return stored
    .filter((m) => m?.workerId && !declined.has(m.workerId))
    .map((m) => {
      const profile =
        workerProfiles.find(
          (p) => (p.docId || p.uid) === m.workerId,
        ) || {
          docId: m.workerId,
          uid: m.workerId,
          name: m.workerName || 'Worker',
          skills: m.matchedSkills || [],
        };
      const breakdown =
        Array.isArray(m.breakdown) && m.breakdown.length
          ? m.breakdown
          : m.factors
            ? buildMatchBreakdown({
                factors: m.factors,
                primaryMatches: (m.matchedSkills || []).includes(
                  profile.primarySkill || (profile.skills || [])[0],
                ),
                rating: profile.rating,
              })
            : [];

      return {
        profile,
        score: m.score ?? 0,
        reasons: m.reasons || [],
        matchedSkills: m.matchedSkills || [],
        factors: m.factors || null,
        breakdown,
        rank: m.rank,
      };
    });
}
