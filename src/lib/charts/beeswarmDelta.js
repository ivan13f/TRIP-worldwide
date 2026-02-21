import * as Plot from "@observablehq/plot";

/**
 * Computes delta = score(yearB) - score(yearA) per iso3 (simple version).
 */
export function beeswarmDelta({ data, yearA = 2000, yearB = 2021, width = 900, height = 420 } = {}) {
  const byIso = new Map();
  for (const d of data) {
    if (!d.iso3) continue;
    if (!byIso.has(d.iso3)) byIso.set(d.iso3, []);
    byIso.get(d.iso3).push(d);
  }

  const deltas = [];
  for (const [iso3, rows] of byIso) {
    const a = rows.find(r => r.year === yearA)?.trip_score;
    const b = rows.find(r => r.year === yearB)?.trip_score;
    if (Number.isFinite(a) && Number.isFinite(b)) {
      deltas.push({ iso3, delta: b - a });
    }
  }

  if (!deltas.length) return `No deltas computed. Check that ${yearA} and ${yearB} exist + trip_score is mapped.`;

  deltas.sort((x, y) => y.delta - x.delta);

  return Plot.plot({
    width,
    height,
    marginLeft: 48,
    x: { label: `Δ TRIP score (${yearA} → ${yearB})` },
    y: { label: null },
    marks: [
      Plot.ruleX([0]),
      Plot.dot(deltas, { x: "delta", y: () => 0, r: 3, tip: true }),
    ]
  });
}
