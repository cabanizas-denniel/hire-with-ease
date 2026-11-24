/**
 * Full-width progress indicator. Active step uses amber highlight only.
 */
function FormStepper({ steps, currentStep }) {
  return (
    <ol
      className="mb-6 flex w-full items-center justify-between gap-1 overflow-x-auto border-b border-[var(--hwe-border)] pb-4"
      aria-label="Form progress"
    >
      {steps.map((label, index) => {
        const isDone = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li
            key={label}
            className="flex min-w-0 flex-1 flex-col items-center text-center"
            aria-current={isActive ? 'step' : undefined}
          >
            <div className="flex w-full items-center">
              <div
                className={`h-0.5 flex-1 ${
                  index === 0
                    ? 'bg-transparent'
                    : isDone || isActive
                      ? 'bg-[var(--hwe-slate)]'
                      : 'bg-[var(--hwe-border-strong)]'
                }`}
              />
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  isDone
                    ? 'border-[var(--hwe-slate)] bg-[var(--hwe-slate)] text-[var(--hwe-on-slate)]'
                    : isActive
                      ? 'border-[var(--hwe-highlight)] bg-[var(--hwe-highlight)] text-[var(--hwe-slate)]'
                      : 'border-[var(--hwe-border-strong)] bg-[var(--hwe-surface)] text-[var(--hwe-muted)]'
                }`}
              >
                {isDone ? '✓' : index + 1}
              </span>
              <div
                className={`h-0.5 flex-1 ${
                  index === steps.length - 1
                    ? 'bg-transparent'
                    : isDone
                      ? 'bg-[var(--hwe-slate)]'
                      : 'bg-[var(--hwe-border-strong)]'
                }`}
              />
            </div>
            <span
              className={`mt-1.5 hidden text-[10px] font-medium leading-tight sm:block ${
                isActive
                  ? 'text-[var(--hwe-slate)]'
                  : isDone
                    ? 'text-[var(--hwe-slate-soft)]'
                    : 'text-[var(--hwe-muted)]'
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

export default FormStepper;
