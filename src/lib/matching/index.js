export * from './statuses.js';
export * from './jobs.js';
export * from './applications.js';
export * from './agreements.js';
export * from './threads.js';
export * from './workerProfile.js';
export {
  MATCH_LIMITS,
  GREEDY_POOL_SIZE,
  availabilitySlotForInstant,
  scoreWorkerFactors,
  greedyBestFirstNarrow,
  astarSelectShortlist,
  runMatchingEngine,
  serializeEngineMatches,
  hydrateEngineMatches,
} from './engine.js';
export { runJobMatching } from './runJobMatching.js';

import { filterRealWorkerProfiles } from './seedFilters.js';

export {
  filterRealApplications,
  filterRealWorkerProfiles,
  isSeedApplication,
  isSeedWorkerProfile,
} from './seedFilters.js';

/**
 * Rule-based matching (deterministic — same job + profile always ranks the same):
 * 1. Required: worker shares at least one skill the job needs.
 * 2. Bonus: same barangay in Olongapo (+5 score).
 * 3. Bonus: job category is in worker's preferred list (+3 score).
 */
export function workerMatchesJob(job, profile) {
  if (!job || !profile) return false;
  const skills = profile.skills || [];
  const required = job.requiredSkills || [];
  return required.some((s) => skills.includes(s));
}

export function scoreMatch(job, profile) {
  if (!job || !profile) return { score: 0, reasons: [], matchedSkills: [] };
  const skills = profile.skills || [];
  const required = job.requiredSkills || [];
  const matchedSkills = required.filter((s) => skills.includes(s));
  const reasons = [];
  let score = 0;

  if (matchedSkills.length === 0) {
    return { score: 0, reasons: [], matchedSkills: [] };
  }

  reasons.push(`Skills: ${matchedSkills.join(', ')}`);
  score += matchedSkills.length * 10;

  if (job.location?.barangay && profile.location?.barangay) {
    if (job.location.barangay === profile.location.barangay) {
      reasons.push('Same barangay in Olongapo');
      score += 5;
    }
  }
  if (
    profile.preferredCategories &&
    profile.preferredCategories.includes(job.category)
  ) {
    reasons.push(`Preferred category: ${job.category}`);
    score += 3;
  }

  return { score, reasons, matchedSkills };
}

/**
 * Workers who qualify for this job (skill overlap), ranked for homeowner view.
 * Excludes suspended/banned profiles when moderationStatus is set.
 */
export function rankWorkersForJob(job, workerProfiles = []) {
  if (!job?.requiredSkills?.length) return [];
  return filterRealWorkerProfiles(workerProfiles)
    .filter((profile) => {
      const status = profile.moderationStatus || 'active';
      return status === 'active';
    })
    .map((profile) => {
      const { score, reasons, matchedSkills } = scoreMatch(job, profile);
      return { profile, score, reasons, matchedSkills };
    })
    .filter((entry) => entry.matchedSkills.length > 0)
    .sort((a, b) => b.score - a.score);
}
