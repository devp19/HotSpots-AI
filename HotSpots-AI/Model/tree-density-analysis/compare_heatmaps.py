import geopandas as gpd
import matplotlib.pyplot as plt
import os

# Make sure you're in the root project folder
os.chdir(os.path.dirname(os.path.abspath(__file__)))

# Load final GeoJSONs
tree_grid = gpd.read_file("output/toronto_grid_with_tree_density.geojson")
building_grid = gpd.read_file("output/toronto_grid_with_building_density.geojson")

# Create side-by-side plots
fig, axes = plt.subplots(1, 2, figsize=(16, 8))

# Plot tree density
tree_grid.plot(column="tree_density", cmap="Greens", legend=True, ax=axes[0])
axes[0].set_title("Tree Density per 100m Cell")
axes[0].axis("off")

# Plot building density
building_grid.plot(column="building_density", cmap="OrRd", legend=True, ax=axes[1])
axes[1].set_title("Building Density per 100m Cell")
axes[1].axis("off")

plt.tight_layout()
plt.show()
