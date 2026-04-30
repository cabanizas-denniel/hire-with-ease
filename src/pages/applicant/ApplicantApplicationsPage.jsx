import { useMemo, useState } from 'react';
import { HiOutlineArrowRight } from 'react-icons/hi2';
import AgreementCard from '../../components/matching/AgreementCard.jsx';
import ChatPanel from '../../components/matching/ChatPanel.jsx';
import JobIssueMedia from '../../components/JobIssueMedia.jsx';
import PageHeader from '../../components/PageHeader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import {
  useApplicationsByWorker,
  useJob,
} from '../../lib/matching/hooks.js';
import { setJobStatus } from '../../lib/matching/jobs.js';
import {
  ACTIVE_APPLICATION_STATUSES,
  APPLICATION_STATUS,
  JOB_STATUS,
} from '../../lib/matching/statuses.js';

function ApplicantApplicationsPage() {
  const auth = useAuth();
  const workerUid = auth?.user?.uid || null;

  const { data: apps, loading } = useApplicationsByWorker(workerUid);

  const active = useMemo(
    () => apps.filter((a) => ACTIVE_APPLICATION_STATUSES.has(a.status)),
    [apps]
  );
  const completed = useMemo(
    () => apps.filter((a) => a.status === APPLICATION_STATUS.COMPLETED),
    [apps]
  );

  // Derive the visible application from the user's pick (when valid)
  // with a fallback to the first active row. Pure-render derivation
  // avoids the "set-state-in-effect" warning React 19 surfaces.
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
        subtitle="Applications and bookings you're involved in. Chat with the homeowner and finalise the agreement here."
      />

      {loading ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          Loading…
        </p>
      ) : null}

      {!loading && active.length === 0 && completed.length === 0 ? (
        <p className="rounded-xl bg-white p-6 text-center text-sm text-gray-500 shadow-sm">
          You haven't applied to any jobs yet. Open <span className="font-semibold">Matched Jobs</span> to find a fit.
        </p>
      ) : null}

      {active.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <aside className="space-y-2">
            <h3 className="px-1 text-xs font-semibold uppercase tracking-wide text-gray-500">
              Active applications
            </h3>
            <ul className="space-y-2">
              {active.map((app) => {
                const id = app.docId || app.id;
                const isSelected = id === selectedAppId;
                return (
                  <li key={id}>
                    <button
                      type="button"
                      onClick={() => setPickedAppId(id)}
                      className={`w-full rounded-xl border bg-white p-3 text-left shadow-sm transition ${
                        isSelected
                          ? 'border-[#1F4E79] ring-2 ring-[#1F4E79]/30'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-[#1F4E79]">
                            {app.jobTitle || 'Job'}
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-500">
                            {app.clientName || 'Homeowner'}
                          </p>
                        </div>
                        <StatusBadge status={prettyAppStatus(app.status)} />
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </aside>

          <div className="space-y-4">
            {selected ? (
              <ApplicationWorkspace application={selected} />
            ) : (
              <div className="rounded-xl bg-white p-8 text-center text-sm text-gray-500 shadow-sm">
                Select an application from the list to open the chat.
              </div>
            )}
          </div>
        </div>
      ) : null}

      {completed.length > 0 ? (
        <section className={active.length > 0 ? 'mt-8' : 'mt-4'}>
          <h2 className="mb-3 text-base font-semibold text-[#1F4E79]">Completed</h2>
          <div className="space-y-3">
            {completed.map((item) => (
              <div
                key={item.docId || item.id}
                className="rounded-xl bg-white p-4 shadow-sm"
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

  const handleStartJob = async () => {
    if (!job) return;
    if (!window.confirm('Mark yourself as on-site and start the job?')) return;
    try {
      await setJobStatus(job.docId || job.id, JOB_STATUS.IN_PROGRESS, {
        startedAt: new Date().toISOString(),
      });
    } catch (err) {
       
      alert(err.message || 'Could not update the job. Please try again.');
    }
  };

  const lat = job?.location?.lat;
  const lng = job?.location?.lng;
  const address = job?.location?.label || job?.location?.barangay || '';

  return (
    <>
      <div className="overflow-hidden rounded-xl border border-blue-100 bg-blue-50/60">
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
          <div className="mt-2 grid gap-1 text-xs text-gray-700 sm:grid-cols-2">
            <p>
              <span className="font-semibold text-[#1F4E79]">Homeowner:</span>{' '}
              {application.clientName || '—'}
            </p>
            <p>
              <span className="font-semibold text-[#1F4E79]">Budget:</span>{' '}
              {job?.budget || '—'}
            </p>
            <p className="sm:col-span-2">
              <span className="font-semibold text-[#1F4E79]">Address:</span>{' '}
              {address || '—'}
            </p>
            {typeof lat === 'number' && typeof lng === 'number' ? (
              <p className="sm:col-span-2">
                <span className="font-semibold text-[#1F4E79]">Pin:</span>{' '}
                {lat.toFixed(5)}, {lng.toFixed(5)}{' '}
                <a
                  className="text-[#2E75B6] underline"
                  href={`https://www.google.com/maps?q=${lat},${lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in maps
                </a>
              </p>
            ) : null}
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
        workerId={application.workerId}
        workerName={application.workerName || user?.fullName}
        role="worker"
        className="h-[400px]"
      />

      <AgreementCard
        application={application}
        role="worker"
        jobBudget={job?.budget}
      />

      {application.status === APPLICATION_STATUS.CONFIRMED &&
      job?.status === JOB_STATUS.CONFIRMED ? (
        <button
          type="button"
          onClick={handleStartJob}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white sm:w-auto"
        >
          I'm on-site — Start Job
          <HiOutlineArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      ) : null}

      {job?.status === JOB_STATUS.IN_PROGRESS &&
      job?.confirmedWorkerId === application.workerId ? (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-900">
          Job is in progress. The homeowner will mark it as complete once the
          work is done.
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
