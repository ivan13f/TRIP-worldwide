// lib/carousel.js
// ─────────────────────────────────────────────────────────────────────────────
// Looped country-card carousel (Act III).
//
// Classic clone-buffer technique: two real cards are cloned onto each end
// of the track. Stepping past the last real card slides onto a clone, then
// — the instant the transition ends — jumps (no transition) back to the
// matching real card. The jump is invisible because the clone is pixel-
// identical to the real card it stands in for.
//
// Autoplay pauses on hover/focus and is skipped entirely for
// prefers-reduced-motion.
// ─────────────────────────────────────────────────────────────────────────────

const CLONE_COUNT = 2;
const AUTOPLAY_MS = 6000;

export function initCarousel(root) {
  if (typeof root === "string") root = document.querySelector(root);
  if (!root) return;

  const track   = root.querySelector(".carousel-track");
  const prevBtn = root.querySelector(".carousel-btn--prev");
  const nextBtn = root.querySelector(".carousel-btn--next");
  const dotsEl  = root.querySelector("[data-carousel-dots]");
  if (!track) return;

  const originals = Array.from(track.children);
  const count = originals.length;
  if (count === 0) return;

  const headClones = originals.slice(0, CLONE_COUNT).map(el => el.cloneNode(true));
  const tailClones = originals.slice(-CLONE_COUNT).map(el => el.cloneNode(true));
  [...headClones, ...tailClones].forEach(el => el.setAttribute("aria-hidden", "true"));
  tailClones.forEach(el => track.insertBefore(el, track.firstChild));
  headClones.forEach(el => track.appendChild(el));

  const dots = [];
  if (dotsEl) {
    originals.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "carousel-dot";
      dot.setAttribute("aria-label", `Go to card ${i + 1} of ${count}`);
      dot.addEventListener("click", () => { goTo(CLONE_COUNT + i); restartAutoplay(); });
      dotsEl.appendChild(dot);
      dots.push(dot);
    });
  }

  let index = CLONE_COUNT; // first real card
  let cardStep = 0;

  function measure() {
    const first = track.children[0];
    const second = track.children[1];
    if (!first || !second) return;
    cardStep = second.getBoundingClientRect().left - first.getBoundingClientRect().left;
  }

  function updateDots() {
    const real = ((index - CLONE_COUNT) % count + count) % count;
    dots.forEach((d, i) => d.classList.toggle("is-active", i === real));
  }

  function goTo(i, animate = true) {
    track.style.transition = animate
      ? "transform 0.6s cubic-bezier(.22,.68,0,1.05)"
      : "none";
    track.style.transform = `translateX(${-i * cardStep}px)`;
    index = i;
    updateDots();
  }

  track.addEventListener("transitionend", (e) => {
    if (e.propertyName !== "transform") return;
    if (index < CLONE_COUNT) goTo(index + count, false);
    else if (index >= CLONE_COUNT + count) goTo(index - count, false);
  });

  function next() { goTo(index + 1); }
  function prev() { goTo(index - 1); }

  nextBtn?.addEventListener("click", () => { next(); restartAutoplay(); });
  prevBtn?.addEventListener("click", () => { prev(); restartAutoplay(); });

  // ── Autoplay ────────────────────────────────────────────────────────────
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let timer = null;

  function startAutoplay() {
    if (reducedMotion || timer) return;
    timer = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() {
    clearInterval(timer);
    timer = null;
  }
  function restartAutoplay() {
    stopAutoplay();
    startAutoplay();
  }

  root.addEventListener("mouseenter", stopAutoplay);
  root.addEventListener("mouseleave", startAutoplay);
  root.addEventListener("focusin", stopAutoplay);
  root.addEventListener("focusout", startAutoplay);

  window.addEventListener("resize", () => {
    measure();
    goTo(index, false);
  });

  measure();
  goTo(index, false);
  startAutoplay();
}
