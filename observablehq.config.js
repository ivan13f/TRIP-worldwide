// See https://observablehq.com/framework/config for documentation.
export default {
  title: "Trans Rights Worldwide",

  // Fonts: Besley (headlines + long read), Inter (numbers, labels, UI)
  head: `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Besley:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 5 5'><circle cx='2.5' cy='2.5' r='2.5' fill='rgb(91,206,250)'/><path fill='rgb(245,169,184)' d='M.5 1H4.5A2.5 2.5 0 0 1 4.5 4H.5A2.5 2.5 0 0 1 .5 1Z'/><path fill='rgb(255,255,255)' d='M.05 2H4.95A2.5 2.5 0 0 1 4.95 3H.05A2.5 2.5 0 0 1 .05 2Z'/></svg>">
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
