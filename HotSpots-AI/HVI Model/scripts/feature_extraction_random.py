import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import numpy as np
import os

# Load datasets
trees = gpd.read_file("HVI Model/data/trees/Street Tree Data - 4326.shp")
buildings = gpd.read_file("HVI Model/data/buildings/3DMassingShapefile_2023_WGS84.shp")

# Project to UTM for spatial math
trees = trees.to_crs("EPSG:32617")
buildings = buildings.to_crs("EPSG:32617")

# Get bounds to randomly sample within
minx, miny, maxx, maxy = trees.total_bounds

# Sample random points (adjust n as needed)
n_points = 200
np.random.seed(42)
points = [Point(np.random.uniform(minx, maxx), np.random.uniform(miny, maxy)) for _ in range(n_points)]
points_gdf = gpd.GeoDataFrame(geometry=points, crs="EPSG:32617")

# Buffer size (~100m)
buffer_radius = 100

# Feature extraction loop
features = []
for pt in points_gdf.geometry:
    buf = pt.buffer(buffer_radius)
    tree_count = trees[trees.intersects(buf)].shape[0]
    
    nearby_buildings = buildings[buildings.intersects(buf)]
    building_volume = 0
    if "AVG_HEIGHT" in nearby_buildings.columns and "SHAPE_AREA" in nearby_buildings.columns:
        building_volume = (nearby_buildings["AVG_HEIGHT"] * nearby_buildings["SHAPE_AREA"]).sum()

    features.append({
        "lat": pt.centroid.y,
        "lon": pt.centroid.x,
        "tree_density": tree_count / buf.area,
        "building_density": building_volume / buf.area
    })


# Convert to GeoDataFrame with correct projection (EPSG:4326 for lat/lon)
features_gdf = gpd.GeoDataFrame(
    features,
    geometry=[Point(f["lon"], f["lat"]) for f in features],
    crs="EPSG:32617"
).to_crs("EPSG:4326")

# Extract updated lat/lon
features_gdf["lon"] = features_gdf.geometry.x
features_gdf["lat"] = features_gdf.geometry.y

# Save as CSV (with fixed lat/lon)
features_gdf.drop(columns="geometry").to_csv("HVI Model/data/processed/features.csv", index=False)
print("✅ features.csv saved with lat/lon in degrees!")
