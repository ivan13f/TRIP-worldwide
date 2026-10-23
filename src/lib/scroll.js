// lib/scroll.js — scroll reveals and scrollytelling steps.

import scrollama from "https://cdn.jsdelivr.net/npm/scrollama@3.2.0/+esm";

// Adds `.is-in` to every `.reveal` element once it enters the viewport.
export function initScroll() {
  const els = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(entries => entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("is-in");
    io.unobserve(e.target);
  }), { threshold: 0.2 });
  els.forEach(el => io.observe(el));
}

// Calls onStep(index, direction) as each `.step` inside `root` crosses the
// middle of the viewport. Scrolling back up re-enters the previous step.
export function scrolly(root, onStep, {
  // On phones the graphic sits at the top, so steps trigger as cards enter from below.
  offset = matchMedia("(max-width: 900px)").matches ? 0.85 : 0.55,
} = {}) {
  if (typeof root === "string") root = document.querySelector(root);
  const steps = root.querySelectorAll(".step");
  const scroller = scrollama();
  scroller
    .setup({ step: steps, offset })
    .onStepEnter(({ element, index, direction }) => {
      steps.forEach(s => s.classList.toggle("is-active", s === element));
      onStep(index, direction);
    });
  window.addEventListener("resize", scroller.resize);
  return scroller;
}
