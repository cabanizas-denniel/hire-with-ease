import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';

const applications = [
  { id: 1, jobTitle: 'Residential Plumbing Repair', employer: 'Apex Build Co.', status: 'Pending' },
  { id: 2, jobTitle: 'Office Repainting', employer: 'Northlight Interiors', status: 'Matched' },
  { id: 3, jobTitle: 'Masonry and Tile Finishing', employer: 'UrbanRise Projects', status: 'Completed' },
];

function ApplicantApplicationsPage() {
  return (
    <div>
      <PageHeader title="My Applications" subtitle="Monitor your submitted applications and current statuses." />

      <div className="space-y-3">
        {applications.map((item) => (
          <div key={item.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-base font-semibold text-[#1F4E79]">{item.jobTitle}</p>
                <p className="text-sm text-gray-600">{item.employer}</p>
              </div>
              <StatusBadge status={item.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ApplicantApplicationsPage;
