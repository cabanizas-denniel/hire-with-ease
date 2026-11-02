import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader.jsx';
import PageSkeleton from '../../components/PageSkeleton.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import WorkerAccessGate, { useWorkerAccessGate } from '../../components/verification/WorkerAccessGate.jsx';
import { useApplicationsByWorker } from '../../lib/matching/hooks.js';
import { APPLICATION_STATUS } from '../../lib/matching/statuses.js';
import { formatPostedDate } from '../../lib/scheduleFormat.js';

function ApplicantApplicationsPage() {
  const gate = useWorkerAccessGate();
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;
  const shouldLoadData = !gate.blocked;

  const { data: apps, loading } = useApplicationsByWorker(
    shouldLoadData ? workerUid : null,
  );

  const completed = useMemo(
    () =>
      (apps || [])
        .filter((a) => a.status === APPLICATION_STATUS.COMPLETED)
        .sort((a, b) => {
          const ta = a.updatedAt?.toMillis?.() ?? a.appliedAt?.toMillis?.() ?? 0;
          const tb = b.updatedAt?.toMillis?.() ?? b.appliedAt?.toMillis?.() ?? 0;
          return tb - ta;
        }),
    [apps],
  );

  return (
    <div>
      <PageHeader
        title="History"
        subtitle="Jobs you have already completed."
      />

      <WorkerAccessGate />

      {!gate.blocked && loading ? (
        <PageSkeleton showHeader={false} variant="cards" />
      ) : null}

      {!gate.blocked && !loading && completed.length === 0 ? (
        <p className="mt-4 rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          No completed jobs yet. Accept a match from{' '}
          <Link
            to="/applicant/jobs"
            className="font-semibold text-[#1F4E79] underline-offset-2 hover:underline"
          >
            Jobs
          </Link>{' '}
          to get started.
        </p>
      ) : null}

      {!gate.blocked && !loading && completed.length > 0 ? (
        <section className="mt-4 space-y-3">
          {completed.map((item) => (
            <div
              key={item.docId || item.id}
              className="panel-surface rounded-xl bg-white p-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="text-base font-semibold text-[#1F4E79]">
                    {item.jobTitle || 'Job'}
                  </p>
                  <p className="text-sm text-gray-600">{item.clientName || '—'}</p>
                  {formatPostedDate(item.updatedAt || item.appliedAt) ? (
                    <p className="mt-1 text-xs text-gray-400">
                      Completed {formatPostedDate(item.updatedAt || item.appliedAt)}
                    </p>
                  ) : null}
                </div>
                <StatusBadge status="Completed" />
              </div>
            </div>
          ))}
        </section>
      ) : null}
    </div>
  );
}

export default ApplicantApplicationsPage;
