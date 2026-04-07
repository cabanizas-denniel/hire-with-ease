import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import jobs from '../../data/jobs.js';

const STATUS_MESSAGES = {
  Matching: 'Finding available workers...',
  Matched: 'Workers matched — review candidates',
  'In Progress': 'Worker confirmed — job in progress',
  Completed: 'Job completed',
};

function EmployerJobsPage() {
  return (
    <div>
      <PageHeader
        title="My Requests"
        subtitle="Track all your service requests and their matching status."
      />

      <div className="space-y-3">
        {jobs.map((job) => (
          <article key={job.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1F4E79]">{job.title}</h3>
                <p className="text-sm text-gray-600">{job.location} · {job.budget}</p>
                <p className="mt-1 text-xs text-gray-500">
                  {STATUS_MESSAGES[job.status] || job.status}
                  {job.matchedWorkers > 0 && job.status !== 'Completed'
                    ? ` · ${job.matchedWorkers} worker${job.matchedWorkers !== 1 ? 's' : ''}`
                    : ''}
                </p>
              </div>
              <StatusBadge status={job.status} />
            </div>
            {job.status === 'Matched' ? (
              <div className="mt-3">
                <Link
                  to={`/employer/candidates/${job.id}`}
                  className="inline-block rounded-lg bg-[#1F4E79] px-4 py-2 text-sm font-medium text-white"
                >
                  View Matched Workers
                </Link>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export default EmployerJobsPage;
