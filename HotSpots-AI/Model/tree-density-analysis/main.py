import geopandas as gpd
import matplotlib.pyplot as plt
import os

# Set working directory to the project folder
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# --- Load Grid
grid_path = "grid/toronto_grid.geojson"
grid = gpd.read_file(grid_path)

# --- Load Tree Shapefile
tree_path = "trees/Street Tree Data - 4326.shp"
trees = gpd.read_file(tree_path)

# --- Load Building Shapefile (3D Massing)
building_path = "buildings/3DMassingShapefile_2023_WGS84.shp"
buildings = gpd.read_file(building_path)

# --- Project all to UTM for accurate area & volume
grid = grid.to_crs("EPSG:32617")
trees = trees.to_crs("EPSG:32617")
buildings = buildings.to_crs("EPSG:32617")

### --- TREE DENSITY ---
# Spatial join: count trees per cell
joined_trees = gpd.sjoin(trees, grid, how="inner", predicate="within")
tree_counts = joined_trees.groupby("index_right").size().reset_index()
tree_counts.columns = ["index_right", "tree_count"]

# Merge into grid
grid["tree_count"] = 0
grid.loc[tree_counts["index_right"], "tree_count"] = tree_counts["tree_count"].values
grid["tree_density"] = grid["tree_count"] / grid.geometry.area

### --- BUILDING DENSITY ---
# Compute area if needed
if "SHAPE_AREA" not in buildings.columns:
    buildings["SHAPE_AREA"] = buildings.geometry.area

# Compute volume using AVG_HEIGHT
buildings["volume"] = buildings["AVG_HEIGHT"] * buildings["SHAPE_AREA"]

# Spatial join: assign building volume to cells
joined_buildings = gpd.sjoin(buildings, grid, how="inner", predicate="intersects")
volume_by_cell = joined_buildings.groupby("index_right")["volume"].sum().reset_index()

# Merge into grid
grid["building_volume"] = 0
grid.loc[volume_by_cell["index_right"], "building_volume"] = volume_by_cell["volume"].values
grid["building_density"] = grid["building_volume"] / grid.geometry.area

### --- EXPORT & VISUALIZATION ---
# # Convert back to lat/lon
grid_final = grid.to_crs("EPSG:4326")

# # Save
# output_path = "output/grid_with_tree_and_building_density.geojson"
# grid_final.to_file(output_path, driver="GeoJSON")

# # Plot
# grid_final.plot(column="building_density", cmap="OrRd", legend=True)
# plt.title("Building Density per 100m Cell")
# plt.tight_layout()
# plt.show()

# --- Side-by-side plots
fig, axes = plt.subplots(1, 2, figsize=(16, 8))

# Tree Density
grid_final.plot(column="tree_density", cmap="Greens", legend=True, ax=axes[0])
axes[0].set_title("Tree Density per 100m Cell")
axes[0].axis("off")

# Building Density
grid_final.plot(column="building_density", cmap="OrRd", legend=True, ax=axes[1])
axes[1].set_title("Building Density per 100m Cell")
axes[1].axis("off")

plt.tight_layout()
plt.show()

