import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { OLONGAPO_BOUNDS, OLONGAPO_CENTER } from '../../lib/olongapoBarangays.js';
import { useEffect } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet's default marker icons use relative URLs which break under
// Vite's bundling. Rewrite them once on module load to use the bundled
// image assets so markers render correctly.
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

/**
 * Base Leaflet map centered on Olongapo City. Children compose layers
 * (markers, heatmap, etc.) on top of the OpenStreetMap tiles.
 */
function OlongapoMap({ children, height = 520 }) {
  useEffect(() => {
    fixDefaultMarkerIcons();
  }, []);

  return (
    <div className="overflow-hidden rounded-xl shadow-sm" style={{ height }}>
      <MapContainer
        center={[OLONGAPO_CENTER.lat, OLONGAPO_CENTER.lng]}
        zoom={13}
        minZoom={11}
        maxZoom={17}
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
        {children}
      </MapContainer>
    </div>
  );
}

export default OlongapoMap;
