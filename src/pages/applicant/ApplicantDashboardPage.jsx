import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import JobCard from '../../components/JobCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import jobs from '../../data/jobs.js';

const workerSkills = ['Plumbing', 'Pipe Fitting', 'Safety Compliance'];

function ApplicantDashboardPage() {
  const newMatches = useMemo(
    () =>
      jobs
        .filter((j) => j.status === 'Matching' || j.status === 'Matched')
        .filter((j) => j.requiredSkills.some((s) => workerSkills.includes(s)))
        .slice(0, 3),
    [],
  );

  const activeJobs = [
    { id: 1, title: 'Office Repainting', client: 'Northlight Interiors', status: 'In Progress' },
    { id: 2, title: 'Emergency Pipe Leak', client: 'Café Amore', status: 'Accepted' },
  ];

  return (
    <div>
      <PageHeader
        title="Worker Dashboard"
        subtitle="Jobs matched to your skills and availability are pushed here automatically."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="New Matches" value={newMatches.length} helperText="Waiting for your response" />
        <StatCard label="Active Jobs" value={activeJobs.length} helperText="Currently in progress" />
        <StatCard label="Jobs Completed" value="47" helperText="All time" />
        <StatCard label="Your Rating" value="4.8" helperText="Based on client feedback" />
      </div>

      {activeJobs.length > 0 ? (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#1F4E79]">Active Jobs</h2>
            <Link to="/applicant/applications" className="text-sm font-medium text-[#2E75B6]">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
                <div>
                  <p className="text-base font-semibold text-[#1F4E79]">{job.title}</p>
                  <p className="text-sm text-gray-600">{job.client}</p>
                </div>
                <StatusBadge status={job.status} />
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#1F4E79]">New Matches For You</h2>
          <Link to="/applicant/jobs" className="text-sm font-medium text-[#2E75B6]">
            See all matches
          </Link>
        </div>
        <p className="mb-3 text-sm text-gray-500">
          The system matched these based on your skills, availability, and location. Accept or decline — no browsing needed.
        </p>
        <div className="grid gap-3">
          {newMatches.map((job) => (
            <JobCard key={job.id} job={job} compact />
          ))}
          {newMatches.length === 0 ? (
            <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
              No new matches right now. Update your profile and availability to improve results.
            </p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default ApplicantDashboardPage;
