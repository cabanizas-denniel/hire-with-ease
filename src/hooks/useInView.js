import { useEffect, useRef, useState } from 'react';

/**
 * One-shot IntersectionObserver. Defaults to visible until the observer is ready,
 * then hides until the element enters the viewport (unless reduced-motion / no IO).
 */
export function useInView({
  threshold = 0.15,
  rootMargin = '0px 0px -60px 0px',
  immediate = false,
} = {}) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (immediate) {
      setReady(true);
      setVisible(true);
      return undefined;
    }

    const reduce =
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reduce || typeof IntersectionObserver === 'undefined') {
      setReady(true);
      setVisible(true);
      return undefined;
    }

    const el = ref.current;
    if (!el) {
      setReady(true);
      setVisible(true);
      return undefined;
    }

    setReady(true);
    setVisible(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, immediate]);

  return { ref, ready, visible, show: !ready || visible };
}

export default useInView;
