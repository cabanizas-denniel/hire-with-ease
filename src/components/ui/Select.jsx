/**
 * Labeled select with optional hint / error.
 */
function Select({
  id,
  label,
  error = '',
  hint = '',
  className = '',
  selectClassName = '',
  required = false,
  children,
  ...rest
}) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;

  return (
    <div className={className}>
      {label ? (
        <label htmlFor={id} className="field-label">
          {label}
          {required ? <span className="text-rose-600"> *</span> : null}
        </label>
      ) : null}
      <select
        id={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`field-input ${error ? 'border-rose-400' : ''} ${selectClassName}`.trim()}
        {...rest}
      >
        {children}
      </select>
      {error ? (
        <p id={`${id}-error`} className="mt-1 text-xs font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p id={`${id}-hint`} className="mt-1 text-xs text-[var(--hwe-muted)]">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export default Select;
