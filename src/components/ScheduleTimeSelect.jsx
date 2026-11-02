const TIME_OPTIONS = Array.from({ length: 24 * 4 }, (_, i) => {
  const totalMinutes = i * 15;
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const value = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  const label = new Date(2000, 0, 1, hour, minute).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return { value, label };
});

/** Snap any HH:MM[:SS] string to the nearest quarter hour. */
export function snapTimeToQuarterHour(timeStr) {
  if (!timeStr || typeof timeStr !== 'string') return '';
  const [hhRaw, mmRaw] = timeStr.split(':');
  const hh = Number(hhRaw);
  const mm = Number(mmRaw);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return '';
  const total = hh * 60 + mm;
  const snapped = Math.round(total / 15) * 15;
  const wrapped = ((snapped % (24 * 60)) + 24 * 60) % (24 * 60);
  const outH = String(Math.floor(wrapped / 60)).padStart(2, '0');
  const outM = String(wrapped % 60).padStart(2, '0');
  return `${outH}:${outM}`;
}

/**
 * Single dropdown of quarter-hour times.
 * Value format matches `<input type="time">`: `HH:MM` (24-hour).
 */
function ScheduleTimeSelect({
  id,
  value = '',
  onChange,
  disabled = false,
  required = false,
  className = '',
  placeholder = 'Select time',
}) {
  const selected = snapTimeToQuarterHour(value);

  return (
    <select
      id={id}
      required={required}
      disabled={disabled}
      aria-label="Time"
      value={selected}
      onChange={(e) => onChange?.(e.target.value)}
      className={`w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-base focus:border-[#1F4E79] focus:outline-none focus:ring-2 focus:ring-[#1F4E79]/20 disabled:opacity-60 ${className}`.trim()}
    >
      <option value="">{placeholder}</option>
      {TIME_OPTIONS.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}

export default ScheduleTimeSelect;
