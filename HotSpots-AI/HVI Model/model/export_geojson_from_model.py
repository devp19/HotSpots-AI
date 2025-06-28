import pandas as pd
import joblib
import json
import os

# --- Load trained model
model_path = "HVI Model/model/heat_model_rf.joblib"
model = joblib.load(model_path)

# --- Load feature data
df = pd.read_csv("HVI Model/data/processed/features_with_temp_weighted.csv")
df = df.dropna()

# --- Features to use (should match model input)
X = df[["tree_density", "building_density", "lat", "lon"]]

# --- Predict vulnerability (or temperature)
predictions = model.predict(X)

# --- Normalize predictions to 0–1 (optional)
v_min, v_max = predictions.min(), predictions.max()
df["vulnerability"] = (predictions - v_min) / (v_max - v_min)

# --- Convert to GeoJSON format
features = []
for _, row in df.iterrows():
    feature = {
        "type": "Feature",
        "geometry": {
            "type": "Point",
            "coordinates": [row["lon"], row["lat"]],
        },
        "properties": {
            "vulnerability": row["vulnerability"]
        }
    }
    features.append(feature)

geojson = {
    "type": "FeatureCollection",
    "features": features
}

# --- Save to GeoJSON file
output_path = "HVI Model/public/heat_points_ml_model.geojson"
os.makedirs("public", exist_ok=True)
with open(output_path, "w") as f:
    json.dump(geojson, f, indent=2)

print("✅ GeoJSON file saved to:", output_path)
