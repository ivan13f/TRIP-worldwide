// src/lib/data.js
// Data helpers for TRIP project.
// IMPORTANT: Do NOT call FileAttachment here.
// Load files in .md pages, then pass arrays into these functions.

/**
 * Normalizes column names and returns a consistent row shape.
 * Adjust the field mapping here once, and all charts benefit.
 */
export function normalizeTripRows(rows) {
  if (!Array.isArray(rows)) return [];

  return rows
    .map((r) => {
      // common column variants (edit as needed)
      const country =
        r.country ?? r.Country ?? r.name ?? r.CountryName ?? r.country_name ?? null;

      const iso3 =
        r.iso3 ?? r.ISO3 ?? r.iso_code3 ?? r.iso_code ?? r.ISO ?? null;

      const yearRaw = r.year ?? r.Year ?? null;
      const year = yearRaw == null ? null : +yearRaw;

      const tripRaw =
        r.trip_score ?? r.TRIP ?? r.trip ?? r.score ?? r.TRIP_score ?? null;
      const trip_score = tripRaw == null ? null : +tripRaw;

      // Keep the original row too (useful while exploring)
      return { ...r, country, iso3, year, trip_score };
    })
    .filter((d) => Number.isFinite(d.year)); // basic sanity
}

/** Returns rows for a single year. */
export function filterByYear(rows, year) {
  const y = +year;
  return rows.filter((d) => d.year === y);
}

/** Group rows by a key function. Returns Map(key -> array). */
export function groupBy(rows, keyFn) {
  const m = new Map();
  for (const r of rows) {
    const k = keyFn(r);
    if (!m.has(k)) m.set(k, []);
    m.get(k).push(r);
  }
  return m;
}

/** Mean helper (ignores null/NaN). */
export function mean(values) {
  let s = 0, n = 0;
  for (const v of values) {
    const x = +v;
    if (Number.isFinite(x)) {
      s += x;
      n += 1;
    }
  }
  return n ? s / n : null;
}

/**
 * Global average TRIP score by year.
 * Output: [{ year, value }]
 */
export function globalAverageByYear(rows) {
  const byYear = groupBy(rows, (d) => d.year);
  const out = [];
  for (const [year, arr] of byYear) {
    out.push({
      year: +year,
      value: mean(arr.map((d) => d.trip_score)),
    });
  }
  out.sort((a, b) => a.year - b.year);
  return out;
}

/**
 * Country time series for selected ISO3 list.
 * Output: Map(iso3 -> [{year, value}])
 */
export function countrySeries(rows, iso3List) {
  const wanted = new Set(iso3List.map(String));
  const filtered = rows.filter((d) => d.iso3 && wanted.has(String(d.iso3)));
  const byIso = groupBy(filtered, (d) => String(d.iso3));
  const out = new Map();
  for (const [iso3, arr] of byIso) {
    const series = arr
      .map((d) => ({ year: d.year, value: d.trip_score }))
      .filter((d) => Number.isFinite(d.year))
      .sort((a, b) => a.year - b.year);
    out.set(iso3, series);
  }
  return out;
}
