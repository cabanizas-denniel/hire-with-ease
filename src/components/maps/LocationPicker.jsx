import { useEffect, useState } from 'react';
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { HiOutlineMapPin } from 'react-icons/hi2';
import {
  OLONGAPO_BOUNDS,
  OLONGAPO_CENTER,
  nearestBarangay,
} from '../../lib/olongapoBarangays.js';

// Leaflet default markers reference relative URLs that break under Vite.
// Same fix used by OlongapoMap, copied here so the picker stays
// independent.
function fixDefaultMarkerIcons() {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
  });
}
fixDefaultMarkerIcons();

const SW = OLONGAPO_BOUNDS.southWest;
const NE = OLONGAPO_BOUNDS.northEast;

function ClickHandler({ onPick }) {
  useMapEvents({
    click: (e) => onPick(e.latlng),
  });
  return null;
}

function FlyTo({ position }) {
  const map = useMap();
  useEffect(() => {
    if (!position) return;
    map.flyTo([position.lat, position.lng], Math.max(map.getZoom(), 16), {
      duration: 0.5,
    });
  }, [map, position]);
  return null;
}

/**
 * Map-based location picker for posting a job.
 *
 * Captures the precise coordinates of the homeowner's address so the
 * worker has navigation-ready data — no more vague "Mabayuan" strings.
 *
 * Props:
 *   - value: { lat, lng, barangay, label } | null
 *   - onChange(value)
 *   - addressDetails: optional free-form text, controlled separately
 */
function LocationPicker({ value, onChange, height = 260 }) {
  const [geoState, setGeoState] = useState({ status: 'idle', error: null });
  const [pendingFly, setPendingFly] = useState(null);

  const isWithinBounds = (lat, lng) =>
    lat >= SW.lat && lat <= NE.lat && lng >= SW.lng && lng <= NE.lng;

  const setPin = (lat, lng) => {
    const nearest = nearestBarangay(lat, lng);
    onChange({
      lat,
      lng,
      barangay: nearest?.name || null,
      // preserve any free-form detail the user typed earlier
      label: value?.label || null,
    });
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoState({
        status: 'error',
        error: 'Your browser does not support location sharing.',
      });
      return;
    }
    setGeoState({ status: 'loading', error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        // Desktop browsers often return an IP/Wi‑Fi based fix that can be far off.
        // Only overwrite the pin when the reading is reasonably accurate.
        if (!isWithinBounds(latitude, longitude)) {
          setGeoState({
            status: 'error',
            error:
              'Your current location appears outside Olongapo City. Please drop the pin manually on the map.',
          });
          return;
        }

        const maxAcceptableAccuracyMeters = 250;
        if (Number.isFinite(accuracy) && accuracy > maxAcceptableAccuracyMeters) {
          setGeoState({
            status: 'error',
            error: `Location isn’t accurate enough yet (±${Math.round(
              accuracy
            )}m). Try again, or place the pin manually.`,
          });
          // Still pan the map to roughly where the device thinks it is,
          // but don't overwrite a user's chosen pin with a low-confidence fix.
          setPendingFly({ lat: latitude, lng: longitude });
          return;
        }

        setPin(latitude, longitude);
        setPendingFly({ lat: latitude, lng: longitude });
        setGeoState({ status: 'idle', error: null });
      },
      (err) => {
        setGeoState({
          status: 'error',
          error:
            err?.message ||
            'Could not get your current location. Please pick on the map instead.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // avoid cached (possibly far away) readings
      }
    );
  };

  const center = value
    ? [value.lat, value.lng]
    : [OLONGAPO_CENTER.lat, OLONGAPO_CENTER.lng];

  return (
    <div className="space-y-2">
      <div
        className="overflow-hidden rounded-xl border border-gray-200 shadow-sm"
        style={{ height }}
      >
        <MapContainer
          center={center}
          zoom={value ? 16 : 13}
          minZoom={11}
          maxZoom={18}
          scrollWheelZoom
          maxBounds={[
            [SW.lat, SW.lng],
            [NE.lat, NE.lng],
          ]}
          maxBoundsViscosity={0.6}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onPick={({ lat, lng }) => setPin(lat, lng)} />
          {value ? (
            <Marker
              position={[value.lat, value.lng]}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const { lat, lng } = e.target.getLatLng();
                  setPin(lat, lng);
                },
              }}
            />
          ) : null}
          {pendingFly ? <FlyTo position={pendingFly} /> : null}
        </MapContainer>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleUseMyLocation}
          disabled={geoState.status === 'loading'}
          className="inline-flex items-center gap-1.5 rounded-lg border border-[#1F4E79] bg-white px-3 py-1.5 text-xs font-semibold text-[#1F4E79] hover:bg-blue-50 disabled:opacity-60"
        >
          <HiOutlineMapPin className="h-4 w-4" aria-hidden="true" />
          {geoState.status === 'loading'
            ? 'Locating…'
            : 'Use my current location'}
        </button>
        {value ? (
          <p className="text-[11px] text-gray-600">
            <span className="font-semibold text-[#1F4E79]">
              {value.barangay || 'Pinned'}
            </span>{' '}
            · {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </p>
        ) : (
          <p className="text-[11px] text-gray-500">
            Tap on the map to drop a pin at your exact address.
          </p>
        )}
      </div>

      {geoState.status === 'error' ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
          {geoState.error}
        </p>
      ) : null}
    </div>
  );
}

export default LocationPicker;
