import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

/**
 * Render points as a heatmap layer. `points` is `[{lat, lng, weight}, ...]`.
 *
 * Used twice on the admin page:
 *   - jobs heatmap (demand)
 *   - workers heatmap (supply)
 *
 * Different gradients so the two layers are visually distinct when
 * shown side by side.
 */
function DemandHeatmap({ points = [], gradient, radius = 35, blur = 25 }) {
  const map = useMap();

  useEffect(() => {
    if (!map || !points.length) return undefined;

    const data = points
      .filter((p) => typeof p.lat === 'number' && typeof p.lng === 'number')
      .map((p) => [p.lat, p.lng, p.weight ?? 1]);

    const layer = L.heatLayer(data, {
      radius,
      blur,
      maxZoom: 17,
      gradient,
    }).addTo(map);

    return () => {
      map.removeLayer(layer);
    };
  }, [map, points, gradient, radius, blur]);

  return null;
}

export default DemandHeatmap;
