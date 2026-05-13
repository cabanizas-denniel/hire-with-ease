/**
 * Notifications data provider.
 *
 * When you don't want mock data showing up in the UI yet, keep these exports
 * but return empty values so components (like the navbar bell) don't crash.
 */

export const applicantNotifications = [];
export const employerNotifications = [];

const byRole = {
  applicant: applicantNotifications,
  employer: employerNotifications,
};

export function getNotificationsForRole(role) {
  return byRole[role] || [];
}

export function getUnreadCount(role) {
  return getNotificationsForRole(role).filter((n) => n.unread).length;
}
