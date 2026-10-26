// lib/charts/choropleth.js — ACT II: the map, zoomable and scroll-driven.
//
// Returns a wrapper node (legend + map + zoom controls) with node.step(i):
// each step flies the map to a region and pins that region's annotations.
// Readers can also zoom freely: buttons, double-click, pinch, or ⌘/Ctrl + scroll.
// Plain scrolling always scrolls the article, never the map.

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
import { parseGeo } from "../geo.js";
import { tooltip, ttRow, pct } from "./tooltip.js";
import { classLegend } from "./legend.js";

// Countries too small to exist in the 110m map: drawn as fixed-size dots.
const MICRO = {
  BHR: [50.55, 26.07], BRB: [-59.54, 13.19], COM: [43.87, -11.88], CPV: [-23.6, 15.1],
  MDV: [73.5, 3.2], MLT: [14.45, 35.9], MUS: [57.55, -20.25], SGP: [103.82, 1.35],
  STP: [6.6, 0.25], SYC: [55.45, -4.68],
};

// Label anchor points (lon, lat) for annotated countries.
const AT = {
  URY: [-56, -32.8], ARG: [-65, -35], BRA: [-50, -10],
  PAK: [69.5, 29.5], IND: [78.5, 22], NPL: [84, 28.3], BGD: [90.3, 23.8],
  MLT: MICRO.MLT, BEL: [4.6, 50.6], AUT: [14.5, 47.5], HUN: [19.4, 47.1],
  NGA: [8, 9.5], UGA: [32.4, 1.3], KEN: [37.9, 0.3], ZAF: [24.5, -29.5], BWA: [24, -22.3],
};

// One entry per scroll step. bounds: [[west, south], [east, north]].
export const MAP_STEPS = [
  { bounds: null, notes: [] },
  { bounds: [[-92, -56], [-30, 14]], notes: [
    { iso3: "URY", note: "Highest score in 2021",          dx: 1,  dy: 0 },
    { iso3: "ARG", note: "First self-ID law, 2012",          dx: -1, dy: 0 },
    { iso3: "BRA", note: "Gender marker change since 2018",  dx: 1,  dy: 0 },
  ]},
  { bounds: [[60, 6], [96, 37]], notes: [
    { iso3: "PAK", note: "Third gender recognized since 2009", dx: -1, dy: 0 },
    { iso3: "IND", note: "Protections, but medical requirements", dx: -1, dy: 1 },
    { iso3: "NPL", note: "Third gender marker since 2012",     dx: 1,  dy: -1 },
    { iso3: "BGD", note: "Third gender marker since 2014",     dx: 1,  dy: 1 },
  ]},
  { bounds: [[-10, 34], [30, 58]], notes: [
    { iso3: "MLT", note: "Protection in the constitution",     dx: 1,  dy: 0 },
    { iso3: "BEL", note: "Among Europe's highest",             dx: -1, dy: 0 },
    { iso3: "AUT", note: "Strong LGB rights, weak trans rights", dx: -1, dy: 1 },
    { iso3: "HUN", note: "No legal gender change in 2021",     dx: 1,  dy: -1 },
  ]},
  { bounds: [[-18, -35], [50, 22]], notes: [
    { iso3: "NGA", note: "Direct criminalization",             dx: -1, dy: 0 },
    { iso3: "UGA", note: "Colonial-era penal code",            dx: -1, dy: -1 },
    { iso3: "KEN", note: "Colonial-era penal code",            dx: 1,  dy: 0 },
    { iso3: "ZAF", note: "Gender marker change since 2003",    dx: 1,  dy: 0 },
  ]},
  { bounds: null, notes: [] },
];

export function choropleth(data, { width = 960, height, theme, topoJson } = {}) {
  const C = theme.colors;
  const geo = parseGeo(topoJson);
  geo.countries.features.forEach(f => {
    if (!f.properties.iso3 && f.properties.name === "Kosovo") f.properties.iso3 = "XKX";
  });
  geo.countries.features = geo.countries.features.filter(f => f.properties.iso3 !== "ATA");
  const byIso = new Map(data.map(d => [d.iso3, d]));
  height ??= Math.round(width * 0.5);
  const compact = width < 600;

  const proj = d3.geoEqualEarth().fitExtent([[2, 2], [width - 2, height - 2]], { type: "Sphere" });
  const path = d3.geoPath(proj);
  const fill = d => theme.scoreColor(d?.score) ?? "url(#map-hatch)";
  const tt = tooltip();
  const showCountry = (ev, iso3, fallbackName) => {
    const d = byIso.get(iso3);
    tt.show(`<span class="tt__title">${d?.name ?? fallbackName ?? "Unknown"}</span>` +
      ttRow("TRIP score 2021", pct(d?.score)) +
      (d ? ttRow("Indicators", `${Math.round(d.score * 13)} of 13`) : ""), ev);
  };

  // ── DOM ────────────────────────────────────────────────────────────────────
  const wrap = document.createElement("div");
  wrap.className = "map";
  wrap.appendChild(classLegend(theme, "TRIP score 2021, out of 13 indicators", { noData: true }));
  const plot = wrap.appendChild(document.createElement("div"));
  plot.className = "map__plot";

  const svg = d3.select(plot).append("svg")
    .attr("class", "chart chart--map")
    .attr("width", width).attr("height", height)
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", "World map of 2021 TRIP scores. Uruguay scores highest at 12 of 13. Most of Africa, the Middle East and Central Asia score 0 to 2.");

  const pat = svg.append("defs").append("pattern").attr("id", "map-hatch")
    .attr("width", 5).attr("height", 5).attr("patternUnits", "userSpaceOnUse").attr("patternTransform", "rotate(45)");
  pat.append("rect").attr("width", 5).attr("height", 5).attr("fill", C.nodata);
  pat.append("line").attr("y2", 5).attr("stroke", C.rule).attr("stroke-width", 1.5);

  const mapG = svg.append("g");
  mapG.append("path").datum({ type: "Sphere" }).attr("d", path)
    .attr("fill", "none").attr("stroke", C.rule).attr("class", "nss");

  mapG.append("g").selectAll("path").data(geo.countries.features).join("path")
    .attr("class", "country nss")
    .attr("d", path)
    .attr("fill", f => fill(byIso.get(f.properties.iso3)))
    .on("pointermove pointerdown", function (ev, f) {
      d3.select(this).classed("is-hover", true).raise();
      showCountry(ev, f.properties.iso3, f.properties.name);
    })
    .on("pointerleave", function () { d3.select(this).classed("is-hover", false); tt.hide(); });

  // Overlays live in screen space so dots and labels keep their size when zoomed.
  const overlay = svg.append("g");
  const micro = overlay.append("g").selectAll("circle")
    .data(Object.entries(MICRO).filter(([iso3]) => byIso.has(iso3)))
    .join("circle")
    .attr("class", "micro")
    .attr("r", 4.5)
    .attr("fill", ([iso3]) => fill(byIso.get(iso3)))
    .on("pointermove pointerdown", (ev, [iso3]) => showCountry(ev, iso3))
    .on("pointerleave", () => tt.hide());

  const annG = overlay.append("g");
  let annotations = [];

  // ── Zoom ───────────────────────────────────────────────────────────────────
  let t = d3.zoomIdentity;
  const place = () => {
    micro.attr("transform", ([, ll]) => `translate(${t.apply(proj(ll))})`);
    annotations.forEach(a => {
      const [px, py] = t.apply(proj(AT[a.iso3]));
      a.g.attr("transform", `translate(${px},${py})`);
      // Flip the label to the other side when it would run off the frame.
      let s = a.side;
      if (s > 0 && px + 30 + a.w > width - 4) s = -1;
      else if (s < 0 && px - 30 - a.w < 4) s = 1;
      a.layout(s);
    });
  };
  const zoom = d3.zoom()
    .scaleExtent([1, 14])
    .translateExtent([[0, 0], [width, height]])
    .filter(ev => {
      if (ev.type === "wheel") return ev.ctrlKey || ev.metaKey;
      if (ev.type.startsWith("touch")) return ev.touches.length > 1;
      return !ev.button;
    })
    .on("zoom", ev => { t = ev.transform; mapG.attr("transform", t); place(); });
  svg.call(zoom);

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fly = (target, ms = 1200) => svg.transition().duration(reduced ? 0 : ms).ease(d3.easeCubicInOut).call(zoom.transform, target);

  const fit = bounds => {
    if (!bounds) return d3.zoomIdentity;
    const [[w, s], [e, n]] = bounds, pts = [];
    for (let i = 0; i <= 4; i++) for (let j = 0; j <= 4; j++) pts.push(proj([w + (e - w) * i / 4, s + (n - s) * j / 4]));
    const [x0, x1] = d3.extent(pts, p => p[0]), [y0, y1] = d3.extent(pts, p => p[1]);
    const k = Math.min(14, 0.88 / Math.max((x1 - x0) / width, (y1 - y0) / height));
    return d3.zoomIdentity.translate(width / 2 - k * (x0 + x1) / 2, height / 2 - k * (y0 + y1) / 2).scale(k);
  };

  // ── Controls ───────────────────────────────────────────────────────────────
  const ctrl = plot.appendChild(document.createElement("div"));
  ctrl.className = "map__ctrl";
  ctrl.innerHTML = `
    <button type="button" class="btn-icon" data-z="in" aria-label="Zoom in">+</button>
    <button type="button" class="btn-icon" data-z="out" aria-label="Zoom out">−</button>
    <button type="button" class="btn-icon" data-z="reset" aria-label="Show the whole world">⤢</button>`;
  ctrl.addEventListener("click", e => {
    const z = e.target.closest("button")?.dataset.z;
    if (z === "in") svg.transition().duration(reduced ? 0 : 300).call(zoom.scaleBy, 1.8);
    if (z === "out") svg.transition().duration(reduced ? 0 : 300).call(zoom.scaleBy, 1 / 1.8);
    if (z === "reset") fly(d3.zoomIdentity, 600);
  });
  const hint = plot.appendChild(document.createElement("p"));
  hint.className = "map__hint";
  hint.textContent = matchMedia("(pointer: coarse)").matches
    ? "Pinch with two fingers to zoom · tap a country for its score"
    : "Drag to pan · ⌘/Ctrl + scroll or the buttons to zoom · Hover for scores";

  // ── Annotations for a step ─────────────────────────────────────────────────
  const drawNotes = notes => {
    annG.selectAll("*").remove();
    annotations = notes.filter(n => byIso.has(n.iso3)).map(n => {
      const d = byIso.get(n.iso3), ly = 18 * (n.dy ?? 0);
      const g = annG.append("g").attr("class", "ann is-pinned");
      const leader = g.append("line").attr("class", "ann__leader");
      g.append("circle").attr("class", "ann__dot").attr("r", 4);
      const label = g.append("g").attr("class", "ann__label");
      const name = d.name === "United States of America" ? "United States" : d.name;
      const n13 = Math.round(d.score * 13);
      const t1 = label.append("text").attr("class", "dlabel dlabel--strong halo")
        .attr("y", compact ? ly : ly - 3).attr("dy", compact ? "0.32em" : null)
        .text(compact ? `${name} ${n13}/13` : `${name} · ${n13} of 13`);
      const t2 = label.append("text").attr("class", "dlabel dlabel--muted halo").attr("y", ly + 13).text(compact ? "" : n.note);
      const w = Math.max(t1.node().getComputedTextLength(), t2.node().getComputedTextLength());
      const layout = s => {
        const lx = 26 * s;
        leader.attr("x1", 5 * s).attr("y1", ly * 0.25).attr("x2", lx - 3 * s).attr("y2", ly);
        label.attr("text-anchor", s < 0 ? "end" : "start");
        t1.attr("x", lx); t2.attr("x", lx);
      };
      return { iso3: n.iso3, g, w, side: n.dx < 0 ? -1 : 1, layout };
    });
    place();
  };

  let current = -1;
  wrap.step = i => {
    if (i === current) return;
    current = i;
    const s = MAP_STEPS[Math.max(0, Math.min(MAP_STEPS.length - 1, i))];
    annG.transition().duration(reduced ? 0 : 200).attr("opacity", 0).end().catch(() => {}).then(() => {
      drawNotes(s.notes);
      annG.transition().delay(reduced ? 0 : 900).duration(reduced ? 0 : 300).attr("opacity", 1);
    });
    fly(fit(s.bounds));
  };
  place();
  return wrap;
}
