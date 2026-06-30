// lib/charts/indicatorDotPlot.js
// ─────────────────────────────────────────────────────────────────────────────
// ACT III — What Changed, and What Didn't
//
// A 13-row horizontal dot plot. Each row = one TRIP indicator.
// Two marks per row:
//   - Hollow circle: adoption rate in 2000
//   - Filled circle: adoption rate in 2021
//   - Connecting line between them (emerald if delta > 0, coral if < 0)
//
// Rows are sorted by 2021 adoption rate, descending (most adopted = top).
//
// Key D3 concepts:
//   - d3.scaleBand() → maps categorical values (indicator names) to y positions
//   - d3.scaleLinear() → maps 0–1 proportion to x pixel position
//   - SVG <circle> → the dots
//   - SVG <line> → the connector between dots
//   - d3.axisTop() → horizontal axis at top of chart
// ─────────────────────────────────────────────────────────────────────────────

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

export function indicatorDotPlot(data, { width = 700, theme } = {}) {

  // ── DIMENSIONS ─────────────────────────────────────────────────────────────
  const margin = { top: 36, right: 80, bottom: 16, left: 220 };
  const rowH   = 36; // height per indicator row
  const height = data.length * rowH + margin.top + margin.bottom;
  const innerW = width - margin.left - margin.right;
  const innerH = height - margin.top - margin.bottom;

  // ── SCALES ─────────────────────────────────────────────────────────────────
  // xScale: 0%–100% proportion → pixel x position
  const xScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, innerW]);

  // yScale: indicator label → pixel y position (centered in row)
  // d3.scaleBand() divides a range into equal bands, one per category.
  // .padding() adds space between bands.
  const yScale = d3.scaleBand()
    .domain(data.map(d => d.label))
    .range([0, innerH])
    .padding(0.3);

  // ── SVG ROOT ───────────────────────────────────────────────────────────────
  const svg = d3.create("svg")
    .attr("width",   width)
    .attr("height",  height)
    .attr("class",   "chart chart--indicator-dot-plot")
    .attr("viewBox", `0 0 ${width} ${height}`);

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // ── BACKGROUND ROWS (alternating) ──────────────────────────────────────────
  // Subtle alternating stripes to help the eye track across each row.
  g.selectAll(".row-bg")
    .data(data)
    .join("rect")
    .attr("class", "row-bg")
    .attr("x",       -margin.left)
    .attr("y",       d => yScale(d.label))
    .attr("width",   width)
    .attr("height",  yScale.bandwidth())
    .attr("fill",    (d, i) => i % 2 === 0 ? theme.colors.ink + "00" : theme.colors.fog + "08");

  // ── ZERO LINE ──────────────────────────────────────────────────────────────
  g.append("line")
    .attr("x1", 0).attr("x2", 0)
    .attr("y1", 0).attr("y2", innerH)
    .attr("stroke",       theme.colors.muted)
    .attr("stroke-width", 0.5)
    .attr("opacity",      0.5);

  // ── CONNECTOR LINES ────────────────────────────────────────────────────────
  // A line between the 2000 dot and the 2021 dot.
  // Color encodes direction: emerald = growth, coral = regression.
  g.selectAll(".connector")
    .data(data)
    .join("line")
    .attr("class", "connector")
    .attr("x1", d => xScale(d.rate2000))
    .attr("x2", d => xScale(d.rate2021))
    .attr("y1", d => yScale(d.label) + yScale.bandwidth() / 2)
    .attr("y2", d => yScale(d.label) + yScale.bandwidth() / 2)
    .attr("stroke", d => d.delta >= 0 ? theme.colors.emerald : theme.colors.coral)
    .attr("stroke-width", 2)
    .attr("opacity", 0.7);

  // ── 2000 DOTS (hollow) ─────────────────────────────────────────────────────
  g.selectAll(".dot-2000")
    .data(data)
    .join("circle")
    .attr("class",  "dot dot-2000")
    .attr("cx",     d => xScale(d.rate2000))
    .attr("cy",     d => yScale(d.label) + yScale.bandwidth() / 2)
    .attr("r",      5)
    .attr("fill",   "none")
    .attr("stroke", theme.colors.muted)
    .attr("stroke-width", 1.5)
    .append("title")
      .text(d => `${d.label} — 2000: ${(d.rate2000 * 100).toFixed(0)}%`);

  // ── 2021 DOTS (filled) ─────────────────────────────────────────────────────
  g.selectAll(".dot-2021")
    .data(data)
    .join("circle")
    .attr("class", "dot dot-2021")
    .attr("cx",    d => xScale(d.rate2021))
    .attr("cy",    d => yScale(d.label) + yScale.bandwidth() / 2)
    .attr("r",     6)
    .attr("fill",  d => d.delta >= 0 ? theme.colors.emerald : theme.colors.coral)
    .attr("opacity", 0.9)
    .append("title")
      .text(d => `${d.label} — 2021: ${(d.rate2021 * 100).toFixed(0)}%`);

  // ── 2021 VALUE LABELS ──────────────────────────────────────────────────────
  // Show the 2021 percentage to the right of the filled dot.
  g.selectAll(".label-2021")
    .data(data)
    .join("text")
    .attr("class", "label label-2021")
    .attr("x",  d => xScale(d.rate2021) + 10)
    .attr("y",  d => yScale(d.label) + yScale.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("fill", theme.colors.fog)
    .style("font-size",   "10px")
    .style("font-family", theme.fonts.mono)
    .text(d => `${(d.rate2021 * 100).toFixed(0)}%`);

  // ── CATEGORY LABELS (left side) ────────────────────────────────────────────
  // The indicator name, left-aligned outside the chart area.
  g.selectAll(".label-indicator")
    .data(data)
    .join("text")
    .attr("class", "label label-indicator")
    .attr("x",  -8)
    .attr("y",  d => yScale(d.label) + yScale.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", "end")
    .attr("fill", d => d.delta < 0 ? theme.colors.coral : theme.colors.fog)
    .style("font-size",   "11px")
    .style("font-family", theme.fonts.mono)
    .text(d => d.label);

  // ── AXIS ───────────────────────────────────────────────────────────────────
  const xAxis = d3.axisTop(xScale)
    .tickValues([0, 0.25, 0.5, 0.75, 1])
    .tickFormat(d => `${(d * 100).toFixed(0)}%`)
    .tickSize(-innerH);

  g.append("g")
    .attr("class", "axis axis--x")
    .call(xAxis)
    .select(".domain").remove();

  // Style tick lines subtly
  g.selectAll(".axis--x .tick line")
    .attr("stroke", theme.colors.muted)
    .attr("stroke-opacity", 0.3);

  g.selectAll(".axis--x .tick text")
    .attr("fill", theme.colors.muted)
    .style("font-size", "10px")
    .style("font-family", theme.fonts.mono);

  // ── LEGEND ─────────────────────────────────────────────────────────────────
  // Small legend at top-right: hollow = 2000, filled = 2021.
  const legendG = svg.append("g")
    .attr("transform", `translate(${width - margin.right + 10}, ${margin.top})`);

  legendG.append("circle")
    .attr("cx", 6).attr("cy", 6).attr("r", 5)
    .attr("fill", "none")
    .attr("stroke", theme.colors.muted)
    .attr("stroke-width", 1.5);

  legendG.append("text")
    .attr("x", 16).attr("y", 6).attr("dy", "0.35em")
    .attr("fill", theme.colors.muted)
    .style("font-size", "9px")
    .style("font-family", theme.fonts.mono)
    .text("2000");

  legendG.append("circle")
    .attr("cx", 6).attr("cy", 22).attr("r", 6)
    .attr("fill", theme.colors.emerald).attr("opacity", 0.9);

  legendG.append("text")
    .attr("x", 16).attr("y", 22).attr("dy", "0.35em")
    .attr("fill", theme.colors.fog)
    .style("font-size", "9px")
    .style("font-family", theme.fonts.mono)
    .text("2021");

  return svg.node();
}
