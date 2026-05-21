/**
 * Detect Firestore records left over from thesis/demo seed scripts.
 * Real workers use auth uid as /worker_profiles doc id; cold-start pool used wrk-XXX.
 */

const SEED_EMAIL_SUFFIX = '@hwe.test';

export function isSeedWorkerProfile(profile) {
  if (!profile) return true;
  const id = String(profile.docId || profile.id || profile.uid || '');
  if (/^wrk-\d+$/i.test(id)) return true;
  if (profile.isSeed === true || profile.seed === true) return true;
  if (profile.seedWorkerId) return true;
  const email = (profile.email || '').toLowerCase();
  if (email.endsWith(SEED_EMAIL_SUFFIX)) return true;
  return false;
}

export function isSeedApplication(application) {
  if (!application) return true;
  if (application.isSeed === true || application.seed === true) return true;
  const workerId = String(application.workerId || '');
  if (/^wrk-\d+$/i.test(workerId)) return true;
  return false;
}

export function filterRealWorkerProfiles(profiles = []) {
  return profiles.filter((p) => !isSeedWorkerProfile(p));
}

export function filterRealApplications(applications = []) {
  return applications.filter((a) => !isSeedApplication(a));
}
