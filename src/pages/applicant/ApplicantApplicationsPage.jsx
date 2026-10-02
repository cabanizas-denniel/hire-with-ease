import { useMemo, useState } from 'react';
import PaymentFulfillmentCard from '../../components/matching/PaymentFulfillmentCard.jsx';
import ChatPanel from '../../components/matching/ChatPanel.jsx';
import WorkerMyJobCard from '../../components/matching/WorkerMyJobCard.jsx';
import JobIssueMedia from '../../components/JobIssueMedia.jsx';
import HomeownerTrustRow from '../../components/HomeownerTrustRow.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import PageSkeleton from '../../components/PageSkeleton.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import WorkerAccessGate, { useWorkerAccessGate } from '../../components/verification/WorkerAccessGate.jsx';
import {
  useApplicationsByWorker,
  useJob,
} from '../../lib/matching/hooks.js';
import {
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS,
  JOB_STATUS,
} from '../../lib/matching/statuses.js';

function ApplicantApplicationsPage() {
  const gate = useWorkerAccessGate();
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;
  const shouldLoadData = !gate.blocked;

  const { data: apps, loading } = useApplicationsByWorker(shouldLoadData ? workerUid : null);

  const active = useMemo(
    () => apps.filter((a) => ACTIVE_APPLICATION_STATUSES.has(a.status)),
    [apps]
  );
  const completed = useMemo(
    () => apps.filter((a) => a.status === APPLICATION_STATUS.COMPLETED),
    [apps]
  );

  const [pickedAppId, setPickedAppId] = useState(null);
  const fallbackAppId = active[0]?.docId || active[0]?.id || null;
  const selectedAppId =
    pickedAppId && active.some((a) => (a.docId || a.id) === pickedAppId)
      ? pickedAppId
      : fallbackAppId;

  const selected = active.find((a) => (a.docId || a.id) === selectedAppId);

  return (
    <div>
      <PageHeader
        title="My Jobs"
        subtitle="Jobs you've accepted. Tap a card to chat with the homeowner."
      />

      <WorkerAccessGate />

      {!gate.blocked && loading ? (
        <PageSkeleton showHeader={false} variant="cards" />
      ) : null}

      {!gate.blocked && !loading && active.length === 0 && completed.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          You haven&apos;t accepted any jobs yet. Open{' '}
          <span className="font-semibold">Matched Jobs</span> to find a fit.
        </p>
      ) : null}

      {!gate.blocked && active.length > 0 ? (
        <section className="mb-6 space-y-4">
          <div className="panel-surface rounded-xl border border-emerald-200/80 bg-white p-4">
            <h2 className="text-base font-semibold text-emerald-900">
              {active.length} active job{active.length === 1 ? '' : 's'}
            </h2>
            <p className="mt-1 text-sm text-emerald-900/80">
              Cards show the homeowner&apos;s issue photo. Tap one to open chat below.
            </p>
          </div>

          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {active.map((app) => {
              const id = app.docId || app.id;
              return (
                <li key={id} className="min-w-0">
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

          {selected ? (
            <div className="space-y-4">
              <ApplicationWorkspace application={selected} />
            </div>
          ) : null}
        </section>
      ) : null}

      {!gate.blocked && completed.length > 0 ? (
        <section className={active.length > 0 ? 'mt-8' : 'mt-4'}>
          <h2 className="canvas-title mb-3 text-base font-semibold">Completed</h2>
          <div className="space-y-3">
            {completed.map((item) => (
              <div
                key={item.docId || item.id}
                className="panel-surface rounded-xl bg-white p-4"
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-base font-semibold text-[#1F4E79]">
                      {item.jobTitle}
                    </p>
                    <p className="text-sm text-gray-600">
                      {item.clientName || '—'}
                    </p>
                  </div>
                  <StatusBadge status="Completed" />
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function ApplicationWorkspace({ application }) {
  const { user } = useAuth();
  const { data: job } = useJob(application.jobId);
  const [declining, setDeclining] = useState(false);

  const address =
    [job?.location?.label, job?.location?.barangay && `${job.location.barangay}, Olongapo`]
      .filter(Boolean)
      .join(' · ') || '';

  const canDecline =
    application.status !== APPLICATION_STATUS.COMPLETED &&
    application.status !== APPLICATION_STATUS.DECLINED &&
    job?.status !== JOB_STATUS.COMPLETED &&
    job?.status !== JOB_STATUS.CANCELLED;

  const handleDecline = async () => {
    const appId = application.docId || application.id;
    if (!appId || !canDecline) return;
    const locked = job?.confirmedWorkerId === application.workerId;
    const msg = locked
      ? 'Decline this hire? The booking will unlock for both you and the homeowner.'
      : 'Decline / withdraw from this job? You will be removed from this request.';
    if (!window.confirm(msg)) return;
    setDeclining(true);
    try {
      const { withdrawApplication } = await import('../../lib/matching/applications.js');
      await withdrawApplication(appId);
    } catch (err) {
      alert(err.message || 'Could not decline this job.');
    } finally {
      setDeclining(false);
    }
  };

  return (
    <>
      <div className="panel-surface overflow-hidden rounded-xl border border-[#1F4E79]/15 bg-white">
        <JobIssueMedia
          job={job}
          variant="gallery"
          titleAlt={`Issue media for "${application.jobTitle || 'Job'}"`}
        />
        <div className="p-4 text-sm text-[#1F4E79]">
          <p className="font-semibold">
            {application.jobTitle || 'Job'}{' '}
            <StatusBadge status={prettyAppStatus(application.status)} />
          </p>
          {canDecline ? (
            <div className="mt-3">
              <button
                type="button"
                onClick={handleDecline}
                disabled={declining}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {declining ? 'Declining…' : 'Decline job'}
              </button>
            </div>
          ) : null}
          <div className="mt-2 grid gap-1 text-xs text-gray-700 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <span className="font-semibold text-[#1F4E79]">Homeowner:</span>{' '}
              <HomeownerTrustRow
                name={application.clientName || 'Homeowner'}
                trustTier={
                  application.clientTrustTier ?? job?.postedByTrustTier ?? null
                }
                prefix=""
                className="mt-1 inline-flex"
              />
            </div>
            {(application.clientEmail || job?.postedByEmail) ? (
              <p>
                <span className="font-semibold text-[#1F4E79]">Email:</span>{' '}
                <a
                  href={`mailto:${application.clientEmail || job.postedByEmail}`}
                  className="text-[#2E75B6] hover:underline"
                >
                  {application.clientEmail || job.postedByEmail}
                </a>
              </p>
            ) : null}
            {(application.clientMobile || job?.postedByMobile) ? (
              <p>
                <span className="font-semibold text-[#1F4E79]">Phone:</span>{' '}
                <a
                  href={`tel:${String(application.clientMobile || job.postedByMobile).replace(/\s/g, '')}`}
                  className="text-[#2E75B6] hover:underline"
                >
                  {application.clientMobile || job.postedByMobile}
                </a>
              </p>
            ) : null}
            <p>
              <span className="font-semibold text-[#1F4E79]">Budget:</span>{' '}
              {job?.budget || '—'}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-[#1F4E79]">Home address:</span>{' '}
              {address || '—'}
            </p>
            {job?.schedule ? (
              <p className="sm:col-span-2">
                <span className="font-semibold text-[#1F4E79]">Schedule:</span>{' '}
                {job.schedule}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <ChatPanel
        jobId={application.jobId}
        jobTitle={application.jobTitle}
        clientId={application.clientId}
        clientName={application.clientName}
        clientEmail={application.clientEmail || job?.postedByEmail}
        clientMobile={application.clientMobile || job?.postedByMobile}
        clientTrustTier={
          application.clientTrustTier ?? job?.postedByTrustTier ?? null
        }
        workerId={application.workerId}
        workerName={application.workerName || user?.fullName}
        role="worker"
        jobBudget={job?.budget}
        jobStatus={job?.status}
        applicationStatus={application.status}
        application={application}
        compact
      />

      {job?.status === JOB_STATUS.IN_PROGRESS ||
      job?.status === JOB_STATUS.COMPLETED ||
      application.status === APPLICATION_STATUS.COMPLETED ? (
        <PaymentFulfillmentCard application={application} role="worker" />
      ) : null}

      {job?.status === JOB_STATUS.IN_PROGRESS &&
      job?.confirmedWorkerId === application.workerId ? (
        <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-950">
          You are checked in. When you finish on site, send a check-out photo in chat.
          Confirm off-platform payment above, then the homeowner can mark the job complete.
        </p>
      ) : null}
    </>
  );
}

function prettyAppStatus(status) {
  switch (status) {
    case APPLICATION_STATUS.PENDING:
      return 'Pending';
    case APPLICATION_STATUS.NEGOTIATING:
      return 'Matching';
    case APPLICATION_STATUS.PROPOSED:
      return 'Matching';
    case APPLICATION_STATUS.CONFIRMED:
      return 'Accepted';
    case APPLICATION_STATUS.COMPLETED:
      return 'Completed';
    default:
      return 'Pending';
  }
}

export default ApplicantApplicationsPage;
