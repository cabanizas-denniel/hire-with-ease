import PageHeader from '../../components/PageHeader.jsx';
import StatCard from '../../components/StatCard.jsx';
import JobCard from '../../components/JobCard.jsx';
import jobs from '../../data/jobs.js';

function ApplicantDashboardPage() {
  const recommendedJobs = jobs.slice(0, 3);

  return (
    <div>
      <PageHeader
        title="Applicant Dashboard"
        subtitle="Track your applications, match updates, and personalized recommendations."
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active Applications" value="6" helperText="2 updated this week" />
        <StatCard label="New Match Alerts" value="4" helperText="Based on your skills" />
        <StatCard label="Profile Completion" value="82%" helperText="Add certifications to improve" />
        <StatCard label="Interviews Scheduled" value="2" helperText="Next: Friday, 2:00 PM" />
      </div>

      <section className="mt-6">
        <h2 className="mb-3 text-lg font-semibold text-[#1F4E79]">Recent Job Recommendations</h2>
        <div className="grid gap-3">
          {recommendedJobs.map((job) => (
            <JobCard key={job.id} job={job} compact />
          ))}
        </div>
      </section>
    </div>
  );
}

export default ApplicantDashboardPage;
