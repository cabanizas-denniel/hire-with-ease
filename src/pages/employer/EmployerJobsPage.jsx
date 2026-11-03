import { useMemo } from 'react';
import { HiOutlineArchiveBox } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import PageSkeleton from '../../components/PageSkeleton.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useJobsByOwner } from '../../lib/matching/hooks.js';
import { ACTIVE_JOB_STATUSES, JOB_STATUS } from '../../lib/matching/statuses.js';
import { locationLabel } from '../../utils/clientJobs.js';

function EmployerJobsPage() {
  const auth = useAuth();
  const ownerUid = auth?.user?.uid || null;

  const { data: jobs, loading } = useJobsByOwner(ownerUid);
  const pastJobs = useMemo(
    () =>
      (jobs || [])
        .filter((j) => !ACTIVE_JOB_STATUSES.has(j.status))
        .sort((a, b) => {
          const ta =
            a.updatedAt?.toMillis?.() ??
            (Date.parse(a.completedAt || a.cancelledAt || a.postedAt || '') || 0);
          const tb =
            b.updatedAt?.toMillis?.() ??
            (Date.parse(b.completedAt || b.cancelledAt || b.postedAt || '') || 0);
          return tb - ta;
        }),
    [jobs],
  );

  return (
    <div>
      <PageHeader
        title="History"
        subtitle="Past and completed requests only. Ongoing work stays on Home."
      />

      {loading ? (
        <PageSkeleton showHeader={false} variant="cards" />
      ) : pastJobs.length === 0 ? (
        <div className="mt-4 flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-200 bg-white p-6 text-center">
          <HiOutlineArchiveBox
            className="h-6 w-6 text-gray-400"
            aria-hidden="true"
          />
          <p className="text-sm font-semibold text-gray-800">No past requests yet</p>
          <p className="max-w-sm text-xs text-gray-500">
            When a request is completed or cancelled, it appears here.
          </p>
          <Link
            to="/employer/post-job"
            className="mt-2 text-sm font-semibold text-[#1F4E79] underline-offset-2 hover:underline"
          >
            Request a service
          </Link>
        </div>
      ) : (
        <section className="mt-4">
          <div className="mb-2 flex items-end justify-between px-1">
            <h2 className="canvas-muted text-xs font-semibold uppercase tracking-wide">
              Past requests
            </h2>
            <span className="canvas-muted text-[11px]">{pastJobs.length} total</span>
          </div>
          <ul className="space-y-2.5">
            {pastJobs.map((job) => (
              <li key={job.docId || job.id}>
                <HistoryRow job={job} />
              </li>
            ))}
          </ul>
        </section>
      )}
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
              : job.status === JOB_STATUS.CANCELLED && job.cancelledAt
                ? `Cancelled ${new Date(job.cancelledAt).toLocaleDateString()}`
                : `Posted ${job.postedAt || '—'}`}
            {job.schedule ? ` · ${job.schedule}` : ''}
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
