import { Link } from 'react-router-dom';
import { HiOutlineMapPin } from 'react-icons/hi2';
import { formatProfileHomeAddress, hasMappableHomeAddress } from '../../lib/homeLocation.js';

/**
 * Read-only home address for job request flow (from homeowner profile).
 */
function SavedHomeAddressCard({ profile, profilePath = '/employer/profile' }) {
  const ready = hasMappableHomeAddress(profile);
  const display = formatProfileHomeAddress(profile);

  if (!ready) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <p className="font-semibold">Home address required</p>
        <p className="mt-1 text-xs text-amber-800">
          Set your home on the map under Profile before posting a service request.
        </p>
        <Link
          to={profilePath}
          className="mt-3 inline-block text-xs font-semibold text-[#1F4E79] underline"
        >
          Go to Profile →
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
      <div className="flex items-start gap-2">
        <HiOutlineMapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#1F4E79]" aria-hidden="true" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Service location (from your profile)
          </p>
          <p className="mt-1 text-sm text-gray-800">{display || '—'}</p>
          <Link
            to={profilePath}
            className="mt-2 inline-block text-xs font-semibold text-[#2E75B6] underline"
          >
            Update home address on Profile
          </Link>
        </div>
      </div>
    </div>
  );
}

export default SavedHomeAddressCard;
