const TONES = {
  highlight: 'bg-[var(--hwe-highlight)] text-[var(--hwe-slate)]',
  accent: 'bg-[var(--hwe-highlight-muted)] text-[var(--hwe-slate)] ring-1 ring-[var(--hwe-highlight)]/30',
  strong: 'bg-[var(--hwe-strong-soft)] text-[var(--hwe-slate-mid)] ring-1 ring-[var(--hwe-strong-border)]',
  sky: 'bg-[var(--hwe-strong-soft)] text-[var(--hwe-slate-mid)] ring-1 ring-[var(--hwe-strong-border)]',
  slate: 'bg-[var(--hwe-canvas-deep)] text-[var(--hwe-slate-soft)] ring-1 ring-[var(--hwe-border)]',
  success: 'bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200',
  danger: 'bg-rose-50 text-rose-800 ring-1 ring-rose-200',
  muted: 'bg-gray-100 text-[var(--hwe-muted)] ring-1 ring-gray-200',
};

/**
 * Compact status / metadata chip. Prefer StatusBadge for job lifecycle labels.
 * Use tone="highlight" sparingly for amber accents.
 */
function Badge({ tone = 'slate', children, className = '' }) {
  const toneClass = TONES[tone] || TONES.slate;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${toneClass} ${className}`.trim()}
    >
      {children}
    </span>
  );
}

export default Badge;
