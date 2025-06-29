import os, json

BASE = os.path.dirname(os.path.abspath(__file__))
IN_GEOJSON  = os.path.join(BASE, 'public', 'vulnerability_points.geojson')
OUT_GEOJSON = os.path.join(BASE, 'public', 'tree_priority.geojson')

w1, w2, w3   = 0.6, 0.2, 0.2
delta_ndvi   = 0.2

with open(IN_GEOJSON) as f:
    data = json.load(f)
features = data['features']

temps   = [feat['properties']['temp']       for feat in features]
ndvis   = [feat['properties']['ndvi']       for feat in features]
blds    = [feat['properties']['bldDensity'] for feat in features]
vuls    = [feat['properties']['vulnerability'] for feat in features]

def normalize(arr):
    mn, mx = min(arr), max(arr)
    return [(v - mn)/(mx - mn) for v in arr]

nT, nN, nB = normalize(temps), normalize(ndvis), normalize(blds)

for i, feat in enumerate(features):
    V0 = vuls[i]
    n2 = min(nN[i] + delta_ndvi, 1.0)
    V1 = w1*nT[i] - w2*n2 + w3*nB[i]
    feat['properties']['plantPriority'] = float(V0 - V1)

out = {"type":"FeatureCollection","features":features}
with open(OUT_GEOJSON, 'w') as f:
    json.dump(out, f, indent=2)

print(f"Wrote {OUT_GEOJSON} with plantPriority for {len(features)} points.")
