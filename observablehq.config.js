// See https://observablehq.com/framework/config for documentation.
export default {
  title: "Trans Rights Worldwide",

  // Fonts: Besley (headlines + long read), Inter (numbers, labels, UI)
  head: `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Besley:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 3'><rect width='5' height='3' fill='%235BCEFA'/><rect y='.6' width='5' height='1.8' fill='%23F5A9B8'/><rect y='1.2' width='5' height='.6' fill='%23FFFFFF'/></svg>">
  `,

  // All source files live in src/
  root: "src",

  // Point explicitly to our custom stylesheet.
  // Observable Framework does NOT auto-detect style.css — this is required.
  style: "style.css",

  // Disable Observable's built-in theme — we use our own style.css entirely.
  // Without this, theme-air,near-midnight.css loads and overrides everything.
  theme: false,
  globalStylesheets: [],

  // Single-scroll editorial story — no sidebar, no auto-generated ToC, no prev/next pager.
  // Navigation is handled by the page's own chapter anchors.
  sidebar: false,
  toc: false,
  pager: false,

  // Remove Observable's default footer — sources block is inline in index.md
  footer: "",

  // Pages: only index is published. _sandbox.md is prefixed with _ so Observable
  // Framework excludes it from the build automatically.
  pages: [],
};
