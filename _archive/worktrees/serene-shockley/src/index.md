---
title: Trans Rights Worldwide
---

```js
// ── Imports ─────────────────────────────────────────────────────────────────
// We pull in utility functions from our own lib/data.js file.
// Think of this like importing a set of tools from a toolbox:
// we specify exactly which tools we need, and where to find them.
import {
  normalizeTripRows,
  globalAverageByYear,
  filterByYear,
  mean
} from "./lib/data.js";
```

```js
// ── Load and prepare data ────────────────────────────────────────────────────
// FileAttachment is Observable Framework's way of referencing data files.
// .csv({ typed: true }) parses numbers as actual numbers, not strings —
// so "2.5" in the CSV becomes the number 2.5, not the text "2.5".
// "await" means: pause here and wait for the file to finish loading
// before running the next line. Without it, `raw` would be empty.
const raw = await FileAttachment("./data/trans_rights_worldwide.csv").csv({ typed: true });

// normalizeTripRows() standardises column names across the dataset.
// It guarantees every row has: { country, iso3, year, trip_score, ...rest }
// This is important because CSVs in the wild often have inconsistent headers.
const data = normalizeTripRows(raw);

// ── Compute the global trend ──────────────────────────────────────────────────
// globalAverageByYear() groups all rows by year and averages trip_score per year.
// It returns a sorted array: [{ year: 2000, value: 1.43 }, { year: 2001, value: 1.49 }, ...]
// We'll pass this `series` array to the trend-line chart once we build it.
const series = globalAverageByYear(data);

// ── Isolate specific years for before/after comparisons ──────────────────────
// filterByYear() returns only the rows matching a given year.
// The +year syntax converts a string to a number, just to be safe.
const rows2000 = filterByYear(data, 2000);
const rows2021 = filterByYear(data, 2021);

// ── Distribution of scores in 2021 ───────────────────────────────────────────
// .filter() creates a new array keeping only rows that pass the test function.
// d => d.trip_score != null  means: keep rows where trip_score exists.
const scored2021 = rows2021.filter(d => d.trip_score != null);

// Counts for later use in charts. We'll reference these variables
// when we build the distribution and indicator charts.
const score0count    = scored2021.filter(d => d.trip_score === 0).length;
const atMost2count   = scored2021.filter(d => d.trip_score <= 2).length;

// ── Criminalization ───────────────────────────────────────────────────────────
// dir_crim = 1 means direct criminalization exists in that country-year.
// The + coerces the value to a number (in case it was parsed as a string).
const dirCrim2000 = rows2000.filter(d => +d.dir_crim === 1).length;
const dirCrim2021 = rows2021.filter(d => +d.dir_crim === 1).length;
const indCrim2021 = rows2021.filter(d => +d.ind_crim === 1).length;

// ── Gender marker change ──────────────────────────────────────────────────────
// gmc = 1 means the country has a national law allowing gender marker changes.
const gmc2000 = rows2000.filter(d => +d.gmc === 1).length;
const gmc2021 = rows2021.filter(d => +d.gmc === 1).length;

// ── Unique country count ──────────────────────────────────────────────────────
// new Set() creates a collection of unique values. .size gives the count.
// This verifies how many distinct countries are in the dataset.
const countryCount = new Set(data.map(d => d.iso3)).size;
```

```html
<div class="trip-page">

<!-- ══════════════════════════════════════════════════════════════
     HERO
     ══════════════════════════════════════════════════════════════ -->

<section class="trip-hero-editorial">

  <div class="trip-hero-kicker">
    <span class="dot"></span>
    <span>Trans Rights Indicator Project</span>
    <span class="sep">·</span>
    <span>173 countries</span>
    <span class="sep">·</span>
    <span>2000–2021</span>
  </div>

  <h1 class="trip-hero-title">
    Doubling sounds<br>like progress.
  </h1>

  <p class="trip-hero-sub">
    The global average score for transgender legal protections doubled between 2000 and 2021.
    When you start from almost nothing, doubling still leaves you with almost nothing.
    This is a story about two decades of trans rights worldwide — where the numbers improved,
    where they stagnated, and what the headline figure quietly leaves out.
  </p>

  <div class="trip-hero-stat">
    <span class="trip-hero-stat__num">23.5%</span>
    <p class="trip-hero-stat__label">
      Global average TRIP score, 2021.<br>
      A score of 100 would mean full legal protection.
      Zero means none at all. After 22 years of measurable change,
      the world average is 23.5.
    </p>
  </div>

</section>


<!-- ══════════════════════════════════════════════════════════════
     CHAPTER 01 — The global average
     ══════════════════════════════════════════════════════════════ -->

<section class="trip-chapter">

  <div class="trip-chapter-label">01 &nbsp; The global average</div>

  <h2 class="trip-h2">The world improved.<br>The line goes up.</h2>

  <div class="trip-prose">
    <p>
      In 2000, the average country earned a score of roughly <span class="hl">11%</span>
      on the Trans Rights Indicator Project (TRIP) index — a composite of 13 legal protections
      spanning criminalization, gender recognition, and anti-discrimination law. By 2021,
      that average had risen to <span class="hl hl--teal">23.5%</span>.
    </p>
    <p>
      Measured as a trend, this is progress. Every region except the Middle East and North Africa
      saw its average score increase. More countries enacted legal gender recognition.
      Anti-discrimination protections — entirely absent worldwide in 2000 — existed in 39 countries
      by 2021. The line, on a chart, goes up.
    </p>
    <p>
      But a global average is also the most forgiving way to read this data.
      It rewards any country that moved, regardless of where it started or where the rest of the world sat.
      To understand what 23.5% actually means, you have to look at the distribution underneath it.
    </p>
  </div>

</section>
```

```js
// ── Chart 01: Global trend line ──────────────────────────────────────────────
// This will be a D3 line chart showing the global average TRIP score, year by year.
// The `series` variable (computed above) is the data it will use:
// [{ year: 2000, value: 1.43 }, { year: 2001, value: 1.49 }, ...]
//
// We'll build this chart together in the next session.
// For now, a labelled placeholder sits here so the narrative reads correctly.
display(html`
  <div class="trip-figure" style="margin-top: 32px;">
    <div class="chart-placeholder" style="min-height: 260px;" id="chart-global-trend">
      Chart 01 · D3 line chart: global average TRIP score, 2000–2021
    </div>
    <p class="trip-caption">
      Global average TRIP score across 173 countries, 2000–2021. Score ranges from 0 (no legal protections)
      to 13 (all 13 indicators present). Data: Williamson (2023).
    </p>
  </div>
`)
```

```html
<!-- ══════════════════════════════════════════════════════════════
     CHAPTER 02 — What the average hides
     ══════════════════════════════════════════════════════════════ -->

<section class="trip-chapter">

  <div class="trip-chapter-label">02 &nbsp; What the average hides</div>

  <h2 class="trip-h2">A handful of countries<br>drag the world average up.</h2>

  <div class="trip-prose">
    <p>
      Global averages are useful for tracking direction. They are less useful for understanding
      where most countries actually are. The TRIP average rose because a cluster of mostly
      Western European and Latin American countries made substantial gains. The median country
      — the one in the middle of the distribution — barely moved.
    </p>
    <p>
      In 2021, more than half of all scored countries earned <span class="hl hl--coral">2 or below</span>
      out of 13 on the TRIP index. That means: either no criminalization and nothing else,
      or criminalization with nothing to counterbalance it. For the majority of the world's
      trans population, the legal environment in 2021 looked nearly identical to 2000.
    </p>
  </div>

  <div class="trip-pullquote">
    "In 2021, the majority of countries still offered trans people almost no legal protection.
    The global average improved. The global median barely moved."
  </div>

</section>
```

```js
// ── Chart 02: Distribution of TRIP scores, 2000 vs 2021 ─────────────────────
// This will be a D3 dot-strip or histogram showing how countries are distributed
// along the 0–13 score range — for two years, side by side or overlaid.
//
// Key insight this chart needs to communicate:
// - In 2000 AND 2021, the distribution is heavily left-skewed (most countries near 0)
// - A small tail of high-scoring countries pulls the mean up
// - The tail grew between 2000 and 2021 (the "progress"), but the bulk barely shifted
//
// Variables we'll need: rows2000, rows2021, scored2021 (all computed above).
display(html`
  <div class="trip-figure" style="margin-top: 32px;">
    <div class="chart-placeholder" style="min-height: 300px;" id="chart-distribution">
      Chart 02 · D3 dot-strip: distribution of country TRIP scores, 2000 vs 2021
    </div>
    <p class="trip-caption">
      Distribution of TRIP scores across all countries, 2000 and 2021.
      Each dot is one country. Score 0 = no protections; 13 = full protection.
    </p>
  </div>
`)
```

```html
<!-- ══════════════════════════════════════════════════════════════
     CHAPTER 03 — Geography is destiny
     ══════════════════════════════════════════════════════════════ -->

<section class="trip-chapter">

  <div class="trip-chapter-label">03 &nbsp; The map</div>

  <h2 class="trip-h2">Progress was not evenly<br>distributed. Not even close.</h2>

  <div class="trip-prose">
    <p>
      The global average obscures a second problem: geographic concentration.
      The countries that improved most are not spread evenly across the world.
      They are clustered — in Western Europe, in Latin America, in pockets of
      Eastern and Southern Africa that stand out sharply against their neighbours.
    </p>
    <p>
      The <span class="hl">Middle East and North Africa</span> recorded no measurable improvement
      in its mean TRIP score over the entire 22-year period. Not slower progress — no progress.
      <span class="hl">Sub-Saharan Africa</span> saw five countries add direct criminal provisions
      explicitly targeting trans people. <span class="hl hl--teal">Western Europe and North America</span>
      remains the only region where the average approaches anything close to meaningful legal protection.
    </p>
    <p>
      Unlike economic development or internet access, trans rights did not diffuse globally.
      The gap between the most and least protective countries widened between 2000 and 2021.
    </p>
  </div>

</section>
```

```js
// ── Chart 03: World choropleth ────────────────────────────────────────────────
// This will be a D3 map (equal-earth projection) coloured by TRIP score.
// A sequential colour scale from near-white (score 0) to deep teal (score 13).
//
// We may also add a year slider to let the reader scrub through 2000–2021 —
// but only if that interaction earns its place in the story (not just because we can).
//
// We'll need: world TopoJSON (world-110m.json) joined to the TRIP data by ISO3 code.
display(html`
  <div class="trip-figure" style="margin-top: 32px;">
    <div class="chart-placeholder chart-placeholder--tall" id="chart-map">
      Chart 03 · D3 choropleth: world map coloured by TRIP score, 2021
    </div>
    <p class="trip-caption">
      TRIP score by country, 2021. Grey = no data. Colour scale: 0 (no protections) →
      full teal (all 13 protections). Data: Williamson (2023); geometry: Natural Earth.
    </p>
  </div>
`)
```

```html
<!-- ══════════════════════════════════════════════════════════════
     CHAPTER 04 — What actually changed
     ══════════════════════════════════════════════════════════════ -->

<section class="trip-chapter">

  <div class="trip-chapter-label">04 &nbsp; Breaking it down</div>

  <h2 class="trip-h2">Progress happened in two<br>categories. One went backwards.</h2>

  <div class="trip-prose">
    <p>
      The TRIP index has 13 component indicators. The global improvement between 2000 and 2021
      was not evenly spread across them. Most of the gain came from two areas:
      <span class="hl hl--teal">legal gender recognition</span> and
      <span class="hl hl--teal">employment anti-discrimination</span>.
    </p>
    <p>
      In 2000, 18 countries — mostly European — had national laws allowing gender marker changes
      on identity documents. By 2021, 60 did. Employment anti-discrimination protections
      grew from zero to 35 countries. These are real gains. They are also the most visible
      and internationally legible type of policy reform.
    </p>
    <p>
      The indicators that remained nearly static — nonbinary recognition, constitutional
      protections, healthcare and housing anti-discrimination — show a different picture.
      And direct criminalization moved in the wrong direction entirely.
    </p>
  </div>

  <div class="trip-callout">
    <div class="trip-callout__headline">Criminalization increased.</div>
    <p style="margin: 0; font-size: 0.96rem; color: rgba(215,232,233,.78); line-height: 1.6;">
      Eight countries explicitly criminalized transgender people in 2000 — through laws targeting
      "cross-dressing" or gender nonconformity. <b>Thirteen did by 2021.</b>
      Decriminalization occurred in exactly one country across the entire 22-year period: Guyana, in 2018,
      following a Caribbean Court of Justice ruling. Indirect criminalization —
      the use of vague laws on "morality," "decency," and "public order" to target trans people —
      remained present in <b>104 countries</b> as of 2021. More than half the world.
    </p>
  </div>

</section>
```

```js
// ── Chart 04: Indicator comparison, 2000 vs 2021 ────────────────────────────
// This will be a D3 dot-and-bar chart showing, for each of the 13 TRIP indicators,
// what proportion of countries scored 1 (= protected) in 2000 vs 2021.
//
// This directly mirrors Figure 2 from Williamson (2023), but redesigned.
// The key visual: most indicators improved modestly; direct criminalization worsened.
// The "no_dircrim" column (= 1 means NO criminalization) should show a DECLINE.
//
// Indicators to show (from the `no_dircrim`, `no_indcrim`, `gmc`, `nophys`, `nopsych`,
// `nodiv`, `nb3g`, `adp_general`, `adp_constitution`, `adp_employment`,
// `adp_education`, `adp_healthcare`, `adp_housing` columns).
display(html`
  <div class="trip-figure" style="margin-top: 32px;">
    <div class="chart-placeholder" style="min-height: 380px;" id="chart-indicators">
      Chart 04 · D3 dot-bar: proportion of countries with each TRIP indicator present, 2000 vs 2021
    </div>
    <p class="trip-caption">
      Each row is one of the 13 TRIP indicators. Dots show the proportion of countries
      where the right was in place in 2000 (light) and 2021 (dark). One indicator — direct
      criminalization — moved in the wrong direction. Data: Williamson (2023).
    </p>
  </div>
`)
```

```html
<!-- ══════════════════════════════════════════════════════════════
     CHAPTER 05 — Trans ≠ LGB
     ══════════════════════════════════════════════════════════════ -->

<section class="trip-chapter">

  <div class="trip-chapter-label">05 &nbsp; Not the same thing</div>

  <h2 class="trip-h2">Being trans and being gay<br>are different legal realities.</h2>

  <div class="trip-prose">
    <p>
      Much of what we know about LGBT rights globally has been measured through
      the lens of sexual orientation — criminalization of same-sex conduct, recognition
      of same-sex unions, protection against homophobic discrimination.
      Transgender rights research has largely borrowed these proxies.
      The TRIP data shows this is a mistake.
    </p>
    <p>
      In 2020, the global averages looked nearly identical: countries scored 24.1% on an
      equivalent LGB index, and 23.3% on TRIP. The similarity is misleading.
      Underneath it, individual countries diverge sharply.
    </p>
    <p>
      <span class="hl">Pakistan</span> scored <span class="hl hl--coral">0%</span> on the LGB index in 2020
      — criminalization of same-sex conduct remained in force. On TRIP, Pakistan scored
      <span class="hl hl--teal">84.6%</span>, following a series of Supreme Court decisions and
      the 2018 Transgender Persons (Protection of Rights) Act that established comprehensive protections.
      <span class="hl">Austria</span> sat at the opposite extreme: <span class="hl hl--teal">81.8%</span> on LGB,
      <span class="hl hl--coral">23.1%</span> on TRIP. Strong protections for gay and lesbian people;
      negligible protections for trans people.
    </p>
    <p>
      Using LGB rights as a proxy for trans rights doesn't add noise. It tells an actively different story.
    </p>
  </div>

</section>
```

```js
// ── Chart 05: TRIP vs LGB scatterplot ────────────────────────────────────────
// This will be a D3 scatterplot with one dot per country, 2020.
// X axis: LGB score (0–100%). Y axis: TRIP score (0–100%).
// Countries that fall on the diagonal treat the two groups similarly.
// Countries that fall off it — Pakistan (top-left), Austria (bottom-right) — are the story.
//
// We'll annotate the key outliers directly on the chart.
// Data sources: TRIP index (this dataset) + LGB score columns (lgb_score, lgb_percent)
// which are already in the same CSV — no separate file needed.
display(html`
  <div class="trip-figure" style="margin-top: 32px;">
    <div class="chart-placeholder" style="min-height: 420px;" id="chart-scatter-lgb">
      Chart 05 · D3 scatterplot: TRIP score vs LGB score per country, 2020
    </div>
    <p class="trip-caption">
      Each dot is one country in 2020. Countries on the diagonal treat trans and LGB people similarly.
      Countries above it protect trans people more than LGB people; below it, the reverse.
      Annotated outliers: Pakistan, India, Austria, South Africa.
      Data: Williamson (2023); LGB index from ILGA World (Mendos et al. 2020).
    </p>
  </div>
`)
```

```html
<!-- ══════════════════════════════════════════════════════════════
     CHAPTER 06 — After 2021
     ══════════════════════════════════════════════════════════════ -->

<section class="trip-chapter">

  <div class="trip-chapter-label">06 &nbsp; After 2021</div>

  <h2 class="trip-h2">The dataset ends in 2021.<br>The backlash had already begun.</h2>

  <div class="trip-prose">
    <p>
      TRIP's 22-year window closes at the start of an acceleration.
      In the United States, anti-trans bills introduced in state legislatures nearly tripled
      in the year following the 2015 <em>Obergefell</em> ruling that legalised same-sex marriage,
      and roughly doubled again after the 2020 <em>Bostock</em> decision extended federal
      anti-discrimination protection to LGBT employees. A legal gain for one group
      triggered a coordinated legislative response against another.
    </p>
    <p>
      In Hungary, constitutional amendments explicitly banned legal gender recognition.
      Russia expanded its "LGBT propaganda" laws to all ages in 2022 and began criminalizing
      gender-affirming healthcare. In the United Kingdom, a multiyear process to reform
      the Gender Recognition Act — expected to simplify legal recognition — stalled,
      then reversed direction.
    </p>
    <p>
      None of this is in the data. The TRIP index covers 2000–2021. But the structural
      conditions for backlash — the concentration of progress in wealthy democracies,
      the fragility of court-led reform, the gap between legal recognition and lived reality
      — are legible in every chart on this page.
    </p>
    <p>
      Rights are not a one-way ratchet. When the data ends, they were already being wound back.
    </p>
  </div>

  <div class="trip-pullquote trip-pullquote--muted">
    Note: No comprehensive global trans rights dataset currently extends the TRIP indicators
    beyond 2021. Post-2021 data on the backlash comes from ILGA World, ACLU, the Trans Legislation
    Tracker, and news reporting. This chapter is editorial — not an extension of the dataset.
  </div>

</section>


<!-- ══════════════════════════════════════════════════════════════
     SOURCES
     ══════════════════════════════════════════════════════════════ -->

<section class="trip-sources">

  <div class="trip-chapter-label">Sources &amp; methodology</div>

  <div class="trip-sources-grid">

    <div class="trip-sources-item">
      <b style="color: rgba(215,232,233,.82);">Primary dataset</b><br>
      Williamson, M. (2023). "A Global Analysis of Transgender Rights: Introducing the
      Trans Rights Indicator Project (TRIP)."
      <em>Perspectives on Politics</em>, 22(3), 799–818.
      <a href="https://doi.org/10.1017/S1537592723002827" target="_blank" rel="noopener">doi.org/10.1017/S1537592723002827</a>
    </div>

    <div class="trip-sources-item">
      <b style="color: rgba(215,232,233,.82);">LGB index data</b><br>
      Mendos, L.R. et al. (2020). <em>State-Sponsored Homophobia 2020</em>.
      ILGA World. The LGB indicator columns included in the TRIP dataset
      are derived from this report.
    </div>

    <div class="trip-sources-item">
      <b style="color: rgba(215,232,233,.82);">Replication data</b><br>
      Williamson, M. (2023). Harvard Dataverse.
      <a href="https://doi.org/10.7910/DVN/FXXLTS" target="_blank" rel="noopener">doi.org/10.7910/DVN/FXXLTS</a>
    </div>

    <div class="trip-sources-item">
      <b style="color: rgba(215,232,233,.82);">Post-2021 context</b><br>
      ACLU (2023). Anti-Trans Legislation Tracker.
      Trans Legislation Tracker (2023).
      ILGA World annual reports (2022–2024).
    </div>

  </div>

  <p style="margin-top: 24px; font-size: 0.82rem; color: rgba(215,232,233,.38); max-width: 72ch;">
    TRIP scores range from 0 to 13. Each point corresponds to one legal indicator: two criminalization
    measures (inverted), six gender recognition measures, and six anti-discrimination protections.
    A score of 13 indicates all 13 indicators are in place. Scores are de jure (law on paper),
    not de facto (enforcement or lived experience). Data covers 173 countries, 2000–2021.
  </p>

</section>


</div>
```
