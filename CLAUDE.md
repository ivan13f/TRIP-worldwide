# CLAUDE.md — Uneven Ground: Project Bible
*Read this at the start of every session. It is the single source of truth.*

---

## What This Project Is

**Uneven Ground** is a single-page journalistic data story about global
transgender rights, 2000–2021. It is built on Observable Framework using D3.js
and Observable Plot. It is a portfolio piece targeting data viz studios
(Accurat) and newsrooms.

**Subtitle:** *A legal record of trans rights in 173 countries, 2000–2021*

**Source data:** Trans Rights Indicator Project (TRIP), Myles Williamson,
University of Alabama (2023). Published in *Perspectives on Politics*, Vol. 22/3.

---

## Editorial Structure

The piece is one page, four acts, no navigation. It is a journalistic essay
with charts, not a dashboard.

| Act | Title | Question answered | Chart |
|-----|-------|-------------------|-------|
| I   | The Headline and the Trap | Did the world progress? (Average says yes. Distribution says no.) | `distributionTrend.js` |
| II  | The Map That Isn't There | Where did progress happen? (Not where you'd expect.) | `choropleth.js` |
| III | What Changed, and What Didn't | Which rights improved most? (Recognition led, protection lagged.) | `indicatorDotPlot.js` + typology callouts |
| IV  | The Divergence Fingerprint | What does all of it look like at once? | `flagship.js` (raw D3 + Scrollama) |

**Epilogue:** Text only. Acknowledges the law-vs-life gap. Notes post-2021
backlash (US bills, Uganda 2023, Hungary, Russia). Cites sources.

---

## The One Finding That Drives Everything

> The bottom quarter of countries scored 7.7% on TRIP in 2000.
> In 2021, they still score 7.7%. The world didn't rise. A cluster
> at the top pulled the average with them.

This is the editorial anchor. Every act builds toward the Divergence
Fingerprint, which makes this finding visible as a literal image.

---

## Architecture Rules (Non-Negotiable)

1. `FileAttachment` calls **only** in `src/index.md` — never inside `lib/`
2. All data transforms **only** in `lib/data.js` — chart modules receive clean data
3. Chart modules are **pure functions**: `(data, opts)` → DOM node, no side effects
4. `flagship.js` is **raw D3 only** — not Observable Plot. Non-negotiable.
5. `style.css` and `theme.js` are Iván's — never modify without explicit direction
6. Build and test all charts in `_sandbox.md` first, then wire into `index.md`
7. Never touch geo data: `src/data/geo/world-110m.json` is read-only

---

## File Map

```
trip-project/
├── src/
│   ├── index.md                  ← THE PAGE. Full narrative + chart wiring.
│   ├── _sandbox.md               ← Dev scratchpad. Never published.
│   ├── style.css                 ← Design system. Iván owns this.
│   ├── data/
│   │   ├── raw/
│   │   │   └── trans_rights_worldwide.csv
│   │   ├── processed/
│   │   │   └── trip_clean.csv.py    ← Python loader. Tested and working.
│   │   └── geo/
│   │       └── world-110m.json
│   └── lib/
│       ├── data.js               ← ALL data transforms. No rendering here.
│       ├── geo.js                ← TopoJSON → GeoJSON helper.
│       ├── theme.js              ← Design tokens (colors, fonts). Iván owns.
│       ├── scroll.js             ← IntersectionObserver for Acts I–III.
│       └── charts/
│           ├── distributionTrend.js  ← Act I
│           ├── choropleth.js         ← Act II
│           ├── indicatorDotPlot.js   ← Act III
│           └── flagship.js           ← Act IV (raw D3 + Scrollama)
├── analysis/
│   ├── 01_verify_divergence.py   ← Verify IQR/percentile findings
│   └── 03_identify_surprises.py  ← Find outlier country cases for annotations
├── _archive/
│   ├── charts/                   ← Old chart files from previous structure. Reference only.
│   │   ├── beeswarmDelta.js      ← (countries.md era)
│   │   ├── countryCompare.js     ← (countries.md era)
│   │   ├── indicatorBands.js     ← (components.md era)
│   │   ├── lineGlobal.js         ← Replaced by distributionTrend.js
│   │   ├── mapTrip.js            ← Replaced by choropleth.js
│   │   └── regionLines.js        ← (regions.md era)
│   └── worktrees/                ← Stale git worktree. DELETE MANUALLY:
│                                    rm -rf _archive/worktrees
└── CLAUDE.md                     ← This file.
```

---

## Design System

**Mode:** Dark only.

**Typography:**
- Headings: **Syne** (700–800) — geometric, distinctive
- Body: **DM Sans** — warm, humanist, legible
- Data labels / captions / kickers: **DM Mono** — technical-editorial precision

**Color tokens (from theme.js):**

| Token | Hex | Role |
|---|---|---|
| `--ink` | `#0f1116` | Background |
| `--fog` | `#d7e8e9` | Primary text |
| `--muted` | `#8a9aa0` | Secondary text, axes, ticks |
| `--violet` | `#6e5cc5` | Low TRIP score / scale start |
| `--emerald` | `#35bf78` | High TRIP score / scale end |
| `--coral` | `#e68263` | Regression / alerts / p25 line |
| `--azure` | `#2a8fd4` | Reserved (not currently used) |

**TRIP color scale:** `violet → emerald`. Used in choropleth AND flagship.
This is the visual signature — never swap to red-green.

**Grain texture:** Animated SVG `feTurbulence` film grain overlay on `body::after`.
Applied globally, consistent across all acts.

**Reference:** Accurat × Milan Design Week 2024 aesthetic.

---

## Data Notes

**TRIP score:** 0–13 composite (sum of 13 binary indicators).
`trip_percent` = score / 13 → used everywhere in the viz (0.0–1.0 range).

**Key verified findings (do not recalculate — run analysis scripts to confirm):**

- Global mean 2000: 10.9% → 2021: 23.5%
- p25 in 2000: 7.7% → p25 in 2021: 7.7% (unchanged)
- IQR 2000: 7.7 pts → IQR 2021: 23.1 pts
- Direct criminalization: 8 countries (2000) → 12 countries (2021) ← WORSENED
- Gender marker change: 11% of countries (2000) → 35% (2021) ← biggest gain
- Anti-discrim employment: 0% → 20%
- Constitutional protection: 0% → 3%
- Nonbinary recognition: 0% → 5%

**Colonial law cases** (British Section 377 lineage, 1860):
Nigeria, Kenya, Uganda, Bangladesh, Singapore, Malaysia, Pakistan (reformed 2018),
India (partially reformed 2018 via Navtej Singh Johar ruling).

**Typology countries (Act III callouts):**
- ARG (100%, complete case)
- IND (62%, recognition without protection)
- AUT (23%, progressive exception — 82% LGB but 23% TRIP)

---

## Build Order

Run in this order. Each depends on the previous being stable.

1. **Verify findings:** Run `analysis/01_verify_divergence.py` and
   `analysis/03_identify_surprises.py`. Confirm numbers match the Data Notes above.
2. **Act I:** `distributionTrend.js` — simplest chart, good D3 warmup.
   Test in `_sandbox.md`.
3. **Act III:** `indicatorDotPlot.js` — static, no scroll interaction.
   Test in `_sandbox.md`.
4. **Act II:** `choropleth.js` — needs geo data. Check `geo.js` loads correctly first.
   Test in `_sandbox.md`.
5. **Act IV:** `flagship.js` — most complex. Build last. Scrollama last.
   Heavy testing in `_sandbox.md` before wiring into `index.md`.
6. **Final wiring:** Connect all charts in `index.md`. Test full scroll flow.
7. **Copy:** Write final editorial text to replace scaffolding copy.
8. **Design pass:** Annotation polish, label collision fixes, legend refinement.

---

## External Citations (for epilogue)

- ACLU Legislative Tracker: https://www.aclu.org/legislative-attacks-on-lgbtq-rights
- Uganda Anti-Homosexuality Act 2023: Human Rights Watch reporting
- TGEU Trans Murder Monitoring: https://transrespect.org/en/research/trans-murder-monitoring/
- LGB comparison (2020): ILGA World State-Sponsored Homophobia Report (Mendos et al., 2020)

---

## Technical Notes

**Import contract (non-negotiable):**

| File | Exports | Notes |
|---|---|---|
| `theme.js` | `THEME`, `colors`, `fonts`, `regionColors`, `indicatorLabels` | Chart modules use `{ THEME }` |
| `geo.js` | `loadGeo()` async | Uses `fetch()` — NOT FileAttachment. Returns `{ countries }` GeoJSON. |
| `scroll.js` | `initScroll()`, `onReveal()`, `onRevealAll()` | `initScroll()` wires IntersectionObserver to all `.chart-container` |
| `data.js` | `yearlyStats`, `countrySnapshot`, `indicatorAdoption`, `fingerprintMatrix`, `countryProfiles`, `INDICATORS`, `REGION_LABELS` | groupBy uses manual helper, not `Map.groupBy()` |

**CSV column names** (match `trip_clean.csv.py` output exactly):
- Criminalization: `dir_crim`, `ind_crim`
- Gender recognition: `gmc`, `gmcpr`, `gmcphys`, `gmcpsych`, `gmcdiv`, `nb3g`
- Anti-discrimination: `adp_employment`, `adp_education`, `adp_healthcare`, `adp_housing`, `adp_constitution`
- ID fields: `iso3`, `country_name`, `year`, `trip_percent`, `e_regionpol_6c`
- Do NOT use: `country_text_id` (wrong name), `e_regionpol_6C` (wrong case), `no_dircrim`, `adp_general` (old names)

**`choropleth()` is async** — always `await choropleth(...)` in index.md.

**`Map.groupBy()` is not used** — replaced with local `groupBy()` helper in data.js for browser compatibility.

**`.band--hidden` class** — defined in style.css; transitions opacity 0→1 when `initScroll()` removes it on scroll reveal.

---

## Status

**Active — full audit and codebase alignment April 2026**
4-act structure locked. All lib files aligned to index.md imports.
Key fixes applied: `geo.js` loadGeo(), `scroll.js` initScroll(), `theme.js` THEME export,
`data.js` column names + groupBy polyfill, `choropleth.js` await, `style.css` band--hidden.

Previous revision: April 2025 — 5-act → 4-act restructure.
Removed: Policy Cascade act. Added: distribution reveal in Act I, typology callouts in Act III.
Old chart files archived in `_archive/charts/`.
