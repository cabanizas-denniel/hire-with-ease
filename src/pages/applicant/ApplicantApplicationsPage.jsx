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

function historyTimestamp(app) {
  if (app.updatedAt?.toMillis) return app.updatedAt.toMillis();
  if (app.declinedAt) {
    const parsed = Date.parse(app.declinedAt);
    if (!Number.isNaN(parsed)) return parsed;
  }
  if (app.appliedAt?.toMillis) return app.appliedAt.toMillis();
  return 0;
}

/** Completed jobs, plus hires the homeowner stopped after an agreed schedule. */
function isHistoryApplication(app) {
  if (!app) return false;
  if (app.status === APPLICATION_STATUS.COMPLETED) return true;
  if (app.contractStopped === true) return true;
  // Older stops (before contractStopped was written) still have this reason/flag.
  if (
    app.status === APPLICATION_STATUS.DECLINED &&
    app.declinedBy === 'client' &&
    /stopped the contract/i.test(String(app.declineReason || ''))
  ) {
    return true;
  }
  return false;
}

function isContractStopped(app) {
  return (
    app?.contractStopped === true ||
    (app?.status === APPLICATION_STATUS.DECLINED &&
      app?.declinedBy === 'client' &&
      /stopped the contract/i.test(String(app.declineReason || '')))
  );
}

function ApplicantApplicationsPage() {
  const gate = useWorkerAccessGate();
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;
  const shouldLoadData = !gate.blocked;

  const { data: apps, loading } = useApplicationsByWorker(
    shouldLoadData ? workerUid : null,
  );

  const historyItems = useMemo(
    () =>
      (apps || [])
        .filter(isHistoryApplication)
        .sort((a, b) => historyTimestamp(b) - historyTimestamp(a)),
    [apps],
  );

  return (
    <div>
      <PageHeader
        title="History"
        subtitle="Jobs you completed, and hires the homeowner stopped after an agreed schedule."
      />

      <WorkerAccessGate />

      {!gate.blocked && loading ? (
        <PageSkeleton showHeader={false} variant="cards" />
      ) : null}

      {!gate.blocked && !loading && historyItems.length === 0 ? (
        <p className="mt-4 rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          No history yet. Accept a match from{' '}
          <Link
            to="/applicant/jobs"
            className="font-semibold text-[#1F4E79] underline-offset-2 hover:underline"
          >
            Jobs
          </Link>{' '}
          to get started.
        </p>
      ) : null}

      {!gate.blocked && !loading && historyItems.length > 0 ? (
        <section className="mt-4 space-y-3">
          {historyItems.map((item) => {
            const stopped = isContractStopped(item);
            const whenLabel = formatPostedDate(
              item.updatedAt || item.declinedAt || item.appliedAt,
            );
            return (
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
                    {whenLabel ? (
                      <p className="mt-1 text-xs text-gray-400">
                        {stopped ? `Contract stopped ${whenLabel}` : `Completed ${whenLabel}`}
                      </p>
                    ) : null}
                    {stopped && item.declineReason ? (
                      <p className="mt-1 text-xs text-gray-500">
                        Reason: {item.declineReason}
                      </p>
                    ) : null}
                  </div>
                  <StatusBadge status={stopped ? 'Contract stopped' : 'Completed'} />
                </div>
              </div>
            );
          })}
        </section>
      ) : null}
    </div>
  );
}

export default ApplicantApplicationsPage;
