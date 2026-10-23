// lib/charts/legend.js — the shared TRIP class legend (Fig. 2 and Fig. 4 use the same one).

export function classLegend(theme, title = "TRIP score, out of 13 indicators", { noData = false } = {}) {
  const wrap = document.createElement("div");
  wrap.className = "fig__legend";
  wrap.innerHTML = `
    <div class="class-legend">
      <div class="class-legend__title">${title}</div>
      <div class="class-legend__row">${theme.scoreClasses.map(c =>
        `<span class="class-legend__item"><i style="background:${c.color}"></i>${c.label}</span>`).join("")}
      </div>
    </div>
    ${noData ? `<span class="key key--hatch"><i></i>No data</span>` : ""}`;
  return wrap;
}
