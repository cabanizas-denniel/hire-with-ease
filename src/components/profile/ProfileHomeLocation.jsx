import { useMemo, useState } from 'react';
import LocationPicker from '../maps/LocationPicker.jsx';
import { ALL_BARANGAY_NAMES, nearestBarangay, resolveLocation } from '../../lib/olongapoBarangays.js';

/**
 * Home address: map pin (lat/lng) + barangay dropdown (you confirm) + street details.
 * Barangay from the dropdown is saved for matching — not auto-guessed from the pin alone.
 */
function ProfileHomeLocation({
  pin,
  onPinChange,
  barangay,
  onBarangayChange,
  addressDetails,
  onAddressDetailsChange,
  idPrefix = 'home',
}) {
  const [suggestedBarangay, setSuggestedBarangay] = useState(null);

  const sortedBarangays = useMemo(
    () => [...ALL_BARANGAY_NAMES].sort((a, b) => a.localeCompare(b)),
    []
  );

  const handlePinChange = (nextPin) => {
    onPinChange?.(nextPin);
    if (nextPin?.lat != null && nextPin?.lng != null) {
      const nearest = nearestBarangay(nextPin.lat, nextPin.lng);
      const suggested = nearest?.name || null;
      setSuggestedBarangay(suggested);
      if (!barangay && suggested) {
        onBarangayChange?.(suggested);
      }
    } else {
      setSuggestedBarangay(null);
    }
  };

  const handleBarangaySelect = (name) => {
    onBarangayChange?.(name);
    if (!pin?.lat && name) {
      const point = resolveLocation(name);
      if (point) {
        onPinChange?.({ lat: point.lat, lng: point.lng });
      }
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
          Pin your home on the map
        </p>
        <p className="mt-1 text-xs text-gray-500">
          Tap the map or use <strong>current location</strong> for exact coordinates. Then confirm your{' '}
          <strong>barangay</strong> in the dropdown below — the map guess can be wrong near borders.
        </p>
      </div>

      <LocationPicker
        value={pin}
        onChange={handlePinChange}
        height={260}
        inferBarangay={false}
      />

      <div>
        <label
          htmlFor={`${idPrefix}-barangay`}
          className="mb-1 block text-xs font-medium text-gray-600"
        >
          Barangay in Olongapo <span className="text-red-500">*</span>
        </label>
        <select
          id={`${idPrefix}-barangay`}
          className="w-full cursor-pointer rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          value={barangay}
          onChange={(e) => handleBarangaySelect(e.target.value)}
        >
          <option value="">Select your barangay</option>
          {sortedBarangays.map((name) => (
            <option key={name} value={name}>
              {name}, Olongapo
            </option>
          ))}
        </select>
        {suggestedBarangay && !barangay ? (
          <p className="mt-1 text-[11px] text-gray-500">
            Suggested from map pin: <strong>{suggestedBarangay}</strong> — please confirm in the list.
          </p>
        ) : null}
      </div>

      <div>
        <label
          htmlFor={`${idPrefix}-address-details`}
          className="mb-1 block text-xs font-medium text-gray-600"
        >
          Street / house details
        </label>
        <textarea
          id={`${idPrefix}-address-details`}
          rows={2}
          className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-base"
          placeholder="Street, house no., gate code, landmark..."
          value={addressDetails}
          onChange={(e) => onAddressDetailsChange(e.target.value)}
        />
        <p className="mt-1 text-[11px] text-gray-500">
          Workers see this text address once you accept them for a job.
        </p>
      </div>
    </div>
  );
}

export default ProfileHomeLocation;
