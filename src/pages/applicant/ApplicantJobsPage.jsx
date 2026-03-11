import { useState } from 'react';
import JobCard from '../../components/JobCard.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import jobs from '../../data/jobs.js';

function ApplicantJobsPage() {
  const [selectedJob, setSelectedJob] = useState(null);

  const applyToJob = (job) => {
    // TODO: Replace with API call to /api/applications.
    setSelectedJob(job);
  };

  return (
    <div>
      <PageHeader title="Recommended Jobs" subtitle="Browse opportunities matched to your profile and availability." />

      <div className="grid gap-3">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} onApply={applyToJob} onViewDetails={setSelectedJob} />
        ))}
      </div>

      <Modal
        isOpen={Boolean(selectedJob)}
        title={selectedJob ? selectedJob.title : ''}
        onClose={() => setSelectedJob(null)}
        onConfirm={() => setSelectedJob(null)}
        confirmText="Close"
      >
        {selectedJob ? selectedJob.description : ''}
      </Modal>
    </div>
  );
}

export default ApplicantJobsPage;
