import geopandas as gpd
import pandas as pd
from shapely.geometry import Point
import numpy as np
import os
from pyproj import Transformer
transformer = Transformer.from_crs("EPSG:32617", "EPSG:4326", always_xy=True)


# --- Load datasets ---
tree_path = "HVI Model/data/trees/Street Tree Data - 4326.shp"
building_path = "HVI Model/data/buildings/3DMassingShapefile_2023_WGS84.shp"

trees = gpd.read_file(tree_path).to_crs("EPSG:32617")
buildings = gpd.read_file(building_path).to_crs("EPSG:32617")

# Define downtown bounds (adjust if needed)
minx, miny, maxx, maxy = trees.total_bounds

# Generate many candidate points (more than needed)
n_candidates = 1500
np.random.seed(42)
candidate_points = [Point(np.random.uniform(minx, maxx), np.random.uniform(miny, maxy)) for _ in range(n_candidates)]
candidates_gdf = gpd.GeoDataFrame(geometry=candidate_points, crs="EPSG:32617")

# Extract local features around each candidate point
buffer_radius = 100  # 100m
features = []
for pt in candidates_gdf.geometry:
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
        "building_density": building_volume / buf.area,
    })

df = pd.DataFrame(features)

# --- Assign a weight for sampling ---
# Areas with HIGH building_density and LOW tree_density are more vulnerable
df["weight"] = (df["building_density"] + 1e-5) / (df["tree_density"] + 1e-5)

# Normalize weights
df["weight"] = df["weight"] / df["weight"].sum()

# Sample final points based on weight
n_final = 300  # adjust as needed
sampled_df = df.sample(n=n_final, weights="weight", random_state=42)

# --- Save result ---
os.makedirs("HVI Model/data/processed", exist_ok=True)

# Convert coordinates
sampled_df[["lon", "lat"]] = sampled_df[["lon", "lat"]].apply(
    lambda row: pd.Series(transformer.transform(row["lon"], row["lat"])),
    axis=1
)

sampled_df.drop(columns=["weight"]).to_csv("HVI Model/data/processed/features_weighted.csv", index=False)
print("✅ Converted to lat/lon and saved features_weighted.csv")
