import pandas as pd
import requests
import time

# Load your tree density dataset
df = pd.read_csv('tree_density_with_coords.csv')

# Make sure these columns exist: 'lat', 'lon'
# If not, add them manually or compute from shapefile centroids

# Create avg_temp column if not present
if "avg_temp" not in df.columns:
    df["avg_temp"] = None

# Define function to get July average temperature
def get_july_avg_temp(lat, lon):
    url = "https://archive-api.open-meteo.com/v1/era5"
    params = {
        "latitude": lat,
        "longitude": lon,
        "start_date": "2023-07-01",
        "end_date": "2023-07-31",
        "daily": "temperature_2m_max",
        "timezone": "America/Toronto"
    }
    try:
        res = requests.get(url, params=params, timeout=10)
        res.raise_for_status()
        temps = res.json()["daily"]["temperature_2m_max"]
        return sum(temps) / len(temps)
    except Exception as e:
        print(f"Failed for ({lat}, {lon}): {e}")
        return None

lat_idx = df.columns.get_loc("lat")
lon_idx = df.columns.get_loc("lon")
avg_temp_idx = df.columns.get_loc("avg_temp")

for i, row in enumerate(df.itertuples(index=False, name=None)):
    avg_temp_val = row[avg_temp_idx]
    if avg_temp_val is None or (isinstance(avg_temp_val, float) and pd.isna(avg_temp_val)):
        lat, lon = row[lat_idx], row[lon_idx]
        print(f"[{i+1}/{len(df)}] Getting temperature for {lat}, {lon}...")
        temp = get_july_avg_temp(lat, lon)
        df.at[i, "avg_temp"] = temp
        time.sleep(1)  # 1 second delay to avoid rate limits

    if i % 10 == 0:
        df.to_csv("tree_density_with_temp_partial.csv", index=False)
        print("✔️ Progress saved.")

# Final save
df.to_csv("tree_density_with_temp_final.csv", index=False)
print("✅ All temperatures saved!")
