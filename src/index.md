---
title: Uneven Ground
toc: false
---

```js
import { yearlyStats, countrySnapshot, indicatorAdoption, fingerprintMatrix } from "./lib/data.js";
import { THEME }             from "./lib/theme.js";
import { distributionTrend } from "./lib/charts/distributionTrend.js";
import { choropleth }        from "./lib/charts/choropleth.js";
import { indicatorDotPlot }  from "./lib/charts/indicatorDotPlot.js";
import { flagship }          from "./lib/charts/flagship.js";
import { initScroll, scrolly } from "./lib/scroll.js";
import { initCarousel }      from "./lib/carousel.js";

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

initScroll();
initCarousel("#country-carousel");
```

<header class="hero" id="hero">
<div class="hero__text">
<h1 class="hero__title">Uneven Ground</h1>
<p class="hero__intro">Political scientist Myles Williamson's <a href="https://www.myleswilliamson.net/trip-data" target="_blank" rel="noopener">Trans Rights Indicator Project</a> records what the law says about trans people in 173 countries, every year from 2000 to 2021. The average score doubled. The bottom quarter did not move.</p>
<a class="hero__cue" href="#act1">Scroll for more <span class="hero__arrow" aria-hidden="true">↓</span></a>
</div>
<div class="hero__art" aria-hidden="true"></div>
</header>

<article class="article">

<!-- ═══ ACT I ═══════════════════════════════════════════════════════════════ -->
<section class="act" id="act1">
<div class="act__head">
<p class="kicker">Act I · 2000 to 2021</p>
<h2 class="act-title">The headline and the trap</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">Williamson's TRIP score asks thirteen yes-or-no questions of every country's laws, every year. They fall into three groups.</p>
<ul>
<li><strong>Criminalization, two questions.</strong> Is there no law that directly targets trans people, and none that is used against them indirectly?</li>
<li><strong>Recognition, five questions.</strong> Can people change the gender marker on their official documents? Can they do it without surgery or other physical requirements, without a psychiatric diagnosis, and without having to divorce? Is there a nonbinary or third gender option?</li>
<li><strong>Protection, six questions.</strong> Is there a general anti-discrimination law covering trans people? Specific protection in employment, education, healthcare and housing? Protection written into the constitution?</li>
</ul>
<p>In 2000, the average country scored 10.9%. By 2021, it scored 23.5%. Progress, the headline says.</p>
</div>
<aside class="note note--left reveal">
<p class="note__label">About the score</p>
<p>Each yes counts as one point. The score is the number of points out of 13, shown as a percentage. It records what the law says, not how it is enforced or how safe daily life is.</p>
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
<div class="step"><p>The headline: the <strong>average</strong> score more than doubled, from 10.9% to 23.5%.</p></div>
<div class="step"><p>The <strong>median</strong> country tells a quieter story. It held one protection until 2014 and two from 2015: from 7.7% to 15.4%.</p></div>
<div class="step"><p>The <strong>middle half</strong> of countries, between the 25th and 75th percentile. Its top edge climbs from 15.4% to 30.8%. Its bottom edge never moves.</p></div>
<div class="step"><p>The <strong>top 10%</strong> of countries scored 15.4% or more in 2000. By 2021 the threshold was 61.5%. This is where the average's rise comes from.</p></div>
<div class="step"><p>And the <strong>bottom quarter</strong>: 7.7% in 2000, 7.7% in 2021. One protection out of thirteen, unchanged for 22 years.</p></div>
</div>
</div>
<div class="row">
<div class="prose">
<p>The world did not rise together. A small group at the top pulled the average up while most countries stayed where they started. That is why the average, 23.5%, now sits well above the median, 15.4%.</p>
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
<p class="kicker">Act II · Where</p>
<h2 class="act-title">The map that isn't there</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">If the bottom held still and the top moved, where is the top?</p>
<p>The expected answer, Western Europe and Scandinavia, is only partly right. Geography does not predict the score.</p>
</div>
<aside class="note note--left reveal">
<p class="note__label">Argentina · 2012</p>
<p>Law 26.743, the Gender Identity Law, passed the Argentine Senate 55 votes to 0. It allowed legal gender recognition with no medical, surgical or judicial requirements.</p>
</aside>
</div>
<div class="scrolly scrolly--wide" id="scrolly-act2">
<div class="scrolly__graphic">
<figure class="fig">
<div class="fig__plot" id="chart-act2"></div>
<figcaption class="fig__cap"><span class="fig__tag">Fig. 2</span><span>TRIP score by country, 2021. Small island states are shown as dots.</span><span class="fig__src">Equal Earth projection. Source: TRIP (Williamson, 2024).</span></figcaption>
</figure>
</div>
<div class="scrolly__steps">
<div class="step"><p>Every country, coloured by how many of the thirteen protections its laws held in 2021. Two thirds of countries hold two or fewer.</p></div>
<div class="step"><p><strong>South America.</strong> Argentina passed the world's first self-ID law in 2012, yet scores 6 of 13: it has none of the anti-discrimination protections. Uruguay holds 12 of 13, the highest score anywhere.</p></div>
<div class="step"><p><strong>South Asia.</strong> Pakistan scores 11 of 13, the highest in Asia. India holds 8 of 13: broad protections, but changing a legal gender still requires medical steps.</p></div>
<div class="step"><p><strong>Europe</strong> is not one place. Malta writes protection into its constitution. Austria, strong on LGB rights, holds 3 of 13. Hungary ended legal gender change in 2020.</p></div>
<div class="step"><p><strong>Sub-Saharan Africa.</strong> Three in four countries score 0 or 1. Nigeria directly criminalizes trans people.</p></div>
<div class="step"><p>Now explore. Zoom with the buttons, pinch, or ⌘/Ctrl + scroll. Hover any country for its score.</p></div>
</div>
</div>
<div class="row">
<div class="prose">
<p>Many of the countries with the most restrictive laws share something beyond their politics: their criminal codes were written under British rule. Section 377 of the Indian Penal Code, drafted in 1860, criminalised "carnal intercourse against the order of nature." It, or close copies of it, spread to Pakistan, Bangladesh, Malaysia and Singapore, and similar "unnatural offences" clauses entered the codes of Nigeria, Kenya and Uganda. Courts and police have applied such clauses to gender-nonconforming people for over a century.</p>
<p>Iran presents a different anomaly. The state has funded gender-affirming surgery since the 1980s, yet same-sex relations remain punishable by death. On TRIP it scores 2 of 13: legal gender change exists, but only after surgery, a psychiatric diagnosis and divorce.</p>
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
<p class="kicker">Act III · What</p>
<h2 class="act-title">What changed, and what didn't</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">The geography tells us where progress happened. The thirteen indicators tell us what kind.</p>
<p>Not all of them moved, and one moved backward.</p>
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
</figure>
</div>
<div class="row">
<div class="prose">
<p>Gender marker change led the improvement, from 11% of countries in 2000 to 35% in 2021. Protection in employment followed, reaching 20%. But constitutional protection exists in just 3% of countries, and a nonbinary option in 5%. Direct criminalization is the only indicator that moved backwards.</p>
</div>
<aside class="note note--right reveal">
<p class="note__label">LGB vs. trans</p>
<p>Austria scores 82% for LGB protections (ILGA World, 2020) but 23% on TRIP. The indicators measure different rights for different groups.</p>
</aside>
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
<p class="kicker">Act IV · Every country, every year</p>
<h2 class="act-title">The divergence fingerprint</h2>
</div>
<div class="row">
<div class="prose">
<p class="lede">What does the complete record look like?</p>
<p>173 rows, one per country, sorted by their 2021 score from highest at the top to lowest at the bottom. 22 columns, one per year. Each cell is coloured by how many protections that country held that year.</p>
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
<div class="step"><p>Each row is a country, each column a year. Hover a row, or search for a country.</p></div>
<div class="step"><p>In 2000, the world was almost uniform: 88% of countries held one or two protections.</p></div>
<div class="step"><p>Through the 2000s, a small group began to move. The rest stayed still.</p></div>
<div class="step"><p>After <strong>2012</strong>, the year Argentina enacted self-determined gender recognition, more countries followed and the gap became structural.</p></div>
<div class="step"><p>By 2021, two worlds had formed. Of the 44 countries in the <strong>bottom quarter</strong>, 39 hold exactly the score they held in 2000.</p></div>
</div>
</div>
<figure class="fig">
<figcaption class="fig__cap"><span class="fig__tag">Fig. 4</span><span>TRIP score of every country, every year, 2000 to 2021.</span><span class="fig__src">Source: TRIP (Williamson, 2024). 173 countries × 22 years.</span></figcaption>
</figure>
</section>

<!-- ═══ EPILOGUE ════════════════════════════════════════════════════════════ -->
<section class="act article-end" id="epilogue">
<div class="act__head">
<p class="kicker">Epilogue</p>
<h2 class="act-title">Law is not life</h2>
</div>
<div class="row">
<div class="prose">
<p>These are laws. They do not record what happened in the streets, in hospitals, in families. A country can score 85% and still be dangerous. A low score can coexist with strong community networks that laws do not see. The legal environment matters. It shapes what police do, what doctors can say, what documents a person can hold. But it is not the whole story.</p>
<p>This data ends in 2021. Since then, at least 27 US states have enacted anti-trans legislation. Uganda's Anti-Homosexuality Act of 2023 introduced life imprisonment provisions affecting trans people. Hungary and Russia have expanded restrictions. The progress you saw is not guaranteed. Some of it is already being undone.</p>
</div>
</div>
<div class="sources">
<p class="sources__label">About this data</p>
<p>This piece uses the <a href="https://www.myleswilliamson.net/trip-data" target="_blank" rel="noopener">Trans Rights Indicator Project (TRIP)</a>, a dataset of 13 legal indicators for 173 countries from 2000 to 2021, developed by Myles Williamson as part of his doctoral research at the University of Alabama and published in <em>Perspectives on Politics</em> (Cambridge University Press), Vol. 22, No. 3 (2024). All scores, shares and counts in this article are calculated from the TRIP data. The LGB comparison uses ILGA World's <em>State-Sponsored Homophobia Report</em> (2020). Post-2021 references: ACLU Legislative Tracker, Human Rights Watch.</p>
</div>
</section>

</article>
