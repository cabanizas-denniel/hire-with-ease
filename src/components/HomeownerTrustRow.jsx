import TrustBadge from './TrustBadge.jsx';
import { shouldShowClientTrustBadge } from '../lib/employerTrust.js';

/**
 * Homeowner name + trust badge (for worker-facing job/application views).
 */
function HomeownerTrustRow({
  name,
  trustTier = null,
  prefix = 'Requested by',
  className = '',
}) {
  const showBadge = shouldShowClientTrustBadge(trustTier);

  if (!name && !showBadge) return null;

  return (
    <div className={`mt-0.5 flex flex-wrap items-center gap-2 ${className}`}>
      {name ? (
        <span className="text-xs text-gray-500">
          {prefix ? `${prefix} ` : ''}
          {name}
        </span>
      ) : null}
      {showBadge ? (
        <TrustBadge tier={trustTier} role="client" size="sm" />
      ) : null}
    </div>
  );
}

export default HomeownerTrustRow;
