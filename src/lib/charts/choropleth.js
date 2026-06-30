// lib/charts/choropleth.js
// ─────────────────────────────────────────────────────────────────────────────
// ACT II — The Map That Isn't There
//
// Annotated world map colored by TRIP score (2021).
// Projection: Equal-Earth — preserves relative land area without distortion.
// Annotations: ~10 countries with editorial leader lines and labels.
//
// Key D3 concepts:
//   - d3.geoEqualEarth() → the map projection (math that converts lat/lon → px)
//   - d3.geoPath() → converts GeoJSON features to SVG path strings
//   - TopoJSON → compact geographic format; geo.js converts it to GeoJSON
//   - d3.scaleSequential() + d3.interpolate → maps 0–1 score to color
//
// Geo data is loaded in index.md via FileAttachment and passed via geo.js.
// ─────────────────────────────────────────────────────────────────────────────

import * as d3     from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import { loadGeo } from "../geo.js";

// ── EDITORIAL ANNOTATIONS ────────────────────────────────────────────────────
// These are the 10 countries that get leader-line annotations on the map.
// Coordinates are [longitude, latitude] in degrees (geographic, not pixel).
// The label and sublabel are editorial copy — adjust tone in writing phase.

const ANNOTATIONS = [
  {
    iso3:     "ARG",
    label:    "Argentina",
    sublabel: "First self-ID law, 2012",
    coords:   [-64, -34],
    anchor:   "end",
    offset:   [-10, 0],
  },
  {
    iso3:     "PAK",
    label:    "Pakistan",
    sublabel: "84% TRIP · 0% LGB",
    coords:   [70, 30],
    anchor:   "start",
    offset:   [10, 0],
  },
  {
    iso3:     "USA",
    label:    "United States",
    sublabel: "No national gender recognition law",
    coords:   [-100, 38],
    anchor:   "middle",
    offset:   [0, -16],
  },
  {
    iso3:     "IRN",
    label:    "Iran",
    sublabel: "State-funded surgery since 1987",
    coords:   [53, 32],
    anchor:   "start",
    offset:   [10, -8],
  },
  {
    iso3:     "NOR",
    label:    "Norway",
    sublabel: "Expected leader",
    coords:   [15, 65],
    anchor:   "start",
    offset:   [8, 0],
  },
  {
    iso3:     "NGA",
    label:    "Nigeria",
    sublabel: "Colonial law, 1860",
    coords:   [8, 9],
    anchor:   "start",
    offset:   [10, 4],
  },
  {
    iso3:     "IND",
    label:    "India",
    sublabel: "Recognition, not protection",
    coords:   [78, 22],
    anchor:   "end",
    offset:   [-10, 8],
  },
  {
    iso3:     "AUT",
    label:    "Austria",
    sublabel: "82% LGB · 23% TRIP",
    coords:   [14, 47],
    anchor:   "middle",
    offset:   [0, -14],
  },
  {
    iso3:     "NPL",
    label:    "Nepal",
    sublabel: "Third gender since 2007",
    coords:   [84, 28],
    anchor:   "start",
    offset:   [8, -8],
  },
  {
    iso3:     "UGA",
    label:    "Uganda",
    sublabel: "Worsening after 2021",
    coords:   [32, 1],
    anchor:   "start",
    offset:   [8, 4],
  },
];

export async function choropleth(data, { width = 960, theme } = {}) {

  // ── GEO DATA ───────────────────────────────────────────────────────────────
  // loadGeo() fetches world-110m.json and converts TopoJSON → GeoJSON.
  // Returns: { countries: GeoJSON FeatureCollection, graticule: GeoJSON }
  const geo = await loadGeo();

  // Build a lookup: ISO3 code → TRIP score
  const scoreByIso = new Map(data.map(d => [d.iso3, d.score]));

  // ── DIMENSIONS ─────────────────────────────────────────────────────────────
  const height = Math.round(width * 0.5);

  // ── PROJECTION ─────────────────────────────────────────────────────────────
  // Equal-Earth projection preserves area. .fitSize() scales and centers it
  // to fill the given [width, height] for the world GeoJSON.
  const projection = d3.geoEqualEarth()
    .fitSize([width, height], geo.countries);

  // geoPath converts GeoJSON feature → SVG path string, using the projection.
  const path = d3.geoPath(projection);

  // ── COLOR SCALE ────────────────────────────────────────────────────────────
  // Maps 0–1 (TRIP percent) to a color between violet and emerald.
  // d3.interpolateRgb() smoothly interpolates between two hex colors.
  const colorScale = d3.scaleSequential()
    .domain([0, 1])
    .interpolator(d3.interpolateRgb(theme.colors.violet, theme.colors.emerald));

  // ── SVG ROOT ───────────────────────────────────────────────────────────────
  const svg = d3.create("svg")
    .attr("width",   width)
    .attr("height",  height)
    .attr("class",   "chart chart--choropleth")
    .attr("viewBox", `0 0 ${width} ${height}`);

  // ── GRATICULE (background grid lines) ──────────────────────────────────────
  svg.append("path")
    .datum(d3.geoGraticule()())
    .attr("class", "graticule")
    .attr("fill",         "none")
    .attr("stroke",       theme.colors.muted)
    .attr("stroke-width", 0.3)
    .attr("stroke-opacity", 0.4)
    .attr("d", path);

  // ── COUNTRIES ──────────────────────────────────────────────────────────────
  // geo.countries.features is an array of GeoJSON features (one per country).
  // For each, we look up the TRIP score and fill with the color scale.
  svg.selectAll(".country")
    .data(geo.countries.features)
    .join("path")
    .attr("class", d => `country country--${d.properties.iso3 ?? "unknown"}`)
    .attr("fill", d => {
      const score = scoreByIso.get(d.properties.iso3);
      return score != null
        ? colorScale(score)
        : theme.colors.muted + "40"; // no-data countries: muted + transparency
    })
    .attr("stroke",       theme.colors.ink)
    .attr("stroke-width", 0.4)
    .attr("d", path)
    .append("title")
      .text(d => {
        const score = scoreByIso.get(d.properties.iso3);
        return score != null
          ? `${d.properties.name}: ${(score * 100).toFixed(1)}%`
          : `${d.properties.name}: no data`;
      });

  // ── ANNOTATIONS ────────────────────────────────────────────────────────────
  // For each annotation, project the geographic coordinates to pixel position,
  // then draw a leader line from the country centroid to the label.

  const annotationG = svg.append("g").attr("class", "annotations");

  ANNOTATIONS.forEach(ann => {
    // Project lat/lon to pixel x, y
    const [px, py] = projection(ann.coords);
    if (!px || !py) return; // skip if projection fails

    const labelX = px + ann.offset[0];
    const labelY = py + ann.offset[1];

    // Leader line: short line from country point to label
    annotationG.append("line")
      .attr("class", "annotation-line")
      .attr("x1", px).attr("y1", py)
      .attr("x2", labelX).attr("y2", labelY)
      .attr("stroke",       theme.colors.muted)
      .attr("stroke-width", 0.8)
      .attr("opacity",      0.7);

    // Dot at country location
    annotationG.append("circle")
      .attr("cx", px).attr("cy", py).attr("r", 2.5)
      .attr("fill", theme.colors.fog)
      .attr("opacity", 0.9);

    // Label text
    const labelG = annotationG.append("g")
      .attr("transform", `translate(${labelX},${labelY})`);

    labelG.append("text")
      .attr("class", "annotation-label")
      .attr("text-anchor", ann.anchor)
      .attr("dy", "-0.15em")
      .attr("fill", theme.colors.fog)
      .style("font-size", "10px")
      .style("font-family", theme.fonts.mono)
      .style("font-weight", "600")
      .text(ann.label);

    labelG.append("text")
      .attr("class", "annotation-sublabel")
      .attr("text-anchor", ann.anchor)
      .attr("dy", "0.85em")
      .attr("fill", theme.colors.muted)
      .style("font-size", "8.5px")
      .style("font-family", theme.fonts.mono)
      .text(ann.sublabel);
  });

  // ── COLOR LEGEND ───────────────────────────────────────────────────────────
  // Small horizontal gradient legend at the bottom-left.
  const legendW = 120, legendH = 8;
  const legendX = 24, legendY = height - 32;

  const defs = svg.append("defs");
  const gradId = "trip-score-gradient";

  const grad = defs.append("linearGradient")
    .attr("id", gradId)
    .attr("x1", "0%").attr("x2", "100%");

  grad.append("stop").attr("offset", "0%").attr("stop-color", theme.colors.violet);
  grad.append("stop").attr("offset", "100%").attr("stop-color", theme.colors.emerald);

  svg.append("rect")
    .attr("x", legendX).attr("y", legendY)
    .attr("width", legendW).attr("height", legendH)
    .attr("rx", 2)
    .attr("fill", `url(#${gradId})`);

  svg.append("text")
    .attr("x", legendX).attr("y", legendY - 4)
    .attr("fill", theme.colors.muted)
    .style("font-size", "8px")
    .style("font-family", theme.fonts.mono)
    .text("TRIP score 2021");

  svg.append("text")
    .attr("x", legendX).attr("y", legendY + legendH + 10)
    .attr("fill", theme.colors.muted)
    .style("font-size", "8px")
    .style("font-family", theme.fonts.mono)
    .text("0%");

  svg.append("text")
    .attr("x", legendX + legendW).attr("y", legendY + legendH + 10)
    .attr("text-anchor", "end")
    .attr("fill", theme.colors.muted)
    .style("font-size", "8px")
    .style("font-family", theme.fonts.mono)
    .text("100%");

  return svg.node();
}
