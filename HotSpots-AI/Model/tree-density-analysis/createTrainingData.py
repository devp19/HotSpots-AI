import pandas as pd

# Load features
df = pd.read_csv("features.csv")

# Normalize features (optional but recommended)
df["tree_density_norm"] = df["tree_density"] / df["tree_density"].max()
df["building_density_norm"] = df["building_density"] / df["building_density"].max()

# Generate synthetic vulnerability score
# Higher when: tree_density is LOW and building_density is HIGH
df["vulnerability_score"] = (
    (1 - df["tree_density_norm"]) * 0.6 + 
    df["building_density_norm"] * 0.4
)

# Clamp between 0 and 1
df["vulnerability_score"] = df["vulnerability_score"].clip(0, 1)

# Save final dataset
df[["tree_density", "building_density", "lon", "lat", "vulnerability_score"]].to_csv("features_with_labels.csv", index=False)

print("✅ Saved: features_with_labels.csv")
