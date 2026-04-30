import { useMemo } from 'react';
import PageHeader from '../../components/PageHeader.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useJobsByOwner } from '../../lib/matching/hooks.js';
import { JOB_STATUS } from '../../lib/matching/statuses.js';
import { locationLabel } from '../../utils/clientJobs.js';

function EmployerHiredPage() {
  const auth = useAuth();
  const ownerUid = auth?.user?.uid || null;
  const { data: jobs, loading } = useJobsByOwner(ownerUid);

  const completed = useMemo(
    () => jobs.filter((j) => j.status === JOB_STATUS.COMPLETED),
    [jobs]
  );

  return (
    <div>
      <PageHeader
        title="Job History"
        subtitle="Completed service requests, worker performance, and your feedback."
      />

      {loading ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Loading…
        </p>
      ) : null}

      {!loading && completed.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          You haven't completed any jobs yet. Once you mark a confirmed job as
          complete, it will land here.
        </p>
      ) : null}

      <div className="space-y-3">
        {completed.map((item) => (
          <article key={item.docId || item.id} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#1F4E79]">{item.title}</h3>
                <p className="text-sm text-gray-600">
                  Worker: {item.confirmedWorkerName || '—'} · {locationLabel(item)}
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  {item.completedAt
                    ? `Completed ${new Date(item.completedAt).toLocaleDateString()}`
                    : `Posted ${item.postedAt || '—'}`}
                  {item.budget ? ` · ${item.budget}` : ''}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                {item.status}
              </span>
            </div>
            {item.agreement?.scope ? (
              <p className="mt-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600 italic">
                "{item.agreement.scope}"
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export default EmployerHiredPage;
