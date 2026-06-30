---
title: Countries
---

```js
import * as Inputs from "@observablehq/inputs";
import { view } from "@observablehq/inputs";
import { normalizeTripRows, groupBy } from "./lib/data.js";
import { countryCompare } from "./lib/charts/countryCompare.js";
import { beeswarmDelta } from "./lib/charts/beeswarmDelta.js";
```

```js
const raw = await FileAttachment("./data/trans_rights_worldwide.csv").csv({ typed: true });
const data = normalizeTripRows(raw);
```
## Country explorer

Pick one or more countries and compare their trajectories, plus a quick “who changed the most” view.

### Compare countries over time

```js
const iso3Options = Array.from(new Set(data.map(d => d.iso3).filter(Boolean))).sort();
const selected = view(Inputs.select(iso3Options, { label: "Country (ISO3)", value: iso3Options[0] }));
```
```js
countryCompare({ data, iso3: selected, width: 900, height: 320 })
```
## Biggest changes (2000 → 2021)

```js
beeswarmDelta({ data, yearA: 2000, yearB: 2021, width: 900, height: 420 })
```

