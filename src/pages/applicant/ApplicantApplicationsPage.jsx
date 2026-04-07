import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const myJobs = [
  {
    id: 1,
    title: 'Office Repainting',
    client: 'Northlight Interiors',
    location: 'Taguig',
    budget: 'PHP 1,500 - 2,100',
    status: 'In Progress',
    acceptedAt: '2026-03-22',
  },
  {
    id: 2,
    title: 'Emergency Pipe Leak',
    client: 'Café Amore',
    location: 'San Juan',
    budget: 'PHP 2,500 - 3,300',
    status: 'Accepted',
    acceptedAt: '2026-04-05',
  },
  {
    id: 3,
    title: 'Residential Plumbing Repair',
    client: 'Maria Santos',
    location: 'Quezon City',
    budget: 'PHP 1,800 - 2,500',
    status: 'Completed',
    acceptedAt: '2026-02-12',
    completedAt: '2026-02-14',
    clientRating: 5,
  },
  {
    id: 4,
    title: 'Condo Pipe Replacement',
    client: 'Apex Build Co.',
    location: 'Makati',
    budget: 'PHP 2,000 - 2,800',
    status: 'Completed',
    acceptedAt: '2026-01-20',
    completedAt: '2026-01-22',
    clientRating: 4,
  },
];

function ApplicantApplicationsPage() {
  const active = myJobs.filter((j) => j.status !== 'Completed');
  const completed = myJobs.filter((j) => j.status === 'Completed');

  return (
    <div>
      <PageHeader
        title="My Jobs"
        subtitle="Jobs you accepted. Track active work and review completed history."
      />

      {active.length > 0 ? (
        <section>
          <h2 className="mb-3 text-base font-semibold text-[#1F4E79]">Active</h2>
          <div className="space-y-3">
            {active.map((item) => (
              <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-[#1F4E79]">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.client} · {item.location}</p>
                    <p className="mt-1 text-xs text-gray-500">{item.budget} · Accepted {item.acceptedAt}</p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {completed.length > 0 ? (
        <section className={active.length > 0 ? 'mt-8' : ''}>
          <h2 className="mb-3 text-base font-semibold text-[#1F4E79]">Completed</h2>
          <div className="space-y-3">
            {completed.map((item) => (
              <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-[#1F4E79]">{item.title}</p>
                    <p className="text-sm text-gray-600">{item.client} · {item.location}</p>
                    <p className="mt-1 text-xs text-gray-500">
                      Completed {item.completedAt}
                      {item.clientRating ? ` · Client rated ★ ${item.clientRating}` : ''}
                    </p>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default ApplicantApplicationsPage;
