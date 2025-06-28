import pandas as pd
import joblib

# Load the trained model
model = joblib.load("vulnerability_model.pkl")

# Load your new features (without labels)
df = pd.read_csv("features.csv")

# Predict using only features (X)
X = df[["tree_density", "building_density"]]
df["vulnerability_score"] = model.predict(X)

# Save predictions
df.to_csv("predictions.csv", index=False)
print("✅ Predictions saved to data/predictions.csv")
