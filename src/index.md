---
title: Uneven Ground
toc: false
---

```js
// ─── DATA LOADING ────────────────────────────────────────────────────────────
// FileAttachment only lives here, in index.md. Never import it from lib/.
// All transforms happen in lib/data.js — chart modules receive clean data.

import {
  yearlyStats,
  countrySnapshot,
  indicatorAdoption,
  fingerprintMatrix,
  countryProfiles
} from "./lib/data.js";

const raw = await FileAttachment("./data/processed/trip_clean.csv").csv({ typed: true });

const statsData    = yearlyStats(raw);        // → Act I
const mapData      = countrySnapshot(raw, 2021); // → Act II
const indicators   = indicatorAdoption(raw);  // → Act III
const matrix       = fingerprintMatrix(raw);  // → Act IV
const profiles     = countryProfiles(raw);    // → Act III callouts
```

```js
// ─── CHART MODULES ───────────────────────────────────────────────────────────
import { distributionTrend } from "./lib/charts/distributionTrend.js";
import { choropleth }        from "./lib/charts/choropleth.js";
import { indicatorDotPlot }  from "./lib/charts/indicatorDotPlot.js";
import { flagship }          from "./lib/charts/flagship.js";
import { initScroll }        from "./lib/scroll.js";
import { THEME }             from "./lib/theme.js";
```

```js
// ─── SCROLL CONTROLLER ───────────────────────────────────────────────────────
// Initialise IntersectionObserver fade-ins for Acts I–III.
// Scrollama step-based control lives inside flagship.js (Act IV only).
initScroll();
```

<!-- ═══════════════════════════════════════════════════════════════════════════
     HERO
     ═══════════════════════════════════════════════════════════════════════════ -->

<div class="hero" id="hero">

  <div class="hero-geometry" aria-hidden="true">
    <div class="hg-violet"></div>
    <div class="hg-emerald"></div>
    <div class="hg-rule"></div>
  </div>

  <div class="hero-kicker">Trans Rights Indicator</div>
  <h1 class="hero-title">Uneven Ground</h1>
  <p class="hero-subtitle">A global legal record of transgender rights, 2000–2021</p>
  <p class="hero-intro">
    Twenty-two years of legislation, court rulings, and quiet reversals —
    condensed into 13 indicators across 173 countries. The average doubled.
    The bottom quarter didn't move. This is a record of that divergence.
  </p>
  <div class="hero-scroll-cue" aria-hidden="true">↓</div>
</div>


<!-- ═══════════════════════════════════════════════════════════════════════════
     ACT I — THE HEADLINE AND THE TRAP
     ═══════════════════════════════════════════════════════════════════════════ -->

<section id="act1" class="act">

  <div class="aside-note aside-note--left aside-note--anchor-mid" aria-hidden="true">
    <p class="aside-note__label">About the score</p>
    <p class="aside-note__text">The TRIP score is a composite of 13 binary legal indicators. A score of 100% means all 13 protections are in place. A score of 0% means none are. It measures what the law says — not how it is enforced.</p>
  </div>

  <p class="act-kicker">2000 – 2021 · global average</p>

  <div class="act-body">
    <p>
      In 2000, the average country scored 11% on trans rights protections —
      a composite of 13 legal indicators tracking criminalization, gender
      recognition, and anti-discrimination law. By 2021, that average had
      risen to 23.5%. Progress, evidently.
    </p>
    <p>
      Then look at the distribution. The line you just saw is not a picture
      of the world moving together. It is a picture of a small cluster at
      the top pulling the average upward, while most countries stayed still.
    </p>
  </div>

  <!-- Chart renders here. The chart begins as a single bold line (mean),
       then reveals the percentile bands on scroll. -->
  <div class="chart-container chart-act1" id="chart-act1"></div>

  ```js
  // Build the chart and mount it into the DOM container above.
  // distributionTrend() returns an SVG node — we append it to the div.
  const act1Chart = distributionTrend(statsData, {
    width: document.querySelector("#chart-act1").clientWidth,
    theme: THEME,
  });
  document.querySelector("#chart-act1").appendChild(act1Chart);
  ```

  <div class="fig-label"><strong>Fig. 1</strong> Global distribution of TRIP scores, 2000–2021 · p25, p50, p75 bands · 173 countries</div>

  <div class="act-body act-body--after-chart">
    <p>
      The bottom quarter of countries scored 7.7% in 2000.
      In 2021, they still score 7.7%. Exactly the same.
    </p>
    <p>
      The world didn't rise. A cluster at the top pulled the average with them,
      and left most of the world where it started.
    </p>
  </div>

  <div class="aside-note aside-note--right aside-note--anchor-low" aria-hidden="true">
    <p class="aside-note__label">Measuring divergence</p>
    <p class="aside-note__text">The Interquartile Range — the spread from p25 to p75 — tripled over this period: from 7.7 percentage points in 2000 to 23.1 in 2021. The average rose; the gap widened.</p>
  </div>

</section>


<!-- ═══════════════════════════════════════════════════════════════════════════
     ACT II — THE MAP THAT ISN'T THERE
     ═══════════════════════════════════════════════════════════════════════════ -->

<section id="act2" class="act">

  <div class="aside-note aside-note--left aside-note--anchor-high" aria-hidden="true">
    <img class="aside-note__img" src="https://picsum.photos/seed/trip02/200/125?grayscale" alt="">
    <p class="aside-note__label">Section 377 · 1860</p>
    <p class="aside-note__text">Drafted by British colonial administrators for India, this law criminalising "carnal intercourse against the order of nature" was copied wholesale into the criminal codes of Nigeria, Bangladesh, Singapore, Uganda, and more than a dozen others. Some still enforce it today.</p>
  </div>

  <p class="act-kicker">173 countries · geography of progress</p>

  <div class="act-body">
    <p>
      If the bottom held still and the top moved, where is the top?
      The expected answer — Western Europe, North America, perhaps
      Scandinavia — is only partially right.
    </p>
    <p>
      Argentina passed a self-determination gender recognition law in 2012,
      the first in the world. Pakistan, a country with no LGB legal protections
      at all, scores 85% on trans rights after a Supreme Court ruling in 2009
      triggered a cascade of legislation. The United States has no national
      gender recognition law and sits in the middle of the global distribution.
    </p>
    <p>
      The map below is not organized the way you might expect.
    </p>
  </div>

  <!-- Annotated choropleth. Equal-Earth projection. Static editorial image
       with hover showing country name + score. Annotations are D3 leader lines
       for ~10 key countries — see choropleth.js for annotation data. -->
  <div class="chart-container chart-act2" id="chart-act2"></div>

  ```js
  const act2Chart = await choropleth(mapData, {
    width: document.querySelector("#chart-act2").clientWidth,
    theme: THEME,
  });
  document.querySelector("#chart-act2").appendChild(act2Chart);
  ```

  <div class="act-body act-body--after-chart">
    <p>
      Many of the countries with the most restrictive laws share something
      beyond their politics. Their criminal codes were written in London.
      Section 377 of the Indian Penal Code — drafted by British colonial
      administrators in 1860 — was adopted wholesale by Nigeria, Bangladesh,
      Singapore, Malaysia, Uganda, and dozens of others. It criminalises
      "carnal intercourse against the order of nature," a clause courts and
      police have applied to gender-nonconforming people for over a century.
    </p>
    <p>
      Iran presents a different kind of anomaly. State-funded gender
      reassignment surgery has been available since 1987 — yet same-sex
      relations remain punishable by death. The map rewards close attention.
    </p>
  </div>

  <div class="aside-note aside-note--right aside-note--anchor-mid" aria-hidden="true">
    <img class="aside-note__img" src="https://picsum.photos/seed/trip03/200/125?grayscale" alt="">
    <p class="aside-note__label">Argentina · 2012</p>
    <p class="aside-note__text">Law 26.743 — the Gender Identity Law — passed the Argentine Senate 55 votes to 0. It allowed self-determined legal gender recognition with no medical, surgical, or judicial requirements. The first law of its kind anywhere in the world.</p>
  </div>

</section>


<!-- ═══════════════════════════════════════════════════════════════════════════
     ACT III — WHAT CHANGED, AND WHAT DIDN'T
     ═══════════════════════════════════════════════════════════════════════════ -->

<section id="act3" class="act">

  <div class="aside-note aside-note--left aside-note--anchor-low" aria-hidden="true">
    <p class="aside-note__label">The one that went backwards</p>
    <p class="aside-note__text">Direct criminalization is the only indicator that worsened between 2000 and 2021. Eight countries had explicit anti-trans criminal provisions in 2000. By 2021, twelve did. Four new countries added them in two decades.</p>
  </div>

  <p class="act-kicker">13 indicators · recognition vs. protection</p>

  <div class="act-body">
    <p>
      The geography tells us where progress happened. This tells us what kind.
      Thirteen legal indicators, each tracking a distinct right — from
      freedom from criminalization to constitutional anti-discrimination
      protections. Not all of them moved.
    </p>
  </div>

  <!-- 13-row indicator dot plot. Each row = one indicator.
       Two marks per row: 2000 adoption rate (hollow) and 2021 (filled).
       Connected by a line. Color: emerald for growth, coral for regression.
       Sorted by 2021 adoption rate, descending. -->
  <div class="chart-container chart-act3" id="chart-act3"></div>

  ```js
  const act3Chart = indicatorDotPlot(indicators, {
    width: document.querySelector("#chart-act3").clientWidth,
    theme: THEME,
  });
  document.querySelector("#chart-act3").appendChild(act3Chart);
  ```

  <div class="act-body act-body--after-chart">
    <p>
      Gender marker changes led the improvement — from 11% of countries in
      2000 to 35% in 2021. Anti-discrimination protections in employment
      followed, reaching 20% of countries. But constitutional protections
      exist in just 3% of countries. Nonbinary recognition: 5%.
      And direct criminalization — the only indicator that moved backwards.
    </p>
  </div>

  <div class="aside-note aside-note--right aside-note--anchor-high" aria-hidden="true">
    <p class="aside-note__label">LGB vs. trans</p>
    <p class="aside-note__text">Countries that score high on LGB rights do not always score high on trans rights. Austria scores 82% for LGB protections (ILGA World, 2020) but just 23% on TRIP — because the indicators measure different rights for different groups.</p>
  </div>

  <!-- ── TYPOLOGY CALLOUTS ──────────────────────────────────────────────── -->
  <!-- Three portrait cards integrated into copy. Not a data grid — editorial
       pull-quotes that illustrate three distinct legal typologies.
       Rendered as styled HTML blocks, not a chart module. -->

  <div class="typology-grid">

    <div class="typology-card">
      <div class="typology-country">Argentina</div>
      <div class="typology-label">The complete case</div>
      <div class="typology-score">Score: 100% · 2021</div>
      <p class="typology-body">
        First country globally to allow self-determined gender recognition
        with no medical requirements (2012). By 2021, the only country to
        score on all 13 indicators. The benchmark — and an outlier.
      </p>
    </div>

    <div class="typology-card">
      <div class="typology-country">India</div>
      <div class="typology-label">Recognition without protection</div>
      <div class="typology-score">Score: 62% · 2021</div>
      <p class="typology-body">
        Gender marker changes allowed since 2014. No general
        anti-discrimination law. Courts advanced recognition; legislation
        did not follow. High on identity, low on daily life.
      </p>
    </div>

    <div class="typology-card">
      <div class="typology-country">Austria</div>
      <div class="typology-label">The progressive exception</div>
      <div class="typology-score">Score: 23% · 2021</div>
      <p class="typology-body">
        Scores 82% on LGB rights. Scores 23% on trans rights. Gender marker
        changes require full medical documentation. No anti-discrimination
        law covers trans people. A country considered progressive —
        but not for this group.
      </p>
    </div>

  </div>

</section>


<!-- ═══════════════════════════════════════════════════════════════════════════
     ACT IV — THE DIVERGENCE FINGERPRINT  (flagship)
     ═══════════════════════════════════════════════════════════════════════════ -->

<section id="act4" class="act act--flagship">

  <p class="act-kicker">every country · every year · 2000–2021</p>

  <div class="act-body act-body--pre-flagship">
    <p>
      Every country. Every year. The complete record — and the shape
      of the world it describes.
    </p>
  </div>

  <!-- ── SCROLLAMA CONTAINER ────────────────────────────────────────────── -->
  <!-- The graphic is sticky. Steps scroll over it.
       Step text is in .flagship-steps > .step divs.
       The SVG lives in #flagship-graphic and is controlled by flagship.js. -->

  <div class="flagship-wrapper">

    <div class="flagship-sticky" id="flagship-graphic">
      <!-- flagship.js mounts the D3 SVG here on init -->
    </div>

    <div class="flagship-steps">

      <div class="step" data-step="1">
        <div class="step-text">
          <p>In 2000, the world was almost uniform. Not equal — but similarly stuck. Most countries clustered between 8% and 15%. A few slightly lighter bands at the top. Nowhere to point to and say: look, this is what protection looks like.</p>
        </div>
      </div>

      <div class="step" data-step="2">
        <div class="step-text">
          <p>Through the 2000s, a small group began to move. The rest stayed still. The separation was not dramatic at first — a widening, not a rupture. But the direction was clear.</p>
        </div>
      </div>

      <div class="step" data-step="3">
        <div class="step-text">
          <p>After 2012 — the year Argentina enacted self-determined gender recognition — something accelerated. More countries followed. The gap became structural. The bright bands at the top are not outliers. They are a world apart.</p>
        </div>
      </div>

      <div class="step" data-step="4">
        <div class="step-text">
          <p>By 2021, two worlds had formed. The bottom half of this image has barely changed since the year 2000. The p25 line — the score below which a quarter of the world sits — has not moved a single percentage point in 22 years.</p>
        </div>
      </div>

    </div><!-- /flagship-steps -->

  </div><!-- /flagship-wrapper -->

  ```js
  // flagship.js takes over full control of Act IV rendering and scroll.
  // It initialises Scrollama internally and manages step transitions.
  flagship(matrix, {
    container: "#flagship-graphic",
    steps: ".flagship-steps .step",
    theme: THEME,
  });
  ```

</section>


<!-- ═══════════════════════════════════════════════════════════════════════════
     EPILOGUE
     ═══════════════════════════════════════════════════════════════════════════ -->

<section id="epilogue" class="act act--epilogue">

  <div class="act-body">
    <p>
      These are laws. They do not record what happened in the streets,
      in hospitals, in families. A country can score 85% and still be
      dangerous. A low score can coexist with strong community networks
      that laws do not see. The legal environment matters — it shapes
      what police do, what doctors can say, what documents a person can hold —
      but it is not the whole story.
    </p>
    <p>
      This data ends in 2021. Since then, at least 27 US states have
      enacted anti-trans legislation. Uganda's Anti-Homosexuality Act of 2023
      introduced life imprisonment provisions affecting trans people. Hungary
      and Russia have expanded restrictions. The bright bands you saw
      are not guaranteed. Some are already dimming.
    </p>
  </div>

  <div class="methodology-note">
    <div class="methodology-kicker">About this data</div>
    <p>
      This piece uses the Trans Rights Indicator Project (TRIP), a dataset
      of 14 legal indicators for 173 countries from 2000 to 2021, developed
      by Myles Williamson (University of Alabama). The composite score
      ranges from 0 to 13. Anti-discrimination adoption figures cited in
      Act III are author's calculations from raw TRIP data. The LGB comparison
      cited in Act III uses ILGA World's State-Sponsored Homophobia Report (2020).
      Post-2021 references: ACLU Legislative Tracker, Human Rights Watch.
    </p>
  </div>

</section>
