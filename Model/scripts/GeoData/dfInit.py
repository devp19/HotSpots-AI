import geopandas as gpd
import matplotlib.pyplot as plt
import os

# # Set working directory (optional)
# os.chdir("C:/Users/YourName/Documents/TorontoTrees")  # Change this to your path

# Load your 100m grid
grid = gpd.read_file("scripts/GeoData/toronto_grid2.geojson")

# Load your tree point dataset (shapefile)
trees = gpd.read_file("scripts/GeoData/Street Tree Data - 4326/Street Tree Data - 4326.shp")

# Reproject to UTM for accurate area calculations
grid = grid.to_crs("EPSG:32617")
trees = trees.to_crs("EPSG:32617")

# Spatial join: assign each tree to a grid cell
joined = gpd.sjoin(trees, grid, how="inner", predicate="within")

# Count trees per grid cell
tree_counts = joined.groupby("index_right").size().reset_index()
tree_counts = tree_counts.rename(columns={0: "tree_count"})

# Merge tree counts into grid
grid["tree_count"] = 0
grid.loc[tree_counts["index_right"], "tree_count"] = tree_counts["tree_count"].values

# Calculate tree density (trees per square meter)
grid["tree_density"] = grid["tree_count"] / grid.geometry.area

# Reproject back to lat/lon for export or mapping
grid_final = grid.to_crs("EPSG:4326")

# Save to GeoJSON
grid_final.to_file("toronto_grid_with_tree_density.geojson", driver="GeoJSON")

# Plot for visual check
grid_final.plot(column="tree_density", cmap="Greens", legend=True)
plt.title("Tree Density per 100m Cell")
plt.show()
