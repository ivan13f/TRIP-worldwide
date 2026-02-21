---
title: TRIP
---

```html
<div class="trip-page">

  <section class="hero">
    <div class="hero__inner">
      <div class="stack">
        <div class="hero__badge">
          <span class="dot"></span>
          <span><b>TRIP</b> — Trans Rights Indicator Project</span>
        </div>

        <div>
          <div class="trip-kicker">Global overview • Regions • Country explorer</div>
          <h1 class="trip-h1">Uneven progress, uneven protection.</h1>
          <p class="trip-lede">
            A design-led data story about how trans rights policies and protections change across the world over two decades — and where gaps persist.
          </p>
        </div>

        <div class="pills">
          <span class="pill"><b>2000–2021</b> time window</span>
          <span class="pill"><b>Global + regional</b> comparison</span>
          <span class="pill"><b>Country</b> deep dives</span>
        </div>

        <div class="btnrow">
          <a class="btn btn--primary" href="./global">Start with the global view →</a>
          <a class="btn" href="./countries">Jump to country explorer</a>
          <a class="btn" href="./components">See the indicator components</a>
        </div>
      </div>

      <aside class="hero__meta">
        <div class="card card--tight">
          <div class="trip-h3">What you’ll find</div>
          <p>
            A compact dashboard with a strong visual system: choropleth + time series + distribution + country comparison modules.
          </p>
        </div>

        <div class="card card--tight">
          <div class="trip-h3">How to read</div>
          <p>
            Use <b>Global</b> to orient, <b>Regions</b> to compare trajectories, <b>Countries</b> to explore winners/laggards, and <b>Components</b> to understand what drives change.
          </p>
        </div>

        <div class="card card--tight note">
          <b>Method note:</b> This is an indicator-based view. Scores reflect recorded policy/rights signals in the dataset — they don’t capture lived experience or enforcement quality.
        </div>
      </aside>
    </div>
  </section>

  <section class="trip-section">
    <div class="trip-kicker">Research questions</div>
    <h2 class="trip-h2">Three lenses to explore the data</h2>
    <p class="trip-lede">
      Each page answers a different question. The goal is not “ranking countries”, but making change (and lack of change) legible.
    </p>

    <div class="grid grid-3" style="margin-top: 18px;">
      <a class="card rq" href="./global">
        <div class="rq__inner">
          <div class="rq__top">
            <div class="rq__tag">RQ 1</div>
            <div class="rq__arrow">↗</div>
          </div>
          <div class="trip-h3">How did the world change over time?</div>
          <p>
            A year slider map + global trend line to see the shape and pace of change.
          </p>
        </div>
      </a>

      <a class="card rq" href="./regions">
        <div class="rq__inner">
          <div class="rq__top">
            <div class="rq__tag">RQ 2</div>
            <div class="rq__arrow">↗</div>
          </div>
          <div class="trip-h3">Do regions move together or diverge?</div>
          <p>
            Regional snapshots and trend lines to compare trajectories and turning points.
          </p>
        </div>
      </a>

      <a class="card rq" href="./countries">
        <div class="rq__inner">
          <div class="rq__top">
            <div class="rq__tag">RQ 3</div>
            <div class="rq__arrow">↗</div>
          </div>
          <div class="trip-h3">Which countries shift the most — and why?</div>
          <p>
            A delta view (2000 → 2021) plus a country comparison module and sortable table.
          </p>
        </div>
      </a>
    </div>
  </section>

  <section class="trip-section">
    <div class="grid grid-2">
      <div class="card">
        <div class="trip-kicker">Storytelling plan</div>
        <h2 class="trip-h2">From overview to explanation</h2>
        <p>
          We start with a global “camera zoomed out”, then zoom in to regional patterns, then switch to country-level exploration.
          Finally, we open the black box: the indicator components behind the score.
        </p>
        <hr />
        <div class="btnrow">
          <a class="btn btn--primary" href="./global">Global change</a>
          <a class="btn" href="./regions">Regions</a>
          <a class="btn" href="./countries">Countries</a>
          <a class="btn" href="./components">Components</a>
        </div>
      </div>

      <div class="card">
        <div class="trip-kicker">Sources</div>
        <h2 class="trip-h2">Data & references</h2>
        <div class="sources" style="margin-top: 10px;">
          <small>Replace with your actual references (dataset, methodology paper, repo link).</small>
          <a href="#" aria-label="Dataset link">Dataset: Trans rights worldwide (CSV)</a>
          <a href="#" aria-label="Method paper link">Method: TRIP indicator documentation</a>
          <a href="#" aria-label="Project repository link">Repository: trip-project</a>
        </div>
      </div>
    </div>
  </section>

</div>
````
