/**
 * Trust tier computation + rating aggregation helpers.
 *
 * Tier definition (prototype rules, matches the PESO onboarding flow):
 *   Tier 0 — Unverified (nothing completed yet)
 *   Tier 1 — Email verified (Stage 1 OTP done)
 *   Tier 2 — Identity Reviewed (Stage 1 + Stage 2 reviewed by admin)
 *   Tier 3 — Document-Backed (Tier 2 + Stage 3 has >=1 admin-reviewed doc)
 *   Tier 4 — Fully Verified (Tier 2 + Stage 4 admin activation; Stage 3 optional but strong)
 *
 * The "Verified" badge across the app displays only at Tier 4 for service providers.
 * Clients have the same tier semantics but the activation rule is relaxed (see below).
 */

export const TIERS = {
  UNVERIFIED: 0,
  PHONE: 1,
  IDENTITY: 2,
  DOCUMENT: 3,
  FULL: 4,
};

export const TIER_LABELS = {
  0: 'Unverified',
  1: 'Email verified',
  2: 'Identity Reviewed',
  3: 'Document-Backed',
  4: 'Fully Verified',
};

export const TIER_DESCRIPTIONS = {
  0: 'Not yet registered for verification.',
  1: 'Email address confirmed via verification code.',
  2: 'Government ID and selfie reviewed by a PESO officer.',
  3: 'Identity + supporting documents (Barangay clearance, TESDA, etc.) on file.',
  4: 'Activated by PESO. Cleared to accept or post jobs on the platform.',
};

export function getTierLabelForRole(tier, role = 'service-provider') {
  const safe = Math.max(0, Math.min(4, Number(tier) || 0));
  if (role === 'client') {
    if (safe === TIERS.IDENTITY) return 'Trusted';
    if (safe === TIERS.FULL) return 'Fully Trusted';
  }
  return TIER_LABELS[safe] ?? TIER_LABELS[0];
}

export function getTierDescriptionForRole(tier, role = 'service-provider') {
  const safe = Math.max(0, Math.min(4, Number(tier) || 0));
  if (role === 'client') {
    if (safe === TIERS.IDENTITY) {
      return 'Identity verified by PESO. Higher trust is granted once supporting documents are reviewed.';
    }
    if (safe === TIERS.FULL) {
      return 'Identity + supporting documents reviewed. This account is fully trusted.';
    }
  }
  return TIER_DESCRIPTIONS[safe] ?? TIER_DESCRIPTIONS[0];
}

export const TIER_COLORS = {
  0: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  1: { bg: 'bg-sky-50', text: 'text-sky-800', border: 'border-sky-200' },
  2: { bg: 'bg-indigo-50', text: 'text-indigo-800', border: 'border-indigo-200' },
  3: { bg: 'bg-violet-50', text: 'text-violet-800', border: 'border-violet-200' },
  4: { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
};

/** Normalize Firestore / legacy values for stage-2 review (case-insensitive). */
export function normalizeStage2ReviewStatus(status) {
  if (status == null || status === '') return 'not-started';
  const s = String(status).trim().toLowerCase();
  if (s === 'reviewed' || s === 'approved') return 'reviewed';
  if (s === 'rejected' || s === 'declined' || s === 'denied') return 'rejected';
  if (s === 'pending') return 'pending';
  if (s === 'not-started' || s === 'not_started') return 'not-started';
  return 'not-started';
}

export function getTrustTier(record, role = 'service-provider') {
  if (!record) return TIERS.UNVERIFIED;
  const { stage1, stage2, stage3, stage4 } = record;

  const stage2Status = normalizeStage2ReviewStatus(stage2?.reviewStatus);
  const identityReviewed = stage2Status === 'reviewed';
  const documentBacked = Boolean(stage3?.documentBacked);
  const activated = Boolean(stage4?.activatedAt);

  if (role === 'service-provider') {
    if (activated && identityReviewed) return TIERS.FULL;
    if (documentBacked && identityReviewed) return TIERS.DOCUMENT;
    if (identityReviewed) return TIERS.IDENTITY;
    // Email verification is now enforced by Firebase Auth (`email_verified`)
    // and Firestore rules, so Tier 1 is implicit.
    return TIERS.PHONE;
  }

  // Clients: activation is implicit once ID is reviewed; docs are "higher trust".
  if (identityReviewed && documentBacked) return TIERS.FULL;
  if (identityReviewed) return TIERS.IDENTITY;
  return TIERS.PHONE;
}

export function getTierLabel(tier) {
  return TIER_LABELS[tier] ?? TIER_LABELS[0];
}

export function isFullyVerified(record, role = 'service-provider') {
  return getTrustTier(record, role) >= TIERS.FULL;
}

export function getStageProgress(record, role = 'service-provider') {
  const tier = getTrustTier(record, role);
  const { stage1, stage2, stage3, stage4 } = record || {};

  return {
    tier,
    stages: {
      stage1: {
        state: 'complete',
        completedAt: stage1?.otpVerifiedAt ?? null,
      },
      stage2: {
        state: normalizeStage2ReviewStatus(stage2?.reviewStatus),
        submittedAt: stage2?.idSubmittedAt ?? null,
        reviewedAt: stage2?.reviewedAt ?? null,
        reviewNote: stage2?.reviewNote ?? '',
      },
      stage3: {
        state: stage3?.documentBacked
          ? 'complete'
          : (stage3?.documents?.length || 0) > 0
            ? 'in-review'
            : 'not-started',
        documentCount: stage3?.documents?.length || 0,
        reviewedDocumentCount: (stage3?.documents || []).filter((d) => d.reviewed).length,
      },
      stage4: {
        state: stage4?.activatedAt ? 'complete' : 'pending',
        activatedAt: stage4?.activatedAt ?? null,
        activatedBy: stage4?.activatedBy ?? null,
      },
    },
  };
}

/* -------------------------------------------------------------------------- */
/*  Rating aggregation                                                         */
/* -------------------------------------------------------------------------- */

export function getAvgRating(ratings = []) {
  if (!ratings.length) return null;
  const sum = ratings.reduce((acc, r) => acc + (Number(r.stars) || 0), 0);
  return Number((sum / ratings.length).toFixed(2));
}

export function getRatingBreakdown(ratings = []) {
  const breakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  for (const r of ratings) {
    const s = Math.max(1, Math.min(5, Math.round(Number(r.stars) || 0)));
    breakdown[s] += 1;
  }
  return breakdown;
}

export function getCategoryAverages(ratings = []) {
  const totals = { punctuality: 0, quality: 0, communication: 0 };
  const counts = { punctuality: 0, quality: 0, communication: 0 };

  for (const r of ratings) {
    const c = r.categories || {};
    for (const key of Object.keys(totals)) {
      if (typeof c[key] === 'number') {
        totals[key] += c[key];
        counts[key] += 1;
      }
    }
  }

  const out = {};
  for (const key of Object.keys(totals)) {
    out[key] = counts[key] ? Number((totals[key] / counts[key]).toFixed(2)) : null;
  }
  return out;
}

export function getReviewStats(ratings = []) {
  return {
    count: ratings.length,
    avg: getAvgRating(ratings),
    breakdown: getRatingBreakdown(ratings),
    categoryAverages: getCategoryAverages(ratings),
    latest: [...ratings]
      .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt))
      .slice(0, 3),
  };
}
