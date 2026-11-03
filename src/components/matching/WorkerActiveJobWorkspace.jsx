import { useState } from 'react';
import ChatPanel from './ChatPanel.jsx';
import JobIssueMedia from '../JobIssueMedia.jsx';
import HomeownerTrustRow from '../HomeownerTrustRow.jsx';
import Modal from '../Modal.jsx';
import StatusBadge from '../StatusBadge.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useJob } from '../../lib/matching/hooks.js';
import { APPLICATION_STATUS, JOB_STATUS } from '../../lib/matching/statuses.js';
import { formatPostedDate } from '../../lib/scheduleFormat.js';

const DECLINE_REASON_PRESETS = [
  'Schedule no longer works for me',
  'Location is too far',
  'Budget does not work',
  'Found another job',
  'Personal emergency',
  'Other',
];

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

/** Chat + details for the worker's current accepted job. */
function WorkerActiveJobWorkspace({ application }) {
  const { user } = useAuth();
  const { data: job } = useJob(application.jobId);
  const [declining, setDeclining] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [declineError, setDeclineError] = useState(null);
  const [declinePreset, setDeclinePreset] = useState('');
  const [declineOther, setDeclineOther] = useState('');

  const address =
    [job?.location?.label, job?.location?.barangay && `${job.location.barangay}, Olongapo`]
      .filter(Boolean)
      .join(' · ') || '';

  const canDecline =
    application.status !== APPLICATION_STATUS.COMPLETED &&
    application.status !== APPLICATION_STATUS.DECLINED &&
    job?.status !== JOB_STATUS.COMPLETED &&
    job?.status !== JOB_STATUS.CANCELLED;

  const locked = job?.confirmedWorkerId === application.workerId;
  const declineBody = locked
    ? 'The booking will unlock and this job will leave your Jobs list permanently.'
    : 'It will be removed from your Jobs list and will not show again.';

  const resolvedDeclineReason =
    declinePreset === 'Other'
      ? declineOther.trim()
      : declinePreset.trim();

  const closeDeclineModal = () => {
    if (declining) return;
    setDeclineOpen(false);
    setDeclineError(null);
    setDeclinePreset('');
    setDeclineOther('');
  };

  const confirmDecline = async () => {
    const appId = application.docId || application.id;
    if (!appId || !canDecline) return;
    if (!resolvedDeclineReason) {
      setDeclineError('Please choose or type a reason for the homeowner.');
      return;
    }
    setDeclining(true);
    setDeclineError(null);
    try {
      const { withdrawApplication } = await import('../../lib/matching/applications.js');
      await withdrawApplication(appId, { reason: resolvedDeclineReason });
      setDeclineOpen(false);
      setDeclinePreset('');
      setDeclineOther('');
    } catch (err) {
      setDeclineError(err.message || 'Could not decline this job.');
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
                onClick={() => {
                  setDeclineError(null);
                  setDeclinePreset('');
                  setDeclineOther('');
                  setDeclineOpen(true);
                }}
                disabled={declining}
                className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Decline job
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
                <span className="font-semibold text-[#1F4E79]">Preferred start:</span>{' '}
                {job.schedule}
              </p>
            ) : null}
            {formatPostedDate(job?.postedAt, job?.createdAt) ? (
              <p className="sm:col-span-2">
                <span className="font-semibold text-[#1F4E79]">Date posted:</span>{' '}
                {formatPostedDate(job?.postedAt, job?.createdAt)}
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

      {job?.status === JOB_STATUS.IN_PROGRESS && locked ? (
        <p className="rounded-lg border border-indigo-200 bg-indigo-50 p-3 text-xs text-indigo-950">
          Job is in progress. Finish with the homeowner on site; they can mark the job complete when
          work is done. Payment stays between you outside the app.
        </p>
      ) : null}

      <Modal
        isOpen={declineOpen}
        title={locked ? 'Decline this hire?' : 'Decline / withdraw from this job?'}
        onClose={closeDeclineModal}
        onConfirm={confirmDecline}
        confirmText={declining ? 'Declining…' : 'Decline'}
        confirmDisabled={declining || !resolvedDeclineReason}
      >
        <p>{declineBody}</p>
        <p className="mt-3 text-xs font-semibold text-[#1F4E79]">
          Tell the homeowner why (required — sent in chat)
        </p>
        <div className="mt-2 space-y-1.5">
          {DECLINE_REASON_PRESETS.map((option) => (
            <label
              key={option}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-700 hover:bg-gray-100"
            >
              <input
                type="radio"
                name="decline-reason"
                className="shrink-0"
                checked={declinePreset === option}
                onChange={() => setDeclinePreset(option)}
              />
              <span>{option}</span>
            </label>
          ))}
        </div>
        {declinePreset === 'Other' ? (
          <textarea
            value={declineOther}
            onChange={(e) => setDeclineOther(e.target.value)}
            rows={3}
            maxLength={280}
            placeholder="Brief reason for the homeowner…"
            className="mt-2 w-full rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-800 focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20"
          />
        ) : null}
        {declineError ? (
          <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
            {declineError}
          </p>
        ) : null}
      </Modal>
    </>
  );
}

export { prettyAppStatus };
export default WorkerActiveJobWorkspace;
