import { useMemo, useState } from 'react';
import JobCard from '../../components/JobCard.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { applyToJob } from '../../lib/matching/applications.js';
import {
  useApplicationsByWorker,
  useOpenJobs,
  useWorkerProfile,
} from '../../lib/matching/hooks.js';
import { scoreMatch } from '../../lib/matching/index.js';
import { ACTIVE_APPLICATION_STATUSES } from '../../lib/matching/statuses.js';
import { locationLabel } from '../../utils/clientJobs.js';

function ApplicantJobsPage() {
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;

  const { data: profile, loading: profileLoading } = useWorkerProfile(workerUid);
  const { data: openJobs, loading: jobsLoading } = useOpenJobs();
  const { data: myApps } = useApplicationsByWorker(workerUid);

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
      .filter((entry) => entry.matchedSkills?.length > 0)
      .sort((a, b) => b.score - a.score);
  }, [profile, openJobs]);

  const [actionEntry, setActionEntry] = useState(null);
  const [actionType, setActionType] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);

  const closeModal = () => {
    setActionEntry(null);
    setActionType('');
    setError(null);
  };

  const handleApply = async () => {
    if (!actionEntry?.job || !workerUid) return;
    setBusy(true);
    setError(null);
    try {
      await applyToJob({
        jobId: actionEntry.job.docId || actionEntry.job.id,
        workerId: workerUid,
        workerName: profile?.name || auth?.user?.fullName,
        workerSkills: profile?.skills || [],
        clientId: actionEntry.job.postedBy || null,
        clientName: actionEntry.job.postedByName || actionEntry.job.clientName,
        jobTitle: actionEntry.job.title,
      });
      closeModal();
    } catch (err) {
      setError(err.message || 'Could not submit your application.');
    } finally {
      setBusy(false);
    }
  };

  const loading = profileLoading || jobsLoading;

  return (
    <div>
      <PageHeader
        title="Matched Jobs"
        subtitle="These jobs were matched to your profile by the system. Apply to express interest, then chat with the homeowner to negotiate."
      />

      <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-[#1F4E79]">
        <p className="font-medium font-semibold">How matching works</p>
        <p className="mt-1 text-gray-600">
          The system evaluates your skills, availability, and location against
          open job requests. Apply to the ones you want and your application
          opens a chat with the homeowner so you can finalise the price,
          schedule, and scope before committing.
        </p>
      </div>

      {!loading && (!profile || (profile.skills || []).length === 0) ? (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <p className="font-semibold">Add your skills to start receiving matches.</p>
          <p className="mt-1">
            Open <span className="font-semibold">My Profile</span> and pick at least
            one skill, that's how the matching engine knows which jobs to surface.
          </p>
        </div>
      ) : null}

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
          const handleApplyClick = alreadyApplied ? undefined : (j) => {
            setActionEntry({ job: j, reasons });
            setActionType('apply');
          };
          const handleDetailsClick = (j) => {
            setActionEntry({ job: j, reasons });
            setActionType('details');
          };
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
                onAccept={handleApplyClick}
                onViewDetails={handleDetailsClick}
              />
            </div>
          );
        })}
      </div>

      <Modal
        isOpen={Boolean(actionEntry)}
        title={
          actionType === 'apply'
            ? `Apply to "${actionEntry?.job?.title}"?`
            : actionEntry?.job?.title || ''
        }
        onClose={closeModal}
        onConfirm={actionType === 'apply' ? handleApply : closeModal}
        confirmText={
          actionType === 'apply' ? (busy ? 'Submitting…' : 'Submit application') : 'Close'
        }
      >
        {actionType === 'apply' ? (
          <>
            <p>
              You'll let {actionEntry?.job?.postedByName || 'the homeowner'} know
              you're interested. They can chat with you to negotiate the price
              and schedule. Applying is not yet a commitment — you only commit
              when both sides confirm a final agreement.
            </p>
            {error ? (
              <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
                {error}
              </p>
            ) : null}
          </>
        ) : (
          <p>{actionEntry?.job?.description}</p>
        )}
      </Modal>
    </div>
  );
}

export default ApplicantJobsPage;
