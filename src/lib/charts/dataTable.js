// lib/charts/dataTable.js — the "View the data" disclosure under each figure.
//
// dataTable(rows, columns, opts) → <details> node
//   columns: [{ key, label, format?, numeric? }]
//   opts: { summary, sortable, download: { filename, csv } }

export function dataTable(rows, columns, { summary = "View the data", sortable = false, download } = {}) {
  const details = document.createElement("details");
  details.className = "data-table";
  details.innerHTML = `<summary>${summary}</summary>`;

  const wrap = details.appendChild(document.createElement("div"));
  wrap.className = "data-table__scroll";
  const table = wrap.appendChild(document.createElement("table"));
  const thead = table.createTHead().insertRow();
  const tbody = table.createTBody();

  let sortKey = null, sortDir = 1;
  const render = () => {
    const sorted = sortKey == null ? rows : [...rows].sort((a, b) => {
      const x = a[sortKey], y = b[sortKey];
      if (x == null) return 1;
      if (y == null) return -1;
      return (typeof x === "number" ? x - y : String(x).localeCompare(String(y))) * sortDir;
    });
    tbody.innerHTML = sorted.map(r => `<tr>${columns.map(c =>
      `<td class="${c.numeric ? "num" : ""}">${(c.format ?? (v => v ?? "No data"))(r[c.key], r)}</td>`).join("")}</tr>`).join("");
  };

  columns.forEach(c => {
    const th = document.createElement("th");
    th.scope = "col";
    if (c.numeric) th.className = "num";
    if (sortable) {
      const btn = th.appendChild(document.createElement("button"));
      btn.type = "button";
      btn.textContent = c.label;
      btn.addEventListener("click", () => {
        sortDir = sortKey === c.key ? -sortDir : (c.numeric ? -1 : 1);
        sortKey = c.key;
        thead.querySelectorAll("th").forEach(h => h.removeAttribute("aria-sort"));
        th.setAttribute("aria-sort", sortDir === 1 ? "ascending" : "descending");
        render();
      });
    } else {
      th.textContent = c.label;
    }
    thead.appendChild(th);
  });
  render();

  if (download) {
    const a = details.appendChild(document.createElement("a"));
    a.className = "data-table__download";
    a.download = download.filename;
    a.href = URL.createObjectURL(new Blob([download.csv], { type: "text/csv" }));
    a.textContent = `Download the full data (${download.filename})`;
  }
  return details;
}

// Quote a CSV field only when it needs it.
export const csvField = v => {
  const s = v == null ? "" : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
