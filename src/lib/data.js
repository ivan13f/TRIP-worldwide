// lib/data.js
// ─────────────────────────────────────────────────────────────────────────────
// All data transforms for Uneven Ground.
// Rules:
//   - This file only transforms data. No D3, no DOM, no rendering.
//   - Chart modules call these functions and receive clean arrays/objects.
//   - FileAttachment lives only in index.md — not here.
// ─────────────────────────────────────────────────────────────────────────────


// ── HELPERS ──────────────────────────────────────────────────────────────────

// Return a value at a given percentile from a sorted array.
// p is 0–100. e.g. quantile(arr, 25) → p25 value.
function quantile(sorted, p) {
  const idx = (p / 100) * (sorted.length - 1);
  const lo  = Math.floor(idx);
  const hi  = Math.ceil(idx);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
}

// Manual groupBy — replaces Map.groupBy() which is not yet universal.
// Returns a Map of key → array of matching rows.
function groupBy(arr, keyFn) {
  const map = new Map();
  for (const item of arr) {
    const key = keyFn(item);
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(item);
  }
  return map;
}

// The 13 indicator columns that make up the TRIP score,
// along with their human-readable labels and category.
// Column names match the actual CSV output of trip_clean.csv.py.
export const INDICATORS = [
  { col: "dir_crim",         label: "No direct criminalization",          category: "criminalization" },
  { col: "ind_crim",         label: "No indirect criminalization",        category: "criminalization" },
  { col: "gmc",              label: "Gender marker change possible",      category: "recognition"    },
  { col: "gmcpr",            label: "GMC — self-ID / no procedure",       category: "recognition"    },
  { col: "gmcphys",          label: "GMC — no physical requirement",      category: "recognition"    },
  { col: "gmcpsych",         label: "GMC — no psychiatric requirement",   category: "recognition"    },
  { col: "gmcdiv",           label: "GMC — no divorce requirement",       category: "recognition"    },
  { col: "nb3g",             label: "Nonbinary / third gender marker",    category: "recognition"    },
  { col: "adp_employment",   label: "Anti-discrim: employment",           category: "protection"     },
  { col: "adp_education",    label: "Anti-discrim: education",            category: "protection"     },
  { col: "adp_healthcare",   label: "Anti-discrim: healthcare",           category: "protection"     },
  { col: "adp_housing",      label: "Anti-discrim: housing",              category: "protection"     },
  { col: "adp_constitution", label: "Anti-discrim: constitutional",       category: "protection"     },
];

// Region labels — readable versions of V-Dem region codes.
export const REGION_LABELS = {
  "Western Europe and North America":    "W. Europe & N. America",
  "Eastern Europe and Central Asia":     "E. Europe & C. Asia",
  "Latin America and the Caribbean":     "Latin America & Caribbean",
  "Middle East and N. Africa":           "Middle East & N. Africa",
  "Sub-Saharan Africa":                  "Sub-Saharan Africa",
  "Asia and Pacific":                    "Asia & Pacific",
};


// ── ACT I: YEARLY DISTRIBUTION STATS ─────────────────────────────────────────
// Returns one row per year with: mean, median, p10, p25, p75, p90.
// Used by distributionTrend.js to draw the line + expanding bands.

export function yearlyStats(raw) {
  // Group rows by year
  const byYear = groupBy(raw, d => d.year);

  return Array.from(byYear.entries())
    .filter(([year]) => year >= 2000 && year <= 2021)
    .map(([year, rows]) => {
      // Pull out just the trip_percent values and drop nulls
      const vals = rows
        .map(d => d.trip_percent)
        .filter(v => v != null && !isNaN(v))
        .sort((a, b) => a - b);

      const mean = vals.reduce((s, v) => s + v, 0) / vals.length;

      return {
        year:   +year,
        mean:   mean,
        median: quantile(vals, 50),
        p10:    quantile(vals, 10),
        p25:    quantile(vals, 25),
        p75:    quantile(vals, 75),
        p90:    quantile(vals, 90),
        n:      vals.length,
      };
    })
    .sort((a, b) => a.year - b.year);
}


// ── ACT II: COUNTRY SNAPSHOT ──────────────────────────────────────────────────
// Returns one row per country for a given year, with score + region.
// Used by choropleth.js.

export function countrySnapshot(raw, year = 2021) {
  return raw
    .filter(d => d.year === year && d.trip_percent != null)
    .map(d => ({
      iso3:       d.iso3,
      name:       d.country_name,
      score:      d.trip_percent,
      region:     d.e_regionpol_6c,
      dir_crim:   d.dir_crim,
      ind_crim:   d.ind_crim,
      gmc:        d.gmc,
      nb3g:       d.nb3g,
    }));
}


// ── ACT III: INDICATOR ADOPTION RATES ────────────────────────────────────────
// Returns one object per indicator with adoption rate in 2000 and 2021.
// Sorted by 2021 rate descending (for dot plot ordering).
// Used by indicatorDotPlot.js.

export function indicatorAdoption(raw) {
  const y2000 = raw.filter(d => d.year === 2000);
  const y2021 = raw.filter(d => d.year === 2021);

  const adoption = INDICATORS.map(ind => {
    const rate2000 = y2000.filter(d => d[ind.col] != null)
      .reduce((s, d, _, a) => s + d[ind.col] / a.length, 0);
    const rate2021 = y2021.filter(d => d[ind.col] != null)
      .reduce((s, d, _, a) => s + d[ind.col] / a.length, 0);

    return {
      col:       ind.col,
      label:     ind.label,
      category:  ind.category,
      rate2000:  rate2000,
      rate2021:  rate2021,
      delta:     rate2021 - rate2000,
    };
  });

  // Sort by 2021 adoption rate descending
  return adoption.sort((a, b) => b.rate2021 - a.rate2021);
}


// ── ACT IV: FINGERPRINT MATRIX ────────────────────────────────────────────────
// Returns a 2D structure: { countries, years, cells }
// countries: sorted by 2021 trip_percent descending
// years: 2000–2021
// cells: flat array of { countryIdx, yearIdx, score } for D3 rendering
// Used by flagship.js.

export function fingerprintMatrix(raw) {
  const years = Array.from(
    new Set(raw.map(d => d.year).filter(y => y >= 2000 && y <= 2021))
  ).sort((a, b) => a - b);

  // Get 2021 scores to determine sort order
  const scores2021 = new Map(
    raw.filter(d => d.year === 2021)
       .map(d => [d.iso3, d.trip_percent ?? 0])
  );

  // Unique countries sorted by 2021 score descending
  const countries = Array.from(
    new Map(raw.map(d => [d.iso3, d.country_name]))
  )
    .map(([iso3, name]) => ({ iso3, name, score2021: scores2021.get(iso3) ?? 0 }))
    .sort((a, b) => b.score2021 - a.score2021);

  const countryIndex = new Map(countries.map((c, i) => [c.iso3, i]));
  const yearIndex    = new Map(years.map((y, i) => [y, i]));

  // Build flat cells array
  const cells = raw
    .filter(d => d.year >= 2000 && d.year <= 2021 && d.trip_percent != null)
    .map(d => ({
      countryIdx: countryIndex.get(d.iso3),
      yearIdx:    yearIndex.get(d.year),
      iso3:       d.iso3,
      name:       d.country_name,
      year:       d.year,
      score:      d.trip_percent,
    }))
    .filter(d => d.countryIdx !== undefined && d.yearIdx !== undefined);

  return { countries, years, cells };
}


// ── ACT III: COUNTRY PROFILES (for typology callouts) ─────────────────────────
// Returns full indicator breakdown for a set of named countries.
// Used to populate the typology cards in index.md (not a chart — just data).

export function countryProfiles(raw, isos = ["ARG", "IND", "AUT"]) {
  const y2021 = raw.filter(d => d.year === 2021 && isos.includes(d.iso3));

  return y2021.map(d => ({
    iso3:    d.iso3,
    name:    d.country_name,
    score:   d.trip_percent,
    indicators: INDICATORS.map(ind => ({
      col:   ind.col,
      label: ind.label,
      value: d[ind.col],
    })),
  }));
}
