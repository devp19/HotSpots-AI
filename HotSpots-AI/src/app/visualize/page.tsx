'use client';

import { useEffect, useState, useCallback } from 'react';
import DeckGL from '@deck.gl/react';
import { HeatmapLayer } from '@deck.gl/aggregation-layers';
import { ScatterplotLayer } from '@deck.gl/layers';
import StaticMap, { NavigationControl } from 'react-map-gl';
import Link from 'next/link';
import Image from 'next/image';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [mapContainerRef, setMapContainerRef] = useState<HTMLDivElement | null>(null);

  const searchOptions: { name: string; coords: [number, number] }[] = [
    { name: 'Downtown Toronto', coords: [43.6532, -79.3832] },
    { name: 'Kensington Market', coords: [43.6548, -79.4012] },
    { name: 'Chinatown', coords: [43.6536, -79.4018] },
    { name: 'Queen West', coords: [43.6476, -79.3984] },
    { name: 'Yorkville', coords: [43.6702, -79.3866] },
    { name: 'The Annex', coords: [43.6684, -79.4072] },
    { name: 'Little Italy', coords: [43.6524, -79.4168] },
    { name: 'Cabbagetown', coords: [43.6624, -79.3584] },
    { name: 'Distillery District', coords: [43.6484, -79.3584] },
    { name: 'Harbourfront', coords: [43.6344, -79.3784] },
    { name: 'Financial District', coords: [43.6484, -79.3784] },
    { name: 'Entertainment District', coords: [43.6444, -79.3884] },
    { name: 'Liberty Village', coords: [43.6344, -79.4284] },
    { name: 'Parkdale', coords: [43.6344, -79.4484] },
    { name: 'High Park', coords: [43.6444, -79.4684] }
  ];

  const filteredOptions = searchOptions.filter(option =>
    option.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSearch = (location: { name: string; coords: [number, number] }) => {
    setViewState({
      ...viewState,
      latitude: location.coords[0],
      longitude: location.coords[1],
      zoom: 16
    });
    setSearchQuery('');
  };

  const toggleFullscreen = () => {
    if (mapContainerRef) {
      if (!document.fullscreenElement) {
        mapContainerRef.requestFullscreen();
        setIsFullscreen(true);
      } else {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

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
        if (pts.length > 0) {
          const sorted = [...pts].sort((a, b) => a.weight - b.weight);
          const q1 = sorted[Math.floor(0.33 * sorted.length)]?.weight ?? 0.33;
          const q2 = sorted[Math.floor(0.66 * sorted.length)]?.weight ?? 0.66;
          setQuantiles({ q1, q2 });
        }
      })
      .catch(console.error);
  }, []);

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

  const scatterLayer = new ScatterplotLayer<PointData>({
    id: 'hot-spots-circles',
    data,
    getPosition: (d) => d.position,
    getRadius: (d) => 80 + 200 * d.weight, 
    getFillColor: (d) => {
      const v = d.weight;
      if (v < quantiles.q1) return [255, 255, 0, 180];
      if (v < quantiles.q2) return [255, 165, 0, 200]; 
      return [255, 100, 0, 220]; 
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
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      fontFamily: 'NeueHaasDisplay, Neue, sans-serif'
    }}>
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        padding: '20px 32px',
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        position: 'sticky',
        top: 0,
        zIndex: 1000
      }}>
        <div style={{ justifySelf: 'start' }}>
          <Link href="/" style={{
            textDecoration: 'none',
            color: '#2a2a2a',
            fontWeight: 600,
            fontSize: '15px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            border: '1.5px solid rgba(42, 42, 42, 0.1)',
            background: 'rgba(255, 255, 255, 0.8)',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
            e.currentTarget.style.borderColor = '#000';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
            e.currentTarget.style.borderColor = 'rgba(42, 42, 42, 0.1)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.8)';
          }}
          >
            ← Back to Home
          </Link>
        </div>
        
        <div style={{
          textAlign: 'center',
          padding: '0 40px'
        }}>
          <div style={{
            fontSize: '32px',
            fontWeight: 700,
            color: '#059669',
            textShadow: '0 2px 4px rgba(5, 150, 105, 0.15)',
            animation: 'sloganPulse 4s ease-in-out infinite',
            letterSpacing: '-0.02em'
          }}>
            Mapping heat, growing green
          </div>
        </div>
        
        <div style={{
          justifySelf: 'end'
        }}>
          
        </div>
      </div>

      <div style={{
        padding: '40px 32px',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <h1 style={{
            margin: 0,
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            color: '#2a2a2a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '2px',
            marginBottom: '16px'
          }}>
            <span>H</span>
            <Image 
              src="/firegif2.gif" 
              alt="Fire" 
              width={48} 
              height={48}
              style={{ objectFit: 'contain' }}
            />
            <span>tSpots.ai</span>
            <span>&nbsp;</span>
            <span style={{ fontSize: '1em', color: '#2a2a2a', fontWeight: 500 }}>- Vulnerability Analysis</span>
          </h1>
          <p style={{
            margin: 0,
            fontSize: '20px',
            color: '#666',
            fontWeight: 400,
            maxWidth: '600px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: 1.6
          }}>
            Explore Toronto's <span style={{ color: '#ef4444', fontWeight: 600 }}>fire vulnerability</span> hotspots through interactive 3D mapping and data visualization
          </p>
        </div>

        <div style={{
          background: 'white',
          borderRadius: '24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.08)',
          overflow: 'hidden',
          border: '3px solid #000',
          display: 'flex',
          height: '75vh',
          minHeight: '600px'
        }}>
          <div style={{
            width: '320px',
            background: 'linear-gradient(180deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRight: '3px solid #000',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{
              padding: '32px 24px',
              overflowY: 'auto',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '24px'
            }}>
              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.04)'
              }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#2a2a2a',
                  letterSpacing: '-0.01em'
                }}>
                  Visualization Mode
                </h3>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <button
                    style={{
                      flex: 1,
                      background: mode === 'gradient' ? '#10b981' : 'white',
                      color: mode === 'gradient' ? 'white' : '#666',
                      border: '1.5px solid',
                      borderColor: mode === 'gradient' ? '#10b981' : 'rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: 'translateY(0)',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (mode !== 'gradient') {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                        e.currentTarget.style.borderColor = '#ef4444';
                        e.currentTarget.style.background = '#fef2f2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (mode !== 'gradient') {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                    onClick={() => setMode('gradient')}
                  >
                    Heatmap
                  </button>
                  <button
                    style={{
                      flex: 1,
                      background: mode === 'circle' ? '#10b981' : 'white',
                      color: mode === 'circle' ? 'white' : '#666',
                      border: '1.5px solid',
                      borderColor: mode === 'circle' ? '#10b981' : 'rgba(0,0,0,0.1)',
                      borderRadius: '12px',
                      padding: '14px 18px',
                      fontWeight: 600,
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      transform: 'translateY(0)',
                      textAlign: 'center'
                    }}
                    onMouseEnter={(e) => {
                      if (mode !== 'circle') {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.12)';
                        e.currentTarget.style.borderColor = '#ef4444';
                        e.currentTarget.style.background = '#fef2f2';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (mode !== 'circle') {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                        e.currentTarget.style.borderColor = 'rgba(0,0,0,0.1)';
                        e.currentTarget.style.background = 'white';
                      }
                    }}
                    onClick={() => setMode('circle')}
                  >
                    Points
                  </button>
                </div>
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.04)'
              }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#2a2a2a',
                  letterSpacing: '-0.01em'
                }}>
                  {mode === 'gradient' ? 'Heatmap Legend' : 'Vulnerability Levels'}
                </h3>
                
                {mode === 'gradient' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: 'linear-gradient(90deg, #00ffff, #ff0000)',
                        border: '1px solid rgba(0,0,0,0.1)'
                      }} />
                      <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Low to High Vulnerability</span>
                    </div>
                    <div style={{ 
                      height: '12px', 
                      background: 'linear-gradient(90deg, #00ffff, #64ff00, #ffff00, #ff8c00, #ff0000)',
                      borderRadius: '6px',
                      marginTop: '8px'
                    }} />
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      fontSize: '12px', 
                      color: '#888',
                      marginTop: '8px',
                      fontWeight: 500
                    }}>
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 0, 0.8)',
                        border: '2px solid rgba(255, 255, 0, 0.3)'
                      }} />
                      <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Low Risk</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(255, 165, 0, 0.8)',
                        border: '2px solid rgba(255, 165, 0, 0.3)'
                      }} />
                      <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Medium Risk</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'rgba(255, 100, 0, 0.8)',
                        border: '2px solid rgba(255, 100, 0, 0.3)'
                      }} />
                      <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>High Risk</span>
                    </div>
                  </div>
                )}
              </div>

              <div style={{
                background: 'white',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                border: '1px solid rgba(0,0,0,0.04)'
              }}>
                <h3 style={{
                  margin: '0 0 20px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#2a2a2a',
                  letterSpacing: '-0.01em'
                }}>
                  Data Overview
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Total Points:</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#2a2a2a' }}>{data.length.toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Max Vulnerability:</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#2a2a2a' }}>
                      {data.length > 0 ? Math.max(...data.map(d => d.weight)).toFixed(3) : '0.000'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '14px', color: '#666', fontWeight: 500 }}>Avg Vulnerability:</span>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#2a2a2a' }}>
                      {data.length > 0 ? (data.reduce((sum, d) => sum + d.weight, 0) / data.length).toFixed(3) : '0.000'}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
                borderRadius: '16px',
                padding: '24px',
                border: '1px solid #f59e0b',
                marginBottom: '24px'
              }}>
                <h4 style={{
                  margin: '0 0 16px 0',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#92400e',
                  letterSpacing: '-0.01em'
                }}>
                  💡 How to Use
                </h4>
                <ul style={{
                  margin: 0,
                  paddingLeft: '20px',
                  fontSize: '14px',
                  color: '#92400e',
                  lineHeight: 1.6,
                  fontWeight: 500
                }}>
                  <li style={{ marginBottom: '12px' }}>• Switch between heatmap and point views</li>
                  <li style={{ marginBottom: '12px' }}>• Hover over points for detailed info</li>
                  <li style={{ marginBottom: '12px' }}>• Use map controls to navigate</li>
                  <li style={{ marginBottom: '12px' }}>• Zoom in for 3D building view</li>
                </ul>
              </div>
            </div>
          </div>

          <div 
            ref={setMapContainerRef}
            style={{
              flex: 1,
              position: 'relative',
              background: '#f8fafc'
            }}
          >
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              zIndex: 1000,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(10px)',
              borderRadius: '12px',
              padding: '8px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
              border: '1px solid rgba(0,0,0,0.1)',
              minWidth: '280px'
            }}>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Search Toronto neighborhoods..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    background: 'transparent',
                    outline: 'none',
                    color: '#2a2a2a'
                  }}
                />
                {searchQuery.length > 0 && filteredOptions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    background: 'white',
                    borderRadius: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                    border: '1px solid rgba(0,0,0,0.1)',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1001,
                    marginTop: '4px'
                  }}>
                    {filteredOptions.map((option, index) => (
                      <div
                        key={index}
                        onClick={() => handleSearch(option)}
                        style={{
                          padding: '12px 16px',
                          cursor: 'pointer',
                          borderBottom: index < filteredOptions.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none',
                          fontSize: '14px',
                          color: '#2a2a2a',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        {option.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={toggleFullscreen}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(0,0,0,0.1)',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.1)';
              }}
            >
              {isFullscreen ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
              )}
            </button>

            <DeckGL
              initialViewState={viewState}
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
              {/* Enhanced Tooltip */}
              {mode === 'circle' && tooltip && (
                <div
                  style={{
                    position: 'absolute',
                    pointerEvents: 'none',
                    left: `${tooltip.x + 16}px`,
                    top: `${tooltip.y + 16}px`,
                    background: 'rgba(42, 42, 42, 0.95)',
                    color: '#fff',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    fontSize: '14px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.3)',
                    zIndex: 20,
                    minWidth: '240px',
                    lineHeight: 1.6,
                    border: '1px solid rgba(255,255,255,0.1)',
                    backdropFilter: 'blur(12px)',
                    fontFamily: 'NeueHaasDisplay, Neue, sans-serif'
                  }}
                >
                  <div style={{ marginBottom: '12px', fontWeight: 600, color: '#fbbf24', fontSize: '15px' }}>
                    📍 Vulnerability Point
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#9ca3af', fontWeight: 500 }}>Vulnerability:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{tooltip.vulnerability.toFixed(3)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ color: '#9ca3af', fontWeight: 500 }}>NDVI:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{tooltip.ndvi.toFixed(3)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#9ca3af', fontWeight: 500 }}>Building Density:</span>
                    <span style={{ fontWeight: 600, color: '#fff' }}>{tooltip.bldDensity.toFixed(3)}</span>
                  </div>
                </div>
              )}
            </DeckGL>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @font-face {
          font-family: 'NeueHaasDisplay';
          src: url('/fonts/NeueHaasDisplayMediu.woff') format('woff');
          font-weight: normal;
          font-style: normal;
          font-display: swap;
        }
        @keyframes sloganPulse {
          0%, 100% { opacity: 0.8; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.02); }
        }
      `}</style>
    </div>
  );
} 