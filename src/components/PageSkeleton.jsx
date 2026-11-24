/**
 * Lightweight loading placeholders that keep page chrome visible.
 */
export function SkeletonPulse({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[var(--hwe-sky-soft)] ${className}`}
      aria-hidden="true"
    />
  );
}

export function PageSkeleton({
  variant = 'cards',
  title = 'Loading',
  subtitle = 'Fetching the latest data…',
  showHeader = true,
}) {
  return (
    <div aria-busy="true" aria-live="polite">
      {showHeader ? (
        <div className="relative mb-6 ml-[calc(-1*var(--hwe-page-pad))] mr-[calc(-1*var(--hwe-page-pad))] w-[calc(100%+2*var(--hwe-page-pad))] bg-[var(--hwe-strong)] px-[var(--hwe-page-pad)] py-6 sm:mb-8 sm:py-8">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--hwe-slate)] sm:text-3xl">{title}</h1>
          <p className="mt-2 w-full text-sm text-[var(--hwe-slate-mid)] sm:text-base">{subtitle}</p>
        </div>
      ) : null}

      {variant === 'stats' ? (
        <div className="hwe-auto-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="panel-surface rounded-xl bg-white p-4">
              <SkeletonPulse className="h-3 w-24" />
              <SkeletonPulse className="mt-3 h-8 w-16" />
              <SkeletonPulse className="mt-2 h-3 w-32" />
            </div>
          ))}
        </div>
      ) : null}

      {variant === 'cards' || variant === 'stats' ? (
        <div className={`space-y-3 ${variant === 'stats' ? 'mt-6' : ''}`}>
          {[0, 1].map((i) => (
            <div key={i} className="panel-surface overflow-hidden rounded-xl bg-white p-4">
              <div className="flex items-start gap-3">
                <SkeletonPulse className="h-11 w-11 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1 space-y-2">
                  <SkeletonPulse className="h-4 w-2/3 max-w-[16rem]" />
                  <SkeletonPulse className="h-3 w-1/2 max-w-[12rem]" />
                  <SkeletonPulse className="h-3 w-full" />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <SkeletonPulse className="h-10 flex-1" />
                <SkeletonPulse className="h-10 flex-1" />
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {variant === 'form' ? (
        <div className="panel-surface mt-1 space-y-4 rounded-xl bg-white p-4 sm:p-5">
          <SkeletonPulse className="h-8 w-full max-w-md" />
          <SkeletonPulse className="h-24 w-full" />
          <SkeletonPulse className="h-10 w-full" />
          <SkeletonPulse className="h-10 w-40" />
        </div>
      ) : null}

      {variant === 'split' ? (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)]">
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="panel-surface rounded-xl bg-white p-3">
                <SkeletonPulse className="h-4 w-32" />
                <SkeletonPulse className="mt-2 h-3 w-20" />
              </div>
            ))}
          </div>
          <div className="panel-surface rounded-xl bg-white p-4">
            <SkeletonPulse className="h-64 w-full" />
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function DashboardRouteFallback() {
  return (
    <div className="hwe-shell relative min-h-screen">
      <div className="sticky top-0 z-40 border-b border-[var(--hwe-border)] bg-[var(--hwe-surface)]/95 backdrop-blur-md">
        <div className="flex w-full min-w-0 items-center justify-between gap-3 px-[var(--hwe-page-pad)] py-3">
          <SkeletonPulse className="h-8 w-36" />
          <div className="flex gap-2">
            <SkeletonPulse className="h-8 w-8 rounded-full" />
            <SkeletonPulse className="h-8 w-8 rounded-full" />
          </div>
        </div>
      </div>
      <div className="w-full min-w-0 px-[var(--hwe-page-pad)] pb-8">
        <PageSkeleton variant="stats" title="Hire With Ease" subtitle="Loading your workspace…" />
      </div>
    </div>
  );
}

/** Lightweight fallback for public routes (login, register, privacy, terms). */
export function PublicRouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--hwe-canvas)]">
      <p className="text-sm font-medium text-[var(--hwe-slate)]">Loading…</p>
    </div>
  );
}

export default PageSkeleton;
