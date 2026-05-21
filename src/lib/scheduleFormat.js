/** Today's date as `YYYY-MM-DD` for `<input type="date" min="...">`. */
export function todayDateInputValue() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function scheduledStartToDate(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null;
  const [y, m, d] = dateStr.split('-').map(Number);
  const [hh, mm] = timeStr.split(':').map(Number);
  const dt = new Date(y, m - 1, d, hh, mm, 0, 0);
  return Number.isNaN(dt.getTime()) ? null : dt;
}

/** Human-readable label stored on jobs and shown to workers. */
export function formatScheduledStart(dateStr, timeStr) {
  const dt = scheduledStartToDate(dateStr, timeStr);
  if (!dt) return '';
  return dt.toLocaleString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** ISO-8601 instant stored on jobs for the matching engine. */
export function scheduledStartAtIso(dateStr, timeStr) {
  const dt = scheduledStartToDate(dateStr, timeStr);
  return dt ? dt.toISOString() : null;
}

export function validateScheduledStart(dateStr, timeStr) {
  if (!dateStr?.trim()) return 'Pick a date for the work.';
  if (!timeStr?.trim()) return 'Pick a time for the work.';
  const dt = scheduledStartToDate(dateStr, timeStr);
  if (!dt) return 'Enter a valid date and time.';
  if (dt.getTime() < Date.now()) {
    return 'Choose a date and time in the future.';
  }
  return null;
}
