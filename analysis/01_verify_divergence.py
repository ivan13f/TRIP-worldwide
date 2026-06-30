"""
analysis/01_verify_divergence.py
─────────────────────────────────────────────────────────────────────────────
Verify the key divergence findings used in the story.
Run this before starting to build charts. Numbers should match CLAUDE.md.

Usage:
    python analysis/01_verify_divergence.py

Expected output (CLAUDE.md canonical values):
    Global mean 2000:  10.9%
    Global mean 2021:  23.5%
    p25 in 2000:        7.7%
    p25 in 2021:        7.7%  ← the editorial punchline — unchanged
    IQR 2000:           7.7 pts
    IQR 2021:          23.1 pts
─────────────────────────────────────────────────────────────────────────────
"""

import pandas as pd
import numpy as np

# ── LOAD DATA ─────────────────────────────────────────────────────────────────
df = pd.read_csv("src/data/raw/trans_rights_worldwide.csv")
df = df[df["year"].between(2000, 2021)].copy()

print("=" * 60)
print("DIVERGENCE VERIFICATION")
print("=" * 60)

# ── YEARLY DISTRIBUTION STATS ─────────────────────────────────────────────────
yearly = df.groupby("year")["trip_percent"].describe(
    percentiles=[0.10, 0.25, 0.50, 0.75, 0.90]
)

print("\nYearly distribution (selected years):")
print(f"{'Year':<6} {'Mean':>8} {'p25':>8} {'p75':>8} {'IQR':>8}")
print("-" * 40)
for year in [2000, 2005, 2010, 2015, 2021]:
    row  = yearly.loc[year]
    mean = row["mean"]
    p25  = row["25%"]
    p75  = row["75%"]
    iqr  = p75 - p25
    print(f"{int(year):<6} {mean:>7.1%} {p25:>7.1%} {p75:>7.1%} {iqr:>7.1%}")

# ── EDITORIAL PUNCHLINE ────────────────────────────────────────────────────────
p25_2000 = yearly.loc[2000, "25%"]
p25_2021 = yearly.loc[2021, "25%"]
print(f"\n>>> p25 in 2000: {p25_2000:.1%}")
print(f">>> p25 in 2021: {p25_2021:.1%}")
if abs(p25_2021 - p25_2000) < 0.01:
    print(">>> CONFIRMED: p25 unchanged in 22 years. ✓")
else:
    print(f">>> WARNING: p25 changed by {(p25_2021 - p25_2000):.1%}. Check data.")

# ── CRIMINALIZATION ────────────────────────────────────────────────────────────
print("\nDirect criminalization (countries with dir_crim == 1):")
for year in [2000, 2010, 2021]:
    n = df[df["year"] == year]["dir_crim"].sum()
    print(f"  {int(year)}: {int(n)} countries")

print("\nIndirect criminalization (countries with ind_crim == 1):")
for year in [2000, 2010, 2021]:
    n = df[df["year"] == year]["ind_crim"].sum()
    print(f"  {int(year)}: {int(n)} countries")

# ── INDICATOR ADOPTION ────────────────────────────────────────────────────────
INDICATORS = {
    "gmc":             "Gender marker change possible",
    "nb3g":            "Nonbinary recognition",
    "adp_employment":  "Anti-discrim: employment",
    "adp_constitution":"Anti-discrim: constitutional",
    "no_dircrim":      "No direct criminalization",
}

print("\nIndicator adoption 2000 vs 2021:")
d2000 = df[df["year"] == 2000]
d2021 = df[df["year"] == 2021]
print(f"{'Indicator':<35} {'2000':>8} {'2021':>8} {'Delta':>8}")
print("-" * 62)
for col, label in INDICATORS.items():
    r2000 = d2000[col].mean()
    r2021 = d2021[col].mean()
    print(f"{label:<35} {r2000:>7.1%} {r2021:>7.1%} {r2021-r2000:>+7.1%}")

# ── REGIONAL BREAKDOWN 2021 ────────────────────────────────────────────────────
print("\nMean TRIP score by region (2021):")
regional = (
    df[df["year"] == 2021]
    .groupby("e_regionpol_6C")["trip_percent"]
    .mean()
    .sort_values(ascending=False)
)
for region, score in regional.items():
    print(f"  {region:<40} {score:.1%}")

print("\n" + "=" * 60)
print("Done. Compare against CLAUDE.md canonical values.")
print("=" * 60)
