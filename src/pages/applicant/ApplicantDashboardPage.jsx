import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import PageSkeleton from '../../components/PageSkeleton.jsx';
import StatCard from '../../components/StatCard.jsx';
import JobCard from '../../components/JobCard.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import WorkerAccessGate, { useWorkerAccessGate } from '../../components/verification/WorkerAccessGate.jsx';
import {
  useApplicationsByWorker,
  useOpenJobs,
  useWorkerProfile,
} from '../../lib/matching/hooks.js';
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

  const shouldLoadData = !gate.blocked;

  const { data: profile, loading: profileLoading } = useWorkerProfile(
    shouldLoadData ? workerUid : null,
  );
  const { data: openJobs, loading: jobsLoading } = useOpenJobs();
  const { data: myApps, loading: appsLoading } = useApplicationsByWorker(
    shouldLoadData ? workerUid : null,
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

  const newMatches = useMemo(() => {
    if (!profile) return [];
    return openJobs
      .map((job) => ({ job, ...scoreMatch(job, profile) }))
      .filter((entry) => entry.matchedSkills?.length > 0)
      .filter((entry) => !myActiveJobIds.has(entry.job.docId || entry.job.id))
      .filter((entry) => !dismissedJobIds.has(entry.job.docId || entry.job.id))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }, [profile, openJobs, myActiveJobIds, dismissedJobIds]);

  const completedCount = (myApps || []).filter(
    (a) => a.status === APPLICATION_STATUS.COMPLETED,
  ).length;

  const loading = shouldLoadData && (profileLoading || jobsLoading || appsLoading);

  return (
    <div>
      <PageHeader
        title="Worker Dashboard"
        subtitle="Matched jobs are pushed here. Accept a job to open chat with the homeowner."
      />

      <WorkerAccessGate />

      {gate.blocked ? null : loading ? (
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
                See all matches
              </Link>
            </div>
            <p className="canvas-muted mb-3 text-sm">
              Based on your skills and location.
            </p>
            <div className="grid gap-3">
              {newMatches.map(({ job }) => (
                <JobCard
                  key={job.docId || job.id}
                  job={{
                    ...job,
                    location: locationLabel(job),
                    clientName: job.postedByName || job.clientName,
                    schedule:
                      job.schedule || (job.type === 'Rush' ? 'ASAP · Dispatch now' : ''),
                  }}
                  compact
                />
              ))}
              {newMatches.length === 0 ? (
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
