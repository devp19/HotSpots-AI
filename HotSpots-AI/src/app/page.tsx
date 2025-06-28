'use client';

import { useCallback } from 'react';
import Map, { NavigationControl } from 'react-map-gl';

const INITIAL_VIEW_STATE = {
  latitude: 43.6532,
  longitude: -79.3832,
  zoom: 14.5,
  pitch: 60,
  bearing: 0,
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

export default function Home() {
  // Only handle 3D buildings layer
  const handleMapLoad = useCallback((event: any) => {
    const map = event.target;
    map.once('style.load', () => {
      const layers = map.getStyle().layers || [];
      const labelLayerId = layers.find(
        (layer: any) =>
          layer.type === 'symbol' &&
          layer.layout &&
          layer.layout['text-field']
      )?.id;

      if (map.getLayer('building')) {
        map.removeLayer('building');
      }

      map.addLayer(
        {
          id: '3d-buildings',
          source: 'composite',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 14,
          paint: {
            'fill-extrusion-color': '#999',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14, 0,
              14.05, ['get', 'height']
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14, 0,
              14.05, ['get', 'min_height']
            ],
            'fill-extrusion-opacity': 0.9,
          }
        },
        labelLayerId
      );
    });
  }, []);

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000' }}>
      <Map
        mapboxAccessToken={MAPBOX_TOKEN}
        mapStyle="mapbox://styles/mapbox/standard"
        style={{ width: '100%', height: '100%' }}
        initialViewState={INITIAL_VIEW_STATE}
        onLoad={handleMapLoad}
      >
        <NavigationControl position="top-left" />
      </Map>
    </div>
  );
}
