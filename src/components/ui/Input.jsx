/**
 * Labeled text field with optional hint / error (inline validation).
 */
function Input({
  id,
  label,
  type = 'text',
  error = '',
  hint = '',
  className = '',
  inputClassName = '',
  required = false,
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
      <input
        id={id}
        type={type}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`field-input ${error ? 'border-rose-400' : ''} ${inputClassName}`.trim()}
        {...rest}
      />
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

export default Input;
