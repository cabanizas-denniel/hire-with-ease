import { useMemo, useState } from 'react';
import JobCard from '../../components/JobCard.jsx';
import Modal from '../../components/Modal.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import PageSkeleton from '../../components/PageSkeleton.jsx';
import WorkerActiveJobWorkspace, {
  prettyAppStatus,
} from '../../components/matching/WorkerActiveJobWorkspace.jsx';
import WorkerMyJobCard from '../../components/matching/WorkerMyJobCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkerAccessGate } from '../../components/verification/WorkerAccessGate.jsx';
import {
  applyToJob,
  findActiveApplication,
  hasActiveApplication,
} from '../../lib/matching/applications.js';
import {
  useApplicationsByWorker,
  useOpenJobs,
  useWorkerProfile,
} from '../../lib/matching/hooks.js';
import {
  buildMatchBreakdown,
  formatMatchBreakdownLines,
  scoreWorkerFactors,
  workerMatchesJob,
} from '../../lib/matching/index.js';
import { normalizeWorkerSkills } from '../../data/skills.js';
import {
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS,
} from '../../lib/matching/statuses.js';
import { dismissMatchedJob } from '../../lib/matching/workerProfile.js';
import { locationLabel } from '../../utils/clientJobs.js';

function ApplicantJobsPage() {
  const gate = useWorkerAccessGate();
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;
  const canAct = Boolean(gate.canAct);
  // Browse matches before activation; applications stay locked until PESO activates.
  const { data: profile, loading: profileLoading } = useWorkerProfile(workerUid);
  const { data: openJobs, loading: jobsLoading } = useOpenJobs();
  const { data: myApps, loading: appsLoading } = useApplicationsByWorker(
    canAct ? workerUid : null,
  );

  const dismissedJobIds = useMemo(
    () => new Set(profile?.dismissedJobIds || []),
    [profile?.dismissedJobIds],
  );

  /** Jobs the worker already accepted then declined — never show again in Matches. */
  const declinedJobIds = useMemo(
    () =>
      new Set(
        (myApps || [])
          .filter((a) => a.status === APPLICATION_STATUS.DECLINED && a.jobId)
          .map((a) => a.jobId),
      ),
    [myApps],
  );

  const activeApps = useMemo(
    () => (myApps || []).filter((a) => ACTIVE_APPLICATION_STATUSES.has(a.status)),
    [myApps],
  );
  const activeApplication = useMemo(
    () => findActiveApplication(myApps),
    [myApps],
  );
  const hasActiveJob = hasActiveApplication(myApps);

  const [pickedAppId, setPickedAppId] = useState(null);
  const fallbackAppId = activeApps[0]?.docId || activeApps[0]?.id || null;
  const selectedAppId =
    pickedAppId && activeApps.some((a) => (a.docId || a.id) === pickedAppId)
      ? pickedAppId
      : fallbackAppId;
  const selectedActive =
    activeApps.find((a) => (a.docId || a.id) === selectedAppId) || activeApplication;

  const matched = useMemo(() => {
    if (hasActiveJob) return [];
    const { skills } = normalizeWorkerSkills(profile || {});
    if (!profile || skills.length === 0) return [];
    return openJobs
      .map((job) => {
        const result = scoreWorkerFactors(job, profile);
        const breakdown = buildMatchBreakdown({
          factors: result.factors,
          primaryMatches: result.primaryMatches,
          rating: profile.rating,
          audience: 'worker',
        });
        return {
          job,
          score: result.total,
          reasons: formatMatchBreakdownLines(breakdown),
          matchedSkills: result.matchedSkills,
        };
      })
      .filter((entry) => workerMatchesJob(entry.job, profile))
      .filter((entry) => {
        const id = entry.job.docId || entry.job.id;
        return !dismissedJobIds.has(id) && !declinedJobIds.has(id);
      })
      .sort((a, b) => b.score - a.score);
  }, [profile, openJobs, dismissedJobIds, declinedJobIds, hasActiveJob]);

  const [applyEntry, setApplyEntry] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [declineJob, setDeclineJob] = useState(null);
  const [declineBusy, setDeclineBusy] = useState(false);
  const [declineError, setDeclineError] = useState(null);

  const closeApplyModal = () => {
    setApplyEntry(null);
    setError(null);
  };

  const closeDeclineModal = () => {
    if (declineBusy) return;
    setDeclineJob(null);
    setDeclineError(null);
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
      setError(err.message || 'Could not accept this job.');
    } finally {
      setBusy(false);
    }
  };

  const confirmDeclineMatch = async () => {
    const jobId = declineJob?.docId || declineJob?.id;
    if (!jobId || !workerUid) return;
    setDeclineBusy(true);
    setDeclineError(null);
    try {
      await dismissMatchedJob(workerUid, jobId);
      setDeclineJob(null);
    } catch (err) {
      setDeclineError(err.message || 'Could not decline this job.');
    } finally {
      setDeclineBusy(false);
    }
  };

  const loading = profileLoading || jobsLoading || (canAct && appsLoading);

  return (
    <div>
      <PageHeader
        title="Jobs"
        subtitle={
          hasActiveJob
            ? 'Your current job. Chat with the homeowner below.'
            : 'Matched opportunities. Accept one job at a time.'
        }
      />

      {loading ? (
        <PageSkeleton showHeader={false} variant="cards" title="Jobs" subtitle="Loading…" />
      ) : null}

      {!loading && canAct && hasActiveJob ? (
        <section className="mt-5 space-y-4">
          {activeApps.length > 1 ? (
            <p className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-950">
              More than one active acceptance was found. Keep one and decline the rest.
            </p>
          ) : null}

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>li]:min-w-0">
            {activeApps.map((app) => {
              const id = app.docId || app.id;
              return (
                <li key={id}>
                  <WorkerMyJobCard
                    application={app}
                    selected={id === selectedAppId}
                    statusLabel={prettyAppStatus(app.status)}
                    onSelect={(a) => setPickedAppId(a.docId || a.id)}
                  />
                </li>
              );
            })}
          </ul>

          {selectedActive ? (
            <div className="space-y-4">
              <WorkerActiveJobWorkspace application={selectedActive} />
            </div>
          ) : null}
        </section>
      ) : null}

      {!loading && (!canAct || !hasActiveJob) ? (
        <>
          {!profile || (!profile.primarySkill && !(profile.skills || []).length) ? (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              <p className="font-semibold">Add your primary skill to start receiving matches.</p>
              <p className="mt-1">
                Open <span className="font-semibold">Profile</span> and choose the one skill that
                best represents your work.
              </p>
            </div>
          ) : null}

          <div className="mt-5">
            {matched.length === 0 ? (
              <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
                No matched jobs right now. Keep your skills and location up to date for better
                results.
              </p>
            ) : (
              <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 [&>li]:min-w-0">
                {matched.map(({ job, reasons }) => {
                  const jobId = job.docId || job.id;
                  return (
                    <li key={jobId}>
                      <JobCard
                        job={{
                          ...job,
                          location: locationLabel(job),
                          clientName: job.postedByName || job.clientName,
                          schedule:
                            job.schedule || (job.type === 'Rush' ? 'ASAP · Dispatch now' : ''),
                        }}
                        matchReasons={reasons}
                        declineLabel="Decline"
                        acceptLabel="Accept"
                        onDecline={
                          canAct
                            ? (j) => {
                                setDeclineError(null);
                                setDeclineJob(j);
                              }
                            : undefined
                        }
                        onAccept={
                          canAct ? (j) => setApplyEntry({ job: j, reasons }) : undefined
                        }
                        verificationHref={canAct ? null : '/applicant/profile'}
                        verificationLabel="Profile Verification"
                      />
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </>
      ) : null}

      <Modal
        isOpen={Boolean(applyEntry) && canAct}
        title={`Accept "${applyEntry?.job?.title}"?`}
        onClose={closeApplyModal}
        onConfirm={handleApply}
        confirmText={busy ? 'Accepting…' : 'Accept'}
      >
        <p>
          You&apos;ll let {applyEntry?.job?.postedByName || 'the homeowner'} know you&apos;re
          interested. After you accept, this page shows only that job until you finish or withdraw.
        </p>
        {error ? (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {error}
          </p>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(declineJob)}
        title={`Decline "${declineJob?.title || 'this job'}"?`}
        onClose={closeDeclineModal}
        onConfirm={confirmDeclineMatch}
        confirmText={declineBusy ? 'Declining…' : 'Decline'}
      >
        <p>It will be removed from your Jobs list and will not show again.</p>
        {declineError ? (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {declineError}
          </p>
        ) : null}
      </Modal>
    </div>
  );
}

export default ApplicantJobsPage;
