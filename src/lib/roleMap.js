/**
 * Role mapping between Firestore (canonical schema) and the React app
 * (internal labels used by routes, sidebar, dashboards, etc).
 *
 * Firestore = source of truth. The frontend uses internal labels only
 * for routing/UI; security checks live in Firestore Rules.
 */

export const FIRESTORE_ROLES = Object.freeze({
  ADMIN: 'admin',
  INFORMAL_WORKER: 'informal_worker',
  HOMEOWNER: 'homeowner',
});

export const APP_ROLES = Object.freeze({
  ADMIN: 'admin',
  APPLICANT: 'applicant',
  EMPLOYER: 'employer',
});

const FIRESTORE_TO_APP = {
  [FIRESTORE_ROLES.ADMIN]: APP_ROLES.ADMIN,
  [FIRESTORE_ROLES.INFORMAL_WORKER]: APP_ROLES.APPLICANT,
  [FIRESTORE_ROLES.HOMEOWNER]: APP_ROLES.EMPLOYER,
};

const APP_TO_FIRESTORE = {
  [APP_ROLES.ADMIN]: FIRESTORE_ROLES.ADMIN,
  [APP_ROLES.APPLICANT]: FIRESTORE_ROLES.INFORMAL_WORKER,
  [APP_ROLES.EMPLOYER]: FIRESTORE_ROLES.HOMEOWNER,
};

export function toAppRole(firestoreRole) {
  return FIRESTORE_TO_APP[firestoreRole] ?? null;
}

export function toFirestoreRole(appRole) {
  return APP_TO_FIRESTORE[appRole] ?? null;
}

export function isValidFirestoreRole(role) {
  return role === FIRESTORE_ROLES.ADMIN
    || role === FIRESTORE_ROLES.INFORMAL_WORKER
    || role === FIRESTORE_ROLES.HOMEOWNER;
}
