/**
 * Horizontal progress rail: numbered circles on a thin line.
 * The current step is dark and bold; earlier steps stay numbered; later steps stay light.
 */
function NumberedStepRail({ steps, currentStep, ariaLabel = 'Progress' }) {
  return (
    <ol className="flex w-full items-start" aria-label={ariaLabel}>
      {steps.map((step, index) => {
        const label = typeof step === 'string' ? step : step.label;
        const key = typeof step === 'string' ? step : step.id;
        const isActive = index === currentStep;
        const isUpcoming = index > currentStep;
        return (
          <li
            key={key}
            className="flex min-w-0 flex-1 flex-col items-center"
            aria-current={isActive ? 'step' : undefined}
          >
            <div className="relative flex h-8 w-full items-center justify-center">
              {index > 0 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 right-1/2 left-0 h-px -translate-y-1/2 bg-gray-200"
                />
              ) : null}
              {index < steps.length - 1 ? (
                <span
                  aria-hidden="true"
                  className="absolute top-1/2 right-0 left-1/2 h-px -translate-y-1/2 bg-gray-200"
                />
              ) : null}
              <span
                className={`relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-white text-xs font-semibold ${
                  isUpcoming
                    ? 'border-gray-200 text-gray-300'
                    : isActive
                      ? 'border-[var(--hwe-slate)] text-[var(--hwe-slate)]'
                      : 'border-gray-300 text-gray-500'
                }`}
              >
                {index + 1}
              </span>
            </div>
            <span
              className={`mt-2 w-full px-0.5 text-center text-[11px] leading-tight sm:text-xs ${
                isActive
                  ? 'font-semibold text-[var(--hwe-slate)]'
                  : isUpcoming
                    ? 'font-normal text-gray-400'
                    : 'font-medium text-gray-500'
              }`}
            >
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

export default NumberedStepRail;
