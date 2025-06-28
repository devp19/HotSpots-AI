import geopandas as gpd
import pandas as pd
import numpy as np
from shapely.geometry import Point

# --- Load Data ---
trees = gpd.read_file("HVI Model/data/trees/Street Tree Data - 4326.shp")
buildings = gpd.read_file("HVI Model/data/buildings/3DMassingShapefile_2023_WGS84.shp")

# --- Reproject to UTM for spatial accuracy ---
trees = trees.to_crs("EPSG:32617")
buildings = buildings.to_crs("EPSG:32617")

# --- Define a bounding box for downtown Toronto (approximate in UTM) ---
# Convert lat/lon (43.65, -79.39) to UTM: approx (X, Y)
downtown_minx, downtown_miny = 626000, 4830000
downtown_maxx, downtown_maxy = 635000, 4836000

# --- Sample more points downtown with 70% downtown, 30% citywide ---
n_total = 300
n_downtown = int(n_total * 0.7)
n_citywide = n_total - n_downtown

np.random.seed(42)

# Sample in downtown
downtown_points = [
    Point(np.random.uniform(downtown_minx, downtown_maxx),
          np.random.uniform(downtown_miny, downtown_maxy))
    for _ in range(n_downtown)
]

# Sample across city bounds (tree bounds used here)
city_minx, city_miny, city_maxx, city_maxy = trees.total_bounds
citywide_points = [
    Point(np.random.uniform(city_minx, city_maxx),
          np.random.uniform(city_miny, city_maxy))
    for _ in range(n_citywide)
]

all_points = downtown_points + citywide_points
points_gdf = gpd.GeoDataFrame(geometry=all_points, crs="EPSG:32617")

# --- Feature Extraction ---
buffer_radius = 100
features = []

for pt in points_gdf.geometry:
    buf = pt.buffer(buffer_radius)

    # Tree density
    tree_count = trees[trees.intersects(buf)].shape[0]

    # Building volume
    nearby_buildings = buildings[buildings.intersects(buf)]
    volume = 0
    if "AVG_HEIGHT" in nearby_buildings.columns and "SHAPE_AREA" in nearby_buildings.columns:
        volume = (nearby_buildings["AVG_HEIGHT"] * nearby_buildings["SHAPE_AREA"]).sum()

    features.append({
        "lat": pt.centroid.y,
        "lon": pt.centroid.x,
        "tree_density": tree_count / buf.area,
        "building_density": volume / buf.area
    })

# --- Save to CSV ---
df = pd.DataFrame(features)
df.to_csv("HVI Model/data/processed/features_biased.csv", index=False)
print("✅ Saved: features_biased.csv")
