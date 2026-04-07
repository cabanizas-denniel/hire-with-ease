function PageHeader({ title, subtitle, action }) {
  return (
    <div
      className="mb-6 ml-[calc(50%-50vw)] w-screen max-w-[100vw] bg-[#2E75B6] shadow-[0_1px_0_rgba(0,0,0,0.06)] sm:mb-8"
      role="region"
      aria-label={typeof title === 'string' ? title : undefined}
    >
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">{title}</h1>
            {subtitle ? (
              <p className="mt-2 max-w-3xl text-sm font-normal leading-relaxed text-white/90 sm:text-base">
                {subtitle}
              </p>
            ) : null}
          </div>
          {action ? <div className="shrink-0">{action}</div> : null}
        </div>
      </div>
    </div>
  );
}

export default PageHeader;
