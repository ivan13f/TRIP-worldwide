/**
 * theme.js — Design tokens for D3 and Observable Plot charts
 * ------------------------------------------------------------
 * Import this in any chart module to get consistent colors,
 * fonts, and chart defaults without hardcoding hex values.
 *
 * Usage:
 *   import { colors, fonts, chart } from "../theme.js";
 *   svg.append("text").style("fill", colors.fog).style("font-family", fonts.mono)
 */

// ── Color palette ──────────────────────────────────────────────

export const colors = {
  // Backgrounds
  ink:      "#0f1116",   // page background
  slate:    "#1e2130",   // elevated surfaces

  // Text
  fog:      "#d7e8e9",   // primary text / high-score labels
  muted:    "#8a9aa0",   // secondary text, axis labels

  // Accents — the purple → emerald axis is the color scale for TRIP scores
  violet:   "#6e5cc5",   // low score / no protections
  emerald:  "#35bf78",   // high score / full protections
  coral:    "#e68263",   // global average line, urgency callouts
  rust:     "#8f4636",   // deep warm, secondary
  azure:    "#2a8fd4",   // regime annotations

  // Opacity variants (for fills, gridlines)
  stroke:   "rgba(215,232,233,0.13)",
  grid:     "rgba(215,232,233,0.09)",
  axis:     "rgba(215,232,233,0.32)",
  tick:     "rgba(215,232,233,0.52)",
};

// ── Typography ─────────────────────────────────────────────────

export const fonts = {
  display: "'Syne', ui-sans-serif, system-ui, sans-serif",
  body:    "'DM Sans', ui-sans-serif, system-ui, sans-serif",
  mono:    "'DM Mono', ui-monospace, 'Cascadia Code', monospace",
};

// ── TRIP score color scale ─────────────────────────────────────
// The flagship fingerprint and choropleth both use this scale.
// It maps TRIP score (0–13) onto the violet → emerald gradient.
// Import d3 and call: d3.scaleSequential(tripScale).domain([0, 13])

export const tripScale = [colors.violet, "#4f82c2", colors.emerald];
// For d3 use: d3.scaleSequential(d3.piecewise(d3.interpolateRgb, tripScale))

// ── Observable Plot theme ──────────────────────────────────────
// Pass `...plotTheme` to any Plot.plot() call for consistent styling.

export const plotTheme = {
  style: {
    background:  "transparent",
    color:       colors.fog,
    fontFamily:  fonts.mono,
    fontSize:    "11px",
  },
  x: {
    labelAnchor: "right",
    tickSize:    0,
    tickPadding: 8,
    labelOffset: 28,
  },
  y: {
    tickSize:    0,
    tickPadding: 8,
    labelOffset: 28,
  },
};

// ── Region colors ──────────────────────────────────────────────
// Consistent color per region for multi-region charts.
// Keys match the e_regionpol_6c values in the dataset.

export const regionColors = {
  "Western Europe and North America":  "#6e5cc5",   // violet
  "Latin America and the Caribbean":   "#35bf78",   // emerald
  "Eastern Europe and Central Asia":   "#2a8fd4",   // azure
  "Asia and Pacific":                  "#e5c94e",   // amber
  "Sub-Saharan Africa":                "#e68263",   // coral
  "Middle East and North Africa":      "#b85ccf",   // magenta-purple
};

// ── Indicator labels ───────────────────────────────────────────
// Human-readable labels for the 13 TRIP indicators.
// Used by indicatorDotPlot and country profiles.

export const indicatorLabels = {
  dir_crim:        "No direct criminalization",
  ind_crim:        "No indirect criminalization",
  gmc:             "Gender marker change (any)",
  gmcpr:           "  — Self-ID / procedure-free",
  gmcphys:         "  — No physical requirement",
  gmcpsych:        "  — No psych. requirement",
  gmcdiv:          "  — No divorce requirement",
  nb3g:            "Third gender / non-binary",
  adp_employment:  "Anti-discrim: employment",
  adp_education:   "Anti-discrim: education",
  adp_healthcare:  "Anti-discrim: healthcare",
  adp_housing:     "Anti-discrim: housing",
  adp_constitution:"Constitutional protection",
};

export const indicators = Object.keys(indicatorLabels);

// ── THEME bundle ───────────────────────────────────────────────
// Convenience export for chart modules that need colors + fonts together.
// Import as: import { THEME } from "./lib/theme.js";
// Pass to chart functions as: { theme: THEME }

export const THEME = { colors, fonts };
