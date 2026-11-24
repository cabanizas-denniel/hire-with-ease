/**
 * One purpose per section: heading + short supporting line + optional action.
 */
function SectionHeader({ title, subtitle, action = null, className = '' }) {
  return (
    <div
      className={`mb-3 flex flex-col gap-2 sm:mb-4 sm:flex-row sm:items-end sm:justify-between ${className}`.trim()}
    >
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight text-[var(--hwe-slate)]">{title}</h2>
        {subtitle ? (
          <p className="mt-1 w-full text-sm leading-relaxed text-[var(--hwe-muted)]">
            {subtitle}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export default SectionHeader;
