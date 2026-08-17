import { JOB_STATUS, APPLICATION_STATUS } from '../../lib/matching/statuses.js';

const STEPS = [
  { id: 'applied', label: 'Applied' },
  { id: 'agreed', label: 'Agreed' },
  { id: 'checkin', label: 'Check-in' },
  { id: 'working', label: 'On site' },
  { id: 'checkout', label: 'Check-out' },
  { id: 'done', label: 'Done' },
];

export function workProgressIndex({
  applicationStatus,
  jobStatus,
  hasCheckIn,
  hasCheckOut,
}) {
  if (jobStatus === JOB_STATUS.COMPLETED || applicationStatus === APPLICATION_STATUS.COMPLETED) {
    return 5;
  }
  if (hasCheckOut) return 4;
  if (jobStatus === JOB_STATUS.IN_PROGRESS || hasCheckIn) return 3;
  if (hasCheckIn) return 2;
  if (
    jobStatus === JOB_STATUS.CONFIRMED ||
    applicationStatus === APPLICATION_STATUS.CONFIRMED
  ) {
    return 1;
  }
  if (applicationStatus) return 0;
  return -1;
}

function JobProgressBar({
  applicationStatus,
  jobStatus,
  hasCheckIn = false,
  hasCheckOut = false,
}) {
  const current = workProgressIndex({
    applicationStatus,
    jobStatus,
    hasCheckIn,
    hasCheckOut,
  });
  if (current < 0) return null;

  return (
    <ol className="flex items-start gap-0.5 px-1 py-2">
      {STEPS.map((step, i) => {
        const done = i < current;
        const active = i === current;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 ? (
                <span
                  className={`h-0.5 flex-1 rounded-full ${
                    done || active ? 'bg-amber-400' : 'bg-white/35'
                  }`}
                />
              ) : (
                <span className="flex-1" />
              )}
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                  done
                    ? 'bg-emerald-500 text-white'
                    : active
                      ? 'bg-amber-400 text-[#1F4E79]'
                      : 'bg-white/40 text-white'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              {i < STEPS.length - 1 ? (
                <span
                  className={`h-0.5 flex-1 rounded-full ${done ? 'bg-amber-400' : 'bg-white/35'}`}
                />
              ) : (
                <span className="flex-1" />
              )}
            </div>
            <span
              className={`mt-1 max-w-full truncate text-center text-[9px] font-semibold ${
                active ? 'text-amber-200' : done ? 'text-white' : 'text-white/70'
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default JobProgressBar;
