import geopandas as gpd
import pandas as pd

# Step 1: Load neighborhood GeoJSON
gdf = gpd.read_file("scripts/Neighbourhoods - 4326.geojson")  # Adjust filename if needed

# Step 2: Project to a suitable CRS for centroid calculation (UTM zone 17N for Toronto)
gdf_proj = gdf.to_crs("EPSG:32617")
centroids = gdf_proj.centroid.to_crs("EPSG:4326")
gdf["lat"] = centroids.y
gdf["lon"] = centroids.x

# Step 3: Keep only relevant columns
centroids_df = gdf[["AREA_NAME", "lat", "lon"]]

# Step 4: Load your tree density CSV
df_tree = pd.read_csv("tree_density.csv")

# Step 5: Merge tree density with centroids
merged = df_tree.merge(centroids_df, left_on="AREA_NAME", right_on="AREA_NAME")

# Step 6: Save new file with lat/lon
merged.to_csv("tree_density_with_coords.csv", index=False)
