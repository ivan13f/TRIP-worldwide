// lib/charts/indicatorDotPlot.js — ACT III: share of countries holding each right, 2000 vs 2021.
// Hollow ring = 2000, filled dot = 2021; dot and connector are primary when the
// share rose and accent when it fell. Rows grouped by indicator family.

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { tooltip, ttRow, pct } from "./tooltip.js";

export function indicatorDotPlot(data, { width = 900, theme } = {}) {
  const C = theme.colors;
  const groups = d3.groups(data, d => d.category);
  const m = { top: 24, right: 56, bottom: 8, left: 56 }, rowH = 52, headH = 40;
  const height = m.top + m.bottom + data.length * rowH + groups.length * headH;
  const x = d3.scaleLinear([0, 1], [m.left, width - m.right]);
  const tt = tooltip();

  const svg = d3.create("svg")
    .attr("class", "chart chart--dotplot")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Dot plot of the 13 TRIP indicators, share of countries in 2000 and 2021. " +
      data.map(d => `${d.label}: ${pct(d.rate2000, 0)} to ${pct(d.rate2021, 0)}`).join(". "));

  [0, 0.25, 0.5, 0.75, 1].forEach(v => {
    svg.append("line").attr("class", "grid-line").attr("x1", x(v)).attr("x2", x(v)).attr("y1", m.top - 6).attr("y2", height - m.bottom);
    svg.append("text").attr("class", "tick").attr("x", x(v)).attr("y", m.top - 12).attr("text-anchor", "middle").text(`${v * 100}%`);
  });

  let y0 = m.top;
  for (const [group, rows] of groups) {
    svg.append("text").attr("class", "group-label halo").attr("x", 0).attr("y", y0 + 28).text(group.toUpperCase());
    y0 += headH;
    for (const d of rows) {
      const cy = y0 + 34, up = d.rate2021 >= d.rate2000, col = up ? C.primary : C.accent;
      const row = svg.append("g");
      const hl = row.append("rect").attr("y", y0).attr("width", width).attr("height", rowH).attr("fill", C.paper2).attr("opacity", 0);
      row.append("text").attr("class", "dlabel halo").attr("x", m.left).attr("y", y0 + 14).text(d.label);
      row.append("line").attr("x1", x(d.rate2000)).attr("x2", x(d.rate2021)).attr("y1", cy).attr("y2", cy)
        .attr("stroke", col).attr("stroke-width", 2.5);
      row.append("circle").attr("cx", x(d.rate2000)).attr("cy", cy).attr("r", 5)
        .attr("fill", C.paper).attr("stroke", C.ink2).attr("stroke-width", 2);
      row.append("circle").attr("cx", x(d.rate2021)).attr("cy", cy).attr("r", 6)
        .attr("fill", col).attr("stroke", C.paper).attr("stroke-width", 2);
      const [lo, hi] = up ? [d.rate2000, d.rate2021] : [d.rate2021, d.rate2000];
      row.append("text").attr("class", `dlabel ${up ? "dlabel--muted" : "dlabel--strong"}`)
        .attr("x", x(lo) - 12).attr("y", cy).attr("dy", "0.32em").attr("text-anchor", "end").text(pct(lo, 0));
      row.append("text").attr("class", `dlabel ${up ? "dlabel--strong" : "dlabel--muted"}`)
        .attr("x", x(hi) + 12).attr("y", cy).attr("dy", "0.32em").text(pct(hi, 0));
      row.append("rect").attr("y", y0).attr("width", width).attr("height", rowH).attr("fill", "transparent")
        .on("pointermove", ev => {
          hl.attr("opacity", 1);
          const dp = (d.rate2021 - d.rate2000) * 100;
          tt.show(`<span class="tt__title">${d.label}</span>` +
            ttRow("2000", pct(d.rate2000), "ring") + ttRow("2021", pct(d.rate2021), col) +
            ttRow("Change", `${dp >= 0 ? "+" : "−"}${Math.abs(dp).toFixed(1)} pts`), ev);
        })
        .on("pointerleave", () => { hl.attr("opacity", 0); tt.hide(); });
      y0 += rowH;
    }
  }
  return svg.node();
}
