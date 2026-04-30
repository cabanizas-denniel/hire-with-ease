export * from './statuses.js';
export * from './jobs.js';
export * from './applications.js';
export * from './agreements.js';
export * from './threads.js';
export * from './workerProfile.js';

/**
 * Pure scoring helper used by both worker- and homeowner-facing pages.
 * Returns a score and the list of reasons we matched. Cold-start logic
 * — keep deterministic so the same job + profile always rank the same.
 */
export function scoreMatch(job, profile) {
  if (!job || !profile) return { score: 0, reasons: [] };
  const skills = profile.skills || [];
  const required = job.requiredSkills || [];
  const matchedSkills = required.filter((s) => skills.includes(s));
  const reasons = [];
  if (matchedSkills.length > 0) {
    reasons.push(`Skills: ${matchedSkills.join(', ')}`);
  }
  if (job.location?.barangay && profile.location?.barangay) {
    if (job.location.barangay === profile.location.barangay) {
      reasons.push('Same barangay as your service area');
    }
  }
  if (
    profile.preferredCategories &&
    profile.preferredCategories.includes(job.category)
  ) {
    reasons.push(`Preferred category: ${job.category}`);
  }
  return {
    score:
      matchedSkills.length * 10 +
      (reasons.length > matchedSkills.length ? reasons.length - matchedSkills.length : 0),
    reasons,
    matchedSkills,
  };
}
