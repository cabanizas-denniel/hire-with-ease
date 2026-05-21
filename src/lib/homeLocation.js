import { resolveLocation } from './olongapoBarangays.js';
import { formatHomeAddress } from '../utils/clientJobs.js';

/** Map pin shape used by LocationPicker on profile forms. */
export function locationToPin(location, locationDetails = '', coords = null) {
  if (coords?.lat != null && coords?.lng != null) {
    return {
      lat: coords.lat,
      lng: coords.lng,
      barangay: location?.barangay || null,
      label: locationDetails?.trim() || location?.label || null,
    };
  }
  if (!location) return null;
  if (location.lat != null && location.lng != null) {
    return {
      lat: location.lat,
      lng: location.lng,
      barangay: location.barangay || null,
      label: locationDetails?.trim() || location.label || null,
    };
  }
  const name = location.barangay || location.label;
  const point = resolveLocation(name);
  if (!point) return null;
  return {
    lat: point.lat,
    lng: point.lng,
    barangay: point.barangay,
    label: locationDetails?.trim() || location.label || null,
  };
}

export function pinToFirestoreLocation(pin, addressDetails = '', barangay = '') {
  if (!pin?.lat || !pin?.lng) return null;
  const details = addressDetails?.trim() || pin.label?.trim() || '';
  const barangayName = (barangay || pin.barangay || '').trim() || null;
  return {
    lat: pin.lat,
    lng: pin.lng,
    barangay: barangayName,
    label: details || barangayName || null,
  };
}

/** Home location for job posting from a homeowner /users doc. */
export function getHomeownerLocationFromProfile(profile) {
  if (!profile) return null;
  const pin = locationToPin(profile.location, profile.locationDetails, profile.coords);
  return pinToFirestoreLocation(
    pin,
    profile.locationDetails,
    profile.location?.barangay || profile.barangay || ''
  );
}

export function formatProfileHomeAddress(profile) {
  if (!profile) return '';
  const loc = getHomeownerLocationFromProfile(profile);
  if (!loc) return '';
  return formatHomeAddress(loc);
}

export function hasMappableHomeAddress(profile) {
  const loc = getHomeownerLocationFromProfile(profile);
  return Boolean(loc?.lat != null && loc?.lng != null);
}

/** Human-readable coordinates for review screens. */
export function formatCoordsLabel(locationOrPin) {
  const lat = locationOrPin?.lat;
  const lng = locationOrPin?.lng;
  if (lat == null || lng == null) return null;
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

/** Worker/home location bundle saved to Firestore (lat, lng, barangay, label + coords). */
export function buildSavedHomeLocation(pin, addressDetails = '', barangay = '') {
  const location = pinToFirestoreLocation(pin, addressDetails, barangay);
  if (!location) return { location: null, coords: null };
  return {
    location,
    coords: { lat: location.lat, lng: location.lng },
  };
}
