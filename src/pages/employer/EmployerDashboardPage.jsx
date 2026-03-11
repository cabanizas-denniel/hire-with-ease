import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import jobs from '../../data/jobs.js';

function EmployerDashboardPage() {
  const openJobs = useMemo(() => jobs.filter((job) => job.status === 'Open').length, []);

  return (
    <div>
      <PageHeader title="Employer Dashboard" subtitle="Manage your job requests and monitor hiring activity." />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Job Posts" value={openJobs} helperText="Across all locations" />
        <StatCard label="Recommended Workers" value="22" helperText="Generated from skill matches" />
        <StatCard label="Recent Hires" value="7" helperText="Last 30 days" />
        <StatCard label="Pending Interviews" value="5" helperText="Awaiting confirmation" />
      </div>

      <section className="mt-6 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="text-lg font-semibold text-[#1F4E79]">Quick Actions</h2>
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <Link to="/employer/post-job" className="rounded-lg bg-[#1F4E79] px-4 py-2 text-center text-sm font-medium text-white">
            Post New Job
          </Link>
          <Link to="/employer/jobs" className="rounded-lg border border-[#1F4E79] px-4 py-2 text-center text-sm font-medium text-[#1F4E79]">
            View Posted Jobs
          </Link>
        </div>
      </section>
    </div>
  );
}

export default EmployerDashboardPage;
