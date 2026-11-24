const VARIANTS = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  strong: 'btn-strong',
  ghost: 'btn-ghost',
};

/**
 * Primary = slate (off-white text), blue on hover.
 * Strong = blue on off-white (slate text). Never amber.
 */
function Button({
  variant = 'primary',
  type = 'button',
  className = '',
  disabled = false,
  children,
  ...rest
}) {
  const base = VARIANTS[variant] || VARIANTS.primary;
  return (
    <button
      type={type}
      disabled={disabled}
      className={`${base} ${className}`.trim()}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
