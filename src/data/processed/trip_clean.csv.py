"""
trip_clean.csv.py — Observable Framework data loader
------------------------------------------------------
Reads the raw TRIP dataset and outputs a cleaned, normalized CSV to stdout.

Observable Framework runs this script from the project root, so the path
below resolves correctly at build/preview time.

Columns retained and standardized:
  country_name, iso3, year,
  trip_score (0–13), trip_percent (0–1),
  dir_crim, ind_crim,
  gmc, gmcpr, gmcphys, gmcpsych, gmcdiv,
  nb3g,
  adp_general, adp_constitution, adp_employment,
  adp_education, adp_healthcare, adp_housing,
  e_regionpol_6C (region code 1–6),
  v2x_regime (regime type 0–3),
  e_gdppc (GDP per capita),
  v2clrelig (religiosity index)
"""

import pandas as pd
import sys

RAW_PATH = "src/data/raw/trans_rights_worldwide.csv"

df = pd.read_csv(RAW_PATH)

# Normalize column names
df.columns = [c.strip().lower() for c in df.columns]

# Coerce year to integer, drop rows without year
df["year"] = pd.to_numeric(df["year"], errors="coerce")
df = df.dropna(subset=["year"])
df["year"] = df["year"].astype(int)

# Standardize country identifier columns
# Dataset uses both 'country_text_id' and 'country_name' — keep both
# Ensure iso3 column exists (alias of country_text_id)
if "country_text_id" in df.columns and "iso3" not in df.columns:
    df["iso3"] = df["country_text_id"]

# Core columns to keep (drop everything else to reduce payload size)
KEEP = [
    "country_name", "iso3", "year",
    # Composite scores
    "trip_score", "trip_percent",
    # Individual indicators (13 total)
    "dir_crim", "ind_crim",
    "gmc", "gmcpr", "gmcphys", "gmcpsych", "gmcdiv",
    "nb3g",
    "adp_general", "adp_constitution", "adp_employment",
    "adp_education", "adp_healthcare", "adp_housing",
    # Context variables
    "e_regionpol_6c",  # Region (1=E.Europe/C.Asia, 2=Latin Am., 3=MENA, 4=SSAfrica, 5=W.Europe/NA, 6=Asia/Pacific)
    "v2x_regime",      # Regime type (0=closed autocracy … 3=liberal democracy)
    "wb_gdppc",        # GDP per capita (World Bank)
    "religiosity_percent",  # Share of population identifying as religious
]

# Keep only columns that actually exist in the dataset
keep_existing = [c for c in KEEP if c in df.columns]
df = df[keep_existing]

# Filter to 2000–2021 (the story's time range; 1999 has sparse coverage)
df = df[(df["year"] >= 2000) & (df["year"] <= 2021)]

# Sort for readability
df = df.sort_values(["country_name", "year"])

print(df.to_csv(index=False), end="")
