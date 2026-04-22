import { HiOutlineCheckBadge, HiOutlineShieldCheck } from 'react-icons/hi2';
import { TIER_COLORS, TIER_LABELS, TIERS } from '../utils/trust.js';

function TrustBadge({ tier = 0, size = 'sm', className = '' }) {
  const safeTier = Math.max(0, Math.min(4, Number(tier) || 0));
  const colors = TIER_COLORS[safeTier];
  const label = TIER_LABELS[safeTier];

  const sizing =
    size === 'lg'
      ? 'px-3 py-1.5 text-sm'
      : size === 'md'
        ? 'px-2.5 py-1 text-xs'
        : 'px-2 py-0.5 text-[11px]';

  const Icon = safeTier >= TIERS.FULL ? HiOutlineCheckBadge : HiOutlineShieldCheck;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border font-semibold ${colors.bg} ${colors.text} ${colors.border} ${sizing} ${className}`}
      title={`Trust tier: ${label}`}
    >
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>
  );
}

export default TrustBadge;
