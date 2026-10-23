---
title: Uneven Ground
toc: false
---

```js
import { yearlyStats, countrySnapshot, indicatorAdoption, fingerprintMatrix, countryTable } from "./lib/data.js";
import { THEME }             from "./lib/theme.js";
import { distributionTrend } from "./lib/charts/distributionTrend.js";
import { choropleth }        from "./lib/charts/choropleth.js";
import { indicatorDotPlot }  from "./lib/charts/indicatorDotPlot.js";
import { flagship }          from "./lib/charts/flagship.js";
import { initScroll, scrolly } from "./lib/scroll.js";
import { initCarousel }      from "./lib/carousel.js";
import { dataTable, csvField } from "./lib/charts/dataTable.js";

const raw      = await FileAttachment("data/processed/trip_clean.csv").csv({ typed: true });
const topoJson = await FileAttachment("data/geo/world-110m.json").json();
```

```js
// On phones, step cards pass over the lower half of the screen, so graphics stay short.
const phone = window.innerWidth <= 1080;
const stickyHeight = (reserve) => phone
  ? Math.round(window.innerHeight * 0.5)
  : Math.max(320, window.innerHeight - reserve);

// Act I — scroll-driven distribution
const act1El = document.querySelector("#chart-act1");
const act1 = distributionTrend(yearlyStats(raw), {
  width: act1El.clientWidth, height: Math.min(460, stickyHeight(240)), theme: THEME,
});
act1El.append(act1);
scrolly("#scrolly-act1", i => act1.step(i));

// Act II — zoomable map, flown to a region on each step
const act2El = document.querySelector("#chart-act2");
const act2 = choropleth(countrySnapshot(raw, 2021), {
  width: act2El.clientWidth,
  height: phone ? stickyHeight() : Math.min(Math.round(act2El.clientWidth * 0.62), stickyHeight(230)),
  theme: THEME, topoJson,
});
act2El.append(act2);
scrolly("#scrolly-act2", i => act2.step(i));

// Act III — static dot plot
const act3El = document.querySelector("#chart-act3");
act3El.append(indicatorDotPlot(indicatorAdoption(raw), { width: act3El.clientWidth, theme: THEME }));

// Act IV — the fingerprint. Rows fill the screen height, never thinner than 4.5px.
const act4El = document.querySelector("#chart-act4");
const matrix = fingerprintMatrix(raw);
const rowHeight = phone ? 4 : Math.min(6, Math.max(4.5, (window.innerHeight - 72) / matrix.countries.length));
const act4 = flagship(matrix, { width: act4El.clientWidth, rowHeight, theme: THEME });
act4El.append(act4);
document.querySelector("#act4-side").append(act4.controls);
// If the fingerprint is taller than the screen, stick it by its bottom edge.
const act4Graphic = act4El.closest(".scrolly__graphic");
act4Graphic.style.top = `${Math.min(0, window.innerHeight - act4Graphic.offsetHeight)}px`;
scrolly("#scrolly-act4", i => act4.step(i));

// "View the data" tables, placed after each scrolling section so they open into the page.
const pctFmt = v => v == null ? "No data" : `${(v * 100).toFixed(1).replace(/\.0$/, "")}%`;
const pts = v => v == null ? "No data" : `${v} of 13`;
const change = v => v == null ? "" : `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v)}`;

document.querySelector("#table-act1").append(dataTable(yearlyStats(raw), [
  { key: "year", label: "Year" },
  { key: "n", label: "Countries", numeric: true },
  { key: "p25", label: "25th pct.", format: pctFmt, numeric: true },
  { key: "median", label: "Median", format: pctFmt, numeric: true },
  { key: "mean", label: "Average", format: pctFmt, numeric: true },
  { key: "p75", label: "75th pct.", format: pctFmt, numeric: true },
  { key: "p90", label: "90th pct.", format: pctFmt, numeric: true },
]));

const countries = countryTable(raw).sort((a, b) => a.name.localeCompare(b.name));
document.querySelector("#table-act2").append(dataTable(countries, [
  { key: "name", label: "Country" },
  { key: "region", label: "Region" },
  { key: "to", label: "Score 2021", format: pts, numeric: true },
], { sortable: true }));

document.querySelector("#table-act3").append(dataTable(indicatorAdoption(raw), [
  { key: "label", label: "Indicator" },
  { key: "category", label: "Group" },
  { key: "rate2000", label: "2000", format: pctFmt, numeric: true },
  { key: "rate2021", label: "2021", format: pctFmt, numeric: true },
  { key: "delta", label: "Change", format: v => `${v > 0 ? "+" : v < 0 ? "−" : ""}${Math.abs(v * 100).toFixed(1)} pts`, numeric: true },
]));

const scoreAt = new Map(matrix.cells.map(d => [`${d.iso3}|${d.year}`, d.score]));
const fullCsv = [["country", "iso3", ...matrix.years].join(","),
  ...matrix.countries.map(c => [csvField(c.name), c.iso3, ...matrix.years.map(y => {
    const v = scoreAt.get(`${c.iso3}|${y}`);
    return v == null ? "" : Math.round(v * 13);
  })].join(","))].join("\n");
document.querySelector("#table-act4").append(dataTable(countries, [
  { key: "name", label: "Country" },
  { key: "from", label: "2000", format: pts, numeric: true },
  { key: "to", label: "2021", format: pts, numeric: true },
  { key: "change", label: "Change", format: change, numeric: true },
], { sortable: true, download: { filename: "trip-scores-2000-2021.csv", csv: fullCsv } }));

initScroll();
initCarousel("#country-carousel");
```

<header class="hero" id="hero">
<div class="hero__text">
<h1 class="hero__title">Uneven Ground</h1>
<p class="hero__intro">An exploration of the Trans Rights Indicator Project, the record that political scientist Myles Williamson built of what the world's laws say about trans people. It follows the countries that rewrote those laws, the many that left them untouched, and the few that went backwards.</p>
<a class="hero__cue" href="#act1">Scroll for more <span class="hero__arrow" aria-hidden="true">↓</span></a>
</div>
<div class="hero__art" aria-hidden="true"></div>
</header>

<article class="article">

<!-- ═══ ACT I ═══════════════════════════════════════════════════════════════ -->
<section class="act" id="act1">
<div class="act__head">
<h2 class="act-title">What the world's laws say about trans people</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">For most of the world, trans legal rights in 2000 came down to one fact: being trans was not, in itself, a crime.</p>
<p>That was the only protection held by 98 of the 170 countries with data that year. Nothing in their laws let a person change the name or gender on a passport, and nothing stopped an employer, a school or a landlord from turning them away. Eight countries went further and made being trans a criminal offence.</p>
</div>
</div>
<div class="row">
<div class="prose">
<p>We know this because Myles Williamson, a political scientist, went through the laws of 173 countries for every year between 2000 and 2021 as part of his doctoral research at the University of Alabama, and asked each of them the same thirteen questions. His <a href="https://www.myleswilliamson.net/trip-data" target="_blank" rel="noopener">Trans Rights Indicator Project</a>, TRIP for short, was published in <em>Perspectives on Politics</em> in 2024. The questions fall into three groups.</p>
<ul>
<li><strong>Criminalization, two questions.</strong> Is there no law that directly targets trans people, and none that is used against them indirectly?</li>
<li><strong>Recognition, five questions.</strong> Can people change the gender marker on their official documents? Can they do it without surgery or other physical requirements, without a psychiatric diagnosis, and without having to divorce? Is there a nonbinary or third gender option?</li>
<li><strong>Protection, six questions.</strong> Is there a general anti-discrimination law covering trans people? Specific protection in employment, education, healthcare and housing? Protection written into the constitution?</li>
</ul>
<p>Building a record like this means making choices. "Transgender" is not a legal category everywhere. In South Asia, laws recognize hijra, khawaja sira and other third-gender identities that overlap with, but are not the same as, the Western idea of being trans. Federal countries complicate things further: in the United States, gender recognition is decided state by state, so a national score can only describe federal law. And a yes-or-no question flattens detail. A country that allows gender change after a year-long waiting period and one that allows it on the spot can both answer yes.</p>
<p>Every yes is a point. A country that answers yes to all thirteen scores 100%; one that answers no to all of them scores 0%. Nobody has reached the top. The highest score in the dataset belongs to Uruguay, with 12.</p>
<p>Measured this way, the world made progress. The average score more than doubled, from 10.9% in 2000 to 23.5% in 2021. But an average of 173 countries hides almost everything that matters about them. Scroll through the chart and the number comes apart.</p>
</div>
<aside class="note note--left reveal">
<p class="note__label">What the score measures</p>
<p>TRIP records what the law says. It does not measure how laws are enforced, how courts read them or how safe daily life is. A high score describes a legal framework, not a guarantee.</p>
</aside>
</div>
<div class="scrolly" id="scrolly-act1">
<div class="scrolly__graphic">
<figure class="fig">
<div class="fig__legend">
<span class="key key--line"><i style="background:var(--primary)"></i>Average</span>
<span class="key key--line"><i style="background:var(--ink-2)"></i>Median</span>
<span class="key key--band"><i style="background:rgba(90,55,209,.16)"></i>Middle half (25th to 75th percentile)</span>
<span class="key key--line"><i style="background:repeating-linear-gradient(90deg,var(--primary) 0 4px,transparent 4px 7px)"></i>Top 10% threshold</span>
<span class="key key--line"><i style="background:var(--accent)"></i>Bottom quarter (25th percentile)</span>
</div>
<div class="fig__plot" id="chart-act1"></div>
<figcaption class="fig__cap"><span class="fig__tag">Fig. 1</span><span>Distribution of TRIP scores across countries, 2000 to 2021.</span><span class="fig__src">Source: Trans Rights Indicator Project (Williamson, 2024). 170 to 173 countries per year.</span></figcaption>
</figure>
</div>
<div class="scrolly__steps">
<div class="step"><p>The <strong>average</strong>: 10.9% in 2000, 23.5% in 2021. This is the number a press release would use.</p></div>
<div class="step"><p>The <strong>median</strong> country, the one in the middle of the ranking, gained a single protection in 22 years. It went from 7.7% to 15.4% in 2015 and stayed there.</p></div>
<div class="step"><p>The <strong>middle half</strong> of countries. Its upper edge climbs from 15.4% to 30.8%. Its lower edge does not move once.</p></div>
<div class="step"><p>The <strong>top tenth</strong>. In 2000 a country needed 15.4% to belong to it. By 2021 it needed 61.5%. This is where the average's growth comes from.</p></div>
<div class="step"><p>The <strong>bottom quarter</strong>: 7.7% in 2000 and 7.7% in 2021. One point out of thirteen, the absence of a criminal law, and nothing else.</p></div>
</div>
</div>
<div class="table-slot" id="table-act1"></div>
<div class="row">
<div class="prose">
<p>Read together, the lines describe two different decades for two groups of countries. A few dozen rewrote their laws, often more than once. Half the world did not touch them: 88 countries ended 2021 with exactly the score they had in 2000.</p>
<p>The distance between the two groups shows up in the gap between the average and the median. In 2000 they were three points apart, 10.9% and 7.7%. By 2021 the gap had grown to eight: 23.5% against 15.4%. The average climbed because the top ran ahead, not because the middle followed.</p>
</div>
<aside class="note note--right reveal">
<p class="note__label">Measuring divergence</p>
<p>The middle half of countries spanned 7.7 percentage points in 2000 and 23.1 in 2021. That distance, the interquartile range, tripled.</p>
</aside>
</div>
</section>

<!-- ═══ ACT II ══════════════════════════════════════════════════════════════ -->
<section class="act" id="act2">
<div class="act__head">
<h2 class="act-title">A map of exceptions</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">If the floor held still while the top moved, the next question is where the top is.</p>
<p>Part of the answer is predictable. Eleven of the thirteen highest scores in 2021 belong to Western Europe, led by Luxembourg, Malta, France, Belgium and Norway with 11 points each. The region averages 7.5 points, more than any other. But it is not uniform, and the countries that break the pattern, inside Europe and outside it, are what make the map worth reading closely.</p>
</div>
</div>
<div class="scrolly scrolly--wide" id="scrolly-act2">
<div class="scrolly__graphic">
<figure class="fig">
<div class="fig__plot" id="chart-act2"></div>
<figcaption class="fig__cap"><span class="fig__tag">Fig. 2</span><span>TRIP score by country, 2021. Small island states are shown as dots.</span><span class="fig__src">Equal Earth projection. Source: TRIP (Williamson, 2024).</span></figcaption>
</figure>
</div>
<div class="scrolly__steps">
<div class="step"><p>In 2021, two thirds of countries held two protections or fewer. On the map they are the three lightest shades.</p></div>
<div class="step"><p><strong>South America.</strong> Uruguay holds 12 of 13, the highest score in the dataset. Argentina wrote the world's first self-ID law in 2012 but scores 6: it has none of the six anti-discrimination protections.</p></div>
<div class="step"><p><strong>South Asia.</strong> Pakistan scores 11, level with France and Norway, while its penal code still criminalizes same-sex relations. India holds 8. All four countries here recognize a third gender.</p></div>
<div class="step"><p><strong>Europe.</strong> Malta is the only European country that protects trans people in its constitution. Austria, Italy and Switzerland hold 3 points each. Hungary abolished legal gender change in 2020.</p></div>
<div class="step"><p><strong>Sub-Saharan Africa.</strong> Three in four countries score 0 or 1, and none scores higher than 3. Nigeria criminalizes trans people directly.</p></div>
<div class="step"><p>Now explore. Zoom with the buttons, pinch, or ⌘/Ctrl + scroll. Hover any country for its score.</p></div>
</div>
</div>
<div class="table-slot" id="table-act2"></div>
<div class="row">
<div class="prose">
<p>Many of the countries at the bottom share something beyond their politics: their criminal codes were written under British rule. Section 377 of the Indian Penal Code, drafted in 1860, criminalized "carnal intercourse against the order of nature." It, or close copies of it, spread to Pakistan, Bangladesh, Malaysia and Singapore, and similar "unnatural offences" clauses entered the codes of Nigeria, Kenya and Uganda. Courts and police have applied them to gender-nonconforming people for more than a century.</p>
<p>Iran is a different kind of exception. The state has paid for gender-affirming surgery since the 1980s, yet same-sex relations remain punishable by death. On TRIP it scores 2: legal gender change exists, but only after surgery, a psychiatric diagnosis and a divorce.</p>
</div>
<aside class="note note--right reveal">
<p class="note__label">Section 377 · 1860</p>
<p>India's Supreme Court struck the clause down for consensual adults in 2018. Versions of it remain in force elsewhere in the former empire.</p>
</aside>
</div>
</section>

<!-- ═══ ACT III ═════════════════════════════════════════════════════════════ -->
<section class="act" id="act3">
<div class="act__head">
<h2 class="act-title">Recognition first, protection later</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">The thirteen rights did not move at the same speed, and not every country moved forward.</p>
<p>The chart compares the share of countries that held each right in 2000 with the share in 2021.</p>
</div>
</div>
<div class="row row--fig">
<aside class="note note--left reveal">
<p class="note__label">The one that went backwards</p>
<p>Eight countries criminalized trans people directly in 2000, twelve in 2021. Five added such laws, including newly independent South Sudan; Guyana removed its law in 2018.</p>
</aside>
<figure class="fig fig--static fig--main-right">
<div class="fig__legend">
<span class="key key--ring"><i></i>2000</span>
<span class="key key--dot"><i style="background:var(--primary)"></i>2021, rose</span>
<span class="key key--dot"><i style="background:var(--accent)"></i>2021, fell</span>
</div>
<div class="fig__plot reveal" id="chart-act3"></div>
<figcaption class="fig__cap"><span class="fig__tag">Fig. 3</span><span>Share of countries with each protection in law, 2000 and 2021.</span><span class="fig__src">Source: TRIP (Williamson, 2024). Author's calculations.</span></figcaption>
<div class="table-slot" id="table-act3"></div>
</figure>
</div>
<div class="row">
<div class="prose">
<p>Recognition led. In 2000, 11% of countries let people change the gender marker on their documents; by 2021, 35% did. The conditions attached to that change eased more slowly. In 2021, 15% of countries no longer demanded surgery, and 11% no longer demanded a psychiatric diagnosis.</p>
<p>Protection came later and stayed thinner. No country had an anti-discrimination law covering trans people in 2000. By 2021, 20% protected them at work and about 17% in schools, hospitals and housing. Five countries, Bolivia, Cuba, Ecuador, Fiji and Malta, wrote that protection into their constitutions. Eight offered a nonbinary or third gender marker.</p>
</div>
</div>
<div class="row">
<div class="prose">
<h3 class="subhead">Going backwards</h3>
<p>Progress did not run in one direction. Twenty-one countries lost at least one protection at some point between 2000 and 2021. Six ended the period with a lower score than they started with: Cambodia, Equatorial Guinea, The Gambia, Indonesia, Kuwait and Oman.</p>
<p>The clearest losses are new laws aimed at trans people. In TRIP's coding, Indonesia added direct criminalization in 2002, Kuwait in 2007, The Gambia in 2013 and Oman in 2018. Other countries took recognition away. Hungary's parliament ended legal gender change in 2020; Bulgaria and Kyrgyzstan lost it in 2021. Most of the remaining drops come from the indirect criminalization indicator, which tracks laws not written about trans people but used against them. It switches on and off in countries such as Haiti, Panama and Kyrgyzstan, and its changes are less clear-cut than a new statute.</p>
</div>
<aside class="note note--right reveal">
<p class="note__label">LGB vs. trans</p>
<p>Austria scores 82% for LGB protections (ILGA World, 2020) but 23% on TRIP. The indicators measure different rights for different groups.</p>
</aside>
</div>
<div class="row">
<div class="prose">
<p>Behind each score is a different legal history. Six countries show how much a single number can hide.</p>
</div>
</div>
<div class="carousel carousel--full reveal" id="country-carousel">
<div class="carousel-viewport">
<div class="carousel-track">
<div class="typology-card"><div class="typology-country">Argentina</div><div class="typology-label">Recognition without protection</div><div class="typology-score">6 of 13 · 46% · 2021</div><p class="typology-body">In 2012, the first country to let people change their legal gender by declaration alone, with no medical requirements. A nonbinary marker followed in 2021. Yet none of the six anti-discrimination protections is in law.</p></div>
<div class="typology-card"><div class="typology-country">India</div><div class="typology-label">Protection with gatekeeping</div><div class="typology-score">8 of 13 · 62% · 2021</div><p class="typology-body">Legal gender change and a third gender option since 2014, and anti-discrimination protection in employment, education, healthcare and housing. But changing a legal gender still requires medical steps.</p></div>
<div class="typology-card"><div class="typology-country">Austria</div><div class="typology-label">The progressive exception</div><div class="typology-score">3 of 13 · 23% · 2021</div><p class="typology-body">Scores 82% on LGB rights but 23% on trans rights. Legal gender change is possible, yet none of the six anti-discrimination protections covers trans people.</p></div>
<div class="typology-card"><div class="typology-country">Pakistan</div><div class="typology-label">Courts moved before laws did</div><div class="typology-score">11 of 13 · 85% · 2021</div><p class="typology-body">A 2009 Supreme Court ruling recognized a third gender. The 2018 Transgender Persons Act added self-identification and protection in employment, education, healthcare and housing. Same-sex relations remain criminalized.</p></div>
<div class="typology-card"><div class="typology-country">Iran</div><div class="typology-label">The medical exception</div><div class="typology-score">2 of 13 · 15% · 2021</div><p class="typology-body">State-funded gender-affirming surgery since the 1980s, but legal gender change requires surgery, a psychiatric diagnosis and divorce. Same-sex relations remain punishable by death.</p></div>
<div class="typology-card"><div class="typology-country">United States</div><div class="typology-label">No federal recognition</div><div class="typology-score">5 of 13 · 38% · 2021</div><p class="typology-body">There is no federal way to change a legal gender marker; that is left to the states. Its score comes from federal anti-discrimination protection in employment, education, healthcare and housing.</p></div>
</div>
</div>
<div class="carousel-controls">
<button class="carousel-btn carousel-btn--prev" type="button" aria-label="Previous country">←</button>
<div class="carousel-dots" data-carousel-dots></div>
<button class="carousel-btn carousel-btn--next" type="button" aria-label="Next country">→</button>
</div>
</div>
</section>

<!-- ═══ ACT IV ══════════════════════════════════════════════════════════════ -->
<section class="act" id="act4">
<div class="act__head">
<h2 class="act-title">Every country, every year</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">Put every country and every year into one image, and both stories become visible at once.</p>
<p>Each row is a country, sorted from the highest score in 2021 at the top to the lowest at the bottom. Each column is a year. The colour of a cell is the number of protections that country held that year, from yellow for none to deep purple for nine or more.</p>
</div>
</div>
<div class="scrolly" id="scrolly-act4">
<div class="scrolly__side" id="act4-side"></div>
<div class="scrolly__graphic scrolly__graphic--tall">
<figure class="fig">
<div class="fig__plot" id="chart-act4"></div>
</figure>
</div>
<div class="scrolly__steps">
<div class="step"><p>Each row is a country, each column a year. Hover a row, or look a country up in the search box.</p></div>
<div class="step"><p>In 2000 the picture is almost one colour. 89% of countries held one or two protections, and none held more than four.</p></div>
<div class="step"><p>Through the 2000s, a few rows at the top begin to darken. By 2011, twelve countries had reached five protections or more.</p></div>
<div class="step"><p>From <strong>2012</strong>, the year of Argentina's law, the change speeds up. Thirty more countries crossed five protections in the decade that followed.</p></div>
<div class="step"><p>The <strong>bottom quarter</strong> barely changes colour from left to right. Of its 44 countries, 39 held exactly the same score in 2021 as in 2000.</p></div>
</div>
</div>
<figure class="fig">
<figcaption class="fig__cap"><span class="fig__tag">Fig. 4</span><span>TRIP score of every country, every year, 2000 to 2021.</span><span class="fig__src">Source: TRIP (Williamson, 2024). 173 countries × 22 years.</span></figcaption>
</figure>
<div class="table-slot" id="table-act4"></div>
<div class="row">
<div class="prose">
<p>This is the shape behind the average. The rise was real, but it was concentrated. In 2000, no country held five protections. By 2021, 42 did, and 16 held nine or more. Below them, the image stays the colour it was in 2000.</p>
</div>
</div>
</section>

<!-- ═══ EPILOGUE ════════════════════════════════════════════════════════════ -->
<section class="act article-end" id="epilogue">
<div class="act__head">
<h2 class="act-title">What the law doesn't record</h2>
</div>
<div class="row">
<div class="prose">
<p>These are laws. They do not record what happens in the street, in hospitals or at home. A country can score 85% and still be dangerous for trans people, and a low score can coexist with community networks that no statute sees. The law still matters: it shapes what police can do, what doctors can say and which documents a person can carry. But it is not the whole story.</p>
<p>The record also stops in 2021, and the losses did not. In 2023, Russia banned legal gender change and gender-affirming medical care. The same year, Uganda's Anti-Homosexuality Act made same-sex relations punishable by life imprisonment and, in some cases, death. In the United States, where gender recognition is left to the states, more than twenty states have restricted gender-affirming care for minors since 2021. In the United Kingdom, the government blocked Scotland's self-ID reform in 2023, and in 2025 the Supreme Court ruled that "sex" in equality law means biological sex.</p>
<p>The countries that moved between 2000 and 2021 show that legal change can come quickly. The ones that moved back, inside the data and after it, show that it can be undone just as fast.</p>
</div>
</div>
<div class="sources">
<p class="sources__label">About this data</p>
<p>This piece uses the <a href="https://www.myleswilliamson.net/trip-data" target="_blank" rel="noopener">Trans Rights Indicator Project (TRIP)</a>, a dataset of 13 legal indicators for 173 countries from 2000 to 2021, developed by Myles Williamson as part of his doctoral research at the University of Alabama and published in <em>Perspectives on Politics</em> (Cambridge University Press), Vol. 22, No. 3 (2024). All scores, shares and counts in this article are calculated from the TRIP data. The LGB comparison uses ILGA World's <em>State-Sponsored Homophobia Report</em> (2020). Post-2021 events: ACLU Legislative Tracker, Human Rights Watch.</p>
</div>
<div class="credits">
<p class="sources__label">Credits</p>
<p><a href="https://www.ivan-alfonsoburgos.com/" target="_blank" rel="noopener">Iván Alfonso Burgos</a></p>
</div>
</section>

</article>
