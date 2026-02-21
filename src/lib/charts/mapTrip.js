import * as Plot from "@observablehq/plot";

/**
 * Map scaffold:
 * - renders countries + borders now
 * - later we’ll add an ISO3 join to color by TRIP score
 */
export function mapTrip({ world, rows, width = 900, height = 520 } = {}) {
  if (!world?.countries?.features?.length) return "World geometry not available.";

  return Plot.plot({
    width,
    height,
    projection: "equal-earth",
    marks: [
      Plot.geo(world.countries, { stroke: "#999", fill: "#eee" }),
      Plot.geo(world.borders, { stroke: "#666" })
    ]
  });
}
