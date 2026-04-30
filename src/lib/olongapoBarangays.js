/**
 * Approximate barangay centroids for Olongapo City, Zambales, Philippines.
 *
 * These are point coordinates used for cold-start visualization on the
 * map (markers, heatmap density). Positions are approximate centers of
 * each barangay and are good enough for thesis demo / aggregation buckets.
 *
 * Names match the strings used in the existing /data/* mock files so the
 * Firestore seed can resolve `location` strings (e.g. "Mabayuan") into
 * `{ lat, lng, barangay }` records.
 *
 * If a name in /data does not match the official 17 barangays it is
 * mapped to the closest reasonable centroid (e.g. "Kababae" -> near
 * "New Kababae"). For real production you would refine these or geocode
 * actual addresses.
 */

export const OLONGAPO_CENTER = { lat: 14.8389, lng: 120.2842 };

export const OLONGAPO_BOUNDS = {
  // Loose bounding box covering all 17 barangays.
  southWest: { lat: 14.795, lng: 120.245 },
  northEast: { lat: 14.910, lng: 120.320 },
};

export const BARANGAYS = {
  Asinan:           { lat: 14.8440, lng: 120.2880 },
  Banicain:         { lat: 14.8380, lng: 120.2800 },
  Barretto:         { lat: 14.8900, lng: 120.2620 },
  'East Bajac-bajac': { lat: 14.8320, lng: 120.2830 },
  'East Tapinac':   { lat: 14.8240, lng: 120.2780 },
  'Gordon Heights': { lat: 14.8500, lng: 120.2950 },
  Kalaklan:         { lat: 14.8570, lng: 120.2770 },
  Mabayuan:         { lat: 14.8600, lng: 120.2810 },
  'New Cabalan':    { lat: 14.8230, lng: 120.3000 },
  'New Ilalim':     { lat: 14.8460, lng: 120.2770 },
  'New Kababae':    { lat: 14.8370, lng: 120.2900 },
  'New Kalalake':   { lat: 14.8450, lng: 120.2820 },
  'Old Cabalan':    { lat: 14.8150, lng: 120.3050 },
  'Pag-asa':        { lat: 14.8400, lng: 120.2730 },
  'Santa Rita':     { lat: 14.8290, lng: 120.2870 },
  'West Bajac-bajac': { lat: 14.8340, lng: 120.2750 },
  'West Tapinac':   { lat: 14.8240, lng: 120.2700 },
};

// Names that appear in mock /data but are not one of the 17 official barangays.
// Resolve them to the closest reasonable centroid so the heatmap still renders.
const ALIASES = {
  'New Asinan': 'Asinan',
  Kababae: 'New Kababae',
};

/**
 * Resolve a free-form location string to a `{ lat, lng, barangay }` record.
 * Returns `null` when the location is unrecognized; callers should decide
 * whether to drop the document, fall back to the city center, or log a warning.
 */
export function resolveLocation(name) {
  if (!name || typeof name !== 'string') return null;
  const trimmed = name.trim();
  const alias = ALIASES[trimmed];
  const key = alias || trimmed;
  const point = BARANGAYS[key];
  if (!point) return null;
  return { lat: point.lat, lng: point.lng, barangay: key };
}

/**
 * Reverse: given a coordinate, find the closest known barangay centroid.
 * We use a flat (lat,lng) Euclidean distance which is fine for the scale
 * of a single city. Returns `{ name, distanceKm }`.
 */
export function nearestBarangay(lat, lng) {
  if (typeof lat !== 'number' || typeof lng !== 'number') return null;
  let best = null;
  for (const [name, point] of Object.entries(BARANGAYS)) {
    const dx = (lat - point.lat) * 111; // ~km per degree of latitude
    const dy =
      (lng - point.lng) * 111 * Math.cos((point.lat * Math.PI) / 180);
    const d = Math.sqrt(dx * dx + dy * dy);
    if (!best || d < best.distanceKm) {
      best = { name, distanceKm: d };
    }
  }
  return best;
}

export const ALL_BARANGAY_NAMES = Object.keys(BARANGAYS);
