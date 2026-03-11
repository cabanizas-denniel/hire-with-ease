import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import jobs from '../../data/jobs.js';

function EmployerJobsPage() {
  return (
    <div>
      <PageHeader title="Posted Jobs" subtitle="Track all your submitted job requests and candidate pipelines." />

      <div className="space-y-3">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1F4E79]">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.location} - {job.schedule}</p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            <div className="mt-3">
              <Link
                to={`/employer/candidates/${job.id}`}
                className="inline-block rounded-lg border border-[#1F4E79] px-4 py-2 text-sm font-medium text-[#1F4E79]"
              >
                View Candidates
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export default EmployerJobsPage;
