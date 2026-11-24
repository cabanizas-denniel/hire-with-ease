/**
 * Guided empty state: title, short support, optional primary action slot.
 */
function EmptyState({ title, description, action = null, icon = null, className = '' }) {
  return (
    <div
      className={`flex flex-col items-center rounded-2xl border border-dashed border-[var(--hwe-border-strong)] bg-[var(--hwe-surface)] px-6 py-10 text-center ${className}`.trim()}
    >
      {icon ? (
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--hwe-sky-soft)] text-[var(--hwe-sky)]">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-[var(--hwe-slate)]">{title}</h3>
      {description ? (
        <p className="mt-1.5 max-w-sm text-sm leading-relaxed text-[var(--hwe-muted)]">
          {description}
        </p>
      ) : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </div>
  );
}

export default EmptyState;
