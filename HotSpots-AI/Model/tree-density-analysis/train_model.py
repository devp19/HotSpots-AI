import pandas as pd
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_squared_error
import joblib
import numpy as np

# Load dataset
df = pd.read_csv("features_with_labels.csv")

# Features and label
X = df[["tree_density", "building_density"]]
y = df["vulnerability_score"]

# Train/test split
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train model
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)

# Evaluate
y_pred = model.predict(X_test)
print("R² Score:", r2_score(y_test, y_pred))
print("RMSE:", np.sqrt(mean_squared_error(y_test, y_pred)))

# Save model
joblib.dump(model, "vulnerability_model.pkl")
print("✅ Model saved as vulnerability_model.pkl")
