import { useEffect, useId, useRef, useState } from 'react';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY;

function loadTurnstileScript() {
  if (typeof window === 'undefined') return Promise.resolve(false);
  if (window.turnstile) return Promise.resolve(true);
  if (window.__hweTurnstileLoading) return window.__hweTurnstileLoading;

  window.__hweTurnstileLoading = new Promise((resolve) => {
    const existing = document.querySelector('script[data-turnstile="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(Boolean(window.turnstile)));
      existing.addEventListener('error', () => resolve(false));
      return;
    }

    const s = document.createElement('script');
    s.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    s.async = true;
    s.defer = true;
    s.dataset.turnstile = 'true';
    s.onload = () => resolve(Boolean(window.turnstile));
    s.onerror = () => resolve(false);
    document.head.appendChild(s);
  });

  return window.__hweTurnstileLoading;
}

/**
 * Cloudflare Turnstile CAPTCHA (client-side gate).
 *
 * NOTE: This only blocks the UI. For real abuse prevention you should
 * verify the token server-side (or use Firebase App Check / Cloud Function
 * sign-up) before creating accounts.
 */
export default function Turnstile({
  onToken,
  onError,
  className = '',
  action = 'register',
}) {
  const id = useId();
  const containerId = `turnstile-${id}`;
  const widgetIdRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function mount() {
      if (!SITE_KEY) {
        onError?.('Captcha is not configured (missing VITE_TURNSTILE_SITE_KEY).');
        return;
      }

      const ok = await loadTurnstileScript();
      if (cancelled) return;
      if (!ok || !window.turnstile) {
        onError?.('Could not load captcha. Please check your connection and try again.');
        return;
      }

      const container = document.getElementById(containerId);
      if (!container) return;

      // If we already rendered one, reset it.
      if (widgetIdRef.current != null) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
        widgetIdRef.current = null;
      }

      widgetIdRef.current = window.turnstile.render(container, {
        sitekey: SITE_KEY,
        action,
        theme: 'light',
        callback: (token) => onToken?.(token),
        'error-callback': () => onError?.('Captcha failed. Please try again.'),
        'expired-callback': () => onToken?.(''),
      });

      setReady(true);
    }

    mount();
    return () => {
      cancelled = true;
      if (widgetIdRef.current != null && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          /* noop */
        }
      }
      widgetIdRef.current = null;
    };
  }, [containerId, onToken, onError, action]);

  return (
    <div className={className}>
      <div id={containerId} />
      {!ready && SITE_KEY ? (
        <p className="mt-1 text-[11px] text-gray-500">Loading captcha…</p>
      ) : null}
    </div>
  );
}

