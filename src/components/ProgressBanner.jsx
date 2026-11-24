/**
 * Blue cap from the ongoing-job card: title block on the left,
 * frosted status pill on the right.
 */
function ProgressBanner({
  eyebrow = 'Your ongoing job',
  title,
  requestId,
  status,
}) {
  return (
    <header className="flex items-center justify-between gap-4 bg-[var(--hwe-strong)] px-4 py-4 text-[var(--hwe-slate)] sm:px-5 sm:py-5">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide">{eyebrow}</p>
        <h2 className="mt-1 truncate text-lg font-bold leading-tight">{title}</h2>
        {requestId ? (
          <p className="mt-0.5 truncate text-xs">Request ID : {requestId}</p>
        ) : null}
      </div>
      {status ? (
        <span className="inline-flex shrink-0 items-center rounded-full border border-white/80 bg-white/30 px-3.5 py-1 text-xs font-medium text-[var(--hwe-slate)] backdrop-blur-md">
          {status}
        </span>
      ) : null}
    </header>
  );
}

export default ProgressBanner;
