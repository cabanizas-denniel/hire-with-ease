/**
 * Lightweight loading placeholders that keep page chrome visible.
 */
export function SkeletonPulse({ className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-[#1F4E79]/10 ${className}`}
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
        <div className="mb-6 ml-[calc(50%-50vw)] w-screen max-w-[100vw] bg-[#2E75B6] shadow-[0_1px_0_rgba(0,0,0,0.06)] sm:mb-8">
          <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm text-white/90 sm:text-base">{subtitle}</p>
          </div>
        </div>
      ) : null}

      {variant === 'stats' ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
    <div className="hwe-shell relative min-h-screen bg-[#06243f]">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(4, 22, 44, 0.2) 0%, rgba(4, 22, 44, 0.55) 55%, rgba(2, 10, 24, 0.85) 100%)',
        }}
        aria-hidden="true"
      />
      <div className="relative">
        <div className="sticky top-0 z-40 border-b border-white/30 bg-white/90 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <SkeletonPulse className="h-8 w-36" />
            <div className="flex gap-2">
              <SkeletonPulse className="h-8 w-8 rounded-full" />
              <SkeletonPulse className="h-8 w-8 rounded-full" />
            </div>
          </div>
        </div>
        <div className="mx-auto w-full max-w-7xl px-4 pb-8 sm:px-6">
          <PageSkeleton variant="stats" title="Hire With Ease" subtitle="Loading your workspace…" />
        </div>
      </div>
    </div>
  );
}

export default PageSkeleton;
