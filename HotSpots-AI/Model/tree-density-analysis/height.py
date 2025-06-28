import geopandas as gpd

# Load the building footprint shapefile
buildings = gpd.read_file("tree-density-analysis/buildings/3DMassingShapefile_2023_WGS84.shp")  # change path if needed

# Print all column names
print("Available columns:")
print(buildings.columns)

# Show first few rows to inspect values
print("\nSample data:")
print(buildings.head())
