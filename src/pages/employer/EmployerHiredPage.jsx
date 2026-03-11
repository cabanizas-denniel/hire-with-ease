import PageHeader from '../../components/PageHeader.jsx';

const hiredWorkers = [
  { id: 1, worker: 'Rafael Santos', job: 'Residential Plumbing Repair', date: '2026-02-12' },
  { id: 2, worker: 'Alyssa Reyes', job: 'Office Repainting', date: '2026-02-20' },
  { id: 3, worker: 'Noel Garcia', job: 'Masonry and Tile Finishing', date: '2026-03-04' },
];

function EmployerHiredPage() {
  return (
    <div>
      <PageHeader title="Hired Workers" subtitle="Review previously confirmed hires and completed engagements." />

      <div className="space-y-3">
        {hiredWorkers.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
            <p className="text-base font-semibold text-[#1F4E79]">{item.worker}</p>
            <p className="text-sm text-gray-600">{item.job}</p>
            <p className="mt-1 text-xs text-gray-500">Hired on: {item.date}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployerHiredPage;
