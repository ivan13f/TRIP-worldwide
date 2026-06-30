import * as Plot from "@observablehq/plot";

export function countryCompare({ data, iso3, width = 900, height = 320 } = {}) {
  const rows = data
    .filter(d => d.iso3 === iso3 && Number.isFinite(d.year) && Number.isFinite(d.trip_score))
    .sort((a, b) => a.year - b.year);

  if (!rows.length) return `No rows for iso3=${iso3}. Check normalizeTripRows mapping.`;

  return Plot.plot({
    width,
    height,
    marginLeft: 48,
    x: { label: "Year" },
    y: { label: "TRIP score" },
    marks: [
      Plot.ruleY([0]),
      Plot.line(rows, { x: "year", y: "trip_score" }),
      Plot.dot(rows, { x: "year", y: "trip_score", tip: true })
    ]
  });
}
