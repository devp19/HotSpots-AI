import pandas as pd
import requests
import time

# --- Load your dataset
df = pd.read_csv("HVI Model/data/processed/features.csv")

# --- Create avg_temp column if not present
if "avg_temp" not in df.columns:
    df["avg_temp"] = None

# --- Define API call for July 2023 average max temperature
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

# --- Fetch temperature for each point
for idx, (i, row) in enumerate(df.iterrows()):
    if pd.isna(df.at[i, "avg_temp"]):
        lat, lon = row["lat"], row["lon"]
        print(f"[{idx+1}/{len(df)}] Getting temperature for {lat:.4f}, {lon:.4f}...")
        df.at[i, "avg_temp"] = get_july_avg_temp(lat, lon)
        time.sleep(1)  # Respect API rate limits

    # Save progress every 10 rows
    if idx % 10 == 0:
        df.to_csv("HVI Model/data/processed/features_with_temp_partial.csv", index=False)
        print("✔️ Progress saved.")

# --- Final save
df.to_csv("HVI Model/data/processed/features_with_temp.csv", index=False)
print("✅ All temperatures saved!")
