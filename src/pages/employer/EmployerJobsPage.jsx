import { useMemo } from 'react';
import { HiOutlineArchiveBox, HiOutlinePlusCircle } from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import ActiveJobCard from '../../components/employer/ActiveJobCard.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { getActiveJob, getCompletedJobs } from '../../utils/clientJobs.js';
import { getCurrentUserId } from '../../utils/currentUser.js';

function EmployerJobsPage() {
  const auth = useAuth();
  const clientId = getCurrentUserId(auth);

  const activeJob = useMemo(() => getActiveJob(clientId), [clientId]);
  const completed = useMemo(() => getCompletedJobs(clientId), [clientId]);

  return (
    <div>
      <PageHeader
        title="My Requests"
        subtitle={
          activeJob
            ? 'Your ongoing request is shown below. Past requests are archived underneath.'
            : 'No ongoing request. Your past requests are listed below.'
        }
      />

      <section>
        <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Ongoing
        </h2>
        {activeJob ? (
          <ActiveJobCard job={activeJob} />
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
              <li key={job.id}>
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
  return (
    <article className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-[#1F4E79] sm:text-base">
            {job.title}
          </h3>
          <p className="mt-0.5 text-xs text-gray-600 sm:text-sm">
            {job.location} · {job.budget}
          </p>
          <p className="mt-0.5 text-[11px] text-gray-400">
            Posted {job.postedAt} · {job.type}
          </p>
        </div>
        <StatusBadge status={job.status} />
      </div>
    </article>
  );
}

export default EmployerJobsPage;
