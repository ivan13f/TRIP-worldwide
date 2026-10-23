// lib/charts/flagship.js — ACT IV: the divergence fingerprint. Raw D3 only.
//
// 173 countries (rows, sorted by 2021 score) × 22 years (columns), each cell
// coloured by TRIP score class. Returns the plot node with:
//   node.step(i)   0 everything · 1 only 2000 · 2 2000–2011 · 3 the 2012 break · 4 the bottom quarter
//   node.controls  legend + country search, for the page to place (aside column on desktop)

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { tooltip, ttRow, pct } from "./tooltip.js";
import { classLegend } from "./legend.js";

const LABELS = ["URY", "PAK", "IND", "ARG", "USA", "AUT", "NPL", "IRN", "KEN", "UGA", "NGA"];
const shortName = n => n === "United States of America" ? "United States" : n;
const of13 = v => v == null ? "No data" : `${Math.round(v * 13)} of 13`;

export function flagship({ countries, years, cells }, { width = 640, rowHeight = 5, theme } = {}) {
  const C = theme.colors;
  const narrow = width < 560;
  const m = { top: 30, right: narrow ? 88 : 110, bottom: 28, left: 0 };
  const rh = rowHeight;
  const innerH = rh * countries.length;
  const height = Math.round(innerH + m.top + m.bottom);

  const x = d3.scaleBand(years, [m.left, width - m.right]).paddingInner(0.12);
  const rowOf = new Map(countries.map((c, i) => [c.iso3, i]));
  const y = i => m.top + i * rh;
  const scoreAt = new Map(cells.map(d => [`${d.iso3}|${d.year}`, d.score]));
  const tt = tooltip();

  const svg = d3.create("svg")
    .attr("class", "chart chart--fingerprint")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "Heatmap of 173 countries by 22 years. A small group at the top darkens after 2010. Most of the bottom quarter keeps the same score from 2000 to 2021.");

  svg.append("rect").attr("x", m.left).attr("y", m.top).attr("width", width - m.left - m.right).attr("height", innerH).attr("fill", C.nodata);
  svg.append("g").selectAll("rect").data(cells).join("rect")
    .attr("x", d => x(d.year)).attr("y", d => y(rowOf.get(d.iso3)))
    .attr("width", x.bandwidth()).attr("height", rh + 0.5)
    .attr("fill", d => theme.scoreColor(d.score));

  // Column gaps in paper colour (the surface gap between fills)
  svg.append("g").selectAll("rect").data(years.slice(1)).join("rect")
    .attr("x", d => x(d) - x.step() * x.paddingInner()).attr("y", m.top - 1)
    .attr("width", x.step() * x.paddingInner()).attr("height", innerH + 2).attr("fill", C.paper);

  [years[0], 2005, 2010, 2015, years.at(-1)].forEach(yr =>
    svg.append("text").attr("class", "tick").attr("x", x(yr) + x.bandwidth() / 2).attr("y", height - m.bottom + 18)
      .attr("text-anchor", "middle").text(yr));

  const labels = svg.append("g").attr("transform", `translate(${width - m.right + 8},0)`);
  countries.forEach((c, i) => {
    if (!LABELS.includes(c.iso3)) return;
    const g = labels.append("g").attr("class", "row-label").attr("data-iso", c.iso3)
      .attr("transform", `translate(0,${y(i) + rh / 2})`);
    g.append("line").attr("x1", -6).attr("x2", 0).attr("stroke", C.ink);
    g.append("text").attr("class", "tick").attr("x", 4).attr("dy", "0.32em").text(shortName(c.name));
  });

  // ── Story layers ───────────────────────────────────────────────────────────
  const maskRight = svg.append("rect").attr("y", m.top - 1).attr("height", innerH + 2)
    .attr("fill", C.paper).attr("opacity", 0).attr("pointer-events", "none");
  const quarterRow = countries.length - Math.ceil(countries.length / 4);
  const maskTop = svg.append("rect").attr("x", m.left).attr("y", m.top - 1).attr("width", width - m.left - m.right)
    .attr("height", y(quarterRow) - m.top + 1).attr("fill", C.paper).attr("opacity", 0).attr("pointer-events", "none");

  const x2012 = x(2012) + x.bandwidth() / 2;
  const rule2012 = svg.append("g").attr("opacity", 0).attr("pointer-events", "none");
  rule2012.append("line").attr("x1", x2012).attr("x2", x2012).attr("y1", m.top - 8).attr("y2", m.top + innerH)
    .attr("stroke", C.accent).attr("stroke-width", 2.5);
  rule2012.append("text").attr("class", "dlabel dlabel--strong halo").attr("x", x2012 + 6).attr("y", m.top - 12)
    .text("2012 · Argentina's self-ID law");

  const quarter = svg.append("g").attr("opacity", 0).attr("pointer-events", "none");
  quarter.append("line").attr("x1", m.left).attr("x2", width - m.right).attr("y1", y(quarterRow)).attr("y2", y(quarterRow))
    .attr("stroke", C.accent).attr("stroke-width", 2.5);
  quarter.append("text").attr("class", "dlabel dlabel--strong halo").attr("x", m.left + 4).attr("y", y(quarterRow) - 8)
    .text(`Bottom quarter · ${countries.length - quarterRow} countries`);

  // ── Selected country (search) and hover outlines ───────────────────────────
  const selected = svg.append("g").attr("opacity", 0).attr("pointer-events", "none");
  const selRect = selected.append("rect").attr("x", m.left - 2).attr("width", width - m.right - m.left + 4).attr("height", rh + 4)
    .attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 2);
  const selLabel = selected.append("text").attr("class", "dlabel dlabel--strong halo").attr("x", width - m.right + 12).attr("dy", "0.32em");

  const hover = svg.append("rect").attr("x", m.left - 1).attr("width", width - m.right - m.left + 2).attr("height", rh + 2)
    .attr("fill", "none").attr("stroke", C.ink).attr("stroke-width", 1.5).attr("opacity", 0).attr("pointer-events", "none");
  svg.append("rect").attr("x", m.left).attr("y", m.top).attr("width", width - m.left - m.right).attr("height", innerH)
    .attr("fill", "transparent")
    .on("pointermove", ev => {
      const [px, py] = d3.pointer(ev);
      const i = Math.max(0, Math.min(countries.length - 1, Math.floor((py - m.top) / rh)));
      const yr = years[Math.max(0, Math.min(years.length - 1, Math.floor((px - m.left) / x.step())))];
      const c = countries[i], v = scoreAt.get(`${c.iso3}|${yr}`);
      hover.attr("y", y(i) - 1).attr("opacity", 1);
      tt.show(`<span class="tt__title">${shortName(c.name)} · ${yr}</span>` +
        ttRow("TRIP score", v == null ? "No data" : `${of13(v)} · ${pct(v)}`) +
        ttRow("In 2021", `${of13(c.score2021)} · ${pct(c.score2021)}`), ev);
    })
    .on("pointerleave", () => { hover.attr("opacity", 0); tt.hide(); });

  // ── Controls: legend + search ──────────────────────────────────────────────
  const controls = document.createElement("div");
  controls.className = "fingerprint__controls";
  controls.appendChild(classLegend(theme, "TRIP score, out of 13 indicators"));
  const listId = "fingerprint-countries";
  const search = document.createElement("div");
  search.className = "search";
  search.innerHTML = `
    <label class="search__label" for="fingerprint-search">Find a country</label>
    <input class="search__input" id="fingerprint-search" type="search" list="${listId}" placeholder="e.g. Kenya" autocomplete="off">
    <datalist id="${listId}">${countries.map(c => `<option value="${shortName(c.name)}"></option>`).join("")}</datalist>
    <p class="search__result" aria-live="polite"></p>`;
  controls.appendChild(search);
  const input = search.querySelector("input"), result = search.querySelector(".search__result");
  const byName = new Map(countries.map(c => [shortName(c.name).toLowerCase(), c]));

  const select = c => {
    if (!c) {
      selected.attr("opacity", 0);
      labels.selectAll(".row-label").attr("opacity", 1);
      result.textContent = "";
      return;
    }
    const i = rowOf.get(c.iso3);
    const s2000 = scoreAt.get(`${c.iso3}|${years[0]}`);
    selRect.attr("y", y(i) - 2);
    selLabel.attr("y", y(i) + rh / 2).text(shortName(c.name));
    // Hide fixed labels that would collide with the selected one.
    labels.selectAll(".row-label").attr("opacity", function () {
      return Math.abs(rowOf.get(this.dataset.iso) - i) * rh < 14 ? 0 : 1;
    });
    selected.attr("opacity", 1);
    result.innerHTML = `<b>${shortName(c.name)}</b> ranks ${i + 1} of ${countries.length} in 2021.<br>` +
      `${years[0]}: ${of13(s2000)} · ${years.at(-1)}: ${of13(c.score2021)}`;
  };
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    select(q ? byName.get(q) : null);
    if (q && !byName.has(q)) result.textContent = "Pick a country from the list.";
  });

  // ── Steps ──────────────────────────────────────────────────────────────────
  const D = matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 600;
  const end = yr => x(yr) + x.bandwidth() + 1;
  let current = -1;
  const node = svg.node();
  node.step = i => {
    if (i === current) return;
    current = i;
    const cut = i === 1 ? end(years[0]) : i === 2 ? end(2011) : null;
    if (cut != null) maskRight.attr("x", cut).attr("width", width - m.right - cut);
    maskRight.transition().duration(D).attr("opacity", cut != null ? 0.88 : 0);
    maskTop.transition().duration(D).attr("opacity", i === 4 ? 0.88 : 0);
    rule2012.transition().duration(D).attr("opacity", i === 3 ? 1 : 0);
    quarter.transition().duration(D).attr("opacity", i === 4 ? 1 : 0);
  };
  node.controls = controls;
  node.step(0);
  return node;
}
