/**
 * theme.js — Design tokens for the D3 charts (light editorial system, v2).
 * Values mirror the CSS custom properties in style.css; keep both in sync.
 * Every colour here was run through the dataviz palette validator on --paper.
 */

export const colors = {
  paper:   "#F7F5F0",   // page + chart surface
  paper2:  "#EFECE4",   // cards, notes, step cards
  rule:    "#D6D2C8",   // hairlines, gridlines
  nodata:  "#E7E3DA",   // missing data (always hatched)
  ink:     "#111111",   // primary text, annotation dots
  ink2:    "#3D3D3A",   // secondary text, "2000" ring
  ink3:    "#67655F",   // ticks, captions, kickers (5.35:1)
  primary: "#5A37D1",   // average line, gain, brand block
  accent:  "#FF4E00",   // the finding: bottom quarter, loss, 2012 break
};

export const primaryRamp = {
  50: "#ECEDFF", 100: "#AEACF9", 200: "#968FF7", 300: "#7E6EF2",
  400: "#6B53E4", 500: "#5A37D1", 600: "#4621AC", 700: "#31167E",
};

// TRIP score classes (out of 13). Bins follow the data: 78% of all
// country-years score 0–2, so the low end gets one colour per value.
export const scoreClasses = [
  { min: 0,  max: 0,  label: "0",    color: "#E2C157" },
  { min: 1,  max: 1,  label: "1",    color: "#42B59A" },
  { min: 2,  max: 2,  label: "2",    color: "#008FB5" },
  { min: 3,  max: 4,  label: "3-4",  color: "#295DC4" },
  { min: 5,  max: 8,  label: "5-8",  color: "#521CA9" },
  { min: 9,  max: 13, label: "9-13", color: "#490053" },
];

// percent: trip_percent (0–1). Returns the class colour, or null for missing data.
export function scoreColor(percent) {
  if (percent == null || Number.isNaN(percent)) return null;
  const n = Math.round(percent * 13);
  return scoreClasses.find(c => n >= c.min && n <= c.max).color;
}

export const fonts = {
  serif: "'Besley', Georgia, 'Times New Roman', serif",
  sans:  "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif",
};

export const indicatorLabels = {
  dir_crim:         "No direct criminalization",
  ind_crim:         "No indirect criminalization",
  gmc:              "Legal gender marker change",
  gmcphys:          "No surgery or physical requirement",
  gmcpsych:         "No psychiatric diagnosis required",
  gmcdiv:           "No divorce requirement",
  nb3g:             "Nonbinary or third gender marker",
  adp_general:      "General anti-discrimination law",
  adp_employment:   "Protection in employment",
  adp_education:    "Protection in education",
  adp_healthcare:   "Protection in healthcare",
  adp_housing:      "Protection in housing",
  adp_constitution: "Constitutional protection",
};

export const THEME = { colors, fonts, primaryRamp, scoreClasses, scoreColor };
