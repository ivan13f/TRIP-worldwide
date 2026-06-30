---
title: Regions
---

```js
import * as Inputs from "@observablehq/inputs";
import { view } from "@observablehq/inputs";
import { normalizeTripRows } from "./lib/data.js";
import { regionLines } from "./lib/charts/regionLines.js";
import { indicatorBands } from "./lib/charts/indicatorBands.js";
```
```js
const raw = await FileAttachment("./data/trans_rights_worldwide.csv").csv({ typed: true });
const data = normalizeTripRows(raw);
```
## Regional patterns

This section is about comparing trajectories between world regions.

## Region trend lines

```js
regionLines({ data, width: 900, height: 360 })
```

## Indicator bands

A compact view to compare how different indicators move over time.

```js
indicatorBands({ data, width: 900, height: 360 })
```
