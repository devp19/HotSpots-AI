import pandas as pd
import geopandas as gpd
from shapely.geometry import Point
from joblib import load
import os

# --- Load model
model_path = "HVI Model/model/heat_model_rf_improved.joblib"
model = load(model_path)

# --- Load features
data_path = "HVI Model/data/processed/features_with_temp.csv"
df = pd.read_csv(data_path)

# --- Predict temperatures
X = df[["tree_density", "building_density", "lat", "lon"]]
df["predicted_temp"] = model.predict(X)

# --- Normalize to vulnerability score (0 to 1)
df["vulnerability"] = (df["predicted_temp"] - df["predicted_temp"].min()) / (
    df["predicted_temp"].max() - df["predicted_temp"].min()
)

# --- Convert to GeoDataFrame
gdf = gpd.GeoDataFrame(
    df,
    geometry=[Point(xy) for xy in zip(df["lon"], df["lat"])],
    crs="EPSG:4326"
)

# --- Export to GeoJSON
output_path = "HVI Model/public/heat_points.geojson"
gdf[["vulnerability", "geometry"]].to_file(output_path, driver="GeoJSON")

print(f"✅ heat_points.geojson saved at {output_path}")
