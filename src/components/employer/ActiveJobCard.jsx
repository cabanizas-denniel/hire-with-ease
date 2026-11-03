import { useState } from 'react';
import {
  HiOutlineBanknotes,
  HiOutlineCalendarDays,
  HiOutlineCheckCircle,
  HiOutlineMapPin,
  HiOutlineStopCircle,
  HiOutlineUsers,
} from 'react-icons/hi2';
import { Link } from 'react-router-dom';
import {
  JOB_STATUS_FLOW,
  getStatusStepIndex,
  locationLabel,
} from '../../utils/clientJobs.js';
import { JOB_STATUS } from '../../lib/matching/statuses.js';
import { setJobStatus, startJobWork } from '../../lib/matching/jobs.js';
import {
  buildApplicationId,
  declineAllApplicationsForJob,
  declineApplication,
  markApplicationCompleted,
} from '../../lib/matching/applications.js';
import { sendMessage } from '../../lib/matching/threads.js';
import {
  notifyJobCompleted,
  notifyJobInProgress,
} from '../../lib/notifications.js';
import { useApplication } from '../../lib/matching/hooks.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Modal from '../Modal.jsx';

/**
 * Central "ongoing job" card for the client. Dominates the dashboard and
 * the Home dashboard whenever an active job exists, since the client
 * can only manage one request at a time.
 */
function ActiveJobCard({ job, variant = 'full', applicantsCount = 0 }) {
  const auth = useAuth();
  const compact = variant === 'compact';
  const jobId = job?.docId || job?.id || null;
  const appId =
    jobId && job?.confirmedWorkerId
      ? buildApplicationId(jobId, job.confirmedWorkerId)
      : null;
  const { data: application } = useApplication(appId);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState(null);
  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeBusy, setCompleteBusy] = useState(false);
  const [completeError, setCompleteError] = useState(null);
  const [progressOpen, setProgressOpen] = useState(false);
  const [progressBusy, setProgressBusy] = useState(false);
  const [progressError, setProgressError] = useState(null);

  if (!job) return null;

  const currentStep = getStatusStepIndex(job.status);
  const statusCopy = getStatusCopy(job.status);
  const action = getPrimaryAction(job, applicantsCount);
  const canMarkInProgress =
    job.status === JOB_STATUS.CONFIRMED && Boolean(job.confirmedWorkerId);
  const canMarkCompleted =
    job.status === JOB_STATUS.IN_PROGRESS && Boolean(job.confirmedWorkerId);

  const closeProgressModal = () => {
    if (progressBusy) return;
    setProgressOpen(false);
    setProgressError(null);
  };

  const openProgressModal = () => {
    if (!jobId || !canMarkInProgress) return;
    setProgressError(null);
    setProgressOpen(true);
  };

  const confirmMarkInProgress = async () => {
    if (!jobId || !canMarkInProgress || progressBusy) return;
    setProgressBusy(true);
    setProgressError(null);
    try {
      await startJobWork(jobId);
      const workerId = application?.workerId || job.confirmedWorkerId || null;
      const clientId = application?.clientId || job.postedBy || auth?.user?.uid || null;
      const jobTitle = application?.jobTitle || job.title;
      if (workerId && clientId) {
        await sendMessage({
          jobId,
          workerId,
          clientId,
          jobTitle,
          authorId: auth?.user?.uid || clientId,
          authorName: auth?.user?.fullName || job.postedByName || 'Homeowner',
          authorRole: 'client',
          text: 'Work started — job is now in progress.',
          messageType: 'work_started',
          replaceMessageTypes: ['work_started'],
        });
        try {
          await notifyJobInProgress({
            workerId,
            clientId,
            jobId,
            jobTitle,
            byRole: 'client',
          });
        } catch (notifyErr) {
          console.warn('Could not create in-progress notifications', notifyErr);
        }
      }
      setProgressOpen(false);
    } catch (err) {
      setProgressError(err.message || 'Could not mark in progress. Please try again.');
    } finally {
      setProgressBusy(false);
    }
  };

  const closeCompleteModal = () => {
    if (completeBusy) return;
    setCompleteOpen(false);
    setCompleteError(null);
  };

  const openCompleteModal = () => {
    if (!jobId || !canMarkCompleted) return;
    setCompleteError(null);
    setCompleteOpen(true);
  };

  const confirmMarkComplete = async () => {
    if (!jobId || completeBusy) return;
    setCompleteBusy(true);
    setCompleteError(null);
    try {
      await setJobStatus(jobId, JOB_STATUS.COMPLETED, {
        completedAt: new Date().toISOString(),
      });
      const workerId = application?.workerId || job.confirmedWorkerId || null;
      const clientId = application?.clientId || job.postedBy || auth?.user?.uid || null;
      const jobTitle = application?.jobTitle || job.title;
      if (workerId) {
        await markApplicationCompleted(buildApplicationId(jobId, workerId));
      }
      if (workerId && clientId) {
        try {
          await notifyJobCompleted({
            workerId,
            clientId,
            jobId,
            jobTitle,
            byRole: 'client',
          });
        } catch (notifyErr) {
          console.warn('Could not create completed notifications', notifyErr);
        }
      }
      setCompleteOpen(false);
    } catch (err) {
      setCompleteError(err.message || 'Could not mark complete. Please try again.');
    } finally {
      setCompleteBusy(false);
    }
  };

  const canCancelMatching =
    job.status === JOB_STATUS.MATCHING || job.status === JOB_STATUS.MATCHED;
  const canStopContract =
    job.status === JOB_STATUS.CONFIRMED || job.status === JOB_STATUS.IN_PROGRESS;

  const cancelTitle = canStopContract
    ? 'Stop this contract?'
    : job.status === JOB_STATUS.MATCHING
      ? 'Cancel this request?'
      : 'Cancel matching for this request?';
  const cancelBody = canStopContract
    ? 'This ends the agreed hire with the worker, unlocks the booking, and cancels the request. Reporting a worker does not do this — only Stop contract does.'
    : job.status === JOB_STATUS.MATCHING
      ? 'Workers will stop seeing it and you can post a new job later.'
      : 'All current applicants will be closed out and you can post a new job later.';
  const cancelConfirmLabel = canStopContract ? 'Stop contract' : 'Cancel matching';

  const closeCancelModal = () => {
    if (cancelBusy) return;
    setCancelOpen(false);
    setCancelError(null);
  };

  const confirmCancelOrStop = async () => {
    if (!jobId) return;
    setCancelBusy(true);
    setCancelError(null);
    try {
      const stoppedWorkerId = canStopContract ? job.confirmedWorkerId || null : null;
      if (stoppedWorkerId) {
        await declineApplication(buildApplicationId(jobId, stoppedWorkerId), {
          byRole: 'client',
          contractStopped: true,
          reason: 'Homeowner stopped the contract',
        });
      }
      await declineAllApplicationsForJob(jobId);
      await setJobStatus(jobId, JOB_STATUS.CANCELLED, {
        cancelledAt: new Date().toISOString(),
        ...(stoppedWorkerId
          ? {
              contractStopped: true,
              stoppedWorkerId,
              stoppedWorkerName: job.confirmedWorkerName || null,
            }
          : {}),
      });
      setCancelOpen(false);
    } catch (err) {
      setCancelError(err.message || 'Could not cancel. Please try again.');
    } finally {
      setCancelBusy(false);
    }
  };

  return (
    <>
    <section className="panel-surface overflow-hidden rounded-2xl border border-[#1F4E79]/25 bg-white shadow-sm">
      <header className="flex flex-col gap-3 border-b border-gray-100 bg-[#1F4E79] p-4 text-white sm:flex-row sm:items-start sm:justify-between sm:p-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-white/75">
            Your ongoing job
          </p>
          <h2 className="mt-0.5 break-words text-lg font-semibold sm:text-xl">
            {job.title}
          </h2>
          <p className="mt-0.5 text-xs text-white/80">
            Request ID · {job.docId || job.id}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full bg-white/15 px-3 py-1 text-xs font-semibold ring-1 ring-inset ring-white/30 backdrop-blur">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
          {job.status}
        </span>
      </header>

      <div className="space-y-4 p-4 sm:p-5">
        <StatusStepper currentStep={currentStep} status={job.status} />

        <div className="rounded-lg bg-blue-50/70 px-3 py-2.5 text-xs text-[#1F4E79] sm:text-sm">
          <p className="font-semibold">{statusCopy.title}</p>
          <p className="mt-0.5 text-gray-600">{statusCopy.detail}</p>
        </div>

        <dl className="grid grid-cols-1 gap-2.5 text-sm sm:grid-cols-2">
          <Fact icon={HiOutlineMapPin} label="Location" value={locationLabel(job) || '—'} />
          <Fact
            icon={HiOutlineCalendarDays}
            label="Preferred start"
            value={job.schedule || '—'}
          />
          <Fact icon={HiOutlineBanknotes} label="Budget" value={job.budget || '—'} />
          <Fact
            icon={HiOutlineUsers}
            label="Applicants"
            value={`${applicantsCount} ${applicantsCount === 1 ? 'applicant' : 'applicants'}`}
          />
        </dl>

        {!compact ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900">
            <p className="font-semibold">You can only manage one request at a time.</p>
            <p className="mt-0.5 text-amber-800/90">
              Workers will arrive at this location and expect you to be present.
              Please complete or cancel this job before posting another.
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {action ? (
            <Link
              to={action.to}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1F4E79] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110 sm:w-auto"
            >
              {action.icon ? <action.icon className="h-4 w-4" aria-hidden="true" /> : null}
              {action.label}
            </Link>
          ) : null}
          {canCancelMatching ? (
            <button
              type="button"
              onClick={() => {
                setCancelError(null);
                setCancelOpen(true);
              }}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 sm:w-auto"
            >
              <HiOutlineStopCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Cancel matching
            </button>
          ) : null}
          {canStopContract ? (
            <button
              type="button"
              onClick={() => {
                setCancelError(null);
                setCancelOpen(true);
              }}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 sm:w-auto"
            >
              <HiOutlineStopCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Stop contract
            </button>
          ) : null}
          {!compact && canMarkInProgress ? (
            <button
              type="button"
              onClick={openProgressModal}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-indigo-300 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-900 hover:bg-indigo-100 sm:w-auto"
            >
              <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
              Mark as in progress
            </button>
          ) : null}
          {!compact && canMarkCompleted ? (
            <button
              type="button"
              onClick={openCompleteModal}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 sm:w-auto"
            >
              <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
              Mark as completed
            </button>
          ) : null}
        </div>
      </div>
    </section>

    <Modal
      isOpen={cancelOpen}
      title={cancelTitle}
      onClose={closeCancelModal}
      onConfirm={confirmCancelOrStop}
      confirmText={
        cancelBusy
          ? canStopContract
            ? 'Stopping…'
            : 'Cancelling…'
          : cancelConfirmLabel
      }
    >
      <p>{cancelBody}</p>
      {canStopContract ? (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-950">
          Any payment already made outside the app is between you and the worker. Hire With Ease
          does not refund money. Use Report if you need PESO to review a dispute.
        </p>
      ) : null}
      {cancelError ? (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {cancelError}
        </p>
      ) : null}
    </Modal>

    <Modal
      isOpen={progressOpen}
      title="Mark this job as in progress?"
      onClose={closeProgressModal}
      onConfirm={confirmMarkInProgress}
      confirmText={progressBusy ? 'Updating…' : 'Mark as in progress'}
      confirmDisabled={progressBusy}
    >
      <p>
        Confirm only when work has started on site. The worker will be notified that the job is
        now in progress.
      </p>
      {progressError ? (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {progressError}
        </p>
      ) : null}
    </Modal>

    <Modal
      isOpen={completeOpen}
      title="Mark this job as completed?"
      onClose={closeCompleteModal}
      onConfirm={confirmMarkComplete}
      confirmText={completeBusy ? 'Completing…' : 'Mark as completed'}
      confirmDisabled={completeBusy}
    >
      <p>This cannot be undone. The request will move to your past jobs and the worker will be notified.</p>
      {completeError ? (
        <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700">
          {completeError}
        </p>
      ) : null}
    </Modal>
    </>
  );
}

function Fact({ icon, label, value }) {
  const Icon = icon;
  return (
    <div className="flex items-start gap-2 rounded-lg bg-gray-50 px-3 py-2">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#1F4E79]" aria-hidden="true" />
      <div className="min-w-0">
        <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
          {label}
        </dt>
        <dd className="truncate text-sm text-gray-800">{value}</dd>
      </div>
    </div>
  );
}

function StatusStepper({ currentStep }) {
  return (
    <ol className="flex items-center justify-between gap-1 overflow-x-auto">
      {JOB_STATUS_FLOW.map((step, index) => {
        const isDone = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li
            key={step}
            className="flex min-w-0 flex-1 flex-col items-center text-center"
          >
            <div className="flex w-full items-center">
              <div
                className={`h-0.5 flex-1 ${
                  index === 0
                    ? 'bg-transparent'
                    : isDone || isActive
                      ? 'bg-[#1F4E79]'
                      : 'bg-gray-200'
                }`}
              />
              <span
                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold ${
                  isDone
                    ? 'border-[#1F4E79] bg-[#1F4E79] text-white'
                    : isActive
                      ? 'border-[#1F4E79] bg-white text-[#1F4E79] ring-2 ring-[#1F4E79]/20'
                      : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {isDone ? '✓' : index + 1}
              </span>
              <div
                className={`h-0.5 flex-1 ${
                  index === JOB_STATUS_FLOW.length - 1
                    ? 'bg-transparent'
                    : isDone
                      ? 'bg-[#1F4E79]'
                      : 'bg-gray-200'
                }`}
              />
            </div>
            <span
              className={`mt-1 text-[10px] font-medium leading-tight sm:text-xs ${
                isActive
                  ? 'text-[#1F4E79]'
                  : isDone
                    ? 'text-gray-600'
                    : 'text-gray-400'
              }`}
            >
              {step}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function getStatusCopy(status) {
  switch (status) {
    case JOB_STATUS.MATCHING:
      return {
        title: "We're finding the right worker for you",
        detail:
          "The system pushed your request to qualified workers nearby. They must Accept before you can chat.",
      };
    case JOB_STATUS.MATCHED:
      return {
        title: 'Workers are ready for your review',
        detail:
          'Open the candidates page, chat to negotiate, then propose a final agreement. Once you both confirm, the booking is locked in.',
      };
    case JOB_STATUS.CONFIRMED:
      return {
        title: 'Booking confirmed',
        detail:
          'You and the worker have agreed on price, schedule, and scope. When work begins on site, mark the job in progress (either of you can).',
      };
    case JOB_STATUS.IN_PROGRESS:
      return {
        title: 'Work in progress',
        detail:
          'Coordinate arrival, finish, and payment with your worker on site. When work is done, mark the job complete.',
      };
    default:
      return { title: status, detail: '' };
  }
}

function getPrimaryAction(job, applicantsCount) {
  const id = job.docId || job.id;
  switch (job.status) {
    case JOB_STATUS.MATCHING:
    case JOB_STATUS.MATCHED:
      return {
        label: applicantsCount > 0
          ? `Review ${applicantsCount} ${applicantsCount === 1 ? 'applicant' : 'applicants'}`
          : 'Open candidates page',
        to: `/employer/candidates/${id}`,
        icon: HiOutlineUsers,
      };
    case JOB_STATUS.CONFIRMED:
    case JOB_STATUS.IN_PROGRESS:
      return {
        label: 'Open candidates page',
        to: `/employer/candidates/${id}`,
        icon: HiOutlineUsers,
      };
    default:
      return null;
  }
}

export default ActiveJobCard;
