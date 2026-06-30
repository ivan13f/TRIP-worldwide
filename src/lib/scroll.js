/**
 * scroll.js — Scroll utility helpers
 * ------------------------------------
 * Two tools for adding scroll-based interactivity:
 *
 *   1. onReveal()  — IntersectionObserver-based scroll reveal.
 *                    Adds a CSS class when an element enters the viewport.
 *                    Used for Level 2 chart animations (most of the piece).
 *
 *   2. makeScroller() — Thin wrapper around Scrollama for the flagship
 *                       graphic's scroll-driven animation (Level 3).
 *                       Requires scrollama to be imported in the .md file.
 *
 * Usage in index.md:
 *
 *   import { initScroll, onReveal, makeScroller } from "./lib/scroll.js";
 *
 *   // Reveal a chart when it scrolls into view:
 *   const el = document.querySelector(".chart-divergence");
 *   onReveal(el, () => el.classList.add("revealed"));
 *
 *   // Scrollytelling for the flagship:
 *   const scroller = makeScroller("#flagship-steps", (progress) => {
 *     // progress: 0–1, use to drive flagship.js animation
 *   });
 */

/**
 * Wire IntersectionObserver scroll reveals for Acts I–III.
 *
 * - Adds `.revealed` to each `.chart-container` when it enters the viewport,
 *   which CSS transitions the chart from opacity:0/translateY to visible.
 * - Also removes `.band--hidden` from all descendants, revealing the
 *   distribution bands and p25 annotation in distributionTrend.js.
 *
 * Call once from index.md after the page renders.
 */
export function initScroll() {
  const containers = document.querySelectorAll(".chart-container");
  if (!containers.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;

        // Fade the container in
        el.classList.add("revealed");

        // Reveal any distribution bands / annotations inside this container
        el.querySelectorAll(".band--hidden").forEach(node => {
          node.classList.remove("band--hidden");
        });

        observer.unobserve(el);
      });
    },
    { threshold: 0.15 }
  );

  containers.forEach(el => observer.observe(el));
}

/**
 * Calls `callback` once when `element` enters the viewport.
 * Unobserves after the first trigger (fire-once behaviour).
 *
 * @param {Element}  element    - DOM element to watch
 * @param {Function} callback   - Called with the IntersectionObserverEntry
 * @param {number}   threshold  - 0–1, portion of element visible (default 0.15)
 */
export function onReveal(element, callback, threshold = 0.15) {
  if (!element) return;
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          callback(entry);
          observer.unobserve(element);
        }
      });
    },
    { threshold }
  );
  observer.observe(element);
}

/**
 * Convenience helper: call onReveal on multiple elements at once.
 *
 * @param {string}   selector   - CSS selector matching all target elements
 * @param {Function} callback   - Called with (element, entry) for each reveal
 * @param {number}   threshold  - Visibility threshold (default 0.15)
 */
export function onRevealAll(selector, callback, threshold = 0.15) {
  document.querySelectorAll(selector).forEach((el) => {
    onReveal(el, (entry) => callback(el, entry), threshold);
  });
}

/**
 * Sets up a Scrollama scroller for step-based scroll narratives.
 * Used exclusively for the flagship graphic (Act 5).
 *
 * Requires scrollama to be available as a global or import.
 * In Observable Framework, add to index.md:
 *   import scrollama from "https://cdn.jsdelivr.net/npm/scrollama@3/+esm";
 *
 * @param {string}   stepSelector  - CSS selector for step elements (e.g. ".step")
 * @param {Function} onStepEnter   - Called with { element, index, direction, progress }
 * @param {Function} onStepProgress - Called with { element, index, progress } (0–1)
 * @param {number}   offset         - Trigger point in viewport (0–1, default 0.5)
 * @returns The scrollama instance (call .destroy() on cleanup)
 */
export function makeScroller(stepSelector, onStepEnter, onStepProgress, offset = 0.5) {
  // scrollama must be available in the calling scope
  if (typeof scrollama === "undefined") {
    console.warn("scroll.js: scrollama not found. Import it before calling makeScroller().");
    return null;
  }

  const scroller = scrollama();

  scroller
    .setup({
      step: stepSelector,
      offset,
      progress: typeof onStepProgress === "function",
      debug: false,
    })
    .onStepEnter((response) => {
      if (typeof onStepEnter === "function") onStepEnter(response);
    })
    .onStepProgress((response) => {
      if (typeof onStepProgress === "function") onStepProgress(response);
    });

  // Handle resize
  window.addEventListener("resize", scroller.resize);

  return scroller;
}
