import * as Plot from "@observablehq/plot";

export function lineGlobal({ series, width = 900, height = 260 } = {}) {
  if (!series?.length) return "No data to plot (global series is empty).";

  return Plot.plot({
    width,
    height,
    marginLeft: 48,
    marginBottom: 32,
    x: { label: "Year" },
    y: { label: "Global average TRIP score" },
    marks: [
      Plot.ruleY([0]),
      Plot.line(series, { x: "year", y: "value" }),
      Plot.dot(series, { x: "year", y: "value" })
    ]
  });
}
