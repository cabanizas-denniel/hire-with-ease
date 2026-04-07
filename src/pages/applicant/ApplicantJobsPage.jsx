import { useMemo, useState } from 'react';
import JobCard from '../../components/JobCard.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import jobs from '../../data/jobs.js';

const workerSkills = ['Plumbing', 'Pipe Fitting', 'Safety Compliance'];
const workerAvailability = new Set(['Mon-AM', 'Tue-AM', 'Wed-AM', 'Thu-AM', 'Fri-AM']);
const workerLocation = 'Quezon City';

function buildMatchReasons(job) {
  const reasons = [];
  const matched = job.requiredSkills.filter((s) => workerSkills.includes(s));
  if (matched.length > 0) reasons.push(`Skills: ${matched.join(', ')}`);
  if (job.location === workerLocation) reasons.push('Same area as your location');
  const scheduleDay = job.schedule.slice(0, 3);
  if (workerAvailability.has(`${scheduleDay}-AM`) || workerAvailability.has(`${scheduleDay}-PM`)) {
    reasons.push('Fits your availability');
  }
  return reasons;
}

function ApplicantJobsPage() {
  const [actionJob, setActionJob] = useState(null);
  const [actionType, setActionType] = useState('');

  const matchedJobs = useMemo(
    () =>
      jobs
        .filter((j) => j.status === 'Matching' || j.status === 'Matched')
        .filter((j) => j.requiredSkills.some((s) => workerSkills.includes(s)))
        .map((j) => ({ ...j, matchReasons: buildMatchReasons(j) }))
        .sort((a, b) => b.matchReasons.length - a.matchReasons.length),
    [],
  );

  const handleAccept = (job) => {
    setActionJob(job);
    setActionType('accept');
  };

  const handleDecline = (job) => {
    setActionJob(job);
    setActionType('decline');
  };

  return (
    <div>
      <PageHeader
        title="Matched Jobs"
        subtitle="These jobs were matched to your profile by the system. You don't need to search — just respond."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-medium">How matching works</p>
        <p className="mt-1 text-gray-600">
          The system evaluates your skills, availability, location, and experience against open job requests.
          You only see jobs you're qualified for. Accept the ones you want — decline the rest.
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {matchedJobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            matchReasons={job.matchReasons}
            onAccept={handleAccept}
            onDecline={handleDecline}
            onViewDetails={(j) => { setActionJob(j); setActionType('details'); }}
          />
        ))}
        {matchedJobs.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            No matched jobs right now. Keep your availability and skills up to date for better results.
          </p>
        ) : null}
      </div>

      <Modal
        isOpen={Boolean(actionJob)}
        title={
          actionType === 'accept'
            ? 'Accept this job?'
            : actionType === 'decline'
              ? 'Decline this job?'
              : actionJob?.title || ''
        }
        onClose={() => setActionJob(null)}
        onConfirm={() => setActionJob(null)}
        confirmText={actionType === 'accept' ? 'Confirm' : actionType === 'decline' ? 'Decline' : 'Close'}
      >
        {actionType === 'details' && actionJob
          ? actionJob.description
          : actionType === 'accept'
            ? `You'll be confirmed for "${actionJob?.title}". The client will be notified.`
            : `This job will be removed from your matches. You can still receive new matches later.`}
      </Modal>
    </div>
  );
}

export default ApplicantJobsPage;
