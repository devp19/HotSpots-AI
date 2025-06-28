import geopandas as gpd

# Load GeoJSON
gdf = gpd.read_file("output/grid_with_tree_and_building_density.geojson")

# Select features
df = gdf[["tree_density", "building_density"]].copy()

# (Optional) Add coordinates if needed
gdf["lon"] = gdf.geometry.centroid.x
gdf["lat"] = gdf.geometry.centroid.y
df["lon"] = gdf["lon"]
df["lat"] = gdf["lat"]

# Save to CSV
df.to_csv("features.csv", index=False)
