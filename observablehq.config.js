// See https://observablehq.com/framework/config for documentation.
export default {
  title: "Trans Rights Worldwide",

  // Fonts: DM Sans (display + body, full weight range) + DM Mono (data labels/kickers)
  // Syne kept in URL in case needed for fallback; DM Sans is now primary across all type.
  // Favicon: replace observable.png with a custom icon when ready
  head: `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,300;1,9..40,400&family=DM+Mono:wght@300;400;500&display=swap" rel="stylesheet">
    <link rel="icon" href="observable.png" type="image/png" sizes="32x32">
  `,

  // All source files live in src/
  root: "src",

  // Point explicitly to our custom stylesheet.
  // Observable Framework does NOT auto-detect style.css — this is required.
  style: "style.css",

  // Disable Observable's built-in theme — we use our own style.css entirely.
  // Without this, theme-air,near-midnight.css loads and overrides everything.
  theme: false,

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
