/**
 * @deprecated Notifications are stored in Firestore under users/{uid}/notifications.
 * Use NotificationsContext (useNotifications) instead.
 */

export const applicantNotifications = [];
export const employerNotifications = [];

export function getNotificationsForRole() {
  return [];
}

export function getUnreadCount() {
  return 0;
}
