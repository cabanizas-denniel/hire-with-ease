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
 * Map-based home location picker (worker & homeowner profiles).
 *
 * Captures precise coordinates for matching and directions.
 *
 * Props:
 *   - value: { lat, lng, barangay?, label? } | null
 *   - onChange(value)
 *   - inferBarangay: when true, auto-labels nearest centroid (legacy); profiles use false + dropdown
 */
function LocationPicker({ value, onChange, height = 260, inferBarangay = true }) {
  const [geoState, setGeoState] = useState({ status: 'idle', error: null });
  const [pendingFly, setPendingFly] = useState(null);

  const isWithinBounds = (lat, lng) =>
    lat >= SW.lat && lat <= NE.lat && lng >= SW.lng && lng <= NE.lng;

  const setPin = (lat, lng) => {
    const next = {
      lat,
      lng,
      label: value?.label || null,
    };
    if (inferBarangay) {
      const nearest = nearestBarangay(lat, lng);
      next.barangay = nearest?.name || null;
    }
    onChange(next);
  };

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setGeoState({
        status: 'error',
        error:
          'Your browser does not support location sharing. Use the demo Olongapo pin or drop a pin on the map.',
      });
      return;
    }
    setGeoState({ status: 'loading', error: null });
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;

        if (!isWithinBounds(latitude, longitude)) {
          setGeoState({
            status: 'error',
            error:
              'Your GPS is outside Olongapo City (e.g. testing from elsewhere). Use “Demo Olongapo pin” below, or drop a pin manually on the map. Product scope remains Olongapo.',
          });
          return;
        }

        const maxAcceptableAccuracyMeters = 250;
        if (Number.isFinite(accuracy) && accuracy > maxAcceptableAccuracyMeters) {
          setGeoState({
            status: 'error',
            error: `Location isn’t accurate enough yet (±${Math.round(
              accuracy
            )}m). Try again, place the pin manually, or use the demo Olongapo pin.`,
          });
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
            'Could not get your current location. Use the demo Olongapo pin or pick on the map.',
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  const handleDemoPin = () => {
    const lat = OLONGAPO_CENTER.lat;
    const lng = OLONGAPO_CENTER.lng;
    setPin(lat, lng);
    setPendingFly({ lat, lng });
    setGeoState({ status: 'idle', error: null });
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
        <div className="flex flex-wrap gap-2">
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
          <button
            type="button"
            onClick={handleDemoPin}
            className="inline-flex items-center gap-1.5 rounded-lg border border-amber-400 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100"
          >
            Use demo Olongapo pin
          </button>
        </div>
        {value ? (
          <p className="text-[11px] text-gray-600">
            {inferBarangay ? (
              <>
                <span className="font-semibold text-[#1F4E79]">
                  {value.barangay || 'Pinned'}
                </span>{' '}
                ·{' '}
              </>
            ) : null}
            {value.lat.toFixed(5)}, {value.lng.toFixed(5)}
          </p>
        ) : (
          <p className="text-[11px] text-gray-500">
            Tap on the map to drop a pin at your exact address.
          </p>
        )}
      </div>

      {geoState.status === 'error' ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
          <p>{geoState.error}</p>
          <button
            type="button"
            onClick={handleDemoPin}
            className="mt-2 font-semibold text-[#1F4E79] underline"
          >
            Place demo Olongapo pin
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default LocationPicker;
