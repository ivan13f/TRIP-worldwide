# Uneven Ground

**Trans Rights Worldwide 2000-2021.** A scrollytelling data story about what the world's laws say about trans people, built on the Trans Rights Indicator Project (TRIP).

- **Read it live:** [uneven-ground.ivan-alfonsoburgos.com](https://uneven-ground.ivan-alfonsoburgos.com/)
- **Case study:** [ivan-alfonsoburgos.com/uneven-ground](https://www.ivan-alfonsoburgos.com/uneven-ground) (coming soon)

## About the story

The piece is one page in four sections, each built around a chart:

| Section | Chart |
|---|---|
| What the world's laws say about trans people | How the distribution of scores changed, step by step (average, median, middle half, top tenth, bottom quarter) |
| A map of exceptions | Zoomable choropleth of 2021 scores, flown region by region |
| Recognition before protection | Dot plot of each of the 13 rights in 2000 and 2021, plus country cards |
| Every country, every year | Heatmap of every country and year, with search and hover |

Every chart has a "View the data" table underneath, and the article works on desktop and mobile.

## Data

**Trans Rights Indicator Project (TRIP)**, by Myles Williamson, developed as part of his doctoral research at the University of Alabama and published in *Perspectives on Politics* (Cambridge University Press), Vol. 22, No. 3 (2024). Data and documentation: [myleswilliamson.net/trip-data](https://www.myleswilliamson.net/trip-data).

TRIP codes 13 yes-or-no legal indicators for 173 countries, every year from 2000 to 2021, in three groups:

- **Criminalization (2):** no direct criminalization, no indirect criminalization
- **Recognition (5):** legal gender marker change, and whether it is possible without physical requirements, without a psychiatric diagnosis and without divorce; nonbinary or third gender option
- **Protection (6):** general anti-discrimination law, plus protection in employment, education, healthcare, housing and the constitution

A country's score is the number of indicators it meets, out of 13. The article shows it as a percentage.

TRIP records what the law says. It doesn't measure enforcement, court rulings or how safe daily life is. Other sources used in the article: ILGA World's *State-Sponsored Homophobia Report* (2020) for the LGB comparison, and the ACLU and Human Rights Watch for events after 2021.

The raw TRIP file is in `src/data/raw/`. The data belongs to its author, so please cite the original publication if you reuse it.

## Built with

- [Observable Framework](https://observablehq.com/framework/) for the static site and the data loader
- [D3](https://d3js.org/) for all charts
- [Scrollama](https://github.com/russellsamora/scrollama) for the scroll-driven steps
- Python and pandas to clean the raw data at build time
- Besley and Inter type, via Google Fonts

## Project structure

```
src/
  index.md                     the article: text and chart wiring
  style.css                    design system
  assets/                      hero image
  data/
    raw/                       original TRIP CSV
    processed/trip_clean.csv.py   Python data loader (cleans and reshapes the raw file)
    geo/world-110m.json        world map (TopoJSON)
  lib/
    data.js                    all data transforms
    theme.js                   colours, fonts, score classes
    geo.js                     TopoJSON to GeoJSON
    scroll.js                  scroll reveals and Scrollama steps
    carousel.js                country cards
    charts/                    one module per chart, plus shared table, legend and tooltip helpers
analysis/                      notebook and verification scripts
article-text.md                the full article text, in reading order
```

## Run it locally

You need Node 18 or newer (the site is built on Node 22) and Python 3 with pandas, because the data loader runs at build time.

```bash
pip install -r requirements.txt
```

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000. `npm run build` writes the static site to `dist/`, and `npm run clean` clears the data loader cache.

## Credits

- Analysis and visualization: [Iván Alfonso Burgos](https://www.ivan-alfonsoburgos.com/)
- Data: Myles Williamson, Trans Rights Indicator Project
- Hero photo: [Karollyne Videira Hubert](https://unsplash.com/@karohubert)
