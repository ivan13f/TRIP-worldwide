"""
analysis/03_identify_surprises.py
─────────────────────────────────────────────────────────────────────────────
Identify the surprising country cases used in Act II annotations.
Specifically: countries where TRIP and LGB scores diverge significantly,
and countries worth annotating on the choropleth.

Run this before writing Act II editorial copy to confirm the data.

Usage:
    python analysis/03_identify_surprises.py
─────────────────────────────────────────────────────────────────────────────
"""

import pandas as pd
import numpy as np

df = pd.read_csv("src/data/raw/trans_rights_worldwide.csv")

# ── TRIP vs LGB DIVERGENCE (2020 — last year with LGB data) ──────────────────
print("=" * 65)
print("TRIP vs LGB DIVERGENCE — 2020")
print("=" * 65)

d2020 = df[df["year"] == 2020].dropna(subset=["trip_percent", "lgb_percent"]).copy()
d2020["gap"] = d2020["trip_percent"] - d2020["lgb_percent"]

print("\nTop 8 countries where TRIP >> LGB (trans rights exceed LGB rights):")
print(f"{'Country':<30} {'TRIP':>8} {'LGB':>8} {'Gap':>8}")
print("-" * 55)
for _, row in d2020.nlargest(8, "gap").iterrows():
    print(f"{row['country_name']:<30} {row['trip_percent']:>7.1%} {row['lgb_percent']:>7.1%} {row['gap']:>+7.1%}")

print("\nTop 8 countries where LGB >> TRIP (LGB rights exceed trans rights):")
print(f"{'Country':<30} {'TRIP':>8} {'LGB':>8} {'Gap':>8}")
print("-" * 55)
for _, row in d2020.nsmallest(8, "gap").iterrows():
    print(f"{row['country_name']:<30} {row['trip_percent']:>7.1%} {row['lgb_percent']:>7.1%} {row['gap']:>+7.1%}")

pct_gap = (d2020["gap"].abs() >= 0.10).mean()
print(f"\n{pct_gap:.0%} of countries have a 10%+ gap between TRIP and LGB scores.")

# ── TOP AND BOTTOM SCORERS 2021 ────────────────────────────────────────────────
print("\n" + "=" * 65)
print("TRIP SCORES — 2021 TOP AND BOTTOM 15")
print("=" * 65)

d2021 = df[df["year"] == 2021].dropna(subset=["trip_percent"]).copy()

print("\nTop 15:")
print(f"{'Country':<30} {'ISO3':>6} {'Score':>8} {'Region'}")
print("-" * 70)
for _, row in d2021.nlargest(15, "trip_percent").iterrows():
    print(f"{row['country_name']:<30} {row['country_text_id']:>6} {row['trip_percent']:>7.1%}  {row['e_regionpol_6C']}")

print("\nBottom 15 (non-zero):")
d2021_nonzero = d2021[d2021["trip_percent"] > 0]
print(f"{'Country':<30} {'ISO3':>6} {'Score':>8} {'Region'}")
print("-" * 70)
for _, row in d2021_nonzero.nsmallest(15, "trip_percent").iterrows():
    print(f"{row['country_name']:<30} {row['country_text_id']:>6} {row['trip_percent']:>7.1%}  {row['e_regionpol_6C']}")

# ── COUNTRIES WITH ZERO SCORE 2021 ────────────────────────────────────────────
zero_2021 = d2021[d2021["trip_percent"] == 0]
print(f"\n{len(zero_2021)} countries scored exactly 0% in 2021:")
print(", ".join(zero_2021["country_name"].tolist()))

# ── IRAN CASE (the most counterintuitive) ─────────────────────────────────────
print("\n" + "=" * 65)
print("IRAN CASE STUDY")
print("=" * 65)
iran = df[df["country_text_id"] == "IRN"][
    ["year", "trip_percent", "gmc", "dir_crim", "ind_crim", "nb3g"]
].query("year in [2000, 2010, 2015, 2021]")
print(iran.to_string(index=False))

# ── COLONIAL LAW COUNTRIES ─────────────────────────────────────────────────────
print("\n" + "=" * 65)
print("INDIRECT CRIMINALIZATION BY REGION — 2021")
print("(proxy for colonial law inheritance)")
print("=" * 65)
by_region = (
    df[df["year"] == 2021]
    .groupby("e_regionpol_6C")
    .agg(
        n_countries=("country_name", "count"),
        pct_ind_crim=("ind_crim", "mean"),
        mean_trip=("trip_percent", "mean"),
    )
    .sort_values("pct_ind_crim", ascending=False)
)
print(by_region.to_string())

# ── BIGGEST MOVERS 2000-2021 ───────────────────────────────────────────────────
print("\n" + "=" * 65)
print("BIGGEST MOVERS — TRIP SCORE CHANGE 2000 TO 2021")
print("=" * 65)
scores = df[df["year"].isin([2000, 2021])].pivot_table(
    index="country_text_id", columns="year", values="trip_percent"
).dropna()
scores.columns = ["score_2000", "score_2021"]
scores["delta"] = scores["score_2021"] - scores["score_2000"]
scores = scores.join(
    df[df["year"] == 2021].set_index("country_text_id")["country_name"]
)

print("\nTop 10 biggest improvements:")
print(f"{'Country':<30} {'2000':>8} {'2021':>8} {'Delta':>8}")
print("-" * 55)
for iso, row in scores.nlargest(10, "delta").iterrows():
    print(f"{row.get('country_name', iso):<30} {row['score_2000']:>7.1%} {row['score_2021']:>7.1%} {row['delta']:>+7.1%}")

print("\n" + "=" * 65)
print("Done. Use these numbers to update choropleth.js annotations.")
print("=" * 65)
