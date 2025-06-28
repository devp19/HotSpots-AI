# File: HVI Model/model/train_model_rf.py

import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import os

# Load dataset
df = pd.read_csv("HVI Model/data/processed/features_with_temp_weighted.csv")
df = df.dropna()


# NEW (safe setup)
y = df["avg_temp"]
X = df[["tree_density", "building_density", "lat", "lon"]]

# Split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print(f"✅ R² Score: {r2_score(y_test, y_pred):.3f}")
print(f"✅ MAE: {mean_absolute_error(y_test, y_pred):.3f}")

# Save
os.makedirs("HVI Model/model", exist_ok=True)
joblib.dump(model, "HVI Model/model/heat_model_rf.joblib")
print("✅ Model saved!")
