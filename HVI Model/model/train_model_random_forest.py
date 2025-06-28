import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error
import joblib

# Load data
df = pd.read_csv("HVI Model/data/processed/features_with_temp.csv")

# Drop rows with missing values
df = df.dropna(subset=["tree_density", "building_density", "avg_temp", "lat", "lon"])

# Define feature matrix and target
X = df[["tree_density", "building_density", "lat", "lon"]]
y = df["avg_temp"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=200, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
r2 = r2_score(y_test, y_pred)
mae = mean_absolute_error(y_test, y_pred)

# Save
joblib.dump(model, "HVI Model/model/heat_model_rf_improved.joblib")

print(f"✅ R² Score: {r2:.3f}")
print(f"✅ MAE: {mae:.3f}")
