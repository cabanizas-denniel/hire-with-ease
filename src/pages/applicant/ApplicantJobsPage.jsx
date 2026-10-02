import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import JobCard from '../../components/JobCard.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import PageSkeleton from '../../components/PageSkeleton.jsx';
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
  const navigate = useNavigate();
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
      navigate('/applicant/applications');
    } catch (err) {
      setError(err.message || 'Could not accept this job.');
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
        subtitle="Jobs matched to your skills. Accept to open a chat with the homeowner."
      />

      <WorkerAccessGate />

      {!gate.blocked && !loading && (!profile || (profile.skills || []).length === 0) ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Add your skills to start receiving matches.</p>
          <p className="mt-1">
            Open <span className="font-semibold">My Profile</span> and pick at least
            one skill so matching knows which jobs to surface.
          </p>
        </div>
      ) : null}

      {gate.blocked ? null : (
      <div className="mt-5 grid gap-3">
        {loading ? (
          <PageSkeleton variant="cards" title="Matched Jobs" subtitle="Loading matches…" />
        ) : null}

        {!loading && matched.length === 0 ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            No matched jobs right now. Keep your skills and location up to date for better results.
          </p>
        ) : null}

        {!loading
          ? matched.map(({ job, reasons }) => {
          const alreadyApplied = myActiveJobIds.has(job.docId || job.id);
          const handleApplyClick = alreadyApplied
            ? undefined
            : (j) => setApplyEntry({ job: j, reasons });

          return (
            <div key={job.docId || job.id}>
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
                declineLabel="Decline"
                acceptLabel="Accept"
                statusTag={alreadyApplied ? 'Accepted' : null}
                onDecline={alreadyApplied ? undefined : handleDecline}
                onAccept={handleApplyClick}
              />
            </div>
          );
        })
          : null}
      </div>
      )}

      <Modal
        isOpen={Boolean(applyEntry)}
        title={`Accept "${applyEntry?.job?.title}"?`}
        onClose={closeApplyModal}
        onConfirm={handleApply}
        confirmText={busy ? 'Accepting…' : 'Accept'}
      >
        <p>
          You&apos;ll let {applyEntry?.job?.postedByName || 'the homeowner'} know
          you&apos;re interested. After you accept, you can chat about price and
          schedule. You only commit when both sides confirm a final agreement.
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
