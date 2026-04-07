import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import jobs from '../../data/jobs.js';

function EmployerDashboardPage() {
  const activeRequests = useMemo(() => jobs.filter((j) => j.status !== 'Completed'), []);
  const matching = useMemo(() => jobs.filter((j) => j.status === 'Matching').length, []);
  const matched = useMemo(() => jobs.filter((j) => j.status === 'Matched').length, []);

  return (
    <div>
      <PageHeader
        title="Client Dashboard"
        subtitle="Post service requests and let the system find the right workers for you."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Requests" value={activeRequests.length} helperText="Across all locations" />
        <StatCard label="Finding Workers" value={matching} helperText="System is matching" />
        <StatCard label="Workers Matched" value={matched} helperText="Ready for your review" />
        <StatCard label="Jobs Completed" value="7" helperText="All time" />
      </div>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1F4E79]">Quick Actions</h2>
        <p className="mt-1 text-sm text-gray-600">
          Describe what you need — the system handles finding available, qualified workers.
        </p>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link to="/employer/post-job" className="rounded-lg bg-[#1F4E79] px-4 py-2 text-center text-sm font-medium text-white">
            Request a Service
          </Link>
          <Link to="/employer/jobs" className="rounded-lg border border-[#1F4E79] px-4 py-2 text-center text-sm font-medium text-[#1F4E79]">
            View My Requests
          </Link>
        </div>
      </section>

      {activeRequests.length > 0 ? (
        <section className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-[#1F4E79]">Recent Activity</h2>
          <div className="space-y-3">
            {activeRequests.slice(0, 4).map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div>
                  <p className="text-base font-semibold text-[#1F4E79]">{job.title}</p>
                  <p className="text-sm text-gray-600">
                    {job.location} · {job.matchedWorkers} worker{job.matchedWorkers !== 1 ? 's' : ''} matched
                  </p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

export default EmployerDashboardPage;
