// lib/charts/tooltip.js — the one shared tooltip (styled by .tt in style.css).

let el;

export function tooltip() {
  el ??= Object.assign(document.body.appendChild(document.createElement("div")), {
    className: "tt", role: "status",
  });
  return {
    show(html, ev) {
      el.innerHTML = html;
      el.classList.add("is-on");
      const r = el.getBoundingClientRect();
      let x = ev.clientX + 16, y = ev.clientY + 16;
      if (x + r.width > innerWidth - 8) x = ev.clientX - r.width - 16;
      if (y + r.height > innerHeight - 8) y = ev.clientY - r.height - 16;
      el.style.transform = `translate(${x}px,${y}px)`;
    },
    hide() { el.classList.remove("is-on"); },
  };
}

// dot: a colour for a filled key, or "ring" for the hollow 2000 marker.
export const ttRow = (k, v, dot) => {
  const key = dot === "ring" ? `<i class="ring"></i>` : dot ? `<i style="background:${dot}"></i>` : "";
  return `<span class="tt__row"><span>${key}${k}</span><b>${v}</b></span>`;
};

export const pct = (v, digits = 1) =>
  v == null || Number.isNaN(v) ? "No data" : `${(v * 100).toFixed(digits).replace(/\.0$/, "")}%`;
