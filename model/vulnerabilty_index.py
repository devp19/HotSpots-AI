#!/usr/bin/env python3
import json
import random
import rasterio
import geopandas as gpd
import numpy as np
from shapely.geometry import Point

# ───────────────────────────────────────────────
# CONFIGURATION
# ───────────────────────────────────────────────
# 1) Bounding box of Toronto [minLon, minLat, maxLon, maxLat]
bbox = (-79.6393, 43.4955, -79.1152, 43.8555)

# 2) Number of points to sample
N_POINTS = 1500   # tweak for desired resolution

# 3) Tuned weights from Gemini
W1, W2, W3 = 0.6, 0.2, 0.2

# 4) Filepaths
LST_TIF   = 'HotSpots-AI/data/toronto_lst.tif'
NDVI_TIF  = 'HotSpots-AI/data/toronto_ndvi.tif'
BUILD_SHP = 'HotSpots-AI/data/buildings/Building Outlines - 4326.shp'

# 5) Output
OUTPUT_GEOJSON = 'HotSpots-AI/data/vulnerability_points.geojson'


# ───────────────────────────────────────────────
# LOAD DATA SOURCES
# ───────────────────────────────────────────────
print("Loading rasters and building footprints…")
lst_src  = rasterio.open(LST_TIF)
ndvi_src = rasterio.open(NDVI_TIF)
buildings = (
    gpd.read_file(BUILD_SHP)
       .to_crs(epsg=3857)      # project to meters for area/buffer
)
print(f"Loaded {len(buildings)} building polygons.")


# ───────────────────────────────────────────────
# SAMPLE POINT GENERATION & METRIC HARVEST
# ───────────────────────────────────────────────
print(f"Generating {N_POINTS} random points…")
minx, miny, maxx, maxy = bbox
points = []
for _ in range(N_POINTS):
    lon = random.uniform(minx, maxx)
    lat = random.uniform(miny, maxy)
    points.append((lon, lat))

temps, ndvis, blds = [], [], []
features = []

print("Sampling metrics for each point…")
for lon, lat in points:
    # 1) Temperature
    temp = next(lst_src.sample([(lon, lat)]))[0]

    # 2) NDVI
    ndvi = next(ndvi_src.sample([(lon, lat)]))[0]

    # 3) Building density in 100 m buffer
    pt = gpd.GeoSeries([Point(lon, lat)], crs='EPSG:4326')\
             .to_crs(epsg=3857)
    circle = pt.buffer(100).iloc[0]
    pts_build = buildings[buildings.intersects(circle)]
    area_sum  = pts_build.geometry.intersection(circle).area.sum()
    density   = float(area_sum / circle.area)

    # collect for normalization
    temps.append(float(temp))
    ndvis.append(float(ndvi))
    blds.append(density)

    # temporarily store raw values in the feature
    features.append({
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [lon, lat] },
      "properties": {
        "temp": float(temp),
        "ndvi": float(ndvi),
        "bldDensity": density
      }
    })

# ───────────────────────────────────────────────
# NORMALIZE & COMPUTE VULNERABILITY
# ───────────────────────────────────────────────
print("Normalizing metrics and computing vulnerability…")
def normalize(arr):
    mn, mx = min(arr), max(arr)
    return [(v - mn)/(mx - mn) for v in arr]

nT = normalize(temps)
nN = normalize(ndvis)
nB = normalize(blds)

for i, feat in enumerate(features):
    V = W1*nT[i] - W2*nN[i] + W3*nB[i]
    feat["properties"]["vulnerability"] = float(V)

# ───────────────────────────────────────────────
# EXPORT GEOJSON
# ───────────────────────────────────────────────
print(f"Writing {len(features)} features to {OUTPUT_GEOJSON} …")
geojson = { "type": "FeatureCollection", "features": features }
with open(OUTPUT_GEOJSON, 'w') as f:
    json.dump(geojson, f, indent=2)

print("✅ Done! Load 'vulnerability_points.geojson' into Mapbox.")
