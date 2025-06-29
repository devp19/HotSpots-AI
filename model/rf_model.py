from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import r2_score, mean_absolute_error
import numpy as np

#sampel data putting 10 for nwo cuz more than ~15 consuming too many API creds
samples = [
    {"temp": 26.59, "ndvi": -0.0029, "bldDensity": 0.4956, "currentV": 1.17},
    {"temp": 29.79, "ndvi":  0.0777, "bldDensity": 0.9961, "currentV": 1.71},
    {"temp": 26.59, "ndvi":  0.0404, "bldDensity": 1.0202, "currentV": 1.61},
    {"temp": 24.39, "ndvi":  0.5260, "bldDensity": 0.0000, "currentV": -0.41},
    {"temp": 26.63, "ndvi":  0.0134, "bldDensity": 0.6096, "currentV": 1.26},
    {"temp": 31.19, "ndvi":  0.3954, "bldDensity": 0.2219, "currentV": 0.46},
    {"temp": 30.35, "ndvi":  0.2562, "bldDensity": 0.0000, "currentV": 0.44},
    {"temp": 28.73, "ndvi":  0.4167, "bldDensity": 0.2835, "currentV": 0.33},
    {"temp": 21.75, "ndvi": -0.0220, "bldDensity": 0.0000, "currentV": 0.43},
    {"temp": 14.65, "ndvi":  0.0421, "bldDensity": 0.0343, "currentV": -0.08},
]

def normalize(arr):
    mn, mx = min(arr), max(arr)
    return [(v - mn)/(mx-mn) for v in arr]

temps   = [s['temp']      for s in samples]
ndvis   = [s['ndvi']      for s in samples]
blds    = [s['bldDensity']for s in samples]
targets = [s['currentV']  for s in samples]

nT = normalize(temps)
nN = normalize(ndvis)
nB = normalize(blds)

X = np.column_stack([nT, nN, nB])
y = np.array(targets)

model = RandomForestRegressor(n_estimators=50, max_depth=1, random_state=0)
model.fit(X, y)

y_pred = model.predict(X)
r2  = r2_score(y, y_pred)
mae = mean_absolute_error(y, y_pred)
importances = model.feature_importances_


#r2 score measuring models perfmrance in a 0..1 metric range. 
# linear regres was gving liek 0.46, random forest is gving much better results

print(f"R² score: {r2:.2f}")
print(f"MAE: {mae:.2f}")
print("Feature importances:")
print(f"  w1 (temp): {importances[0]:.2f}")
print(f"  w2 (ndvi): {importances[1]:.2f}")
print(f"  w3 (bldDensity): {importances[2]:.2f}")