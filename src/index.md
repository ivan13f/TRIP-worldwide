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
<h1 class="hero__title">Uneven Ground<span class="hero__title-sub">Trans Rights Worldwide 2000-2021</span></h1>
<p class="hero__intro">An exploration of the Trans Rights Indicator Project, the record that political scientist Myles Williamson built of what the world's laws say about trans people.</p>
<a class="hero__cue" href="#act1">Scroll for more <span class="hero__arrow" aria-hidden="true">↓</span></a>
</div>
<div class="hero__art"><img src="./assets/hero-protest.jpg" alt="Protesters at a trans rights march holding signs that read Protect Trans Youth and End Trans Torture, under a trans pride flag"></div>
</header>

<article class="article">

<!-- ═══ ACT I ═══════════════════════════════════════════════════════════════ -->
<section class="act" id="act1">
<div class="act__head">
<h2 class="act-title">What the world's laws say about trans people</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">In 2000, most of the world offered trans people very little in law. Often it came down to a single thing: being trans was not, in itself, a crime.</p>
<p>For 98 of the 170 countries with data that year, that was where it stopped. No way to change the name or gender on a passport. No rule to stop an employer, a school or a landlord from saying no. And eight countries went even further and made being trans a criminal offence.</p>
</div>
</div>
<div class="row">
<div class="prose">
<p>Political scientist Myles Williamson went through the laws of 173 countries for every year between 2000 and 2021 as part of his doctoral research at the University of Alabama. His <a href="https://www.myleswilliamson.net/trip-data" target="_blank" rel="noopener">Trans Rights Indicator Project</a>, TRIP for short, was published in <em>Perspectives on Politics</em> in 2024. He composed a score that is based on 13 indicators that answer questions that fall into three groups:</p>
<ul>
<li><strong>Criminalization, two questions.</strong> Is there no law that directly targets trans people, and none that is used against them indirectly?</li>
<li><strong>Recognition, five questions.</strong> Can people change the gender marker on their official documents? Can they do it without surgery or other physical requirements, without a psychiatric diagnosis, and without having to divorce? Is there a nonbinary or third gender option?</li>
<li><strong>Protection, six questions.</strong> Is there a general anti-discrimination law covering trans people? Specific protection in employment, education, healthcare and housing? Protection written into the constitution?</li>
</ul>
<p>Building a record like this is no easy task. "Transgender" is not a legal category everywhere. In South Asia, for example, laws recognize hijra, khawaja sira and other third-gender identities that overlap with the Western idea of being trans, but are not the same as it. Federal countries add another difficulty. In the United States, gender recognition is decided state by state, while a national record can only count federal law. A yes-or-no question also flattens detail. A country that allows a change of gender after a year-long waiting period and one that allows it on the spot can both answer yes.</p>
<p>The sources have limits too. Williamson coded each law by hand, using at least two sources whenever possible: reports from human rights organizations, government websites and news articles. Some forms of persecution can also be undercounted, such as arrests under vague laws that never name trans people. Finally, all thirteen questions weigh the same, so two countries can reach the same score by very different roads. Williamson himself notes that the real richness of the data is in the individual indicators, not only in the total.</p>
<p>None of this makes the record less useful. It means the score should be read as a map of the law, not as a portrait of daily life.</p>
<p>Measured this way, the world has made some progress. The average score more than doubled, from 10.9% in 2000 to 23.5% in 2021. But an average of 173 countries hides almost everything that matters about them.</p>
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
<div class="step"><p>The <strong>average</strong>: 10.9% in 2000, 23.5% in 2021. But this hides the real distribution.</p></div>
<div class="step"><p>The <strong>median</strong> country, the one in the middle of the ranking, gained a single protection in 22 years. It went from 7.7% to 15.4% in 2015 and stayed there.</p></div>
<div class="step"><p>The <strong>middle half</strong> of countries. Its upper edge climbs from 15.4% to 30.8%. Its lower edge does not move once.</p></div>
<div class="step"><p>The <strong>top tenth</strong>. From 2000 to 2021, the score needed to be among them climbed from 15.4% to 61.5%. This is where the average's growth comes from.</p></div>
<div class="step"><p>The <strong>bottom quarter</strong>: same score in 2000 as in 2021. One point out of thirteen, often the absence of a criminal law, and nothing else.</p></div>
</div>
</div>
<div class="table-slot" id="table-act1"></div>
<div class="row">
<div class="prose">
<p>Read all together in the graph, the lines describe two different groups of countries. A few dozen rewrote their laws, often more than once. Half the world did not touch them: 88 countries ended 2021 with exactly the score they had in 2000. The average climbed because the top ran ahead, not because the middle followed.</p>
</div>
<aside class="note note--right reveal">
<p class="note__label">Measuring divergence</p>
<p>The distance between the countries at the 25th and the 75th percentile tripled, from 7.7 to 23.1 percentage points. The middle of the world is more spread out than it was.</p>
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
<p class="lede">If the bottom held still while the top moved, who is at the top?</p>
<p>Part of the answer is what you would expect. Of the 13 countries with the highest scores in 2021, eleven are in Western Europe. Five of them, Belgium, France, Luxembourg, Malta and Norway, hold 11 of the 13 protections. Taken together, Western Europe and North America average 7.5, more than any other region. But the region is not uniform, and the countries that break the pattern, inside Europe and outside it, are the reason this map deserves a closer look.</p>
</div>
</div>
<div class="scrolly scrolly--wide" id="scrolly-act2">
<div class="scrolly__graphic">
<figure class="fig">
<div class="fig__plot" id="chart-act2"></div>
<figcaption class="fig__cap"><span class="fig__tag">Fig. 2</span><span>TRIP score by country, 2021.</span><span class="fig__src">Equal Earth projection. Source: TRIP (Williamson, 2024).</span></figcaption>
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
<p class="note__label">Section 377</p>
<p>India's Supreme Court struck the clause down for consensual adults in 2018. Versions of it remain in force elsewhere in the former empire.</p>
</aside>
</div>
</section>

<!-- ═══ ACT III ═════════════════════════════════════════════════════════════ -->
<section class="act" id="act3">
<div class="act__head">
<h2 class="act-title">Recognition before protection</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">Not all thirteen rights moved at the same speed, and not every country moved forward.</p>
<p>The chart compares the share of countries that held each right in 2000 with the share in 2021.</p>
</div>
</div>
<div class="row row--fig">
<aside class="note note--left reveal">
<p class="note__label">Direct criminalization went backwards</p>
<p>It is the only right that went the wrong way. Eight countries criminalized trans people directly in 2000, and twelve did in 2021.</p>
</aside>
<figure class="fig fig--static fig--main-right">
<div class="fig__legend">
<span class="key key--ring"><i></i>2000</span>
<span class="key key--dot"><i style="background:var(--primary)"></i>2021, rose</span>
<span class="key key--dot"><i style="background:var(--accent)"></i>2021, fell</span>
</div>
<div class="fig__plot reveal" id="chart-act3"></div>
<figcaption class="fig__cap"><span class="fig__tag">Fig. 3</span><span>Share of countries with each protection in law, 2000 and 2021.</span><span class="fig__src">Source: TRIP (Williamson, 2024).</span></figcaption>
<div class="table-slot" id="table-act3"></div>
</figure>
</div>
<div class="row">
<div class="prose">
<p>Recognition led the progress. In 2000 you could change the gender on your documents in 18 countries, mostly European, and in none of the Americas. By 2021 you could in 60, ten of them in Latin America.</p>
<p>Protection from discrimination came later and ranked lower. No country had an anti-discrimination law covering trans people in 2000. By 2021, 20% protected them at work and about 17% in schools, hospitals and housing. Five countries (Bolivia, Cuba, Ecuador, Fiji and Malta) wrote that protection into their constitutions. Eight offered a nonbinary or third gender marker.</p>
</div>
</div>
<div class="row">
<div class="prose">
<h3 class="subhead">Going backwards</h3>
<p>Progress was not in one direction. Twenty-one countries lost at least one protection at some point between 2000 and 2021. Six ended the period with a lower score than they started with: Cambodia, Equatorial Guinea, The Gambia, Indonesia, Kuwait and Oman.</p>
<p>The clearest cases are four countries that wrote new laws against trans people. In TRIP's dataset, Indonesia did it in 2002, Kuwait in 2007, The Gambia in 2013 and Oman in 2018. Other countries took recognition away. Hungary's parliament ended legal gender change in 2020; Bulgaria and Kyrgyzstan lost it in 2021.</p>
<p>In 14 of the 21 countries, the only loss came from indirect criminalization, an indicator that tracks laws not written about trans people but used against them.</p>
</div>
<aside class="note note--right reveal">
<p class="note__label">LGB vs. trans</p>
<p>The two usually go together: in 2020, 134 of 173 countries had similar scores on both scales. But when they split, it is mostly trans rights that are left behind.</p>
</aside>
</div>
<div class="row">
<div class="prose">
<p>Behind each score is a different legal history. In these examples we can see how much a number can hide.</p>
</div>
</div>
<div class="carousel carousel--full reveal" id="country-carousel">
<div class="carousel-viewport">
<div class="carousel-track">
<div class="typology-card"><div class="typology-country">Argentina</div><div class="typology-label">Recognition without protection</div><div class="typology-score">6 of 13 · 46% · 2021</div><p class="typology-body">In 2012, the first country to let people change their legal gender by declaration alone, with no medical requirements. A nonbinary marker followed in 2021. Yet none of the six anti-discrimination protections is in law.</p></div>
<div class="typology-card"><div class="typology-country">India</div><div class="typology-label">Protection with conditions</div><div class="typology-score">8 of 13 · 62% · 2021</div><p class="typology-body">India recognized a third gender and allowed a change of legal gender in 2014. Six years later came protection against discrimination in employment, education, healthcare and housing. But the change of legal gender still depends on medical conditions, and indirect criminalization remains in the data.</p></div>
<div class="typology-card"><div class="typology-country">Austria</div><div class="typology-label">The progressive exception</div><div class="typology-score">3 of 13 · 23% · 2021</div><p class="typology-body">Scores 82% on LGB rights but 23% on trans rights. Legal gender change is possible, yet none of the six anti-discrimination protections covers trans people.</p></div>
<div class="typology-card"><div class="typology-country">Pakistan</div><div class="typology-label">Trans rights without LGB rights</div><div class="typology-score">11 of 13 · 85% · 2021</div><p class="typology-body">One or two protections until 2017, then 11 in 2018: the biggest one-year gain in the dataset, tied with Luxembourg. It is the poorest of the 13 countries with 10 points or more, and the only one not classified as a democracy. On the LGB index it scores 0% (2020).</p></div>
<div class="typology-card"><div class="typology-country">Iran</div><div class="typology-label">Joint second in the region, unchanged since 2000</div><div class="typology-score">2 of 13 · 15% · 2021</div><p class="typology-body">The same score, 2 of 13, in all 22 years: no direct criminalization and a legal route to change gender, with all three conditions still attached. It is still joint second, with Turkey, in a region of 19 countries where 16 score one point or none.</p></div>
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
<p>Each row is a country, sorted from the highest score in 2021 at the top to the lowest at the bottom. Each column is a year. The colour of a cell is the number of protections that country held that year.</p>
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
<div class="step"><p>The <strong>bottom quarter</strong> barely changes colour from left to right. Of its 44 countries, 39 held exactly the same score in 2021 as in 2000.</p></div>
</div>
</div>
<figure class="fig">
<figcaption class="fig__cap"><span class="fig__tag">Fig. 4</span><span>TRIP score of every country, every year (2000-2021).</span><span class="fig__src">Source: TRIP (Williamson, 2024).</span></figcaption>
</figure>
<div class="table-slot" id="table-act4"></div>
<div class="row">
<div class="prose">
<p>This is the shape behind the average. The rise was real, but it happened in one part of the picture. In 2000, not one country had five protections. By 2021, 42 did, and 16 had nine or more. Further down the image, the colour is still the one it started with.</p>
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
<p>Everything in this article is about laws, and laws are only one part of the picture. They say nothing about the lived experience of trans people: what happens in the street, in a hospital or at home. A country can score 85% and still be a dangerous place for trans people, and a country with a low score can have strong communities that no law records. Still, the law matters. It shapes what the police can do, what a doctor can say and which documents a person is allowed to carry. It is just not the whole story.</p>
<p>The first version of the TRIP records stops in 2021, but the world continued changing. In 2023, Russia banned legal gender change and gender-affirming medical care. The same year, Uganda's Anti-Homosexuality Act made same-sex relations punishable by life imprisonment and, in some cases, death. In the United States, where gender recognition is left to the states, more than twenty states have restricted gender-affirming care for minors since 2021. In the United Kingdom, the government blocked Scotland's self-ID reform in 2023, and in 2025 the Supreme Court ruled that "sex" in equality law means biological sex.</p>
<p>The record shows that a country can change its laws in a year. It also shows that it can change them back. Some of the countries that moved forward between 2000 and 2021 did it fast, and some of the ones that went the other way did it just as fast, as we continue to see in different parts of the world.</p>
</div>
</div>
<div class="sources">
<p class="sources__label">About this data</p>
<p>The <a href="https://www.myleswilliamson.net/trip-data" target="_blank" rel="noopener">Trans Rights Indicator Project (TRIP)</a> is a dataset of 13 legal indicators for 173 countries from 2000 to 2021, developed by Myles Williamson as part of his doctoral research at the University of Alabama and published in <em>Perspectives on Politics</em> (Cambridge University Press), Vol. 22, No. 3 (2024).</p>
<p>All scores, shares and counts in this article are calculated from the TRIP data.</p>
<p>The LGB comparison uses ILGA World's <em>State-Sponsored Homophobia Report</em> (2020). Post-2021 events: ACLU Legislative Tracker, Human Rights Watch.</p>
</div>
<div class="credits">
<p class="sources__label">Credits</p>
<p>Text, data analysis and graphics: <a href="https://www.ivan-alfonsoburgos.com/" target="_blank" rel="noopener">Iván Alfonso Burgos</a></p>
<p>Photo by <a href="https://unsplash.com/@karohubert?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank" rel="noopener">Karollyne Videira Hubert</a> on <a href="https://unsplash.com/?utm_source=unsplash&amp;utm_medium=referral&amp;utm_content=creditCopyText" target="_blank" rel="noopener">Unsplash</a></p>
</div>
</section>

</article>
