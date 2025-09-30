
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix default marker icon for Leaflet in React
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [15.235, 78.44]; // Delhi
const DEFAULT_ZOOM = 5;

// Custom Heatmap Layer for dynamic hotspots
function HeatmapLayer({ points }) {
  const map = useMap();
  useEffect(() => {
    if (!map || points.length < 2) return;
    // Check map container size before adding heatmap
    const container = map.getContainer();
    const width = container.offsetWidth;
    const height = container.offsetHeight;
    if (width === 0 || height === 0) return;
    const heatLayer = L.heatLayer(points, {
      radius: 30,
      blur: 20,
      maxZoom: 17,
      minOpacity: 0.5,
      gradient: {
        0.2: 'blue',
        0.4: 'lime',
        0.6: 'yellow',
        0.8: 'red'
      }
    }).addTo(map);
    return () => {
      map.removeLayer(heatLayer);
    };
  }, [map, points]);
  return null;
}

export default function MapView() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    // Fetch report data from backend API
    fetch('http://127.0.0.1:5000/api/reports')
      .then(res => res.json())
      .then(data => {
        // Map backend fields to frontend expected fields
        const mapped = (Array.isArray(data) ? data : []).map(r => ({
          ...r,
          lat: r.latitude,
          lng: r.longitude,
          label: r.category || 'Report',
          volume: 1 // or any other logic
        }));
        setReports(mapped);
      })
      .catch(() => {
        // fallback example reports
        setReports([
          { lat: 28.6139, lng: 77.2090, label: 'Flood Report', volume: 5 },
          { lat: 28.6200, lng: 77.2200, label: 'Tsunami Report', volume: 2 },
          { lat: 28.6300, lng: 77.2000, label: 'Cyclone Report', volume: 8 },
        ]);
      });
  }, []);

  // Only use points with valid lat/lng for heatmap
  const validHeatPoints = reports
    .filter(r => typeof r.lat === 'number' && typeof r.lng === 'number' && !isNaN(r.lat) && !isNaN(r.lng))
    .map(r => [r.lat, r.lng, r.volume || 1]); // volume as intensity

  return (
    <MapContainer center={DEFAULT_CENTER} zoom={DEFAULT_ZOOM} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {/* Markers for each report */}
      {reports.map((r, idx) => (
        <Marker key={idx} position={[r.lat, r.lng]}>
          <Popup>
            <strong>{r.label}</strong><br />
            Volume: {r.volume || 1}
          </Popup>
        </Marker>
      ))}
      {/* Dynamic Hotspot Heatmap */}
      {validHeatPoints.length > 1 && <HeatmapLayer points={validHeatPoints} />}
    </MapContainer>
  );
}
