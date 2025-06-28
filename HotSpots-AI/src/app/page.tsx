'use client';

import { useEffect, useState } from 'react';
import Map, { NavigationControl } from 'react-map-gl';
import { DeckGL } from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { GeoJsonLayer } from '@deck.gl/layers';
import { MapContainer, TileLayer, GeoJSON, Tooltip } from 'react-leaflet';

const INITIAL_VIEW_STATE = {
  latitude: 43.6532,  
  longitude: -79.3832,
  zoom: 14.5,
  pitch: 60,
  bearing: 0,
};


const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

function onEachFeature(feature: any, layer: any) {
  if (feature.properties) {
    let tooltipContent = `
      <strong>Prediction:</strong> ${feature.properties.vulnerability}<br/>
      <strong>Tree Density:</strong> ${feature.properties.tree_density}<br/>
      <strong>Building Density:</strong> ${feature.properties.building_density}
    `;
    layer.bindTooltip(tooltipContent);
  }
}

export default function Home() {
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [heatData, setHeatData] = useState<any>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);
  // const [pulse, setPulse] = useState(0);

  // // Animate pulse for heatmap
  // useEffect(() => {
  //   let animationFrame: number;
  //   const animate = () => {
  //     setPulse(performance.now());
  //     animationFrame = requestAnimationFrame(animate);
  //   };
  //   animate();
  //   return () => cancelAnimationFrame(animationFrame);
  // }, []);

  // const pulseFactor = 1 + 0.2 * Math.sin((pulse / 500) % (2 * Math.PI));

  useEffect(() => {
    fetch('/heat_points_ml_model_89r2.geojson')
      .then(res => res.json())
      .then(data => {
        console.log("Sample feature properties:", data.features?.[0]?.properties);
        setHeatData(data);
      });
  }, []);

  
  useEffect(() => {
    fetch('/heat_points_ml_model_89r2.geojson')
      .then(res => res.json())
      .then(data => setHeatData(data));
  }, []);

  const handleMapLoad = (event: any) => {
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
  };



  const features = (heatData?.features || []).filter(
    (f: any) => f.properties.vulnerability > 0.7
  );
  

  const heatLayer = heatData
    ? new HeatmapLayer({
        id: 'heatmap-layer',
        data: features,
        getPosition: d => d.geometry.coordinates,
        getWeight: d => d.properties.vulnerability,
        radiusPixels: 300,
        intensity: 1.0,
        threshold: 0.005,
        aggregation: 'SUM',
        colorRange: [
          [0, 0, 255, 0],
          [0, 255, 255, 128],
          [0, 255, 0, 180],
          [255, 255, 0, 200],
          [255, 128, 0, 220],
          [255, 0, 0, 255],
        ],
      })
    : null;

    const circleLayer = heatData
    ? new GeoJsonLayer({
        id: 'geojson-circles',
        data: features,
        pickable: true,
        pointType: 'circle',
        getPosition: (f: any) => {
          const [lon, lat] = f.geometry.coordinates;
          const jitter = () => (Math.random() - 0.5) * 0.00005; // smaller ~5m jitter
          return [lon + jitter(), lat + jitter()];
        },
        getPointRadius: f => {
          const v = f.properties.vulnerability ?? f.properties.vulnerability_score ?? 0;
          const base = 100 * v;
          const variation = 1 + (Math.random() - 0.5) * 0.2;
          return base * variation;
        },
        getFillColor: f => {
          const v = f.properties.vulnerability ?? f.properties.vulnerability_score ?? 0;
          const alpha = 180 + Math.floor(Math.random() * 50);
          if (v > 0.8) return [255, 0, 0, alpha];
          if (v > 0.6) return [255, 128, 0, alpha];
          if (v > 0.4) return [255, 200, 100, alpha];
          return [0, 0, 0, 0]; // skip low scores
        },
        getLineColor: [0, 0, 0, 0],
        pointRadiusMinPixels: 3,
        pointRadiusMaxPixels: 60,
        filled: true,
        stroked: false,
      })
    : null;
  
  

  return (
    <div style={{ height: '100vh', width: '100vw', backgroundColor: '#000' }}>
      <button
        style={{
          position: 'absolute',
          zIndex: 10,
          top: 16,
          left: 16,
          padding: '8px 16px',
          background: '#222',
          color: '#fff',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer'
        }}
        onClick={() => setShowHeatmap(v => !v)}
      >
        {showHeatmap ? 'Show Circles' : 'Show Heatmap'}
      </button>
      <DeckGL
        initialViewState={viewState}
        controller={true}
        layers={showHeatmap ? [heatLayer] : [circleLayer]}
      >
        <Map
          mapboxAccessToken={MAPBOX_TOKEN}
          mapStyle="mapbox://styles/mapbox/standard"
          style={{ width: '100%', height: '100%' }}
          onLoad={handleMapLoad}
        >
          <NavigationControl position="top-left" />
        </Map>
      </DeckGL>
      {/* <MapContainer
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        center={{ lat: viewState.latitude, lng: viewState.longitude }}
        zoom={viewState.zoom}
        scrollWheelZoom={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          options={{
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          }}
        />
        {heatData && <GeoJSON data={heatData} onEachFeature={onEachFeature} />}
      </MapContainer> */}
    </div>
  );
}
