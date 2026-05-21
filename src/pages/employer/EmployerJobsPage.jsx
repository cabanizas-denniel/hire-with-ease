import { useMemo } from 'react';
import { HiOutlineArchiveBox, HiOutlinePlusCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import ActiveJobCard from '../../components/employer/ActiveJobCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useApplicationsForJob,
  useJobsByOwner,
} from '../../lib/matching/hooks.js';
import { findActiveJob } from '../../lib/matching/jobs.js';
import { ACTIVE_JOB_STATUSES, JOB_STATUS } from '../../lib/matching/statuses.js';
import { locationLabel } from '../../utils/clientJobs.js';

function EmployerJobsPage() {
  const auth = useAuth();
  const ownerUid = auth?.user?.uid || null;

  const { data: jobs, loading } = useJobsByOwner(ownerUid);
  const activeJob = useMemo(() => findActiveJob(jobs), [jobs]);
  const completed = useMemo(
    () => jobs.filter((j) => !ACTIVE_JOB_STATUSES.has(j.status)),
    [jobs]
  );

  const { data: applicants } = useApplicationsForJob(
    activeJob?.docId || activeJob?.id || null
  );

  return (
    <div>
      <PageHeader
        title="Requests"
        subtitle={
          activeJob
            ? 'Your ongoing request is shown below. Completed and past requests are listed underneath.'
            : 'No ongoing request. Your past and completed requests are listed below.'
        }
      />

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Ongoing
        </h2>
        {loading ? (
          <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
            Loading…
          </p>
        ) : activeJob ? (
          <ActiveJobCard job={activeJob} applicantsCount={applicants?.length || 0} />
        ) : (
          <div className="rounded-xl border border-dashed border-gray-200 bg-white p-5 text-center shadow-sm sm:p-6">
            <p className="text-sm font-semibold text-gray-800">
              No ongoing request
            </p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-gray-500">
              You can only run one request at a time, so the next worker who
              arrives is meeting you and not an empty address.
            </p>
            <Link
              to="/employer/post-job"
              className="mt-3 inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#1F4E79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
            >
              <HiOutlinePlusCircle className="h-4 w-4" aria-hidden="true" />
              Request a Service
            </Link>
          </div>
        )}
      </section>

      <section className="mt-6">
        <div className="mb-2 flex items-end justify-between px-1">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Past Requests
          </h2>
          <span className="text-[11px] text-gray-400">
            {completed.length} total
          </span>
        </div>

        {completed.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center">
            <HiOutlineArchiveBox
              className="h-6 w-6 text-gray-400"
              aria-hidden="true"
            />
            <p className="text-sm font-semibold text-gray-800">
              No past requests yet
            </p>
            <p className="max-w-sm text-xs text-gray-500">
              Once a job wraps up it moves here so you can look back at worker
              history and ratings.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {completed.map((job) => (
              <li key={job.docId || job.id}>
                <HistoryRow job={job} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function HistoryRow({ job }) {
  const isCompleted = job.status === JOB_STATUS.COMPLETED;
  return (
    <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[#1F4E79] sm:text-base">
            {job.title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
            {isCompleted && job.confirmedWorkerName
              ? `Worker: ${job.confirmedWorkerName} · `
              : ''}
            {locationLabel(job)}
            {job.budget ? ` · ${job.budget}` : ''}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            {isCompleted && job.completedAt
              ? `Completed ${new Date(job.completedAt).toLocaleDateString()}`
              : `Posted ${job.postedAt || '—'}`}
            {' · '}
            {job.type || 'Scheduled'}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>
      {isCompleted && job.agreement?.scope ? (
        <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm italic text-gray-600">
          &ldquo;{job.agreement.scope}&rdquo;
        </p>
      ) : null}
    </article>
  );
}

export default EmployerJobsPage;
