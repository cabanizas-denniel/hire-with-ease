/**
 * Full-bleed strong-blue page header within the content column.
 * Text on blue is slate (WCAG AA). Bleeds past main horizontal padding.
 */
function PageHeader({ title, subtitle, action }) {
  return (
    <header
      className="relative mb-6 ml-[calc(-1*var(--hwe-page-pad))] mr-[calc(-1*var(--hwe-page-pad))] w-[calc(100%+2*var(--hwe-page-pad))] bg-[var(--hwe-strong)] px-[var(--hwe-page-pad)] py-6 sm:mb-8 sm:py-8"
      role="region"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div className="flex w-full min-w-0 flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight text-[var(--hwe-slate)] sm:text-3xl lg:text-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 w-full text-sm font-normal leading-relaxed text-[var(--hwe-slate-mid)] sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </div>
    </header>
  );
}

export default PageHeader;
