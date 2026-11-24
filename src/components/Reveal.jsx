import useInView from '../hooks/useInView.js';

/**
 * Scroll (or load) reveal. Visible by default until the observer arms, then fades in once.
 */
function Reveal({
  as: Tag = 'div',
  children,
  className = '',
  delayMs = 0,
  immediate = false,
  ...rest
}) {
  const { ref, show } = useInView({ immediate });

  return (
    <Tag
      ref={ref}
      className={`reveal ${show ? 'reveal-in' : 'reveal-out'} ${className}`.trim()}
      style={delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default Reveal;
