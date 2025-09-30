import React, { useEffect, useState } from 'react';
import Auth from './Auth';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';



// Map for Nearby Alerts, centered on user location
function UserNearbyMap({ userLocation }) {
  const [reports, setReports] = React.useState([]);

  React.useEffect(() => {
    fetch('http://127.0.0.1:5000/api/reports')
      .then(res => res.json())
      .then(data => {
        const mapped = (Array.isArray(data) ? data : []).map(r => ({
          ...r,
          lat: r.latitude,
          lng: r.longitude,
          label: r.category || 'Report',
          volume: 1
        }));
        setReports(mapped);
      });
  }, []);

  if (!userLocation || !userLocation.latitude || !userLocation.longitude) {
    return <div>Fetching your location...</div>;
  }

  return (
    <MapContainer center={[userLocation.latitude, userLocation.longitude]} zoom={16} style={{ height: 300, width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {reports.filter(r => typeof r.lat === 'number' && typeof r.lng === 'number' && !isNaN(r.lat) && !isNaN(r.lng)).map((r, idx) => (
        <Marker key={idx} position={[r.lat, r.lng]}>
          <Popup>
            <strong>{r.label}</strong><br />
            {r.description}
          </Popup>
        </Marker>
      ))}
      <Marker position={[userLocation.latitude, userLocation.longitude]}>
        <Popup>Your Location</Popup>
      </Marker>
    </MapContainer>
  );
}



export default function UserDashboard() {
  // Parse user object from localStorage
  const loggedIn = localStorage.getItem('user');
  let userObj = null;
  try {
    userObj = loggedIn ? JSON.parse(loggedIn) : null;
  } catch (e) {
    userObj = null;
  }
  const [reports, setReports] = useState([]);
  const [popup, setPopup] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportForm, setReportForm] = useState({ category: '', description: '', media: null, latitude: '', longitude: '' });
  const [userLocation, setUserLocation] = useState(null);
  const categories = ['Flooding', 'High Waves', 'Tsunami Alert', 'Coastal Damage', 'Other'];

  useEffect(() => {
    // Fetch only the current user's reports from backend using uploader_id
    if (userObj && userObj.id) {
      fetch(`http://127.0.0.1:5000/api/reports?uploader_id=${userObj.id}`)
        .then(res => res.json())
        .then(data => setReports(data))
        .catch(() => setReports([]));
    }

    // Auto-fetch user location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setReportForm(f => ({
            ...f,
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          }));
          setUserLocation({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        err => {
          setUserLocation(null);
        }
      );
    }
  }, []);

  const handleReportChange = e => {
    const { name, value, files } = e.target;
    setReportForm({
      ...reportForm,
      [name]: files ? files[0] : value
    });
  };

  const handleReportSubmit = async e => {
    e.preventDefault();
    const formData = new FormData();
    if (!userObj || !userObj.id) {
      alert('User not found. Please log in again.');
      return;
    }
    formData.append('uploader_id', userObj.id);
    formData.append('category', reportForm.category);
    formData.append('description', reportForm.description);
    formData.append('latitude', reportForm.latitude);
    formData.append('longitude', reportForm.longitude);
    if (reportForm.media) {
      formData.append('media', reportForm.media);
    }
    try {
      const res = await fetch('http://127.0.0.1:5000/api/report', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setPopup('Report submitted successfully!');
        setTimeout(() => setPopup(''), 3000);
      } else {
        alert(data.error || 'Failed to submit report');
      }
    } catch (err) {
      alert('Error submitting report');
    }
  };

  if (!loggedIn) {
    return <Auth userType="user" />;
  }

  return (
    <main className="dashboard-container" style={{ padding: '2rem', maxWidth: '100%', margin: 'auto', position: 'relative' }}>
      {popup && (
        <div style={{
          position: 'fixed',
          top: '30px',
          left: '50%',
          transform: 'translateX(-50%)',
          background: '#4caf50',
          color: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
        }}>
          {popup}
        </div>
      )}
      <h2 className="heading-info">Welcome to HarborNet Dashboard</h2>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        {/* Left Column: Report Hazard */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <section className="report-hazard card shadow p-3 m-2">
            <h3>Report Hazard</h3>
            <form onSubmit={handleReportSubmit} className="flex flex-column m-2">
              <label>Category</label>
              <select name="category" required value={reportForm.category} onChange={handleReportChange}>
                <option value="">Select Category</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
              <label>Description (optional)</label>
              <textarea name="description" value={reportForm.description} onChange={handleReportChange} />
              <label>Photo/Video</label>
              <input type="file" name="media" accept="image/*,video/*" onChange={handleReportChange} />
              {/* Location is auto-fetched and hidden from manual input */}
              <input type="hidden" name="latitude" value={reportForm.latitude} />
              <input type="hidden" name="longitude" value={reportForm.longitude} />
              <div className="m-1" style={{ color: '#555', fontSize: '0.9rem' }}>
                {reportForm.latitude && reportForm.longitude
                  ? `Location: ${reportForm.latitude}, ${reportForm.longitude}`
                  : 'Fetching location...'}
              </div>
              <button type="submit" className="btn m-2">Submit Report</button>
            </form>
          </section>
        </div>
        {/* Center Column: My Reports */}
        <div style={{ flex: 1, minWidth: '300px', minHeight: '' }}>
          <section className="my-reports card shadow p-3 m-2" style={{ minHeight: '60vh'}}>
            <h3>My Reports</h3>
            {reports.length === 0 ? <p>No reports submitted yet.</p> : (
              <ul>
                {reports.map((r, idx) => (
                  <li key={idx}>
                    <strong>{r.category}</strong> - {r.status} <br />
                    {r.description}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
        {/* Right Column: Notifications & Nearby Alerts */}
        <div style={{ flex: 1, minWidth: '300px' }}>
          <section className="notifications card shadow p-3 m-2">
            <h3>Notifications</h3>
            {notifications.length === 0 ? <p>No notifications.</p> : (
              <ul>
                {notifications.map((n, idx) => (
                  <li key={idx}>{n.message}</li>
                ))}
              </ul>
            )}
          </section>
          <section className="nearby-alerts card shadow p-3 m-2">
            <h3>Nearby Alerts</h3>
            <UserNearbyMap userLocation={userLocation} />
          </section>
        </div>
      </div>
    </main>
  );
}
