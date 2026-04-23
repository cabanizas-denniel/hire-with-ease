/**
 * Mock notifications for the prototype.
 * Split per-role so the navbar bell can show an accurate unread count
 * for whichever user is currently logged in.
 */

export const applicantNotifications = [
  {
    id: 1,
    type: 'match',
    title: 'New job match: Emergency Pipe Leak',
    message:
      'A rush plumbing job in San Juan matches your skills and morning availability. Respond now.',
    time: '2 min ago',
    jobId: 'job-109',
    unread: true,
  },
  {
    id: 2,
    type: 'match',
    title: 'New job match: Residential Plumbing Repair',
    message:
      'A scheduled plumbing job in Quezon City matches 2 of your skills.',
    time: '1 hour ago',
    jobId: 'job-101',
    unread: true,
  },
  {
    id: 3,
    type: 'status',
    title: 'Job accepted: Office Repainting',
    message:
      'You confirmed for Office Repainting with Northlight Interiors. Job is now In Progress.',
    time: '3 hours ago',
    unread: false,
  },
  {
    id: 4,
    type: 'rating',
    title: 'Client rated you 5 stars',
    message:
      'Maria Santos rated your work on Residential Plumbing Repair. Great job!',
    time: '1 day ago',
    unread: false,
  },
  {
    id: 5,
    type: 'system',
    title: 'Complete your availability',
    message:
      'You have open slots on weekends. Adding Saturday availability could increase your matches by up to 40%.',
    time: '2 days ago',
    unread: false,
  },
];

export const employerNotifications = [
  {
    id: 1,
    type: 'match',
    title: 'Worker matched: Kitchen Faucet Replacement',
    message:
      'Rafael Santos (Fully Verified · 4.8★) accepted your request. Tap to confirm the schedule.',
    time: '5 min ago',
    jobId: 'job-101',
    unread: true,
  },
  {
    id: 2,
    type: 'match',
    title: '2 workers found for: Office Repainting',
    message:
      'The system matched 2 qualified painters for your request. Review their profiles and pick one.',
    time: '45 min ago',
    jobId: 'job-113',
    unread: true,
  },
  {
    id: 3,
    type: 'verification',
    title: 'Identity approved by PESO',
    message:
      'Your identity submission was reviewed and approved. Your trust tier is now Identity Reviewed.',
    time: '2 hours ago',
    unread: true,
  },
  {
    id: 4,
    type: 'status',
    title: 'Job completed: Bathroom Tile Grouting',
    message:
      'Mark the job as completed and leave a rating so other clients benefit from your feedback.',
    time: '1 day ago',
    jobId: 'job-108',
    unread: false,
  },
  {
    id: 5,
    type: 'system',
    title: 'Tip: Add preferred schedule to every request',
    message:
      'Requests with a preferred date and time get matched 2x faster than open-ended ones.',
    time: '3 days ago',
    unread: false,
  },
];

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
