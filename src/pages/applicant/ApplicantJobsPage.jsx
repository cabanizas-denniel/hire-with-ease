import { useMemo, useState } from 'react';
import JobCard from '../../components/JobCard.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import WorkerAccessGate, { useWorkerAccessGate } from '../../components/verification/WorkerAccessGate.jsx';
import { applyToJob } from '../../lib/matching/applications.js';
import {
  useApplicationsByWorker,
  useOpenJobs,
  useWorkerProfile,
} from '../../lib/matching/hooks.js';
import { scoreMatch, workerMatchesJob } from '../../lib/matching/index.js';
import { ACTIVE_APPLICATION_STATUSES } from '../../lib/matching/statuses.js';
import { dismissMatchedJob } from '../../lib/matching/workerProfile.js';
import { locationLabel } from '../../utils/clientJobs.js';

function ApplicantJobsPage() {
  const gate = useWorkerAccessGate();
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;
  const shouldLoadData = !gate.blocked;

  const { data: profile, loading: profileLoading } = useWorkerProfile(shouldLoadData ? workerUid : null);
  const { data: openJobs, loading: jobsLoading } = useOpenJobs();
  const { data: myApps } = useApplicationsByWorker(shouldLoadData ? workerUid : null);

  const dismissedJobIds = useMemo(
    () => new Set(profile?.dismissedJobIds || []),
    [profile?.dismissedJobIds],
  );

  const myActiveJobIds = useMemo(
    () =>
      new Set(
        (myApps || [])
          .filter((a) => ACTIVE_APPLICATION_STATUSES.has(a.status))
          .map((a) => a.jobId)
      ),
    [myApps]
  );

  const matched = useMemo(() => {
    const skills = profile?.skills || [];
    if (!profile || skills.length === 0) return [];
    return openJobs
      .map((job) => {
        const { score, reasons, matchedSkills } = scoreMatch(job, profile);
        return { job, score, reasons, matchedSkills };
      })
      .filter((entry) => workerMatchesJob(entry.job, profile))
      .filter((entry) => !dismissedJobIds.has(entry.job.docId || entry.job.id))
      .sort((a, b) => b.score - a.score);
  }, [profile, openJobs, dismissedJobIds]);

  const [applyEntry, setApplyEntry] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const closeApplyModal = () => {
    setApplyEntry(null);
    setError(null);
  };

  const handleApply = async () => {
    if (!applyEntry?.job || !workerUid) return;
    setBusy(true);
    setError(null);
    try {
      await applyToJob({
        jobId: applyEntry.job.docId || applyEntry.job.id,
        workerId: workerUid,
        workerName: profile?.name || auth?.user?.fullName,
        workerSkills: profile?.skills || [],
        clientId: applyEntry.job.postedBy || null,
        clientName: applyEntry.job.postedByName || applyEntry.job.clientName,
        clientEmail: applyEntry.job.postedByEmail || null,
        clientMobile: applyEntry.job.postedByMobile || null,
        clientTrustTier: applyEntry.job.postedByTrustTier ?? null,
        jobTitle: applyEntry.job.title,
      });
      closeApplyModal();
    } catch (err) {
      setError(err.message || 'Could not submit your application.');
    } finally {
      setBusy(false);
    }
  };

  const handleDecline = async (job) => {
    const jobId = job.docId || job.id;
    if (
      !window.confirm(
        'Decline this job? It will be removed from your matched jobs list.',
      )
    ) {
      return;
    }
    if (!workerUid) return;
    try {
      await dismissMatchedJob(workerUid, jobId);
    } catch (err) {
      alert(err.message || 'Could not decline this job.');
    }
  };

  const loading = profileLoading || jobsLoading;

  return (
    <div>
      <PageHeader
        title="Matched Jobs"
        subtitle="These jobs were matched to your profile by the system. Apply to express interest, then chat with the homeowner to negotiate."
      />

      <WorkerAccessGate />

      {gate.blocked ? null : (
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-medium font-semibold">How matching works</p>
        <p className="mt-1 text-gray-600">
          Rule-based matching: jobs appear here when you share at least one required
          skill. Same barangay in Olongapo ranks higher. Apply to open a chat with
          the homeowner and agree on price and schedule.
        </p>
      </div>
      )}

      {!gate.blocked && !loading && (!profile || (profile.skills || []).length === 0) ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Add your skills to start receiving matches.</p>
          <p className="mt-1">
            Open <span className="font-semibold">My Profile</span> and pick at least
            one skill, that's how the matching engine knows which jobs to surface.
          </p>
        </div>
      ) : null}

      {gate.blocked ? null : (
      <div className="mt-5 grid gap-3">
        {loading ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Loading matches…
          </p>
        ) : null}

        {!loading && matched.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            No matched jobs right now. Keep your availability and skills up to date for better results.
          </p>
        ) : null}

        {matched.map(({ job, reasons }) => {
          const alreadyApplied = myActiveJobIds.has(job.docId || job.id);
          const handleApplyClick = alreadyApplied
            ? undefined
            : (j) => setApplyEntry({ job: j, reasons });

          return (
            <div key={job.docId || job.id} className="relative">
              {alreadyApplied ? (
                <span className="absolute right-3 top-3 z-10 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-800">
                  Applied
                </span>
              ) : null}
              <JobCard
                job={{
                  ...job,
                  location: locationLabel(job),
                  clientName: job.postedByName || job.clientName,
                  schedule: job.schedule || (job.type === 'Rush' ? 'ASAP · Dispatch now' : ''),
                }}
                matchReasons={reasons}
                showDescription
                showFullMedia
                declineLabel="Decline Job"
                onDecline={alreadyApplied ? undefined : handleDecline}
                onAccept={handleApplyClick}
              />
            </div>
          );
        })}
      </div>
      )}

      <Modal
        isOpen={Boolean(applyEntry)}
        title={`Apply to "${applyEntry?.job?.title}"?`}
        onClose={closeApplyModal}
        onConfirm={handleApply}
        confirmText={busy ? 'Submitting…' : 'Submit application'}
      >
        <p>
          You'll let {applyEntry?.job?.postedByName || 'the homeowner'} know
          you're interested. They can chat with you to negotiate the price
          and schedule. Applying is not yet a commitment — you only commit
          when both sides confirm a final agreement.
        </p>
        {error ? (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}
      </Modal>
    </div>
  );
}

export default ApplicantJobsPage;
