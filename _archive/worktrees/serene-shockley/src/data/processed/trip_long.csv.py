import pandas as pd

# Load raw
df = pd.read_csv("src/data/raw/trans_rights_worldwide.csv")

# Normalize column names (robust against minor differences)
df.columns = [c.strip() for c in df.columns]

# Common expected columns in TRIP-style datasets:
# country / Country, iso3 / ISO3, year / Year, trip_score / TRIP
# We'll keep everything, but ensure year is int if present.
for col in ["year", "Year"]:
    if col in df.columns:
        df[col] = pd.to_numeric(df[col], errors="coerce").astype("Int64")

# Drop rows missing a year if we have a year column
if "year" in df.columns:
    df = df.dropna(subset=["year"])
elif "Year" in df.columns:
    df = df.dropna(subset=["Year"])

# Output as CSV
print(df.to_csv(index=False), end="")