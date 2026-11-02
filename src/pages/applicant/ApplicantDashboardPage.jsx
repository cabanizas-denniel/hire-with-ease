import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import PageSkeleton from '../../components/PageSkeleton.jsx';
import StatCard from '../../components/StatCard.jsx';
import JobCard from '../../components/JobCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useWorkerAccessGate } from '../../components/verification/WorkerAccessGate.jsx';
import {
  useApplicationsByWorker,
  useOpenJobs,
  useWorkerProfile,
} from '../../lib/matching/hooks.js';
import { hasActiveApplication } from '../../lib/matching/applications.js';
import { scoreMatch } from '../../lib/matching/index.js';
import {
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS,
} from '../../lib/matching/statuses.js';
import { locationLabel } from '../../utils/clientJobs.js';

function ApplicantDashboardPage() {
  const gate = useWorkerAccessGate();
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;
  const canAct = Boolean(gate.canAct);

  const { data: profile, loading: profileLoading } = useWorkerProfile(workerUid);
  const { data: openJobs, loading: jobsLoading } = useOpenJobs();
  const { data: myApps, loading: appsLoading } = useApplicationsByWorker(
    canAct ? workerUid : null,
  );

  const myActiveJobIds = useMemo(
    () =>
      new Set(
        (myApps || [])
          .filter((a) => ACTIVE_APPLICATION_STATUSES.has(a.status))
          .map((a) => a.jobId),
      ),
    [myApps],
  );

  const dismissedJobIds = useMemo(
    () => new Set(profile?.dismissedJobIds || []),
    [profile?.dismissedJobIds],
  );

  const declinedJobIds = useMemo(
    () =>
      new Set(
        (myApps || [])
          .filter((a) => a.status === APPLICATION_STATUS.DECLINED && a.jobId)
          .map((a) => a.jobId),
      ),
    [myApps],
  );

  const workerHasActiveJob = canAct && hasActiveApplication(myApps);

  const newMatches = useMemo(() => {
    if (!profile || workerHasActiveJob) return [];
    return openJobs
      .map((job) => ({ job, ...scoreMatch(job, profile) }))
      .filter((entry) => entry.matchedSkills?.length > 0)
      .filter((entry) => {
        const id = entry.job.docId || entry.job.id;
        return (
          !myActiveJobIds.has(id) &&
          !dismissedJobIds.has(id) &&
          !declinedJobIds.has(id)
        );
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [
    profile,
    openJobs,
    myActiveJobIds,
    dismissedJobIds,
    declinedJobIds,
    workerHasActiveJob,
  ]);

  const completedCount = (myApps || []).filter(
    (a) => a.status === APPLICATION_STATUS.COMPLETED,
  ).length;

  const loading = profileLoading || jobsLoading || (canAct && appsLoading);

  return (
    <div>
      <PageHeader
        title="Worker Dashboard"
        subtitle="Matched jobs are pushed here. Accept a job to open chat with the homeowner."
      />

      {loading ? (
        <PageSkeleton showHeader={false} variant="stats" />
      ) : (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="New Matches"
              value={newMatches.length}
              helperText="Waiting for your response"
            />
            <StatCard
              label="Jobs Completed"
              value={profile?.jobsCompleted ?? completedCount}
              helperText="All time"
            />
            <StatCard
              label="Your Rating"
              value={profile?.rating != null ? profile.rating : '—'}
              helperText="Based on client feedback"
            />
          </div>

          <section className="mt-6">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="canvas-title text-lg font-semibold">New Matches For You</h2>
              <Link
                to="/applicant/jobs"
                className="canvas-muted text-sm font-medium underline-offset-2 hover:underline"
              >
                See all jobs
              </Link>
            </div>
            <p className="canvas-muted mb-3 text-sm">
              Based on your skills and location.
            </p>
            <div className="grid gap-3">
              {workerHasActiveJob ? (
                <p className="rounded-xl border border-[#1F4E79]/15 bg-white p-6 text-center text-sm text-gray-600 shadow-sm">
                  You already have an active job. Open{' '}
                  <Link
                    to="/applicant/jobs"
                    className="font-semibold text-[#1F4E79] underline-offset-2 hover:underline"
                  >
                    Jobs
                  </Link>{' '}
                  to continue chatting, or finish/withdraw before accepting another match.
                </p>
              ) : null}
              {!workerHasActiveJob
                ? newMatches.map(({ job }) => (
                    <JobCard
                      key={job.docId || job.id}
                      job={{
                        ...job,
                        location: locationLabel(job),
                        clientName: job.postedByName || job.clientName,
                        schedule:
                          job.schedule || (job.type === 'Rush' ? 'ASAP · Dispatch now' : ''),
                      }}
                      compact={canAct}
                      verificationHref={canAct ? null : '/applicant/profile'}
                      verificationLabel="Profile Verification"
                    />
                  ))
                : null}
              {!workerHasActiveJob && newMatches.length === 0 ? (
                <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
                  No new matches right now. Update your skills and location to improve
                  results.
                </p>
              ) : null}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default ApplicantDashboardPage;
