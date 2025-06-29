#!/usr/bin/env python3
import json
import random
import rasterio
import geopandas as gpd
import numpy as np
from shapely.geometry import Point

# bounding box of toronto, gpt gave this 
bbox = (-79.6393, 43.4955, -79.1152, 43.8555)

N_POINTS = 1500   

#tuend weights givne from gemini api call. seems to be a good balance of temp, ndvi, and bldDensity
W1, W2, W3 = 0.6, 0.2, 0.2

LST_TIF   = 'HotSpots-AI/data/toronto_lst.tif'
NDVI_TIF  = 'HotSpots-AI/data/toronto_ndvi.tif'
BUILD_SHP = 'HotSpots-AI/data/buildings/Building Outlines - 4326.shp'


OUTPUT_GEOJSON = 'HotSpots-AI/data/vulnerability_points.geojson'


print("Loading rasters and building footprints…")
lst_src  = rasterio.open(LST_TIF)
ndvi_src = rasterio.open(NDVI_TIF)
buildings = (
    gpd.read_file(BUILD_SHP)
       .to_crs(epsg=3857) 
)
print(f"Loaded {len(buildings)} building polygons.")


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
    temp = next(lst_src.sample([(lon, lat)]))[0]

    ndvi = next(ndvi_src.sample([(lon, lat)]))[0]

    pt = gpd.GeoSeries([Point(lon, lat)], crs='EPSG:4326')\
             .to_crs(epsg=3857)
    circle = pt.buffer(100).iloc[0]
    pts_build = buildings[buildings.intersects(circle)]
    area_sum  = pts_build.geometry.intersection(circle).area.sum()
    density   = float(area_sum / circle.area)

    temps.append(float(temp))
    ndvis.append(float(ndvi))
    blds.append(density)

    features.append({
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [lon, lat] },
      "properties": {
        "temp": float(temp),
        "ndvi": float(ndvi),
        "bldDensity": density
      }
    })


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


print(f"Writing {len(features)} features to {OUTPUT_GEOJSON} …")
geojson = { "type": "FeatureCollection", "features": features }
with open(OUTPUT_GEOJSON, 'w') as f:
    json.dump(geojson, f, indent=2)

print("Done! Load 'vulnerability_points.geojson' into Mapbox.")
