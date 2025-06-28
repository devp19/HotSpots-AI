import json
import rasterio
import geopandas as gpd
from shapely.geometry import Point

print("Starting sample generation...")

# 1) Open your rasters
lst = rasterio.open('HotSpots-AI/data/toronto_lst.tif')
ndvi = rasterio.open('HotSpots-AI/data/toronto_ndvi.tif')
print("Loaded LST and NDVI rasters.")

# 2) Load the Building Outlines shapefile
buildings = (
    gpd.read_file('HotSpots-AI/data/buildings/Building Outlines - 4326.shp')
       .to_crs(epsg=3857)   # project to meters
)
print(f"Loaded {len(buildings)} building footprints.")

# 3) Define your 10 sample points
points = [
    {"id":"cn_tower",        "lon":-79.3871, "lat":43.6426},
    {"id":"queens_park",     "lon":-79.3906, "lat":43.6677},
    {"id":"financial_dist",  "lon":-79.3806, "lat":43.6487},
    {"id":"high_park",       "lon":-79.4650, "lat":43.6465},
    {"id":"distillery",      "lon":-79.3591, "lat":43.6503},
    {"id":"lakeshore_west",  "lon":-79.5204, "lat":43.6253},
    {"id":"scarborough_tc",  "lon":-79.2840, "lat":43.7730},
    {"id":"north_york",      "lon":-79.4136, "lat":43.7615},
    {"id":"port_lands",      "lon":-79.3566, "lat":43.6405},
    {"id":"toronto_islands", "lon":-79.3710, "lat":43.6204},
]
print(f"Defined {len(points)} sample points.")

samples = []
temps, ndvis, blds = [], [], []

# 4) Loop & sample
for pt in points:
    lon, lat = pt['lon'], pt['lat']
    print(f"Sampling point '{pt['id']}' at ({lon}, {lat})...")

    # a) LST temperature
    temp = next(lst.sample([(lon, lat)]))[0]

    # b) NDVI
    ndvi_val = next(ndvi.sample([(lon, lat)]))[0]

    # c) Building density in a 100 m buffer
    pt_geo = gpd.GeoSeries([Point(lon, lat)], crs='EPSG:4326') \
               .to_crs(epsg=3857)
    buf = pt_geo.buffer(100).iloc[0]
    nearby = buildings[buildings.intersects(buf)]
    area = nearby.geometry.intersection(buf).area.sum()
    bld_density = area / buf.area

    print(f"  → temp: {temp:.2f}, ndvi: {ndvi_val:.4f}, bldDensity: {bld_density:.4f}")

    temps.append(float(temp))
    ndvis.append(float(ndvi_val))
    blds.append(bld_density)

    samples.append({
        "id": pt["id"],
        "lon": lon, "lat": lat,
        "temp": float(temp),
        "ndvi": float(ndvi_val),
        "bldDensity": float(bld_density)
    })

# 5) Normalize & compute initial vulnerability (w1=w2=w3=1)
print("Normalizing metrics and computing initial vulnerability scores...")
def normalize(arr):
    mn, mx = min(arr), max(arr)
    return [(v - mn) / (mx - mn) for v in arr]

nT, nN, nB = normalize(temps), normalize(ndvis), normalize(blds)
for i, s in enumerate(samples):
    s["currentV"] = nT[i] - nN[i] + nB[i]

print("Vulnerability scores computed.")

# 6) Write samples.json
with open('samples.json', 'w') as f:
    json.dump(samples, f, indent=2)

print(f"✔ samples.json generated with {len(samples)} samples.")
