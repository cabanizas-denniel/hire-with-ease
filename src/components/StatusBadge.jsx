const STATUS_STYLES = {
  Matching: 'bg-[var(--hwe-highlight-muted)] text-[var(--hwe-slate)] ring-1 ring-[var(--hwe-highlight)]/40',
  Matched: 'bg-[var(--hwe-strong-soft)] text-[var(--hwe-slate-mid)]',
  Accepted: 'bg-teal-50 text-teal-800',
  Declined: 'bg-gray-100 text-[var(--hwe-muted)]',
  'In Progress': 'bg-[var(--hwe-strong-soft)] text-[var(--hwe-slate)]',
  Completed: 'bg-emerald-50 text-emerald-800',
  Cancelled: 'bg-rose-50 text-rose-800',
  'Contract stopped': 'bg-rose-50 text-rose-800',
  Open: 'bg-gray-100 text-[var(--hwe-slate-soft)]',
  Pending: 'bg-[var(--hwe-highlight-muted)] text-[var(--hwe-slate)] ring-1 ring-[var(--hwe-highlight)]/40',
};

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
        STATUS_STYLES[status] || 'bg-gray-100 text-[var(--hwe-slate-soft)]'
      }`}
    >
      {status}
    </span>
  );
}

export default StatusBadge;
