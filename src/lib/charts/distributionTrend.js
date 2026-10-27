// lib/charts/distributionTrend.js — ACT I: the average and the spread.
//
// Returns an SVG node with node.step(i) for scrollytelling:
//   0  average only
//   1  + median
//   2  + middle half (25th–75th percentile band), fanning out from the median
//   3  + top 10% threshold (90th percentile), dashed reference
//   4  + bottom quarter (25th percentile) line, in the accent colour

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { tooltip, ttRow, pct } from "./tooltip.js";

export function distributionTrend(data, { width = 640, height = 420, theme } = {}) {
  const C = theme.colors;
  const narrow = width < 520;
  const m = { top: 16, right: narrow ? 84 : 112, bottom: 32, left: 40 };
  const first = data[0], last = data.at(-1);

  const x = d3.scaleLinear(d3.extent(data, d => d.year), [m.left, width - m.right]);
  const y = d3.scaleLinear([0, 0.65], [height - m.bottom, m.top]);

  const svg = d3.create("svg")
    .attr("class", "chart chart--distribution")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", `Line chart, 2000 to 2021. Average TRIP score ${pct(first.mean)} to ${pct(last.mean)}. ` +
      `Median ${pct(first.median)} to ${pct(last.median)}. 25th percentile ${pct(first.p25)} to ${pct(last.p25)}. ` +
      `75th percentile ${pct(first.p75)} to ${pct(last.p75)}. 90th percentile ${pct(first.p90)} to ${pct(last.p90)}.`);

  const yt = [0, 0.2, 0.4, 0.6];
  svg.append("g").selectAll("line").data(yt.slice(1)).join("line")
    .attr("class", "grid-line").attr("x1", m.left).attr("x2", width - m.right).attr("y1", y).attr("y2", y);
  svg.append("line").attr("class", "axis-line")
    .attr("x1", m.left).attr("x2", width - m.right).attr("y1", y(0)).attr("y2", y(0));
  svg.append("g").selectAll("text").data(yt).join("text")
    .attr("class", "tick").attr("x", m.left - 8).attr("y", y).attr("dy", "0.32em").attr("text-anchor", "end")
    .text(d => `${d * 100}%`);
  svg.append("g").selectAll("text").data([2000, 2005, 2010, 2015, 2021]).join("text")
    .attr("class", "tick").attr("x", x).attr("y", height - m.bottom + 20).attr("text-anchor", "middle").text(d => d);

  // Scores are counts out of 13, so percentiles move in steps: draw them as steps.
  const curve = d3.curveStepAfter;
  const band = d3.area().x(d => x(d.year)).y0(d => y(d.p25)).y1(d => y(d.p75)).curve(curve);
  const flat = d3.area().x(d => x(d.year)).y0(d => y(d.median)).y1(d => y(d.median)).curve(curve);
  const line = k => d3.line().x(d => x(d.year)).y(d => y(d[k])).curve(k === "mean" ? d3.curveMonotoneX : curve);
  const drawn = (path) => {
    const len = path.node().getTotalLength();
    return path.attr("stroke-dasharray", `${len} ${len}`).attr("stroke-dashoffset", len).property("len", len);
  };

  const iqr = svg.append("path").datum(data).attr("fill", C.primary).attr("fill-opacity", 0.16).attr("d", flat);
  const p90 = drawn(svg.append("path").datum(data).attr("fill", "none").attr("stroke", C.primary)
    .attr("stroke-width", 1.5).attr("d", line("p90")));
  const median = drawn(svg.append("path").datum(data).attr("fill", "none").attr("stroke", C.ink2)
    .attr("stroke-width", 2).attr("d", line("median")));
  svg.append("path").datum(data).attr("fill", "none").attr("stroke", C.primary)
    .attr("stroke-width", 2.5).attr("stroke-linecap", "round").attr("d", line("mean"));
  const p25 = drawn(svg.append("path").datum(data).attr("fill", "none").attr("stroke", C.accent)
    .attr("stroke-width", 2.5).attr("d", line("p25")));
  // The 90th percentile is a reference, not a series: dashed once drawn.
  const p90Dash = "4 4";

  const endLabel = (yv, name, value, muted) => {
    const g = svg.append("g").attr("transform", `translate(${width - m.right + 10},${y(yv)})`).attr("opacity", 0);
    g.append("text").attr("class", "dlabel dlabel--muted").attr("dy", "-0.3em").text(name);
    g.append("text").attr("class", `dlabel ${muted ? "" : "dlabel--strong"}`).attr("dy", "0.95em").text(value);
    return g;
  };
  endLabel(last.mean, "Average", pct(last.mean)).attr("opacity", 1);
  const medianLabel = endLabel(last.median, "Median", pct(last.median));
  const p75Label    = endLabel(last.p75, "75th pct.", pct(last.p75), true);
  const p90Label    = endLabel(last.p90, "Top 10% from", pct(last.p90), true);
  const p25Label    = endLabel(last.p25, narrow ? "Bottom ¼" : "Bottom quarter", pct(last.p25));
  svg.append("text").attr("class", "dlabel dlabel--strong halo")
    .attr("x", x(first.year) + 4).attr("y", y(first.mean) - 10).text(pct(first.mean));
  const p25Start = svg.append("text").attr("class", "dlabel dlabel--strong halo")
    .attr("x", x(first.year) + 4).attr("y", y(first.p25) + 20).attr("opacity", 0).text(pct(first.p25));

  // ── Hover: crosshair + tooltip ─────────────────────────────────────────────
  const tt = tooltip();
  const cross = svg.append("line").attr("y1", m.top).attr("y2", height - m.bottom)
    .attr("stroke", C.ink).attr("stroke-width", 1).attr("opacity", 0).attr("pointer-events", "none");
  svg.append("rect")
    .attr("x", m.left).attr("y", m.top).attr("width", width - m.left - m.right).attr("height", height - m.top - m.bottom)
    .attr("fill", "transparent")
    .on("pointermove", ev => {
      const yr = Math.round(x.invert(d3.pointer(ev)[0]));
      const d = data.find(r => r.year === yr);
      if (!d) return;
      cross.attr("opacity", 1).attr("x1", x(yr)).attr("x2", x(yr));
      tt.show(`<span class="tt__title">${yr} · ${d.n} countries</span>` +
        ttRow("Top 10% from", pct(d.p90)) +
        ttRow("75th percentile", pct(d.p75)) +
        ttRow("Average", pct(d.mean), C.primary) +
        ttRow("Median", pct(d.median), C.ink2) +
        ttRow("25th percentile", pct(d.p25), C.accent), ev);
    })
    .on("pointerleave", () => { cross.attr("opacity", 0); tt.hide(); });

  // ── Steps ──────────────────────────────────────────────────────────────────
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const tr = sel => sel.transition().duration(reduced ? 0 : 900).ease(d3.easeCubicOut);
  const draw = (path, on) => tr(path).attr("stroke-dashoffset", on ? 0 : path.property("len"));
  const show = (sel, on) => tr(sel).attr("opacity", on ? 1 : 0);
  let current = -1;
  const node = svg.node();
  node.step = i => {
    if (i === current) return;
    current = i;
    draw(median, i >= 1); show(medianLabel, i >= 1);
    tr(iqr).attr("d", i >= 2 ? band : flat); show(p75Label, i >= 2);
    if (i >= 3) {
      tr(p90).attr("stroke-dashoffset", 0).on("end", () => p90.attr("stroke-dasharray", p90Dash));
    } else {
      p90.attr("stroke-dasharray", `${p90.property("len")} ${p90.property("len")}`);
      draw(p90, false);
    }
    show(p90Label, i >= 3);
    draw(p25, i >= 4); show(p25Label, i >= 4); show(p25Start, i >= 4);
  };
  node.step(0);
  return node;
}
