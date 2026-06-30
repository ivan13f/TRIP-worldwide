// lib/charts/distributionTrend.js
// ─────────────────────────────────────────────────────────────────────────────
// ACT I — The Headline and the Trap
//
// A single-line chart that transforms into a distribution view.
// State 0 (initial): Bold line showing the global mean, 2000–2021.
// State 1 (scroll reveal): Percentile bands fan out (p10–p90, p25–p75).
//
// Key D3 concepts used here:
//   - d3.scaleLinear() → maps data values to pixel positions
//   - d3.line() → draws a path from an array of points
//   - d3.area() → fills a region between two lines (used for bands)
//   - d3.axisBottom/Left() → draws labeled axes
//   - SVG <path> → the actual rendered line/band
//
// The two-state reveal is driven by CSS classes toggled by scroll.js.
// The chart itself just renders everything; CSS hides/shows bands.
// ─────────────────────────────────────────────────────────────────────────────

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function distributionTrend(data, { width = 800, theme } = {}) {

  // ── DIMENSIONS ─────────────────────────────────────────────────────────────
  // Margins give space for axes and labels.
  const margin = { top: 24, right: 40, bottom: 48, left: 56 };
  const height = 320;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // ── SCALES ─────────────────────────────────────────────────────────────────
  // xScale maps years (2000–2021) to x pixel positions.
  // d3.extent() returns [min, max] of an array.
  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.year))
    .range([0, innerW]);

  // yScale maps 0%–100% (or clipped to max) to y pixel positions.
  // Note: SVG y=0 is at the top, so range is [innerH, 0] — inverted.
  const yScale = d3.scaleLinear()
    .domain([0, 0.7])
    .range([innerH, 0])
    .clamp(true);

  // ── SVG ROOT ───────────────────────────────────────────────────────────────
  const svg = d3.create("svg")
    .attr("width",  width)
    .attr("height", height)
    .attr("class",  "chart chart--distribution-trend")
    .attr("viewBox", `0 0 ${width} ${height}`);

  // Group shifted by margins — everything renders inside this group.
  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // ── BAND GENERATORS ────────────────────────────────────────────────────────
  // d3.area() creates a filled shape between an upper and lower line.
  // The .x() sets the x position for each data point.
  // The .y0() is the bottom of the band, .y1() is the top.

  const bandOuter = d3.area()
    .x(d => xScale(d.year))
    .y0(d => yScale(d.p10))
    .y1(d => yScale(d.p90))
    .curve(d3.curveCatmullRom);

  const bandInner = d3.area()
    .x(d => xScale(d.year))
    .y0(d => yScale(d.p25))
    .y1(d => yScale(d.p75))
    .curve(d3.curveCatmullRom);

  // ── MEAN LINE GENERATOR ────────────────────────────────────────────────────
  // d3.line() creates a path from an array of [x, y] pairs.
  const meanLine = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.mean))
    .curve(d3.curveCatmullRom);

  const p25Line = d3.line()
    .x(d => xScale(d.year))
    .y(d => yScale(d.p25))
    .curve(d3.curveCatmullRom);

  // ── RENDER BANDS (initially hidden via CSS class) ───────────────────────────
  // The class "band--hidden" sets opacity: 0 in style.css.
  // scroll.js removes this class when the chart scrolls into view.

  g.append("path")
    .datum(data)
    .attr("class", "band band--outer band--hidden")
    .attr("fill",    theme.colors.violet)
    .attr("opacity", 0.12)
    .attr("d", bandOuter);

  g.append("path")
    .datum(data)
    .attr("class", "band band--inner band--hidden")
    .attr("fill",    theme.colors.violet)
    .attr("opacity", 0.22)
    .attr("d", bandInner);

  // ── p25 FLAT LINE (the editorial punchline) ─────────────────────────────────
  // This is the line that barely moves — the story's key finding.
  // Rendered in coral with a label. Also initially hidden.
  g.append("path")
    .datum(data)
    .attr("class", "p25-line band--hidden")
    .attr("fill",         "none")
    .attr("stroke",       theme.colors.coral)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "4 3")
    .attr("d", p25Line);

  // ── MEAN LINE (always visible) ──────────────────────────────────────────────
  g.append("path")
    .datum(data)
    .attr("class", "mean-line")
    .attr("fill",         "none")
    .attr("stroke",       theme.colors.fog)
    .attr("stroke-width", 2.5)
    .attr("d", meanLine);

  // ── AXES ───────────────────────────────────────────────────────────────────
  // d3.axisBottom() creates a horizontal axis at the bottom.
  // .tickFormat() lets us control how values are displayed.
  const xAxis = d3.axisBottom(xScale)
    .tickValues([2000, 2005, 2010, 2015, 2021])
    .tickFormat(d => d)
    .tickSize(0);

  const yAxis = d3.axisLeft(yScale)
    .tickValues([0, 0.25, 0.5])
    .tickFormat(d => `${(d * 100).toFixed(0)}%`)
    .tickSize(-innerW);

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${innerH})`)
    .call(xAxis)
    .select(".domain").remove(); // remove the axis line, keep ticks

  g.append("g")
    .attr("class", "axis axis--y")
    .call(yAxis)
    .select(".domain").remove();

  // ── ANNOTATIONS ────────────────────────────────────────────────────────────
  // Endpoint labels for the mean line.
  const lastPoint = data[data.length - 1];

  g.append("text")
    .attr("class", "annotation annotation--endpoint")
    .attr("x", xScale(lastPoint.year) + 6)
    .attr("y", yScale(lastPoint.mean))
    .attr("dy", "0.35em")
    .attr("fill", theme.colors.fog)
    .style("font-size", "11px")
    .style("font-family", theme.fonts.mono)
    .text(`${(lastPoint.mean * 100).toFixed(1)}% avg`);

  // p25 annotation (visible with the band reveal)
  g.append("text")
    .attr("class", "annotation annotation--p25 band--hidden")
    .attr("x", xScale(lastPoint.year) + 6)
    .attr("y", yScale(lastPoint.p25))
    .attr("dy", "0.35em")
    .attr("fill", theme.colors.coral)
    .style("font-size", "10px")
    .style("font-family", theme.fonts.mono)
    .text("bottom 25%: 7.7%");

  // ── RETURN THE SVG NODE ────────────────────────────────────────────────────
  // D3 creates a detached DOM node. index.md appends it to the container.
  return svg.node();
}
