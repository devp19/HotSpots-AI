import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib
import os

# Update this path
csv_path = "HVI Model/data/processed/features_with_temp.csv"  

# Load dataset
df = pd.read_csv(csv_path)

# Drop rows with missing temperature
df = df.dropna(subset=["avg_temp"])

# Define features and target
X = df[["tree_density", "building_density"]]
y = df["avg_temp"]

# Split into train/test
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("R² Score:", r2_score(y_test, y_pred))
print("MAE:", mean_absolute_error(y_test, y_pred))

# Save model
os.makedirs("HVI Model/model", exist_ok=True)
joblib.dump(model, "HVI Model/model/heat_model_linear_regress.joblib")
print("✅ Model saved as heat_model.joblib")
