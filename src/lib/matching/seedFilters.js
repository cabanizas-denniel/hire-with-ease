/**
 * Hide leftover cold-start docs (`wrk-201`) that are not real Auth users.
 * Demo logins (@hwe.test) keyed by Firebase uid SHOULD appear in matching.
 */

export function isSeedWorkerProfile(profile) {
  if (!profile) return true;
  const id = String(profile.docId || profile.id || profile.uid || '');
  if (/^wrk-\d+$/i.test(id)) return true;
  return false;
}

export function isSeedApplication(application) {
  if (!application) return true;
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
