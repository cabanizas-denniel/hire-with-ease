import { Fragment, useMemo } from 'react';

const DAYS = [
  { key: 'Mon', short: 'M', full: 'Monday' },
  { key: 'Tue', short: 'T', full: 'Tuesday' },
  { key: 'Wed', short: 'W', full: 'Wednesday' },
  { key: 'Thu', short: 'T', full: 'Thursday' },
  { key: 'Fri', short: 'F', full: 'Friday' },
  { key: 'Sat', short: 'S', full: 'Saturday' },
  { key: 'Sun', short: 'S', full: 'Sunday' },
];

const SLOTS = ['AM', 'PM'];
const WEEKDAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const WEEKENDS = ['Sat', 'Sun'];
const TOTAL_SLOTS = DAYS.length * SLOTS.length;

function describeAvailability(slots) {
  if (!slots || slots.length === 0) return 'No slots set';
  if (slots.length === TOTAL_SLOTS) return 'Full availability';

  const set = new Set(slots);
  const has = (day, slot) => set.has(`${day}-${slot}`);

  const weekdayAM = WEEKDAYS.every((d) => has(d, 'AM'));
  const weekdayPM = WEEKDAYS.every((d) => has(d, 'PM'));
  const weekendAM = WEEKENDS.every((d) => has(d, 'AM'));
  const weekendPM = WEEKENDS.every((d) => has(d, 'PM'));
  const anyWeekday = WEEKDAYS.some((d) => has(d, 'AM') || has(d, 'PM'));
  const anyWeekend = WEEKENDS.some((d) => has(d, 'AM') || has(d, 'PM'));
  const allAM = slots.every((s) => s.endsWith('AM'));
  const allPM = slots.every((s) => s.endsWith('PM'));

  if (weekdayAM && weekdayPM && !anyWeekend) return 'Full weekdays';
  if (weekdayAM && allAM && !anyWeekend) return 'Weekday mornings';
  if (weekdayPM && allPM && !anyWeekend) return 'Weekday afternoons';
  if (!anyWeekday && weekendAM && weekendPM) return 'Weekends only';
  if (!anyWeekday && anyWeekend) return 'Weekends (partial)';
  if (allAM) return 'Mornings only';
  if (allPM) return 'Afternoons only';
  if (anyWeekday && anyWeekend) return 'Flexible (incl. weekends)';
  return 'Custom schedule';
}

const SIZE_MAP = {
  xs: 'h-2.5 w-2.5',
  sm: 'h-3.5 w-3.5',
  md: 'h-4 w-4',
};

function AvailabilityGrid({
  availability = [],
  size = 'sm',
  showSummary = true,
  showLegend = false,
  className = '',
}) {
  const activeSet = useMemo(() => new Set(availability), [availability]);
  const cellSize = SIZE_MAP[size] || SIZE_MAP.sm;
  const filled = availability.length;
  const summary = describeAvailability(availability);

  return (
    <div className={`inline-flex flex-col gap-1.5 ${className}`}>
      <div
        className="inline-grid items-center gap-0.5"
        style={{ gridTemplateColumns: 'auto repeat(7, minmax(0, auto))' }}
        role="img"
        aria-label={`Availability: ${filled} of ${TOTAL_SLOTS} slots — ${summary}`}
      >
        <span />
        {DAYS.map((d) => (
          <span
            key={d.key}
            title={d.full}
            className={`${cellSize} text-center text-[9px] font-semibold leading-none text-gray-500`}
          >
            {d.short}
          </span>
        ))}

        {SLOTS.map((slot) => (
          <Fragment key={slot}>
            <span className="pr-1 text-right text-[9px] font-semibold leading-none text-gray-400">
              {slot}
            </span>
            {DAYS.map((d) => {
              const isActive = activeSet.has(`${d.key}-${slot}`);
              return (
                <span
                  key={`${d.key}-${slot}`}
                  title={`${d.full} ${slot}${isActive ? ' — available' : ''}`}
                  className={`${cellSize} rounded-[3px] transition-colors ${
                    isActive ? 'bg-[#1F4E79]' : 'bg-gray-200'
                  }`}
                />
              );
            })}
          </Fragment>
        ))}
      </div>

      {showSummary ? (
        <p className="text-[11px] leading-tight text-gray-600">
          <span className="font-semibold text-[#1F4E79]">
            {filled}/{TOTAL_SLOTS}
          </span>
          <span className="mx-1 text-gray-300">·</span>
          <span>{summary}</span>
        </p>
      ) : null}

      {showLegend ? (
        <div className="flex items-center gap-3 text-[10px] text-gray-500">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-[#1F4E79]" />
            Available
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2.5 w-2.5 rounded-[2px] bg-gray-200" />
            Unavailable
          </span>
        </div>
      ) : null}
    </div>
  );
}

export default AvailabilityGrid;
