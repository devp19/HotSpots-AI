'use client';

import { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import StaticMap, { NavigationControl } from 'react-map-gl';

const INITIAL_VIEW_STATE = {
  latitude: 43.6532,
  longitude: -79.3832,
  zoom: 14.5,
  pitch: 60,
  bearing: 0,
};

const MAPBOX_TOKEN = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

type PointData = {
  position: [number, number];
  weight: number;
  ndvi?: number;
  bldDensity?: number;
  vulnerability?: number;
};

type TooltipInfo = {
  x: number;
  y: number;
  ndvi: number;
  bldDensity: number;
  vulnerability: number;
} | null;

export default function Visualize() {
  const [data, setData] = useState<PointData[]>([]);
  const [mode, setMode] = useState<'gradient' | 'circle'>('gradient');
  const [tooltip, setTooltip] = useState<TooltipInfo>(null);
  const [quantiles, setQuantiles] = useState<{q1: number, q2: number}>({q1: 0.33, q2: 0.66});

  // Fetch vulnerability points only
  useEffect(() => {
    fetch('/vulnerability_points.geojson')
      .then((res) => res.json())
      .then((geojson) => {
        const pts: PointData[] = geojson.features.map((f: any) => ({
          position: f.geometry.coordinates,
          weight: f.properties.vulnerability,
          ndvi: f.properties.ndvi,
          bldDensity: f.properties.bldDensity,
          vulnerability: f.properties.vulnerability,
        }));
        setData(pts);
        // Compute quantiles for coloring
        if (pts.length > 0) {
          const sorted = [...pts].sort((a, b) => a.weight - b.weight);
          const q1 = sorted[Math.floor(0.33 * sorted.length)]?.weight ?? 0.33;
          const q2 = sorted[Math.floor(0.66 * sorted.length)]?.weight ?? 0.66;
          setQuantiles({ q1, q2 });
        }
      })
      .catch(console.error);
  }, []);

  // Heatmap layer (gradient)
  const heatmapLayer = new HeatmapLayer<PointData>({
    id: 'hot-spots-heatmap',
    data,
    getPosition: (d) => d.position,
    getWeight: (d) => d.weight,
    radiusPixels: 600,
    intensity: 1,
    threshold: 0.1,
    colorRange: [
      [0, 255, 255, 0],
      [0, 255, 255, 50],
      [0, 200, 255, 100],
      [100, 255, 0, 150],
      [255, 255, 0, 200],
      [255, 140, 0, 220],
      [255, 0, 0, 255],
    ],
    colorDomain: [0, Math.max(...data.map((d) => d.weight), 1)],
  });

  // 2D circle layer (Scatterplot)
  const scatterLayer = new ScatterplotLayer<PointData>({
    id: 'hot-spots-circles',
    data,
    getPosition: (d) => d.position,
    getRadius: (d) => 80 + 200 * d.weight, // scale by vulnerability
    getFillColor: (d) => {
      const v = d.weight;
      if (v < quantiles.q1) return [255, 255, 0, 180]; // yellow
      if (v < quantiles.q2) return [255, 165, 0, 200]; // orange
      return [255, 100, 0, 220]; // dark orange
    },
    pickable: true,
    radiusMinPixels: 4,
    radiusMaxPixels: 40,
    stroked: false,
    filled: true,
    onHover: info => {
      if (info && info.object) {
        setTooltip({
          x: info.x,
          y: info.y,
          ndvi: info.object.ndvi ?? 0,
          bldDensity: info.object.bldDensity ?? 0,
          vulnerability: info.object.vulnerability ?? info.object.weight ?? 0,
        });
      } else {
        setTooltip(null);
      }
    },
  });

  // 3D buildings extrusion (unchanged)
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

      if (map.getLayer('3d-buildings')) {
        map.removeLayer('3d-buildings');
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
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              14,
              0,
              14.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.9,
          },
        },
        labelLayerId
      );
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', width: '100vw', background: '#eef2f4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        position: 'relative',
        width: '90vw',
        maxWidth: '900px',
        height: '70vh',
        maxHeight: '700px',
        background: '#fff',
        borderRadius: '18px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
        overflow: 'hidden',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
      }}>
        <div style={{ position: 'absolute', top: '16px', left: '16px', zIndex: 10, display: 'flex', gap: '12px' }}>
          <button
            style={{
              background: '#222',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 18px',
              fontWeight: 600,
              fontSize: '15px',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
              outline: 'none',
              transition: 'background 0.2s',
            }}
            onClick={() => setMode(mode === 'gradient' ? 'circle' : 'gradient')}
          >
            {mode === 'gradient' ? 'Visualize Data Points' : 'Show Gradient'}
          </button>
        </div>
        <DeckGL
          initialViewState={INITIAL_VIEW_STATE}
          controller
          layers={[mode === 'gradient' ? heatmapLayer : scatterLayer]}
          style={{ borderRadius: '18px' }}
        >
          <StaticMap
            mapboxAccessToken={MAPBOX_TOKEN}
            mapStyle="mapbox://styles/mapbox/standard"
            onLoad={handleMapLoad}
            style={{ width: '100%', height: '100%', borderRadius: '18px' }}
          >
            <NavigationControl position="top-left" />
          </StaticMap>
          {/* Tooltip for circle mode */}
          {mode === 'circle' && tooltip && (
            <div
              style={{
                position: 'absolute',
                pointerEvents: 'none',
                left: `${tooltip.x + 12}px`,
                top: `${tooltip.y + 12}px`,
                background: 'rgba(30,30,30,0.97)',
                color: '#fff',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '14px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
                zIndex: 20,
                minWidth: '180px',
                lineHeight: 1.5,
              }}
            >
              <div><b>Vulnerability:</b> {tooltip.vulnerability.toFixed(3)}</div>
              <div><b>NDVI:</b> {tooltip.ndvi.toFixed(3)}</div>
              <div><b>Building Density:</b> {tooltip.bldDensity.toFixed(3)}</div>
            </div>
          )}
        </DeckGL>
      </div>
    </div>
  );
} 