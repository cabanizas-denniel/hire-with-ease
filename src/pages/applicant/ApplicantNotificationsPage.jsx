import { useState } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';

const notifications = [
  {
    id: 1,
    type: 'match',
    title: 'New job match: Emergency Pipe Leak',
    message: 'A rush plumbing job in San Juan matches your skills and morning availability. Respond now.',
    time: '2 min ago',
    jobId: 'job-109',
    unread: true,
  },
  {
    id: 2,
    type: 'match',
    title: 'New job match: Residential Plumbing Repair',
    message: 'A scheduled plumbing job in Quezon City matches 2 of your skills.',
    time: '1 hour ago',
    jobId: 'job-101',
    unread: true,
  },
  {
    id: 3,
    type: 'status',
    title: 'Job accepted: Office Repainting',
    message: 'You confirmed for Office Repainting with Northlight Interiors. Job is now In Progress.',
    time: '3 hours ago',
    unread: false,
  },
  {
    id: 4,
    type: 'rating',
    title: 'Client rated you ★ 5',
    message: 'Maria Santos rated your work on Residential Plumbing Repair. Great job!',
    time: '1 day ago',
    unread: false,
  },
  {
    id: 5,
    type: 'system',
    title: 'Complete your availability',
    message: 'You have open slots on weekends. Adding Saturday availability could increase your matches by up to 40%.',
    time: '2 days ago',
    unread: false,
  },
];

const TYPE_STYLES = {
  match: 'border-l-[#2E75B6]',
  status: 'border-l-teal-500',
  rating: 'border-l-amber-400',
  system: 'border-l-gray-400',
};

function ApplicantNotificationsPage() {
  const [items] = useState(notifications);

  return (
    <div>
      <PageHeader
        title="Notifications"
        subtitle="Job matches, status updates, and system messages. Match notifications are your primary way to discover new jobs."
      />

      <div className="space-y-3">
        {items.map((item) => (
          <article
            key={item.id}
            className={`rounded-xl border-l-4 bg-white p-4 shadow-sm ${TYPE_STYLES[item.type] || 'border-l-gray-300'} ${
              item.unread ? 'ring-1 ring-[#2E75B6]/20' : ''
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-semibold text-[#1F4E79]">{item.title}</h3>
                  {item.unread ? (
                    <span className="h-2 w-2 shrink-0 rounded-full bg-[#2E75B6]" />
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-gray-600">{item.message}</p>
              </div>
              <span className="shrink-0 text-xs text-gray-400">{item.time}</span>
            </div>
            {item.type === 'match' ? (
              <div className="mt-3">
                <Link
                  to="/applicant/jobs"
                  className="inline-block rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white"
                >
                  View &amp; Respond
                </Link>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export default ApplicantNotificationsPage;
