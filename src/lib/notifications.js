import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase.js';

/** UI category for styling and action links on notification pages. */
export const NOTIFICATION_UI_TYPES = Object.freeze({
  VERIFICATION: 'verification',
  MATCH: 'match',
  STATUS: 'status',
  RATING: 'rating',
  SYSTEM: 'system',
});

/**
 * Persist an in-app notification for a user (idempotent by eventKey).
 * Called from admin approval flows after verification state is saved.
 */
export async function createUserNotification(userId, payload) {
  if (!db || !userId) return;

  const {
    eventKey,
    type = NOTIFICATION_UI_TYPES.VERIFICATION,
    title,
    message,
    linkTo = null,
  } = payload;

  if (!eventKey || !title || !message) return;

  const ref = doc(db, 'users', userId, 'notifications', eventKey);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  const createdAtIso = new Date().toISOString();
  await setDoc(ref, {
    eventKey,
    type,
    title,
    message,
    linkTo,
    unread: true,
    createdAtIso,
    readAt: null,
  });
}

export function profileLinkForVerificationRole(verificationRole) {
  return verificationRole === 'client' ? '/employer/profile' : '/applicant/profile';
}

export async function notifyIdentityReview(userId, { approved, verificationRole, eventAt }) {
  const linkTo = profileLinkForVerificationRole(verificationRole);
  const isEmployer = verificationRole === 'client';

  if (approved && isEmployer) {
    await createUserNotification(userId, {
      eventKey: `verification:employer:active:${eventAt}`,
      type: NOTIFICATION_UI_TYPES.VERIFICATION,
      title: 'Employer profile verified',
      message:
        'PESO approved your profile. Your account is active and you can request services.',
      linkTo,
    });
    return;
  }

  await createUserNotification(userId, {
    eventKey: `verification:identity:${approved ? 'approved' : 'rejected'}:${eventAt}`,
    type: NOTIFICATION_UI_TYPES.VERIFICATION,
    title: approved ? 'Identity approved' : 'Identity needs resubmission',
    message: approved
      ? isEmployer
        ? 'PESO approved your government ID and selfie.'
        : 'PESO approved your government ID and selfie. Complete any remaining verification steps to get activated.'
      : 'Your identity submission was not approved. Open Profile → Verification to review notes and resubmit.',
    linkTo,
  });
}

export async function notifyDocumentReview(
  userId,
  { approved, verificationRole, docIndex, label, eventAt }
) {
  const linkTo = profileLinkForVerificationRole(verificationRole);
  const docLabel = label?.trim() || 'supporting document';

  await createUserNotification(userId, {
    eventKey: `verification:document:${docIndex}:${approved ? 'approved' : 'rejected'}:${eventAt}`,
    type: NOTIFICATION_UI_TYPES.VERIFICATION,
    title: approved ? 'Document approved' : 'Document needs resubmission',
    message: approved
      ? `PESO approved your ${docLabel}.`
      : `Your ${docLabel} was not approved. Open Profile → Verification to resubmit.`,
    linkTo,
  });
}

export async function notifyWorkerActivation(userId, { eventAt }) {
  await createUserNotification(userId, {
    eventKey: `verification:worker:activated:${eventAt}`,
    type: NOTIFICATION_UI_TYPES.VERIFICATION,
    title: 'Worker account activated',
    message:
      'PESO activated your account. You can now view matched jobs and apply to work requests.',
    linkTo: '/applicant/profile',
  });
}

export async function notifyApplicationRejected(userId, { verificationRole, eventAt }) {
  await createUserNotification(userId, {
    eventKey: `verification:application:rejected:${eventAt}`,
    type: NOTIFICATION_UI_TYPES.VERIFICATION,
    title: 'Verification update',
    message:
      'PESO reviewed your submission and requested changes. Open Profile → Verification for details.',
    linkTo: profileLinkForVerificationRole(verificationRole),
  });
}

const ADMIN_VERIFICATION_LINK = '/admin/verification';

/**
 * Shared PESO inbox: workers/employers create; admins read and mark read.
 */
export async function createAdminNotification({
  eventKey,
  type = NOTIFICATION_UI_TYPES.VERIFICATION,
  title,
  message,
  linkTo = ADMIN_VERIFICATION_LINK,
  subjectUserId,
  subjectRole,
}) {
  if (!db || !eventKey || !title || !message || !subjectUserId) return;

  const ref = doc(db, 'admin_notifications', eventKey);
  const existing = await getDoc(ref);
  if (existing.exists()) return;

  const createdAtIso = new Date().toISOString();
  await setDoc(ref, {
    eventKey,
    type,
    title,
    message,
    linkTo,
    subjectUserId,
    subjectRole: subjectRole || 'service-provider',
    unread: true,
    createdAtIso,
    readAt: null,
  });
}

export async function notifyAdminsVerificationSubmission(
  subjectUserId,
  { kind, verificationRole, eventAt, documentLabel }
) {
  const roleLabel = verificationRole === 'client' ? 'Employer' : 'Worker';
  const roleLower = roleLabel.toLowerCase();

  if (kind === 'identity') {
    await createAdminNotification({
      eventKey: `admin:inbox:identity:${subjectUserId}:${eventAt}`,
      title: `New ${roleLabel} identity review`,
      message: `A ${roleLower} submitted a government ID and selfie for PESO review.`,
      subjectUserId,
      subjectRole: verificationRole,
    });
    return;
  }

  if (kind === 'document') {
    const docLabel = documentLabel?.trim() || 'supporting document';
    await createAdminNotification({
      eventKey: `admin:inbox:document:${subjectUserId}:${eventAt}`,
      title: `New ${roleLabel} document`,
      message: `A ${roleLower} uploaded ${docLabel} for PESO review.`,
      subjectUserId,
      subjectRole: verificationRole,
    });
  }
}

export function formatNotificationTime(iso) {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}
