import geopandas as gpd

# Load your tree point shapefile
trees = gpd.read_file("scripts/Tree Point/TOPO_TREE_WGS84.shp")

# Load Toronto neighborhood polygons (GeoJSON or SHP)
hoods = gpd.read_file("scripts/Neighbourhoods - 4326.geojson")

# Project both to same CRS (UTM zone 17N for Toronto = EPSG:32617)
trees = trees.to_crs("EPSG:32617")
hoods = hoods.to_crs("EPSG:32617")

# Spatial join: assign each tree point to a neighborhood
tree_join = gpd.sjoin(trees, hoods, how="inner", predicate="within")

# Count number of trees per neighborhood
tree_counts = tree_join.groupby("AREA_NAME").size().reset_index()
tree_counts = tree_counts.rename(columns={0: "tree_count"})

# Merge counts into the neighborhood GeoDataFrame
hoods = hoods.merge(tree_counts, on="AREA_NAME", how="left")
hoods["tree_count"] = hoods["tree_count"].fillna(0)

# Normalize: trees per km²
hoods["area_km2"] = hoods.geometry.area / 1e6
hoods["tree_density"] = hoods["tree_count"] / hoods["area_km2"]

# Export to CSV or GeoJSON
hoods.to_file("neighborhoods_with_tree_density.geojson", driver="GeoJSON")
hoods[["AREA_NAME", "tree_density"]].to_csv("tree_density.csv", index=False)

# Optional: visualize
hoods.plot(column="tree_density", cmap="Greens", legend=True)
