import React, { useEffect, useState } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart, ArcElement, Tooltip, Legend } from 'chart.js';
import Auth from './Auth';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';
Chart.register(ArcElement, Tooltip, Legend);



// Heatmap Layer for admin map, colored by category
function AdminHeatmapLayer({ reports }) {
  const map = useMap();
  useEffect(() => {
    if (!map || reports.length < 2) return;
    // Pie chart colors for categories
    const catColors = {
      flooding: '#42a5f5',
      tsunami: '#66bb6a',
      'high waves': '#ffa726',
      highwaves: '#ffa726',
      'coastal damage': '#ab47bc',
      coastaldamage: '#ab47bc',
      other: '#ff7043'
    };
    // Group points by category for multi-color heatmap
    const layers = [];
    Object.entries(catColors).forEach(([cat, color]) => {
      const points = reports.filter(r => {
        const c = (r.label || '').toLowerCase().replace(/\s/g, '');
        const catKey = cat.replace(/\s/g, '');
        return c === catKey;
      }).map(r => [r.lat, r.lng, 1]);
      if (points.length > 1) {
        const layer = L.heatLayer(points, {
          radius: 20,
          blur: 0,
          maxZoom: 17,
          minOpacity: 0.9,
          gradient: { 0.2: color, 0.8: color }
        }).addTo(map);
        layers.push(layer);
      }
    });
    return () => { layers.forEach(layer => map.removeLayer(layer)); };
  }, [map, reports]);
  return null;
}



// Admin Interactive Map with filters and marker toggle
function AdminInteractiveMap({ filters }) {
  const [reports, setReports] = React.useState([]);
  const [showMarkers, setShowMarkers] = React.useState(true);
  const [showVerified, setShowVerified] = React.useState(true);

  React.useEffect(() => {
    const status = showVerified ? 'true' : 'false';
    fetch(`http://127.0.0.1:5000/api/reports?verified=${status}`)
      .then(res => res.json())
      .then(data => {
        // Map backend fields to frontend expected fields
        const mapped = (Array.isArray(data) ? data : []).map(r => ({
          ...r,
          lat: r.latitude,
          lng: r.longitude,
          label: r.category || 'Report',
        }));
        setReports(mapped);
      });
  }, [filters, showVerified]);

  // Filter reports by type (hazard)
  const filteredReports = reports.filter(r => {
    let match = true;
    if (filters.type && filters.type !== '' && r.label !== filters.type) match = false;
    // Add more filter logic for location/date if needed
    return match;
  });

  return (
    <div>
      <div style={{ marginBottom: 10, display: 'flex', gap: 24, alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label className="switch">
            <input type="checkbox" checked={showMarkers} onChange={e => setShowMarkers(e.target.checked)} />
            <span className="slider"></span>
          </label>
          <span style={{ minWidth: 80 }}>Show Markers</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label className="switch">
            <input type="checkbox" checked={showVerified} onChange={e => setShowVerified(e.target.checked)} />
            <span className="slider"></span>
          </label>
          <span style={{ minWidth: 80 }}>Show Verified</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <label className="switch">
            <input type="checkbox" checked={!showVerified} onChange={e => setShowVerified(v => !v)} />
            <span className="slider"></span>
          </label>
          <span style={{ minWidth: 100 }}>Show Unverified</span>
        </div>
      </div>
      <MapContainer center={[15.235, 78.44]} zoom={5} style={{ height: 300, width: '100%' }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AdminHeatmapLayer reports={filteredReports} />
        {showMarkers && filteredReports.filter(r => typeof r.lat === 'number' && typeof r.lng === 'number' && !isNaN(r.lat) && !isNaN(r.lng)).map((r, idx) => (
          <Marker key={idx} position={[r.lat, r.lng]}>
            <Popup>
              <strong>{r.label}</strong><br />
              {r.description}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}



export default function AdminDashboard() {
  const loggedIn = localStorage.getItem('admin');
  const [overview, setOverview] = useState({});
  const [verifiedCategoryCounts, setVerifiedCategoryCounts] = useState({
    flooding: 0,
    tsunami: 0,
    highWaves: 0,
    coastalDamage: 0,
    other: 0
  });
  const [reports, setReports] = useState([]);
  const [mapData, setMapData] = useState([]);
  const [socialTrends, setSocialTrends] = useState([]);
  const [agencyActions, setAgencyActions] = useState([]);
  const [filters, setFilters] = useState({ location: '', date: '', type: '' });
  const [centerPanel, setCenterPanel] = useState('report'); // 'report' or 'map'
  const [mediaPopup, setMediaPopup] = useState({ open: false, image: null, video: null });
  const BACKEND_URL = "http://127.0.0.1:5000"; // or your Flask server address

  const fetchReports = () => {
    fetch('http://127.0.0.1:5000/api/reports?verified=false')
      .then(res => res.json())
      .then(data => setReports(data))
      .catch(() => setReports([]));
  };
  useEffect(() => {
    const fetchOverview = () => {
      fetch('http://127.0.0.1:5000/api/overview')
        .then(res => res.json())
        .then(data => setOverview(data))
        .catch(() => setOverview({}));
      // Fetch only verified reports for category counts
      fetch('http://127.0.0.1:5000/api/reports?verified=true')
        .then(res => res.json())
        .then(data => {
          // Aggregate counts by category (case-insensitive)
          const counts = { flooding: 0, tsunami: 0, highWaves: 0, coastalDamage: 0, other: 0 };
          data.forEach(r => {
            const cat = (r.category || '').toLowerCase();
            if (cat === 'flooding') counts.flooding++;
            else if (cat === 'tsunami' || cat === 'tsunami alert') counts.tsunami++;
            else if (cat === 'high waves') counts.highWaves++;
            else if (cat === 'coastal damage') counts.coastalDamage++;
            else counts.other++;
          });
          setVerifiedCategoryCounts(counts);
        })
        .catch(() => setVerifiedCategoryCounts({ flooding: 0, tsunami: 0, highWaves: 0, coastalDamage: 0, other: 0 }));
    };
    fetchOverview();
    fetchReports();
    // Poll overview every 10 seconds for live update
    const interval = setInterval(fetchOverview, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleApprove = async (id) => {
    await fetch('http://127.0.0.1:5000/api/report/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchReports();
  };

  const handleReject = async (id) => {
    await fetch('http://127.0.0.1:5000/api/report/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchReports();
  };

  const handleVerify = (report) => {
    setMediaPopup({
      open: true,
      image: report.image_path,
      video: report.video_path
    });
  };

  if (!loggedIn) {
    return <Auth userType="admin" />;
  }

  return (
  <main className="admin-dashboard-container" style={{ padding: '2rem', width: '95vw', minHeight: '78vh', margin: 0 }}>
      <h2 className="heading-info">Admin Dashboard</h2>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Overview Panel & Interactive Map Button */}
        <div style={{ flex: 0.5, minWidth: '150px' }}>
          <section className="overview-panel card shadow p-3 m-2" style={{ minHeight: '50vh' }}>
            <h3>Overview Panel</h3>
            {/* Real-time counts and verified/unverified summary */}
            <div>
              <p>Flooding: {verifiedCategoryCounts.flooding}</p>
              <p>Tsunami: {verifiedCategoryCounts.tsunami}</p>
              <p>High Waves: {verifiedCategoryCounts.highWaves}</p>
              <p>Coastal Damage: {verifiedCategoryCounts.coastalDamage}</p>
              <p>Other: {verifiedCategoryCounts.other}</p>
              <p>Verified: {overview.verified || 0} / Unverified: {overview.unverified || 0}</p>
              {/* Pie/Donut Chart for categories (verified only) */}
              <div style={{ maxWidth: 250, margin: '0 auto' }}>
                <Pie
                  data={{
                    labels: ['Flooding', 'Tsunami', 'High Waves', 'Coastal Damage', 'Other'],
                    datasets: [
                      {
                        data: [
                          verifiedCategoryCounts.flooding,
                          verifiedCategoryCounts.tsunami,
                          verifiedCategoryCounts.highWaves,
                          verifiedCategoryCounts.coastalDamage,
                          verifiedCategoryCounts.other
                        ],
                        backgroundColor: [
                          '#42a5f5',
                          '#66bb6a',
                          '#ffa726',
                          '#ab47bc',
                          '#ff7043'
                        ],
                        borderWidth: 1
                      }
                    ]
                  }}
                  options={{
                    plugins: {
                      legend: { display: true, position: 'bottom' },
                      tooltip: { enabled: true }
                    },
                    cutout: '60%', // donut style
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                  height={200}
                />
              </div>
            </div>
          </section>
          <button className="btn m-2" onClick={() => setCenterPanel(centerPanel === 'report' ? 'map' : 'report')}>
            {centerPanel === 'report' ? 'Show Interactive Map' : 'Show Report Management'}
          </button>
        </div>
        {/* Center Column: Toggle between Report Management and Interactive Map */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          {centerPanel === 'report' ? (
            <section className="report-management card shadow p-3 m-2">
              <h3>Report Management</h3>
              {reports.length === 0 ? <p>No reports found.</p> : (
                <ul>
                  {reports.map((r, idx) => (
                    <li key={idx}>
                      <strong>{r.category}</strong> - {r.status} <br />
                      {r.description}
                      <div style={{ marginTop: '0.5rem' }}>
                        <button className="btn m-1" onClick={() => handleApprove(r.id)}>Approve</button>
                        <button className="btn m-1" onClick={() => handleVerify(r)}>Verify</button>
                        <button className="btn m-1" onClick={() => handleReject(r.id)}>Reject</button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
              {mediaPopup.open && (
                <div style={{
                  position: 'fixed',
                  top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.5)',
                  zIndex: 2000,
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <div style={{ background: 'white', padding: 20, borderRadius: 8, maxWidth: 600, maxHeight: '90vh', overflow: 'auto', position: 'relative' }}>
                    <button style={{ position: 'absolute', top: 10, right: 10 }} onClick={() => setMediaPopup({ open: false, image: null, video: null })}>Close</button>
                    {mediaPopup.image && <img src={BACKEND_URL + mediaPopup.image} alt="Report Media" style={{ maxWidth: '100%', maxHeight: 400 }} />}
                    {mediaPopup.video && <video src={BACKEND_URL + mediaPopup.video} controls style={{ maxWidth: '100%', maxHeight: 400 }} />}
                    {!mediaPopup.image && !mediaPopup.video && <div>No media available.</div>}
                  </div>
                </div>
              )}
            </section>
          ) : (
            <section className="interactive-map card shadow p-3 m-2">
              <h3>Interactive Map</h3>
              <AdminInteractiveMap filters={filters} />
              <div className="filters m-2">
                <label>Location</label>
                <input type="text" name="location" value={filters.location} onChange={e => setFilters({ ...filters, location: e.target.value })} />
                <label>Date</label>
                <input type="date" name="date" value={filters.date} onChange={e => setFilters({ ...filters, date: e.target.value })} />
                <label>Hazard Type</label>
                <select name="type" value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
                  <option value="">All</option>
                  <option value="Flooding">Flooding</option>
                  <option value="High Waves">High Waves</option>
                  <option value="Tsunami">Tsunami</option>
                  <option value="Coastal Damage">Coastal Damage</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </section>
          )}
        </div>
        {/* Right Column: Social Media Trends & Agency Actions */}
        <div style={{ flex: 0.6, minWidth: '300px' }}>
          <section className="social-trends card shadow p-3 m-2">
            <h3>Social Media Trends</h3>
            {socialTrends.length === 0 ? <p>No trends found.</p> : (
              <ul>
                {socialTrends.map((trend, idx) => (
                  <li key={idx}>
                    <strong>{trend.text}</strong> <br />
                    Sentiment: {trend.sentiment}
                  </li>
                ))}
              </ul>
            )}
          </section>
          <section className="agency-actions card shadow p-3 m-2">
            <h3>Agency Actions</h3>
            <button className="btn m-2">Push Alert to Citizens</button>
            <button className="btn m-2">Download Data</button>
            <button className="btn m-2">Share with Early Warning Systems</button>
          </section>
        </div>
      </div>
    </main>
  );
}
