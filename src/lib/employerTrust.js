import { getTrustTier, TIERS } from '../utils/trust.js';

/** Trust tier for a homeowner from their Firestore user doc or verification record. */
export function getClientTrustTier(verification) {
  if (!verification) return TIERS.UNVERIFIED;
  return getTrustTier(verification, 'client');
}

/** Show a badge to workers once PESO has verified the homeowner's identity (tier 2+). */
export function shouldShowClientTrustBadge(tier) {
  const safe = Number(tier) || 0;
  return safe >= TIERS.IDENTITY;
}

export function clientTrustTierFromUserDoc(userDoc) {
  return getClientTrustTier(userDoc?.verification);
}
