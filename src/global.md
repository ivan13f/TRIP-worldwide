---
title: Global change
---

```js
import * as Inputs from "@observablehq/inputs";
import { view } from "@observablehq/inputs";
import { normalizeTripRows, globalAverageByYear, filterByYear } from "./lib/data.js";
import { lineGlobal } from "./lib/charts/lineGlobal.js";
import { mapTrip } from "./lib/charts/mapTrip.js";
import { topoToFeatures } from "./lib/geo.js";
import { feature } from "topojson-client";
```

```js
// 1) Load data directly here (stable!)
const raw = await FileAttachment("./data/trans_rights_worldwide.csv").csv({ typed: true });
const data = normalizeTripRows(raw);

// 2) Load world topojson directly here too
const topo = await FileAttachment("./data/geo/world-110m.json").json();
const world = topoToFeatures(topo); // { countries, borders }
```

```js
const year = view(Inputs.range([2000, 2021], { step: 1, value: 2021, label: "Year" }));
```

## Global change (2000–2021)

This page answers two basic questions:

How does the global average TRIP score evolve over time?

How do values look across the world in a given year?

## Global average trend

```js
const series = globalAverageByYear(data);
lineGlobal({ series, width: 900, height: 260 })
```
```js
const rowsYear = filterByYear(data, year);
mapTrip({
  world,
  rows: rowsYear,
  year,
  width: 900,
  height: 520
})
```