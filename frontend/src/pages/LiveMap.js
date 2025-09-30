
import React from 'react';
import MapView from '../MapView';

export default function LiveMap() {
  return (
    <main className="flex flex-center w-100" style={{ minHeight: '100%' }}>
      <section className="map-view card shadow p-3" style={{ maxWidth: '100%', width: '100%' }}>
        <h2 className="heading-info text-center m-2">🗺️ Map View</h2>
        <div className="flex flex-center" style={{ height: '500px', width: '100%' }}>
          <MapView />
        </div>
      </section>
    </main>
  );
}