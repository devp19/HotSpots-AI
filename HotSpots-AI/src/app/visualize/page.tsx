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
    <div style={{ 
      minHeight: '100vh', 
      width: '100vw', 
      background: '#f8f9fa',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '20px'
    }}>
      <div style={{
        position: 'relative',
        width: '95vw',
        maxWidth: '1400px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px'
      }}>
        {/* Title Section - Now above the map */}
        <div style={{
          textAlign: 'center',
          padding: '0 16px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: '2.8rem',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#1e293b'
          }}>
            🔥 HotSpots AI - Vulnerability Analysis
          </h1>
          <p style={{
            margin: '12px 0 0 0',
            fontSize: '1.2rem',
            color: '#64748b',
            fontWeight: 400
          }}>
            Interactive 3D visualization of fire vulnerability hotspots in Toronto
          </p>
        </div>

        {/* Main Container with Black Border */}
        <div style={{
          height: '75vh',
          maxHeight: '700px',
          background: '#fff',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
          overflow: 'hidden',
          border: '3px solid #000',
          display: 'flex',
          flexDirection: 'row'
        }}>
          {/* Legend Sidebar */}
          <div style={{
            width: '280px',
            background: '#f8fafc',
            borderRight: '2px solid #000',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '24px'
          }}>
            {/* Mode Toggle */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1e293b'
              }}>
                Visualization Mode
              </h3>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  style={{
                    flex: 1,
                    background: mode === 'gradient' ? '#3b82f6' : '#f1f5f9',
                    color: mode === 'gradient' ? 'white' : '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: mode === 'gradient' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                  onClick={() => setMode('gradient')}
                >
                  Heatmap
                </button>
                <button
                  style={{
                    flex: 1,
                    background: mode === 'circle' ? '#3b82f6' : '#f1f5f9',
                    color: mode === 'circle' ? 'white' : '#64748b',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: mode === 'circle' ? '0 2px 8px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                  onClick={() => setMode('circle')}
                >
                  Points
                </button>
              </div>
            </div>

            {/* Legend */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1e293b'
              }}>
                {mode === 'gradient' ? 'Heatmap Legend' : 'Vulnerability Levels'}
              </h3>
              
              {mode === 'gradient' ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      background: 'linear-gradient(90deg, #00ffff, #ff0000)',
                      border: '1px solid #e2e8f0'
                    }} />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Low to High Vulnerability</span>
                  </div>
                  <div style={{ 
                    height: '8px', 
                    background: 'linear-gradient(90deg, #00ffff, #64ff00, #ffff00, #ff8c00, #ff0000)',
                    borderRadius: '4px',
                    marginTop: '8px'
                  }} />
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    fontSize: '12px', 
                    color: '#64748b',
                    marginTop: '4px'
                  }}>
                    <span>Low</span>
                    <span>High</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'rgba(255, 255, 0, 0.8)',
                      border: '2px solid rgba(255, 255, 0, 0.3)'
                    }} />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Low Risk</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'rgba(255, 165, 0, 0.8)',
                      border: '2px solid rgba(255, 165, 0, 0.3)'
                    }} />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>Medium Risk</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      background: 'rgba(255, 100, 0, 0.8)',
                      border: '2px solid rgba(255, 100, 0, 0.3)'
                    }} />
                    <span style={{ fontSize: '14px', color: '#64748b' }}>High Risk</span>
                  </div>
                </div>
              )}
            </div>

            {/* Data Info */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '20px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              border: '1px solid #e2e8f0'
            }}>
              <h3 style={{
                margin: '0 0 16px 0',
                fontSize: '1.1rem',
                fontWeight: 600,
                color: '#1e293b'
              }}>
                Data Overview
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Total Points:</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{data.length}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Max Vulnerability:</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {data.length > 0 ? Math.max(...data.map(d => d.weight)).toFixed(3) : '0.000'}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '14px', color: '#64748b' }}>Avg Vulnerability:</span>
                  <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                    {data.length > 0 ? (data.reduce((sum, d) => sum + d.weight, 0) / data.length).toFixed(3) : '0.000'}
                  </span>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div style={{
              background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
              borderRadius: '12px',
              padding: '20px',
              border: '1px solid #f59e0b'
            }}>
              <h4 style={{
                margin: '0 0 12px 0',
                fontSize: '1rem',
                fontWeight: 600,
                color: '#92400e'
              }}>
                💡 How to Use
              </h4>
              <ul style={{
                margin: 0,
                paddingLeft: '16px',
                fontSize: '14px',
                color: '#92400e',
                lineHeight: 1.5
              }}>
                <li>Switch between heatmap and point views</li>
                <li>Hover over points for detailed info</li>
                <li>Use map controls to navigate</li>
                <li>Zoom in for 3D building view</li>
              </ul>
            </div>
          </div>

          {/* Map Container */}
          <div style={{
            flex: 1,
            position: 'relative'
          }}>
            <DeckGL
              initialViewState={INITIAL_VIEW_STATE}
              controller
              layers={[mode === 'gradient' ? heatmapLayer : scatterLayer]}
              style={{ borderRadius: '0' }}
            >
              <StaticMap
                mapboxAccessToken={MAPBOX_TOKEN}
                mapStyle="mapbox://styles/mapbox/standard"
                onLoad={handleMapLoad}
                style={{ width: '100%', height: '100%' }}
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
                    padding: '12px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    zIndex: 20,
                    minWidth: '200px',
                    lineHeight: 1.5,
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(8px)'
                  }}
                >
                  <div style={{ marginBottom: '8px', fontWeight: 600, color: '#fbbf24' }}>
                    📍 Vulnerability Point
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#9ca3af' }}>Vulnerability:</span>
                    <span style={{ fontWeight: 600 }}>{tooltip.vulnerability.toFixed(3)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#9ca3af' }}>NDVI:</span>
                    <span style={{ fontWeight: 600 }}>{tooltip.ndvi.toFixed(3)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af' }}>Building Density:</span>
                    <span style={{ fontWeight: 600 }}>{tooltip.bldDensity.toFixed(3)}</span>
                  </div>
                </div>
              )}
            </DeckGL>
          </div>
        </div>
      </div>
    </div>
  );
} 