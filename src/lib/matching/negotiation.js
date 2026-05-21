/** Negotiation must close within 4 hours of first chat (spec step 4 note). */
export const NEGOTIATION_WINDOW_MS = 4 * 60 * 60 * 1000;

export function negotiationExpiresAt(threadOrIso) {
  if (!threadOrIso) return null;
  if (typeof threadOrIso === 'string') {
    const d = new Date(threadOrIso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (threadOrIso?.negotiationExpiresAtIso) {
    const d = new Date(threadOrIso.negotiationExpiresAtIso);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const startedAt = threadOrIso?.negotiationStartedAt;
  if (!startedAt) return null;
  const t =
    typeof startedAt === 'string'
      ? new Date(startedAt).getTime()
      : startedAt?.toMillis?.() ?? startedAt?.toDate?.()?.getTime?.();
  if (!t || Number.isNaN(t)) return null;
  return new Date(t + NEGOTIATION_WINDOW_MS);
}

export function isNegotiationExpired(thread) {
  if (!thread) return false;
  if (thread.negotiationClosed) return true;
  const exp = negotiationExpiresAt(thread);
  if (!exp) return false;
  return Date.now() > exp.getTime();
}

export function formatNegotiationCountdown(thread) {
  const exp = negotiationExpiresAt(thread);
  if (!exp) return null;
  const ms = exp.getTime() - Date.now();
  if (ms <= 0) return 'Negotiation window ended';
  const h = Math.floor(ms / 3_600_000);
  const m = Math.floor((ms % 3_600_000) / 60_000);
  return h > 0 ? `${h}h ${m}m left to agree` : `${m}m left to agree`;
}
