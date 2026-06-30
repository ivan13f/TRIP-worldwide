// lib/charts/flagship.js
// ─────────────────────────────────────────────────────────────────────────────
// ACT IV — The Divergence Fingerprint
//
// The main event. All 173 countries × 22 years, colored by TRIP score.
// Countries run top-to-bottom (y-axis), sorted by 2021 score descending.
// Years run left-to-right (x-axis), 2000–2021.
// Each cell is colored violet → emerald by score.
//
// Scroll is driven by Scrollama. Four steps annotate the image:
//   Step 1: Highlight 2000 — the world was uniformly stuck.
//   Step 2: Highlight 2000–2010 — a small group begins to separate.
//   Step 3: Mark 2012 (Argentina) — the acceleration point.
//   Step 4: Highlight bottom half — unchanged in 22 years.
//
// This file manages its own Scrollama instance. It does NOT use scroll.js.
// It is built in raw D3 — no Observable Plot.
//
// Key D3 concepts:
//   - d3.scaleBand() for both x (years) and y (countries)
//   - d3.scaleSequential() for color encoding
//   - Scrollama for step-triggered highlights
//   - d3.select / .selectAll / .filter for targeting specific cells
// ─────────────────────────────────────────────────────────────────────────────

import * as d3     from "https://cdn.jsdelivr.net/npm/d3@7/+esm";
import scrollama   from "https://cdn.jsdelivr.net/npm/scrollama@3/+esm";

// ── COUNTRY ANNOTATIONS ──────────────────────────────────────────────────────
// Countries to label on the right edge of the fingerprint.
// Sorted to match the visual from top (highest 2021 score) to bottom.
const COUNTRY_LABELS = [
  "ISL", "NOR", "ARG", "NLD", "MLT", "BEL", "DNK",
  "PAK", "NPL", "IND",
  "USA",
  "BRA", "COL",
  "AUT", "ZAF",
  "NGA", "KEN", "UGA",
  "IRN", "SAU",
];

// Key event to annotate on the time axis
const TIME_ANNOTATIONS = [
  { year: 2012, label: "Argentina self-ID law", sublabel: "First in the world" },
];

export function flagship({ countries, years, cells }, {
  container = "#flagship-graphic",
  steps     = ".flagship-steps .step",
  theme,
} = {}) {

  // ── DIMENSIONS ─────────────────────────────────────────────────────────────
  const containerEl = document.querySelector(container);
  if (!containerEl) return;

  const margin   = { top: 32, right: 160, bottom: 48, left: 16 };
  const width    = containerEl.clientWidth;
  const cellH    = Math.max(3, Math.floor((window.innerHeight * 0.75) / countries.length));
  const height   = countries.length * cellH + margin.top + margin.bottom;
  const innerW   = width - margin.left - margin.right;
  const innerH   = countries.length * cellH;

  // ── SCALES ─────────────────────────────────────────────────────────────────
  const xScale = d3.scaleBand()
    .domain(years)
    .range([0, innerW])
    .padding(0.05);

  const yScale = d3.scaleBand()
    .domain(countries.map(c => c.iso3))
    .range([0, innerH])
    .padding(0.02);

  const colorScale = d3.scaleSequential()
    .domain([0, 1])
    .interpolator(d3.interpolateRgb(theme.colors.violet, theme.colors.emerald));

  // p25 boundary: which country index sits at approximately the p25 boundary?
  // We'll use this to draw the p25 line annotation in step 4.
  const p25CountryIdx = Math.floor(countries.length * 0.75); // bottom 25%

  // ── SVG ROOT ───────────────────────────────────────────────────────────────
  const svg = d3.create("svg")
    .attr("width",   width)
    .attr("height",  height)
    .attr("class",   "chart chart--flagship")
    .attr("viewBox", `0 0 ${width} ${height}`);

  containerEl.appendChild(svg.node());

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // ── CELLS ──────────────────────────────────────────────────────────────────
  // Each cell is a rect colored by TRIP score.
  // We give each cell a class with its year and country ISO for targeting.
  const cellG = g.append("g").attr("class", "cells");

  cellG.selectAll(".cell")
    .data(cells)
    .join("rect")
    .attr("class",  d => `cell cell--${d.iso3} cell--y${d.year}`)
    .attr("x",      d => xScale(d.year))
    .attr("y",      d => yScale(d.iso3))
    .attr("width",  xScale.bandwidth())
    .attr("height", yScale.bandwidth())
    .attr("fill",   d => colorScale(d.score))
    .attr("rx",     0.5)
    .append("title")
      .text(d => `${d.name} ${d.year}: ${(d.score * 100).toFixed(0)}%`);

  // ── X AXIS (years) ─────────────────────────────────────────────────────────
  const xAxis = d3.axisBottom(xScale)
    .tickValues([2000, 2005, 2010, 2015, 2021])
    .tickFormat(d => d)
    .tickSize(0);

  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${innerH + 8})`)
    .call(xAxis)
    .select(".domain").remove();

  g.selectAll(".axis--x .tick text")
    .attr("fill", theme.colors.muted)
    .style("font-size", "10px")
    .style("font-family", theme.fonts.mono);

  // ── TIME ANNOTATIONS ───────────────────────────────────────────────────────
  TIME_ANNOTATIONS.forEach(ann => {
    const x = xScale(ann.year) + xScale.bandwidth() / 2;

    g.append("line")
      .attr("class", "time-annotation-line")
      .attr("x1", x).attr("x2", x)
      .attr("y1", 0).attr("y2", innerH + 4)
      .attr("stroke", theme.colors.coral)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "3 3")
      .attr("opacity", 0); // revealed in step 3

    g.append("text")
      .attr("class", "time-annotation-label")
      .attr("x", x + 4)
      .attr("y", -4)
      .attr("fill", theme.colors.coral)
      .style("font-size", "9px")
      .style("font-family", theme.fonts.mono)
      .attr("opacity", 0)
      .text(ann.label);
  });

  // ── COUNTRY LABELS (right edge) ────────────────────────────────────────────
  const labelCountries = countries.filter(c => COUNTRY_LABELS.includes(c.iso3));

  const labelsG = g.append("g")
    .attr("class", "country-labels")
    .attr("transform", `translate(${innerW + 6}, 0)`);

  labelsG.selectAll(".country-label")
    .data(labelCountries)
    .join("g")
    .attr("class", d => `country-label country-label--${d.iso3}`)
    .attr("transform", d => `translate(0, ${yScale(d.iso3) + yScale.bandwidth() / 2})`)
    .call(g => {
      // Short leader tick
      g.append("line")
        .attr("x1", -4).attr("x2", 0)
        .attr("y1", 0).attr("y2", 0)
        .attr("stroke", theme.colors.muted)
        .attr("stroke-width", 0.5);

      // Country name
      g.append("text")
        .attr("x", 4).attr("dy", "0.35em")
        .attr("fill", theme.colors.muted)
        .style("font-size", "8.5px")
        .style("font-family", theme.fonts.mono)
        .text(d => d.name);
    });

  // ── HIGHLIGHT OVERLAYS ─────────────────────────────────────────────────────
  // Semi-transparent overlays that dim everything EXCEPT the highlighted region.
  // Shown/hidden by Scrollama step handlers below.

  // Year-range highlight mask (used in steps 1 and 2)
  const maskLeft = g.append("rect")
    .attr("class", "highlight-mask mask--left")
    .attr("x", 0).attr("y", 0)
    .attr("height", innerH)
    .attr("fill", theme.colors.ink)
    .attr("opacity", 0)
    .attr("pointer-events", "none");

  const maskRight = g.append("rect")
    .attr("class", "highlight-mask mask--right")
    .attr("y", 0).attr("height", innerH)
    .attr("fill", theme.colors.ink)
    .attr("opacity", 0)
    .attr("pointer-events", "none");

  // Bottom-half mask (used in step 4 to highlight the bottom 25%)
  const maskTop = g.append("rect")
    .attr("class", "highlight-mask mask--top")
    .attr("x", 0).attr("y", 0)
    .attr("width", innerW)
    .attr("fill", theme.colors.ink)
    .attr("opacity", 0)
    .attr("pointer-events", "none");

  // p25 boundary line (step 4)
  const p25Y = countries[p25CountryIdx]
    ? yScale(countries[p25CountryIdx].iso3)
    : innerH * 0.75;

  const p25Line = g.append("line")
    .attr("class", "p25-boundary")
    .attr("x1", 0).attr("x2", innerW)
    .attr("y1", p25Y).attr("y2", p25Y)
    .attr("stroke", theme.colors.coral)
    .attr("stroke-width", 1.5)
    .attr("stroke-dasharray", "4 3")
    .attr("opacity", 0);

  // ── SCROLLAMA SETUP ────────────────────────────────────────────────────────
  const scroller = scrollama();

  scroller
    .setup({
      step:   steps,
      offset: 0.6,   // trigger when step is 60% down the viewport
      debug:  false,
    })
    .onStepEnter(({ index }) => handleStep(index + 1, "enter"))
    .onStepExit(({ index, direction }) => {
      if (direction === "up") handleStep(index, "exit");
    });

  // ── STEP HANDLERS ─────────────────────────────────────────────────────────
  function handleStep(step, action) {
    const DUR = 600; // transition duration in ms
    const MASK_OPACITY = 0.72;

    if (action === "exit") {
      // Reset all highlights when scrolling back up
      maskLeft.transition().duration(DUR).attr("opacity", 0);
      maskRight.transition().duration(DUR).attr("opacity", 0);
      maskTop.transition().duration(DUR).attr("opacity", 0);
      p25Line.transition().duration(DUR).attr("opacity", 0);
      g.selectAll(".time-annotation-line, .time-annotation-label")
        .transition().duration(DUR).attr("opacity", 0);
      return;
    }

    if (step === 1) {
      // Highlight only year 2000: dim everything after 2001
      const x2000 = xScale(2000) + xScale.bandwidth();
      maskLeft.attr("width", 0);
      maskRight
        .attr("x", x2000)
        .attr("width", innerW - x2000)
        .transition().duration(DUR).attr("opacity", MASK_OPACITY);
      maskTop.transition().duration(DUR).attr("opacity", 0);
    }

    if (step === 2) {
      // Highlight 2000–2010: dim everything after 2010
      const x2010 = xScale(2010) + xScale.bandwidth() * 5;
      maskLeft.attr("width", 0).attr("opacity", 0);
      maskRight
        .attr("x", x2010)
        .attr("width", innerW - x2010)
        .transition().duration(DUR).attr("opacity", MASK_OPACITY);
      maskTop.transition().duration(DUR).attr("opacity", 0);
    }

    if (step === 3) {
      // Show Argentina annotation at 2012, remove year mask
      maskLeft.transition().duration(DUR).attr("opacity", 0);
      maskRight.transition().duration(DUR).attr("opacity", 0);
      maskTop.transition().duration(DUR).attr("opacity", 0);
      g.selectAll(".time-annotation-line, .time-annotation-label")
        .transition().duration(DUR).attr("opacity", 1);
    }

    if (step === 4) {
      // Highlight bottom 25%: dim top 75%, show p25 line
      maskLeft.transition().duration(DUR).attr("opacity", 0);
      maskRight.transition().duration(DUR).attr("opacity", 0);
      maskTop
        .attr("height", p25Y)
        .transition().duration(DUR).attr("opacity", MASK_OPACITY);
      p25Line.transition().duration(DUR).attr("opacity", 1);
      g.selectAll(".time-annotation-line, .time-annotation-label")
        .transition().duration(DUR).attr("opacity", 0);
    }
  }
}
