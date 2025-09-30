

import React, {useEffect, useState} from 'react';
import { useNavigate } from 'react-router-dom';
const CATEGORIES = ['Flooding', 'Tsunami', 'High Waves', 'Coastal Damage'];

export default function Home() {
  const navigate = useNavigate();
  const handleReportHazard = () => {
    navigate('/dashboard');
  };
  const [highlights, setHighlights] = useState([]);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/socialmedia_posts')
      .then(res => res.json())
      .then(data => {
        // Filter posts by keywords matching categories (except 'Other')
        const filtered = data.filter(post =>
          CATEGORIES.some(cat =>
            post.content && post.content.toLowerCase().includes(cat.toLowerCase())
          )
        );
        setHighlights(filtered.slice(0, 5)); // Show top 5 highlights
      });
  }, []);
  return (
    <div className="page home flex flex-column" style={{ minHeight: '80vh', width: '100%' }}>
      <div className="flex flex-row flex-wrap w-100" style={{ flex: 1, alignItems: 'flex-start', justifyContent: 'space-between' }}>
        {/* Left column with welcome message and initiative */}
        <div className="flex flex-row w-100" style={{ width: '100%' }}>
          {/* Left: Welcome message and initiative */}
          <div className="flex flex-column justify-content-between" style={{ flex: 1, maxWidth: '40%' }}>
            <div className="m-2 flex flex-row align-items-center" style={{ gap: '1rem' }}>
              <img src="/harbornet.png" alt="HarborNet Logo" style={{ height: '56px', width: '56px', objectFit: 'contain', borderRadius: '1rem'}} />
              <h1 className="heading-large heading-info" style={{ textAlign: 'left' }}>Welcome to HarborNet</h1>
            </div>
            <div className="card m-1">
              <h2 className="heading-info">Our initiative</h2>
              <p className=''>
                India’s 7,500 km long coastline is home to millions and is regularly exposed to ocean-related hazards such as tsunamis, storm surges, high waves, and coastal flooding. While national agencies like INCOIS provide scientific early warnings using satellites and sensor networks, timely ground-level information from local communities is often missing.<br />
                This platform aims to bridge that gap.<br />
                Our initiative empowers citizens, coastal residents, volunteers, and disaster managers to work together by:
                <ul>
                  <li>Enabling real-time reporting of unusual ocean activity or coastal damage through photos, videos, and location-tagged observations.</li>
                  <li>Aggregating and visualizing crowdsourced reports and social media discussions during hazardous events.</li>
                  <li>Supporting early response and better situational awareness for emergency services and local authorities.</li>
                </ul>
              </p>
            </div>
          </div>
          {/* Center: Latest Updates */}
          <div className="flex flex-column justify-content-center align-items-center p-2" style={{ flex: 1, minWidth: '300px', maxWidth: '300px', margin: '0 1rem' }}>
            <div className="card m-1" style={{ height: '70vh', width: '100%' }}>
              <h2 className="heading-info text-center">Latest Updates</h2>
              {/* Visual alerts, news, etc. */}
            </div>
          </div>
          {/* Right: Social Media Highlights (fix right space) */}
          <div className="flex flex-column justify-content-start align-items-end p-2" style={{ flex: 0.8, minWidth: '300px', maxWidth: '400px', maxHeight: '70vh', margin: '0 1rem' }}>
            <div className="card m-1" style={{ marginTop: '0.5rem', width: '100%', minHeight: '80%', maxHeight: '70vh', overflowY: 'auto' }}>
              <h2 className="heading-info">Social Media Highlights</h2>
                {highlights.length === 0 ? (
                  <p className="text-center" style={{ color: 'var(--color-subtext)' }}>
                    No trending posts found for key hazard categories.
                  </p>
                ) : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {highlights.map(post => (
                      <li
                        key={post.id}
                        className="card"
                        style={{
                          margin: '12px 0',
                          borderLeft: '4px solid var(--color-ocean-300)',
                          background: 'var(--color-surface)',
                          boxShadow: '0 1px 4px #e0e0e0',
                          padding: 16,
                        }}
                      >
                        <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: 4 }}>
                          {post.platform}
                        </div>
                        <div style={{ marginBottom: 6 }}>{post.content}</div>
                        <div style={{ fontSize: 13, color: '#666' }}>
                          By: {post.username || 'Unknown'} | {post.timestamp}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
            </div>
            <div className="m-1" style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'flex-end'}}>
              <div className="m-1">
                <a href="#" className="btn p-3">Download Mobile App</a>
              </div>
              <button className="btn" style={{ marginTop: '0.5rem' }} onClick={handleReportHazard}>Report a Hazard</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}