import PageHeader from '../../components/PageHeader.jsx';

const jobHistory = [
  {
    id: 1,
    title: 'Residential Plumbing Repair',
    worker: 'Rafael Santos',
    location: 'Quezon City',
    completedAt: '2026-02-14',
    budget: 'PHP 2,200',
    rating: 5,
    feedback: 'Arrived on time, fixed everything in one visit. Very professional.',
  },
  {
    id: 2,
    title: 'Office Repainting',
    worker: 'Alyssa Reyes',
    location: 'Taguig',
    completedAt: '2026-02-22',
    budget: 'PHP 1,800',
    rating: 4,
    feedback: 'Good finish quality, but took an extra day.',
  },
  {
    id: 3,
    title: 'Condo Tile Finishing',
    worker: 'Noel Garcia',
    location: 'Manila',
    completedAt: '2026-03-06',
    budget: 'PHP 2,400',
    rating: 5,
    feedback: 'Excellent craftsmanship. Highly recommended.',
  },
];

function EmployerHiredPage() {
  return (
    <div>
      <PageHeader
        title="Job History"
        subtitle="Completed service requests, worker performance, and your feedback."
      />

      <div className="space-y-3">
        {jobHistory.map((item) => (
          <article key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1F4E79]">{item.title}</h3>
                <p className="text-sm text-gray-600">Worker: {item.worker} · {item.location}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Completed {item.completedAt} · {item.budget}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
              </span>
            </div>
            {item.feedback ? (
              <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 italic">
                "{item.feedback}"
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export default EmployerHiredPage;
