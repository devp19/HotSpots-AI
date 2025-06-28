import pandas as pd
import geojson

# Load your CSV
df = pd.read_csv("predictions.csv")  # Make sure this file is in the same folder

# Convert each row to a GeoJSON Feature
features = []
for _, row in df.iterrows():
    point = geojson.Point((row["lon"], row["lat"]))
    feature = geojson.Feature(
        geometry=point,
        properties={
            "vulnerability": row["vulnerability_score"]
        }
    )
    features.append(feature)

# Create FeatureCollection
feature_collection = geojson.FeatureCollection(features)

# Save to file in the same directory
with open("heat_points.geojson", "w") as f:
    geojson.dump(feature_collection, f)

print("✅ heat_points.geojson created successfully.")
