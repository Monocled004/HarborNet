
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import Home from './pages/Home';
import Auth from './pages/Auth';
import UserDashboard from './pages/UserDashboard';
import LiveMap from './pages/LiveMap';
import SocialMonitor from './pages/SocialMonitor';
import AdminDashboard from './pages/AdminDashboard';
import ReportArchive from './pages/ReportArchive';
import HelpResources from './pages/HelpResources';

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pages = [
    { path: '/', label: 'Home' },
    { path: '/auth', label: 'Login/Register' },
    { path: '/dashboard', label: 'User Dashboard' },
    { path: '/map', label: 'Live Map' },
    { path: '/social', label: 'Social Monitor' },
    { path: '/admin', label: 'Admin Dashboard' },
    { path: '/archive', label: 'Report Archive' },
    { path: '/help', label: 'Help & Resources' },
  ];
  return (
    <Router>
      <div style={{ padding: '1rem', background: 'var(--color-bg)', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button className="btn" onClick={() => setSidebarOpen(true)}>
          ☰ Menu
        </button>
      </div>
      <div
        className="sidebar"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          width: '260px',
          background: '#fff',
          boxShadow: '2px 0 8px rgba(0,0,0,0.1)',
          zIndex: 1000,
          padding: '2rem 1rem',
          transform: sidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(.4,0,.2,1)',
          pointerEvents: sidebarOpen ? 'auto' : 'none',
        }}
      >
        <button className="btn" style={{ marginBottom: '2rem', width: '100%' }} onClick={() => setSidebarOpen(false)}>
          Close
        </button>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {pages.map(page => (
            <Link key={page.path} to={page.path} className="btn" style={{ textAlign: 'left' }} onClick={() => setSidebarOpen(false)}>
              {page.label}
            </Link>
          ))}
        </nav>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/map" element={<LiveMap />} />
        <Route path="/social" element={<SocialMonitor />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/archive" element={<ReportArchive />} />
        <Route path="/help" element={<HelpResources />} />
      </Routes>
    </Router>
  );
}


export default App;
