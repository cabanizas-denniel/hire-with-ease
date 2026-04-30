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
import { setJobStatus } from '../../lib/matching/jobs.js';
import {
  buildApplicationId,
  declineAllApplicationsForJob,
  markApplicationCompleted,
} from '../../lib/matching/applications.js';

/**
 * Central "ongoing job" card for the client. Dominates the dashboard and
 * the My Requests page whenever an active job exists, since the client
 * can only manage one request at a time.
 */
function ActiveJobCard({ job, variant = 'full', applicantsCount = 0 }) {
  if (!job) return null;

  const compact = variant === 'compact';
  const currentStep = getStatusStepIndex(job.status);
  const statusCopy = getStatusCopy(job.status);
  const action = getPrimaryAction(job, applicantsCount);

  const jobId = job.docId || job.id;

  const handleMarkComplete = async () => {
    if (!jobId) return;
    if (!window.confirm('Mark this job as completed? This cannot be undone.')) return;
    try {
      await setJobStatus(jobId, JOB_STATUS.COMPLETED, {
        completedAt: new Date().toISOString(),
      });
      if (job.confirmedWorkerId) {
        await markApplicationCompleted(
          buildApplicationId(jobId, job.confirmedWorkerId)
        );
      }
    } catch (err) {
       
      alert(err.message || 'Could not mark complete. Please try again.');
    }
  };

  const canCancelMatching =
    job.status === JOB_STATUS.MATCHING || job.status === JOB_STATUS.MATCHED;

  const handleCancelMatching = async () => {
    if (!jobId) return;
    const msg =
      job.status === JOB_STATUS.MATCHING
        ? 'Cancel this request? Workers will stop seeing it and you can post a new job later.'
        : 'Cancel matching for this request? All current applicants will be closed out and you can post a new job later.';
    if (!window.confirm(msg)) return;
    try {
      await declineAllApplicationsForJob(jobId);
      await setJobStatus(jobId, JOB_STATUS.CANCELLED, {
        cancelledAt: new Date().toISOString(),
      });
    } catch (err) {
      alert(err.message || 'Could not cancel. Please try again.');
    }
  };

  return (
    <section className="overflow-hidden rounded-2xl border border-[#1F4E79]/15 bg-white shadow-sm">
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
            label="Schedule"
            value={`${job.type || 'Scheduled'} · ${job.schedule || '—'}`}
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
              onClick={handleCancelMatching}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50 sm:w-auto"
            >
              <HiOutlineStopCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              Cancel matching
            </button>
          ) : null}
          {!compact && (job.status === JOB_STATUS.IN_PROGRESS || job.status === JOB_STATUS.CONFIRMED) ? (
            <button
              type="button"
              onClick={handleMarkComplete}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-2.5 text-sm font-semibold text-emerald-800 hover:bg-emerald-100 sm:w-auto cursor-pointer"
            >
              <HiOutlineCheckCircle className="h-4 w-4" aria-hidden="true" />
              Mark as completed
            </button>
          ) : null}
        </div>
      </div>
    </section>
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
          "The system pushed your request to qualified, verified workers nearby. Workers can now Apply and start a chat with you.",
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
          'You and the worker have agreed on price, schedule, and scope. The worker will start the job at the agreed time.',
      };
    case JOB_STATUS.IN_PROGRESS:
      return {
        title: 'Your worker is on-site',
        detail:
          'Be present at the location while work is ongoing. Mark the job complete once the work is finished so you can rate the worker.',
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
