// See https://observablehq.com/framework/config for documentation.
export default {
  title: "Trans Rights Worldwide",

  head: '<link rel="icon" href="observable.png" type="image/png" sizes="32x32">',

  root: "src",

  // Single-scroll editorial story — no sidebar, no auto-generated ToC, no prev/next pager.
  // The page carries its own navigation through chapter structure.
  sidebar: false,
  toc: false,
  pager: false,

  // Remove Observable's default "Built with Observable" footer — we provide our own sources block.
  footer: "",
};
