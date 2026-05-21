/**
 * Horizontal step indicator for multi-step forms.
 */
function FormStepper({ steps, currentStep }) {
  return (
    <ol className="mb-6 flex items-center justify-between gap-1 overflow-x-auto">
      {steps.map((label, index) => {
        const isDone = index < currentStep;
        const isActive = index === currentStep;
        return (
          <li
            key={label}
            className="flex min-w-0 flex-1 flex-col items-center text-center"
          >
            <div className="flex w-full items-center">
              <div
                className={`h-0.5 flex-1 ${
                  index === 0
                    ? 'bg-transparent'
                    : isDone || isActive
                      ? 'bg-[#1F4E79]'
                      : 'bg-gray-200'
                }`}
              />
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold ${
                  isDone
                    ? 'border-[#1F4E79] bg-[#1F4E79] text-white'
                    : isActive
                      ? 'border-[#1F4E79] bg-white text-[#1F4E79] ring-2 ring-[#1F4E79]/20'
                      : 'border-gray-300 bg-white text-gray-400'
                }`}
              >
                {isDone ? '✓' : index + 1}
              </span>
              <div
                className={`h-0.5 flex-1 ${
                  index === steps.length - 1
                    ? 'bg-transparent'
                    : isDone
                      ? 'bg-[#1F4E79]'
                      : 'bg-gray-200'
                }`}
              />
            </div>
            <span
              className={`mt-1.5 hidden text-[10px] font-medium leading-tight sm:block ${
                isActive ? 'text-[#1F4E79]' : isDone ? 'text-gray-600' : 'text-gray-400'
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
