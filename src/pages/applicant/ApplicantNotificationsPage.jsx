import PageHeader from '../../components/PageHeader.jsx';

const notifications = [
  { id: 1, title: 'New skill match found', message: '3 new jobs match your Plumbing and Safety Compliance skills.' },
  { id: 2, title: 'Application updated', message: 'Your application for Office Repainting moved to Matched status.' },
  { id: 3, title: 'Reminder', message: 'Complete your availability schedule to boost recommendation quality.' },
];

function ApplicantNotificationsPage() {
  return (
    <div>
      <PageHeader title="Notifications" subtitle="Stay updated on job matches and system messages." />

      <div className="space-y-3">
        {notifications.map((notice) => (
          <article key={notice.id} className="rounded-xl bg-white p-4 shadow-sm">
            <h3 className="text-base font-semibold text-[#1F4E79]">{notice.title}</h3>
            <p className="mt-1 text-sm text-gray-600">{notice.message}</p>
          </article>
        ))}
      </div>
    </div>
  );
}

export default ApplicantNotificationsPage;
