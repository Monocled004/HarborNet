import React, { useEffect, useState } from 'react';

export default function SocialMonitor() {
  const [posts, setPosts] = useState([]);
  const [platform, setPlatform] = useState('Twitter');
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);

  const loadPosts = () => {
    setLoading(true);
    fetch('http://127.0.0.1:5000/api/socialmedia_posts')
      .then(res => res.json())
      .then(data => {
        setPosts(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const fetchNewPosts = () => {
    setFetching(true);
    fetch('http://127.0.0.1:5000/api/fetch_socialmedia', { method: 'POST' })
      .then(() => {
        loadPosts();
        setFetching(false);
      })
      .catch(() => setFetching(false));
  };

  const filteredPosts = posts.filter(p => p.platform === platform);

  return (
    <main>
      <section className="social-monitor">
        <h2>Social Media Monitor</h2>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
          <label className="switch">
            <input
              type="checkbox"
              checked={platform === 'YouTube'}
              onChange={() => setPlatform(platform === 'Twitter' ? 'YouTube' : 'Twitter')}
            />
            <span className="slider"></span>
          </label>
          <span style={{ minWidth: 80 }}>{platform}</span>
          <button
            className="btn"
            style={{ marginLeft: 'auto' }}
            onClick={fetchNewPosts}
            disabled={fetching}
          >
            {fetching ? 'Fetching...' : 'Reload & Fetch New Posts'}
          </button>
        </div>
        <div className="card" style={{ minHeight: 300 }}>
          {loading ? (
            <p>Loading posts...</p>
          ) : filteredPosts.length === 0 ? (
            <p>No {platform} posts found.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {filteredPosts.map(post => (
                <div key={post.id} style={{ border: '1.5px solid #bdbdbd', borderRadius: 8, padding: 12, background: '#fafbfc', boxShadow: '0 1px 4px #e0e0e0' }}>
                  <div style={{ fontWeight: 600, color: '#1976d2', marginBottom: 4 }}>{post.platform}</div>
                  <div style={{ marginBottom: 6 }}>{post.content}</div>
                  <div style={{ fontSize: 13, color: '#666' }}>By: {post.username || 'Unknown'} | {post.timestamp}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}